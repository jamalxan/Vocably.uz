// RTCPeerConnection o'rovchisi — "perfect negotiation" (MDN naqshi), CALLS_SPEC §9.2.
// Qo'ng'iroq qiluvchi — impolite (to'qnashgan taklifni e'tiborsiz qoldiradi), qabul qiluvchi — polite
// (o'z taklifini qaytarib, kelganiga javob beradi). Shu tufayli ikkala tomon ham istalgan payt
// qayta kelishuv (kamera yoqish, ICE restart) boshlay oladi va "glare" holati o'z-o'zidan hal bo'ladi.
//
// `startOpen:false` (qo'ng'iroq qiluvchi): PC grant'dan keyinoq yaratiladi va taklif + ICE yig'ish
// jiringlash paytida boshlanadi (tezroq ulanish), lekin signal'lar `open()` (call:accept) gacha
// navbatda turadi — server ularni faqat bog'langan socket'lar orasida uzatadi.
//
// Testlar uchun `PeerConnection` va `timers` tashqaridan beriladi (peer.test.js — soxta PC).

const AUTO_RESTART_MAX = 2;
const ICE_DISCONNECT_GRACE_MS = 3000;
const AFTER_LAST_RESTART_MS = 15000;
const VIDEO_MAX_BITRATE = 1_000_000;

const plainDescription = (d) => (d ? { type: d.type, sdp: d.sdp } : null);
const plainCandidate = (c) => {
  if (!c) return null;
  if (typeof c.toJSON === 'function') return c.toJSON();
  const { candidate, sdpMid, sdpMLineIndex, usernameFragment } = c;
  return { candidate, sdpMid, sdpMLineIndex, usernameFragment };
};

// Firefox'ning eski versiyalarida `connectionState` yo'q — ICE holatidan taxminlaymiz.
const ICE_TO_CONNECTION = { new: 'new', checking: 'connecting', connected: 'connected', completed: 'connected', disconnected: 'disconnected', failed: 'failed', closed: 'closed' };

/**
 * @param {object} o
 * @param {RTCIceServer[]} [o.iceServers]
 * @param {boolean} o.polite
 * @param {(msg: { description?: object, candidate?: object|null }) => void} o.send
 * @param {(e: RTCTrackEvent) => void} [o.onTrack]
 * @param {(state: string) => void} [o.onConnectionState]
 * @param {(reason: string) => void} [o.onFatal] — ikkinchi ICE restart'dan 15 s keyin ham ulanmasa
 */
