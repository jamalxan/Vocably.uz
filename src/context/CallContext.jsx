'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRealtime } from '@/context/RealtimeContext';
import { useT } from '@/context/LocaleContext';
import { initialCallState, isLiveStatus, reduceCall } from '@/lib/call/callMachine';
import { createPeer } from '@/lib/call/peer';
import {
  clearMediaSession,
  getLocalStream,
  getVideoTrack,
  mediaSupported,
  releaseWakeLock,
  requestWakeLock,
  setMediaSession,
  vibrateLoop,
} from '@/lib/call/devices';
import {
  installAudioUnlock,
  isAudioUnlocked,
  playBusy,
  playConnected,
  playEnd,
  startRingback,
  startRingtone,
  stopAll,
  stopRingback,
  stopRingtone,
  unlockAudio,
} from '@/lib/call/sounds';
import { requestPauseAllMedia } from '@/lib/chat/mediaControl';

// 1:1 ovozli/video qo'ng'iroqlar — docs/chat/CALLS_SPEC.md §9.6. RealtimeProvider ichida, (main)
// layout'da: qo'ng'iroq /app ichidagi har qanday navigatsiyada davom etadi (strip / PiP karta).
// Holat — sof reducer (callMachine.js); bu yerda faqat orkestratsiya: getUserMedia, grant (Next),
// signal (socket), RTCPeerConnection (peer.js), tovush, tebranish, wake lock, Media Session va
// mahalliy xavfsizlik taymerlari (server taymerlari asosiy — bular faqat zaxira).

const CallContext = createContext(null);

// Mahalliy xavfsizlik taymerlari (CALLS_SPEC §9.1): server 45/30/15 s — bizniki biroz uzunroq.
const RING_WATCHDOG_MS = 50_000;
const INCOMING_GRACE_MS = 5_000;
const CONNECT_WATCHDOG_MS = 35_000;
const RECONNECT_WATCHDOG_MS = 20_000;
const END_FALLBACK_MS = 3_000;
const ICE_CACHE_MS = 50 * 60 * 1000;
// Server bergan TTL (ttlSec/iceTtlSec/ttl) dan 60 s kam, lekin 50 daqiqadan oshmaydi — TURN kredensiallari muddati o'tgach relay ishlamaydi.
const iceCacheTtl = (data) => Math.max(30_000, Math.min(ICE_CACHE_MS, (Number(data?.ttlSec || data?.iceTtlSec || data?.ttl) || 600) * 1000 - 60_000));
const INVITE_ACK_MS = 5_000;

const noop = () => {};
const subscribeNoop = () => noop;
const FALLBACK = Object.freeze({
  call: initialCallState,
  supported: false,
  canCall: false,
  unavailableKey: 'call.unsupported',
  startCall: () => Promise.resolve(),
  acceptCall: () => Promise.resolve(),
  rejectCall: noop,
  endCall: noop,
  toggleMic: noop,
  toggleCamera: () => Promise.resolve(),
  flipCamera: () => Promise.resolve(),
  setOutputDevice: noop,
  outputDeviceId: null,
  flipping: false,
  minimize: noop,
  restore: noop,
  enableSound: noop,
  clearError: noop,
  retryAfterError: noop,
  localStream: null,
  remoteStream: null,
  audioRetry: 0,
  reportAudioBlocked: noop,
  pendingCallback: null,
  consumeCallback: noop,
});

const errorOf = (err, retry) => ({ name: err?.name || 'Error', message: err?.message || '', ...(retry ? { retry } : {}) });