export function createPeer({
  iceServers = [],
  polite,
  send,
  onTrack,
  onConnectionState,
  onFatal,
  forceRelay = false,
  startOpen = false,
  PeerConnection,
  timers,
  log = (e) => console.warn('[call] peer', e),
}) {
  const PC = PeerConnection || (typeof window !== 'undefined' ? window.RTCPeerConnection : undefined);
  if (!PC) throw new Error('webrtc_unsupported');
  const setTimer = timers?.setTimeout || setTimeout;
  const clearTimer = timers?.clearTimeout || clearTimeout;

  const pc = new PC({ iceServers, iceTransportPolicy: forceRelay ? 'relay' : 'all', bundlePolicy: 'max-bundle' });

  let opened = !!startOpen;
  let closed = false;
  const outbox = [];
  let makingOffer = false;
  let ignoreOffer = false;
  let isSettingRemoteAnswerPending = false;
  const pendingCandidates = [];
  let autoRestarts = 0;
  let iceTimer = null;
  let fatalTimer = null;
  let everConnected = false;
  let lastConnectionState = null;
  const bitrateApplied = new Set();
  const senders = {}; // kind -> RTCRtpSender (track null bo'lib qolsa ham topilsin)

  const out = (msg) => {
    if (closed) return;
    if (opened) send(msg);
    else outbox.push(msg);
  };

  function open() {
    if (opened || closed) return;
    opened = true;
    const descriptions = outbox.filter((m) => m.description);
    const candidates = outbox.filter((m) => !m.description);
    outbox.length = 0;
    [...descriptions, ...candidates].forEach((m) => send(m));
  }

  const emitConnection = (state) => {
    if (!state || state === lastConnectionState) return;
    lastConnectionState = state;
    if (state === 'connected') {
      everConnected = true;
      clearTimer(fatalTimer);
      fatalTimer = null;
    }
    onConnectionState?.(state);
  };

  function applyVideoBitrate() {
    if (typeof pc.getSenders !== 'function') return;
    pc.getSenders().forEach((sender) => {
      const track = sender.track;
      if (!track || track.kind !== 'video' || bitrateApplied.has(track.id) || typeof sender.getParameters !== 'function') return;
      bitrateApplied.add(track.id);
      try {
        const params = sender.getParameters() || {};
        if (!params.encodings || !params.encodings.length) params.encodings = [{}];
        params.encodings[0].maxBitrate = VIDEO_MAX_BITRATE;
        Promise.resolve(sender.setParameters(params)).catch(() => {});
      } catch {
        // ba'zi brauzerlar kelishuvdan oldin parametrlarni bermaydi — keyingi 'stable'da emas, o'tkazamiz
      }
    });
  }

  pc.onnegotiationneeded = async () => {
    if (closed) return;
    try {
      makingOffer = true;
      await pc.setLocalDescription();
      out({ description: plainDescription(pc.localDescription) });
    } catch (e) {
      log(e);
    } finally {
      makingOffer = false;
    }
  };

  pc.onicecandidate = ({ candidate } = {}) => out({ candidate: plainCandidate(candidate) });

  pc.ontrack = (e) => {
    if (!closed) onTrack?.(e);
  };

  pc.onsignalingstatechange = () => {
    if (pc.signalingState === 'stable') applyVideoBitrate();
  };

  pc.onconnectionstatechange = () => {
    if (!closed) emitConnection(pc.connectionState);
  };

  function scheduleFatalCheck() {
    clearTimer(fatalTimer);
    fatalTimer = setTimer(() => {
      fatalTimer = null;
      if (!closed && lastConnectionState !== 'connected') onFatal?.('failed');
    }, AFTER_LAST_RESTART_MS);
  }

  function autoRestart() {
    if (closed || polite || autoRestarts >= AUTO_RESTART_MAX) return;
    autoRestarts += 1;
    restartIce();
    if (autoRestarts >= AUTO_RESTART_MAX) scheduleFatalCheck();
  }

  pc.oniceconnectionstatechange = () => {
    if (closed) return;
    const st = pc.iceConnectionState;
    if (!pc.connectionState) emitConnection(ICE_TO_CONNECTION[st]);
    clearTimer(iceTimer);
    iceTimer = null;
    if (st === 'disconnected') iceTimer = setTimer(autoRestart, ICE_DISCONNECT_GRACE_MS);
    else if (st === 'failed') autoRestart();
  };

  async function handleSignal({ description, candidate } = {}) {
    if (closed) return;
    try {
      if (description) {
        const readyForOffer = !makingOffer && (pc.signalingState === 'stable' || isSettingRemoteAnswerPending);
        const offerCollision = description.type === 'offer' && !readyForOffer;
        ignoreOffer = !polite && offerCollision;
        if (ignoreOffer) return;
        isSettingRemoteAnswerPending = description.type === 'answer';
        // polite tomonda to'qnashuv bo'lsa setRemoteDescription o'z taklifimizni yashirincha qaytaradi (implicit rollback).
        await pc.setRemoteDescription(description);
        isSettingRemoteAnswerPending = false;
        while (pendingCandidates.length) {
          const c = pendingCandidates.shift();
          await pc.addIceCandidate(c).catch(() => {});
        }
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          out({ description: plainDescription(pc.localDescription) });
        }
      } else if (candidate !== undefined) {
        if (!pc.remoteDescription) {
          pendingCandidates.push(candidate);
          return;
        }
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {
          if (!ignoreOffer) log(e);
        }
      }
    } catch (e) {
      isSettingRemoteAnswerPending = false;
      log(e);
    }
  }

  function addLocalStream(stream) {
    if (closed || !stream) return;
    stream.getTracks().forEach((track) => {
      if (track.kind === 'video') track.contentHint = 'motion';
      senders[track.kind] = pc.addTrack(track, stream);
    });
  }

  function transceiverFor(kind) {
    if (typeof pc.getTransceivers !== 'function') return null;
    return pc.getTransceivers().find((t) => t.sender === senders[kind] || t.sender?.track?.kind === kind || t.receiver?.track?.kind === kind) || null;
  }

  function senderFor(kind) {
    if (senders[kind]) return senders[kind];
    const fromSenders = typeof pc.getSenders === 'function' ? pc.getSenders().find((s) => s.track?.kind === kind) : null;
    return fromSenders || transceiverFor(kind)?.sender || null;
  }

  /** Mavjud sender'dagi trekni almashtiradi (kamera almashtirish) — qayta kelishuvsiz. */
  async function replaceTrack(kind, track) {
    const sender = senderFor(kind);
    if (!sender || closed) return false;
    if (track && kind === 'video') track.contentHint = 'motion';
    await sender.replaceTrack(track);
    return true;
  }

  /**
   * Kamera: `null` -> yuborishni to'xtatadi va eski trekni o'chiradi (kamera chirog'i o'chadi);
   * trek -> mavjud video sender bo'lsa replaceTrack, bo'lmasa addTrack (audio qo'ng'iroq videoga
   * o'tadi — negotiationneeded orqali qayta kelishuv).
   */
  async function setVideoSending(track, stream) {
    if (closed) return;
    const sender = senderFor('video');
    if (!track) {
      if (!sender) return;
      const old = sender.track;
      await sender.replaceTrack(null);
      old?.stop?.();
      return;
    }
    track.contentHint = 'motion';
    if (sender) {
      const old = sender.track;
      await sender.replaceTrack(track);
      if (old && old !== track) old.stop?.();
      // Masofadan yaratilgan (recvonly) transceiver — endi yuborish ham kerak.
      const tr = transceiverFor('video');
      if (tr && (tr.direction === 'recvonly' || tr.direction === 'inactive')) tr.direction = 'sendrecv';
      senders.video = sender;
      return;
    }
    senders.video = pc.addTrack(track, stream);
  }

  function setMicEnabled(on) {
    const sender = senderFor('audio');
    if (sender?.track) sender.track.enabled = !!on;
  }

  function restartIce() {
    if (closed) return;
    if (typeof pc.restartIce === 'function') pc.restartIce();
    else if (typeof pc.createOffer === 'function')
      pc.createOffer({ iceRestart: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => out({ description: plainDescription(pc.localDescription) }))
        .catch(log);
  }

  function close() {
    if (closed) return;
    closed = true;
    clearTimer(iceTimer);
    clearTimer(fatalTimer);
    outbox.length = 0;
    pendingCandidates.length = 0;
    pc.onnegotiationneeded = null;
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onsignalingstatechange = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    try {
      pc.close();
    } catch {
      // allaqachon yopilgan
    }
  }

  return {
    pc,
    open,
    handleSignal,
    addLocalStream,
    replaceTrack,
    setVideoSending,
    setMicEnabled,
    restartIce,
    close,
    getStats: (...args) => pc.getStats(...args),
    get isOpen() {
      return opened;
    },
    get closed() {
      return closed;
    },
    get everConnected() {
      return everConnected;
    },
  };
}