export function CallProvider({ children }) {
  const realtime = useRealtime();
  const { socket, connected, on, emit, configured } = realtime;
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();

  const [call, dispatch] = useReducer(reduceCall, initialCallState);
  const stateRef = useRef(initialCallState);
  // Reducer sof bo'lgani uchun keyingi holatni shu yerda ham hisoblab, ref'ni darhol yangilaymiz —
  // handler'lar (socket, PC) qaror qabul qilishda eng so'nggi holatni ko'radi.
  const act = useCallback((event) => {
    stateRef.current = reduceCall(stateRef.current, event);
    dispatch(event);
    return stateRef.current;
  }, []);

  const supported = useSyncExternalStore(subscribeNoop, () => configured && mediaSupported(), () => false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [outputDeviceId, setOutputDeviceId] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [audioRetry, setAudioRetry] = useState(0);
  const [pendingCallback, setPendingCallback] = useState(null);

  const socketRef = useRef(null);
  useEffect(() => { socketRef.current = socket; });
  const peerRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pendingSignalsRef = useRef([]);
  const iceCacheRef = useRef(null); // { iceServers, at }
  const icePrefetchRef = useRef(null);
  const incomingExpiresRef = useRef(null);
  const serverSinceRef = useRef(null);
  const connectedOnceRef = useRef(false);
  const endFallbackRef = useRef(null);
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; });

  const connectedRef = useRef(connected);
  useEffect(() => { connectedRef.current = connected; });

  const canCall = supported && connected && call.status === 'idle' && !call.elsewhere;
  const unavailableKey = !supported ? 'call.unsupported' : !connected ? 'cv.callUnavailable' : canCall ? null : 'call.busyToast';
  const canCallRef = useRef(canCall);
  useEffect(() => { canCallRef.current = canCall; });

  // ---------------------------------------------------------------- media helpers
  const stopLocal = useCallback(() => {
    localRef.current?.getTracks().forEach((tr) => tr.stop());
    localRef.current = null;
    setLocalStream(null);
  }, []);

  const teardown = useCallback(() => {
    stopAll();
    vibrateLoop(false);
    peerRef.current?.close();
    peerRef.current = null;
    pendingSignalsRef.current = [];
    stopLocal();
    remoteRef.current = null;
    setRemoteStream(null);
    releaseWakeLock();
    clearMediaSession();
    clearTimeout(endFallbackRef.current);
    serverSinceRef.current = null;
    connectedOnceRef.current = false;
    incomingExpiresRef.current = null;
    setFlipping(false);
  }, [stopLocal]);

  const fetchIceServers = useCallback(() => {
    const cached = iceCacheRef.current;
    if (cached && Date.now() - cached.at < (cached.ttlMs || ICE_CACHE_MS)) return Promise.resolve(cached.iceServers);
    if (icePrefetchRef.current) return icePrefetchRef.current;
    icePrefetchRef.current = fetch('/api/chat/ice-servers', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const iceServers = Array.isArray(data?.iceServers) ? data.iceServers : [];
        if (data) iceCacheRef.current = { iceServers, at: Date.now(), ttlMs: iceCacheTtl(data) };
        return iceServers;
      })
      .catch(() => [])
      .finally(() => {
        icePrefetchRef.current = null;
      });
    return icePrefetchRef.current;
  }, []);

  const emitMedia = useCallback(() => {
    const s = stateRef.current;
    if (!s.callId || !isLiveStatus(s.status)) return;
    emit('call:media', { callId: s.callId, audio: !!s.mic, video: !!s.camera });
  }, [emit]);

  // ---------------------------------------------------------------- peer
  const onPeerConnection = useCallback(
    (st) => {
      const s = stateRef.current;
      if (st === 'connected') {
        if (!isLiveStatus(s.status)) return;
        emit('call:connected', { callId: s.callId });
        emitMedia();
        if (!connectedOnceRef.current) {
          connectedOnceRef.current = true;
          playConnected();
        }
        requestWakeLock();
        if (s.status === 'reconnecting') {
          const next = act({ type: 'CONNECTION_RESTORED' });
          if (next.status === 'connecting' && serverSinceRef.current) act({ type: 'SERVER_ACTIVE', callId: next.callId, since: serverSinceRef.current });
        }
      } else if (st === 'disconnected' || st === 'failed') {
        if (s.status === 'connecting' || s.status === 'active') act({ type: 'CONNECTION_LOST' });
      }
    },
    [act, emit, emitMedia]
  );

  // Serverdan "menda qo'ng'iroq bormi?" (call:query, ack). Faqat idle/elsewhere holatda ma'noli:
  // boshqa qurilmada davom etayotgan qo'ng'iroq uchun ElsewhereBanner, yoki uning tugaganini bilish.
  const queryServerState = useCallback(() => {
    const sock = socketRef.current;
    if (!sock?.connected) return;
    sock.timeout(INVITE_ACK_MS).emit('call:query', {}, (err, payload) => {
      if (err) return;
      const s = stateRef.current;
      if (!payload) {
        if (s.status === 'elsewhere') act({ type: 'END', callId: s.elsewhere?.callId, reason: 'not_in_call' });
        return;
      }
      if (payload.onThisDevice === false && (s.status === 'idle' || s.status === 'elsewhere')) act({ type: 'SERVER_STATE', ...payload });
    });
  }, [act]);

  const makePeer = useCallback(
    ({ polite, startOpen, iceServers }) => {
      const callId = stateRef.current.callId;
      const peer = createPeer({
        iceServers,
        polite,
        startOpen,
        forceRelay: process.env.NEXT_PUBLIC_CALL_FORCE_RELAY === '1',
        send: ({ description, candidate }) => {
          const id = stateRef.current.callId || callId;
          if (description) emit('call:sdp', { callId: id, description });
          else emit('call:ice', { callId: id, candidate });
        },
        onTrack: (e) => {
          // Bitta MediaStream'ga yig'amiz (audio qo'ng'iroq keyin videoga o'tsa ham shu oqim).
          const base = remoteRef.current || new window.MediaStream();
          const tracks = e.streams?.[0]?.getTracks?.() || [e.track];
          tracks.forEach((tr) => {
            if (!base.getTracks().includes(tr)) base.addTrack(tr);
          });
          e.track.onended = () => {
            const cur = remoteRef.current;
            if (cur) {
              cur.removeTrack(e.track);
              setRemoteStream(new window.MediaStream(cur.getTracks()));
            }
          };
          remoteRef.current = base;
          // <video srcObject> yangi trekni ko'rishi uchun yangi obyekt.
          setRemoteStream(new window.MediaStream(base.getTracks()));
        },
        onConnectionState: onPeerConnection,
        onFatal: () => {
          const s = stateRef.current;
          if (!s.callId || s.status === 'ended' || s.status === 'idle') return;
          emit('call:end', { callId: s.callId, reason: 'failed' });
          clearTimeout(endFallbackRef.current);
          endFallbackRef.current = setTimeout(() => act({ type: 'END', callId: s.callId, reason: 'failed' }), END_FALLBACK_MS);
        },
      });
      peerRef.current = peer;
      // Peer yaratilishidan oldin kelgan signal'lar (nazariy) — tartib bilan beramiz.
      const queued = pendingSignalsRef.current;
      pendingSignalsRef.current = [];
      queued.forEach((m) => peer.handleSignal(m));
      return peer;
    },
    [act, emit, onPeerConnection]
  );

  // ---------------------------------------------------------------- actions
  const startCall = useCallback(
    async ({ conversationId, kind, peer }) => {
      if (!canCallRef.current || !conversationId) return;
      const retry = { conversationId, kind, peer };
      act({ type: 'START', conversationId, kind, peer });
      unlockAudio();
      requestPauseAllMedia();
      let media;
      try {
        media = await getLocalStream(kind, { facing: 'user' });
      } catch (err) {
        // Ruxsat berilmadi — hech kim jiringlamaydi, yozuv ham yo'q (CALLS_SPEC §12).
        act({ type: 'MEDIA_FAILED', error: errorOf(err, retry) });
        return;
      }
      if (stateRef.current.status !== 'starting') {
        media.stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      localRef.current = media.stream;
      setLocalStream(media.stream);
      if (media.videoFailed) act({ type: 'TOGGLE_CAMERA', value: false });

      let res;
      let data = {};
      try {
        res = await fetch(`/api/chat/conversations/${conversationId}/calls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind }),
        });
        data = await res.json().catch(() => ({}));
      } catch {
        act({ type: 'GRANT_FAILED', code: 'network' });
        return;
      }
      if (stateRef.current.status !== 'starting') return;
      if (!res.ok || !data.grant || !data.callId) {
        const code = data.code || (res.status === 429 ? 'rate_limited' : res.status === 503 ? 'not_configured' : res.status === 403 ? 'callee_unavailable' : 'failed');
        act({ type: 'GRANT_FAILED', code, message: data.error });
        return;
      }
      if (Array.isArray(data.iceServers)) iceCacheRef.current = { iceServers: data.iceServers, at: Date.now(), ttlMs: iceCacheTtl(data) };
      act({ type: 'GRANT_OK', callId: data.callId, peer: data.peer || null });
      // Taklif va ICE yig'ish jiringlash paytida boshlanadi; signal'lar call:accept'gacha navbatda.
      const p = makePeer({ polite: false, startOpen: false, iceServers: data.iceServers || [] });
      p.addLocalStream(media.stream);
      const s = socketRef.current;
      const callId = data.callId;
      if (!s || !s.connected) {
        act({ type: 'ACK_FAIL', callId, code: 'failed' });
        return;
      }
      s.timeout(INVITE_ACK_MS).emit(
        'call:invite',
        { grant: data.grant, callId, conversationId, calleeId: String(data.peer?.id || peer?.id || ''), kind },
        (err, ack) => {
          if (stateRef.current.callId !== callId) return;
          if (err) act({ type: 'ACK_FAIL', callId, code: 'failed' });
          else if (ack?.ok) act({ type: 'ACK_OK', callId, expiresAt: ack.expiresAt });
          else act({ type: 'ACK_FAIL', callId, code: ack?.code || 'failed' });
        }
      );
    },
    [act, makePeer]
  );

  const acceptCall = useCallback(
    async ({ videoOff = false } = {}) => {
      const s0 = stateRef.current;
      if (s0.status !== 'incoming') return;
      stopRingtone();
      vibrateLoop(false);
      unlockAudio().then((ok) => ok && act({ type: 'AUDIO_BLOCKED', blocked: false }));
      requestPauseAllMedia();
      const { callId, kind } = s0;
      act({ type: 'ACCEPT', videoOff });
      let media;
      try {
        media = await getLocalStream(kind, { facing: 'user', videoOff });
      } catch (err) {
        emit('call:end', { callId, reason: 'media_error' });
        act({ type: 'ACCEPT_MEDIA_FAILED', error: errorOf(err) });
        return;
      }
      if (stateRef.current.callId !== callId || stateRef.current.status !== 'accepting') {
        media.stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      localRef.current = media.stream;
      setLocalStream(media.stream);
      const iceServers = await fetchIceServers();
      if (stateRef.current.callId !== callId || stateRef.current.status !== 'accepting') return;
      const p = makePeer({ polite: true, startOpen: true, iceServers });
      p.addLocalStream(media.stream);
      emit('call:accept', { callId });
      act({ type: 'ACCEPT_MEDIA_READY', videoFailed: media.videoFailed });
    },
    [act, emit, fetchIceServers, makePeer]
  );

  const rejectCall = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'incoming') return;
    emit('call:reject', { callId: s.callId, reason: 'declined' });
    act({ type: 'REJECT' });
  }, [act, emit]);

  const endCall = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'ended' || s.status === 'elsewhere') return;
    if (s.status === 'incoming') {
      rejectCall();
      return;
    }
    if (!s.callId) {
      // Grant hali olinmagan — serverga hech narsa yuborilmagan.
      act({ type: 'END', reason: 'cancel' });
      return;
    }
    const reason = s.status === 'outgoing' || s.status === 'inviting' ? 'cancel' : 'hangup';
    emit('call:end', { callId: s.callId, reason });
    // Server call:end bilan javob beradi (davomiylik bilan); kelmasa — 3 s'dan keyin o'zimiz.
    clearTimeout(endFallbackRef.current);
    const callId = s.callId;
    const since = s.since;
    endFallbackRef.current = setTimeout(() => {
      act({ type: 'END', callId, reason, durationSec: since && reason === 'hangup' ? Math.max(0, Math.round((Date.now() - since) / 1000)) : null });
    }, END_FALLBACK_MS);
  }, [act, emit, rejectCall]);

  const toggleMic = useCallback(() => {
    const s = stateRef.current;
    const next = !s.mic;
    localRef.current?.getAudioTracks().forEach((tr) => {
      tr.enabled = next;
    });
    peerRef.current?.setMicEnabled(next);
    act({ type: 'TOGGLE_MIC', value: next });
    emitMedia();
  }, [act, emitMedia]);

  const toggleCamera = useCallback(async () => {
    const s = stateRef.current;
    const stream = localRef.current;
    if (!stream) return;
    if (s.camera) {
      const old = stream.getVideoTracks();
      old.forEach((tr) => stream.removeTrack(tr));
      if (peerRef.current) await peerRef.current.setVideoSending(null);
      old.forEach((tr) => tr.stop());
      setLocalStream(new window.MediaStream(stream.getTracks()));
      act({ type: 'TOGGLE_CAMERA', value: false });
      emitMedia();
      return;
    }
    try {
      const track = await getVideoTrack(s.facing);
      stream.getVideoTracks().forEach((tr) => {
        stream.removeTrack(tr);
        tr.stop();
      });
      stream.addTrack(track);
      if (peerRef.current) await peerRef.current.setVideoSending(track, stream);
      setLocalStream(new window.MediaStream(stream.getTracks()));
      act({ type: 'TOGGLE_CAMERA', value: true });
      emitMedia();
    } catch (err) {
      act({ type: 'SET_ERROR', error: errorOf(err) });
    }
  }, [act, emitMedia]);

  const flipCamera = useCallback(async () => {
    const s = stateRef.current;
    const stream = localRef.current;
    if (!stream || !s.camera || flipping) return;
    const nextFacing = s.facing === 'user' ? 'environment' : 'user';
    setFlipping(true);
    try {
      // iOS bir vaqtda bitta kamera oqimini ochadi — eskisini avval to'xtatamiz (VideoRecorder.jsx kabi).
      const old = stream.getVideoTracks();
      old.forEach((tr) => {
        stream.removeTrack(tr);
        tr.stop();
      });
      let track;
      try {
        track = await getVideoTrack(nextFacing);
      } catch (err) {
        if (err?.name !== 'NotReadableError' && err?.name !== 'TrackStartError') throw err;
        await new Promise((r) => setTimeout(r, 350));
        track = await getVideoTrack(nextFacing);
      }
      stream.addTrack(track);
      await peerRef.current?.replaceTrack('video', track);
      setLocalStream(new window.MediaStream(stream.getTracks()));
      act({ type: 'SET_FACING', facing: nextFacing });
    } catch (err) {
      // Yangi kamera ochilmadi — avvalgisini qaytarishga urinamiz.
      try {
        const back = await getVideoTrack(s.facing);
        stream.addTrack(back);
        await peerRef.current?.replaceTrack('video', back);
        setLocalStream(new window.MediaStream(stream.getTracks()));
      } catch {
        // kamera o'chiq qoladi
      }
      act({ type: 'SET_ERROR', error: errorOf(err) });
    } finally {
      setFlipping(false);
    }
  }, [act, flipping]);

  const minimize = useCallback(() => act({ type: 'MINIMIZE' }), [act]);
  const restore = useCallback(() => act({ type: 'RESTORE' }), [act]);
  const clearError = useCallback(() => act({ type: 'CLEAR_ERROR' }), [act]);
  const reportAudioBlocked = useCallback((blocked) => act({ type: 'AUDIO_BLOCKED', blocked }), [act]);

  const enableSound = useCallback(() => {
    unlockAudio().then((ok) => {
      if (!ok) return;
      act({ type: 'AUDIO_BLOCKED', blocked: false });
      if (stateRef.current.status === 'incoming') startRingtone();
      if (stateRef.current.status === 'outgoing' && stateRef.current.ringing) startRingback();
    });
    // Remote <audio> play() ni qayta urinish (CallOverlay shu raqamni kuzatadi).
    setAudioRetry((n) => n + 1);
  }, [act]);

  const retryAfterError = useCallback(() => {
    const retry = stateRef.current.error?.retry;
    act({ type: 'CLEAR_ERROR' });
    if (retry) startCall(retry);
  }, [act, startCall]);

  const setOutputDevice = useCallback((deviceId) => setOutputDeviceId(deviceId || null), []);

  // ---------------------------------------------------------------- deep link ?call=audio|video
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = /^\/app\/friends\/([^/]+)$/.exec(pathname || '');
    const kind = new URLSearchParams(window.location.search).get('call');
    if (m && (kind === 'audio' || kind === 'video')) {
      setPendingCallback({ username: decodeURIComponent(m[1]), kind });
      // Havola bir martalik: parametr darhol manzildan olib tashlanadi (yangilash/orqaga qaytishda
      // qayta so'ramaydi). Next navigatsiyasiz — faqat tarix yozuvi almashtiriladi.
      const url = new URL(window.location.href);
      url.searchParams.delete('call');
      window.history.replaceState(window.history.state, '', url.pathname + (url.search || '') + url.hash);
    }
  }, [pathname]);

  const consumeCallback = useCallback(() => {
    setPendingCallback(null);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('call')) return;
    url.searchParams.delete('call');
    router.replace(url.pathname + (url.search ? url.search : ''));
  }, [router]);

  // ---------------------------------------------------------------- socket events
  useEffect(() => {
    const cur = () => stateRef.current;
    const mine = (p) => !!p?.callId && String(p.callId) === String(cur().callId);
    const offs = [
      on('call:invite', (p = {}) => {
        if (!p.callId) return;
        // Tugagan qo'ng'iroq ekrani hali yopilmagan (1.5-2.5 s) — bu band emas, yangi taklif qabul qilinadi.
        if (cur().status === 'ended') act({ type: 'RESET' });
        const next = act({ type: 'INVITE_RECEIVED', ...p });
        if (next.status !== 'incoming' || String(next.callId) !== String(p.callId)) {
          // Bu qurilma band (boshqa qo'ng'iroqda) — avtomatik "band" (CALLS_SPEC §3.2).
          emit('call:reject', { callId: p.callId, reason: 'busy' });
          return;
        }
        incomingExpiresRef.current = p.expiresAt ? new Date(p.expiresAt).getTime() : Date.now() + 45_000;
        if (isAudioUnlocked()) startRingtone();
        else act({ type: 'AUDIO_BLOCKED', blocked: true });
        vibrateLoop(true);
        emit('call:ringing', { callId: p.callId });
        fetchIceServers();
      }),
      on('call:ringing', (p) => {
        if (mine(p)) act({ type: 'REMOTE_RINGING', callId: p.callId });
      }),
      on('call:accept', (p) => {
        if (!mine(p)) return;
        stopRingback();
        act({ type: 'REMOTE_ACCEPT', callId: p.callId });
        peerRef.current?.open();
      }),
      on('call:sdp', (p) => {
        if (!mine(p) || !p.description) return;
        if (peerRef.current) peerRef.current.handleSignal({ description: p.description });
        else pendingSignalsRef.current.push({ description: p.description });
      }),
      on('call:ice', (p) => {
        if (!mine(p) || p.candidate === undefined) return;
        if (peerRef.current) peerRef.current.handleSignal({ candidate: p.candidate });
        else pendingSignalsRef.current.push({ candidate: p.candidate });
      }),
      on('call:media', (p) => {
        if (mine(p)) act({ type: 'REMOTE_MEDIA', audio: p.audio, video: p.video });
      }),
      on('call:state', (p = {}) => {
        const s = cur();
        if (p.onThisDevice === false) {
          if (s.status === 'idle' || s.status === 'elsewhere') act({ type: 'SERVER_STATE', ...p });
          return;
        }
        if (p.state === 'active' && mine(p)) {
          serverSinceRef.current = p.since ?? Date.now();
          // reconnecting'dan faqat PC ulangan bo'lsa (aks holda CONNECTION_RESTORED keyin qo'llaydi).
          if (s.status === 'reconnecting' && peerRef.current?.pc?.connectionState !== 'connected') return;
          act({ type: 'SERVER_ACTIVE', callId: p.callId, since: p.since });
        }
      }),
      on('call:resume', (p) => {
        if (mine(p)) peerRef.current?.restartIce();
      }),
      on('call:busy', (p) => {
        if (!mine(p)) return;
        if (cur().status === 'inviting') act({ type: 'ACK_FAIL', callId: p.callId, code: 'busy' });
        else if (cur().status === 'outgoing') act({ type: 'END', callId: p.callId, reason: 'busy' });
      }),
      on('call:timeout', (p) => {
        if (!mine(p)) return;
        const s = cur();
        if (s.status === 'outgoing') act({ type: 'TIMEOUT', which: 'ring' });
        else if (s.status === 'incoming') act({ type: 'TIMEOUT', which: 'incoming' });
        else if (s.status === 'accepting') act({ type: 'END', callId: p.callId, reason: 'timeout' });
        else if (s.status === 'inviting') act({ type: 'ACK_FAIL', callId: p.callId, code: 'timeout' });
      }),
      on('call:end', (p = {}) => {
        const s = cur();
        if (s.status === 'elsewhere') {
          if (s.elsewhere && String(s.elsewhere.callId) === String(p.callId)) act({ type: 'END', callId: p.callId, reason: p.reason });
          return;
        }
        if (!mine(p)) return;
        clearTimeout(endFallbackRef.current);
        // Javob bermagan (jiringlayotgan) callee tab'lari uchun bekor/rad/band — jimgina yopiladi.
        const silent = p.reason === 'answered_elsewhere' || (s.role === 'callee' && s.status === 'incoming' && ['rejected', 'cancel', 'offline', 'busy'].includes(p.reason));
        act({ type: 'END', callId: p.callId, reason: p.reason, durationSec: p.durationSec ?? null, silent });
      }),
      on('call:error', (p = {}) => {
        const s = cur();
        if (p.code === 'ice_limit') {
          console.warn('[call] ice_limit');
          return;
        }
        const relevant = p.callId ? mine(p) : s.status === 'inviting';
        if (!relevant || s.status === 'idle') {
          console.warn('[call] error', p.code);
          return;
        }
        // Qabul qilish jiringlash vaqti tugashi bilan to'qnashdi — "Javob bermadi" (CALLS_SPEC §14).
        act({ type: 'ERROR', callId: p.callId, code: p.code === 'not_ringing' ? 'timeout' : p.code });
      }),
      on('connect', () => {
        const s = cur();
        if (!s.callId || !['connecting', 'active', 'reconnecting'].includes(s.status)) {
          queryServerState();
          return;
        }
        const sock = socketRef.current;
        if (!sock) return;
        sock.timeout(INVITE_ACK_MS).emit('call:resume', { callId: s.callId }, (err, ack) => {
          if (cur().callId !== s.callId) return;
          if (err || !ack?.ok) {
            act({ type: 'END', callId: s.callId, reason: 'not_in_call' });
            return;
          }
          if (ack.state === 'active' && ack.since) serverSinceRef.current = ack.since;
          if (cur().status === 'reconnecting' && peerRef.current?.pc?.connectionState === 'connected') {
            const next = act({ type: 'CONNECTION_RESTORED' });
            if (next.status === 'connecting' && serverSinceRef.current) act({ type: 'SERVER_ACTIVE', callId: s.callId, since: serverSinceRef.current });
          }
          if (cur().role === 'caller') peerRef.current?.restartIce();
        });
      }),
      on('disconnect', () => {
        const s = cur();
        if (s.status === 'connecting' || s.status === 'active') act({ type: 'CONNECTION_LOST' });
        // Boshqa qurilmadagi qo'ng'iroq haqidagi ma'lumot eskiradi — qayta ulanganda server yana yuboradi.
        if (s.status === 'elsewhere') act({ type: 'END', callId: s.elsewhere?.callId, reason: 'disconnected' });
      }),
    ];
    // Socket effektdan oldin ulangan bo'lishi mumkin (sahifa qayta yuklanganda): 'connect' qayta
    // kelmaydi — holatni o'zimiz so'raymiz (boshqa qurilmadagi qo'ng'iroq banneri uchun).
    if (socketRef.current?.connected) queryServerState();
    return () => offs.forEach((off) => off());
  }, [on, emit, act, fetchIceServers, queryServerState]);

  // Socket butunlay yo'qolsa (provider o'chdi) — 'disconnect' eventisiz ham reconnecting'ga o'tamiz.
  useEffect(() => {
    if (connected) return;
    const s = stateRef.current;
    if (s.status === 'connecting' || s.status === 'active') act({ type: 'CONNECTION_LOST' });
  }, [connected, act]);

  // ---------------------------------------------------------------- status side effects
  const { status, ringing, endReason, durationSec, callId, peer: callPeer } = call;
  useEffect(() => {
    let timer = null;
    const s = stateRef.current;
    const endLocally = (reason, which) => {
      if (s.callId) emit('call:end', { callId: s.callId, reason });
      act({ type: 'TIMEOUT', which });
    };
    switch (status) {
      case 'outgoing':
        timer = setTimeout(() => endLocally('cancel', 'ring'), RING_WATCHDOG_MS);
        break;
      case 'incoming': {
        const until = (incomingExpiresRef.current || Date.now() + 45_000) + INCOMING_GRACE_MS;
        timer = setTimeout(() => act({ type: 'TIMEOUT', which: 'incoming' }), Math.max(1000, until - Date.now()));
        break;
      }
      case 'connecting':
        timer = setTimeout(() => endLocally('failed', 'connect'), CONNECT_WATCHDOG_MS);
        break;
      case 'reconnecting':
        timer = setTimeout(() => endLocally('failed', 'reconnect'), RECONNECT_WATCHDOG_MS);
        break;
      default:
        break;
    }
    return () => clearTimeout(timer);
  }, [status, callId, act, emit]);

  useEffect(() => {
    if (status === 'outgoing' && ringing) startRingback();
    else stopRingback();
    if (status !== 'incoming') {
      stopRingtone();
      vibrateLoop(false);
    }
  }, [status, ringing]);

  useEffect(() => {
    if (status === 'idle') {
      teardown();
      return undefined;
    }
    if (status !== 'ended') return undefined;
    teardown();
    if (endReason === 'busy') playBusy();
    else playEnd();
    const ms = endReason === 'hangup' && durationSec !== null && durationSec !== undefined ? 1500 : 2500;
    const timer = setTimeout(() => act({ type: 'RESET' }), ms);
    return () => clearTimeout(timer);
  }, [status, endReason, durationSec, teardown, act]);

  // Media Session (Android bildirishnoma paneli) — faol qo'ng'iroqda.
  const handlersRef = useRef({});
  useEffect(() => {
    handlersRef.current = { endCall, toggleMic, toggleCamera };
  });
  const peerName = callPeer?.nickname || callPeer?.name || (callPeer?.username ? `@${callPeer.username}` : '');
  useEffect(() => {
    if (status !== 'active') return;
    setMediaSession(peerName, tRef.current('call.mediaSessionTitle'), {
      hangup: () => handlersRef.current.endCall(),
      toggleMicrophone: () => handlersRef.current.toggleMic(),
      toggleCamera: () => handlersRef.current.toggleCamera(),
    });
  }, [status, peerName]);

  // Sahifani yopish: ulanish/faol paytda ogohlantirish; pagehide — eng yaxshi urinish bilan tugatish.
  useEffect(() => {
    const live = status === 'connecting' || status === 'active' || status === 'reconnecting';
    const outgoingLike = status === 'inviting' || status === 'outgoing';
    if (!live && !outgoingLike) return undefined;
    const onBeforeUnload = (e) => {
      if (!live) return;
      e.preventDefault();
      e.returnValue = '';
    };
    const onPageHide = () => {
      const s = stateRef.current;
      if (s.callId) socketRef.current?.emit('call:end', { callId: s.callId, reason: outgoingLike ? 'cancel' : 'hangup' });
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [status]);

  // Birinchi foydalanuvchi harakati AudioContext'ni ochadi (RealtimeProvider ham o'rnatadi — idempotent).
  useEffect(() => {
    installAudioUnlock();
  }, []);

  // Unmount (logout / imtihonga o'tish) — hammasini yopamiz.
  useEffect(
    () => () => {
      const s = stateRef.current;
      if (s.callId && s.status !== 'ended' && s.status !== 'idle' && s.status !== 'elsewhere') {
        socketRef.current?.emit(s.status === 'incoming' ? 'call:reject' : 'call:end', s.status === 'incoming' ? { callId: s.callId, reason: 'declined' } : { callId: s.callId, reason: s.status === 'outgoing' || s.status === 'inviting' ? 'cancel' : 'hangup' });
      }
      teardown();
    },
    [teardown]
  );

  // E2E hook (CALLS_SPEC §9.6).
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E_HOOKS !== '1') return undefined;
    window.__vocablyCall = { getPc: () => peerRef.current?.pc || null, getState: () => stateRef.current, state: () => stateRef.current.status };
    return () => {
      delete window.__vocablyCall;
    };
  }, []);

  const value = useMemo(
    () => ({
      call,
      supported,
      canCall,
      unavailableKey,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMic,
      toggleCamera,
      flipCamera,
      setOutputDevice,
      outputDeviceId,
      flipping,
      minimize,
      restore,
      enableSound,
      clearError,
      retryAfterError,
      localStream,
      remoteStream,
      audioRetry,
      reportAudioBlocked,
      pendingCallback,
      consumeCallback,
    }),
    [call, supported, canCall, unavailableKey, startCall, acceptCall, rejectCall, endCall, toggleMic, toggleCamera, flipCamera, setOutputDevice, outputDeviceId, flipping, minimize, restore, enableSound, clearError, retryAfterError, localStream, remoteStream, audioRetry, reportAudioBlocked, pendingCallback, consumeCallback]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  return useContext(CallContext) || FALLBACK;
}
