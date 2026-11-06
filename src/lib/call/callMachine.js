// Qo'ng'iroq holat mashinasi — SOF reducer (taymer yo'q, I/O yo'q): CallProvider taymerlarni va
// socket hodisalarini event'larga aylantiradi, shuning uchun testlarga soxta taymer kerak emas.
// docs/chat/CALLS_SPEC.md §9.1. Ro'yxatda yo'q (holat, event) juftligi e'tiborsiz qoldiriladi va
// AYNAN shu state obyekti qaytadi (React keraksiz qayta chizmaydi).

export const CALL_STATUSES = ['idle', 'starting', 'inviting', 'outgoing', 'incoming', 'accepting', 'connecting', 'active', 'reconnecting', 'ended', 'elsewhere'];

export const initialCallState = Object.freeze({
  status: 'idle',
  callId: null,
  conversationId: null,
  kind: 'audio',
  role: 'caller',
  peer: null, // { id, username, name, nickname, photoId }
  ringing: false, // outgoing: qabul qiluvchining tab'i jiringlayapti
  since: null, // ms, server acceptedAt (taymer asosi)
  resumeTo: null, // reconnecting'dan keyin qaytiladigan holat
  endReason: null,
  durationSec: null,
  mic: true,
  camera: false,
  facing: 'user',
  remoteMic: true,
  remoteCamera: false,
  minimized: false,
  audioBlocked: false,
  error: null, // { kind: 'media' | 'grant', code, message, retry? } -> CallErrorSheet
  elsewhere: null, // { callId, conversationId, state } — boshqa qurilmamda qo'ng'iroq bor
});

// Mikrofon/kamera tugmalari ishlaydigan holatlar ("starting..active"; reconnecting ham — ulanish
// tiklanayotganda ham ovozni o'chira olish kerak).
const MEDIA_CONTROL = new Set(['starting', 'inviting', 'outgoing', 'incoming', 'accepting', 'connecting', 'active', 'reconnecting']);
// Kichraytirish: ekranli har qanday faol holat (chiquvchi jiringlash ham — strip "Jiringlamoqda…").
const MINIMIZABLE = new Set(['starting', 'inviting', 'outgoing', 'incoming', 'accepting', 'connecting', 'active', 'reconnecting']);

const toMs = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
};

const ended = (state, reason, extra = {}) => ({ ...state, status: 'ended', endReason: reason ?? null, ringing: false, resumeTo: null, ...extra });
const backToIdle = (state, extra = {}) => ({ ...initialCallState, error: state.error, elsewhere: null, ...extra });
const sameCall = (state, event) => !event.callId || !state.callId || String(event.callId) === String(state.callId);

const errorInfo = (kind, error) => ({
  kind,
  code: error?.code || error?.name || null,
  name: error?.name || null,
  message: error?.message || null,
  ...(error?.retry ? { retry: error.retry } : {}),
});

/**
 * @param {typeof initialCallState} state
 * @param {{ type: string, [k: string]: any }} event
 */
export function reduceCall(state, event) {
  if (!event || !event.type) return state;
  const s = state.status;

  switch (event.type) {
    case 'START':
      if (s !== 'idle') return state;
      return {
        ...initialCallState,
        status: 'starting',
        role: 'caller',
        conversationId: event.conversationId ?? null,
        kind: event.kind === 'video' ? 'video' : 'audio',
        peer: event.peer ?? null,
        camera: event.kind === 'video',
        error: null,
      };

    case 'MEDIA_FAILED':
      if (s !== 'starting') return state;
      return backToIdle(state, { error: errorInfo('media', event.error) });

    case 'GRANT_FAILED':
      if (s !== 'starting') return state;
      return ended(state, event.code || 'failed');

    case 'GRANT_OK':
      if (s !== 'starting') return state;
      return { ...state, status: 'inviting', callId: event.callId ?? null, peer: event.peer ? { ...(state.peer || {}), ...event.peer } : state.peer };

    case 'ACK_OK':
      if (s !== 'inviting' || !sameCall(state, event)) return state;
      return { ...state, status: 'outgoing', ringing: false };

    case 'ACK_FAIL':
      if (s !== 'inviting' || !sameCall(state, event)) return state;
      return ended(state, event.code || 'failed');

    case 'REMOTE_RINGING':
      if (s !== 'outgoing' || !sameCall(state, event) || state.ringing) return state;
      return { ...state, ringing: true };

    case 'REMOTE_ACCEPT':
      if (s !== 'outgoing' || !sameCall(state, event)) return state;
      return { ...state, status: 'connecting', ringing: false };

    case 'INVITE_RECEIVED': {
      if (s !== 'idle' && s !== 'elsewhere') return state;
      if (s === 'elsewhere' && state.elsewhere && String(state.elsewhere.callId) === String(event.callId)) return state;
      const from = event.from || {};
      return {
        ...initialCallState,
        status: 'incoming',
        role: 'callee',
        callId: event.callId ?? null,
        conversationId: event.conversationId ?? null,
        kind: event.kind === 'video' ? 'video' : 'audio',
        peer: { id: from.userId ?? from.id ?? null, username: from.username ?? null, name: from.name ?? null, nickname: from.nickname ?? null, photoId: from.photoId ?? null },
        camera: false,
        error: state.error,
      };
    }

    case 'ACCEPT':
      if (s !== 'incoming') return state;
      return { ...state, status: 'accepting', camera: state.kind === 'video' && !event.videoOff, minimized: false };

    case 'REJECT':
      if (s !== 'incoming') return state;
      return backToIdle(state);

    case 'ACCEPT_MEDIA_READY':
      if (s !== 'accepting') return state;
      return { ...state, status: 'connecting', ...(event.videoFailed ? { camera: false } : {}) };

    case 'ACCEPT_MEDIA_FAILED':
      if (s !== 'accepting') return state;
      return ended(state, 'media_error', { error: errorInfo('media', event.error) });

    case 'SERVER_ACTIVE': {
      if (s !== 'connecting' && s !== 'reconnecting') return state;
      if (!sameCall(state, event)) return state;
      const since = toMs(event.since) ?? state.since ?? Date.now();
      return { ...state, status: 'active', since, resumeTo: null };
    }

    case 'CONNECTION_LOST':
      if (s !== 'connecting' && s !== 'active') return state;
      return { ...state, status: 'reconnecting', resumeTo: s };

    case 'CONNECTION_RESTORED':
      if (s !== 'reconnecting') return state;
      return { ...state, status: state.resumeTo || 'connecting', resumeTo: null };

    case 'REMOTE_MEDIA': {
      if (s === 'idle') return state;
      const remoteMic = event.audio !== false;
      const remoteCamera = !!event.video;
      if (remoteMic === state.remoteMic && remoteCamera === state.remoteCamera) return state;
      return { ...state, remoteMic, remoteCamera };
    }

    case 'TOGGLE_MIC': {
      if (!MEDIA_CONTROL.has(s)) return state;
      const mic = typeof event.value === 'boolean' ? event.value : !state.mic;
      return mic === state.mic ? state : { ...state, mic };
    }

    case 'TOGGLE_CAMERA': {
      if (!MEDIA_CONTROL.has(s)) return state;
      const camera = typeof event.value === 'boolean' ? event.value : !state.camera;
      return camera === state.camera ? state : { ...state, camera };
    }

    case 'SET_FACING': {
      if (!MEDIA_CONTROL.has(s)) return state;
      const facing = event.facing === 'environment' ? 'environment' : 'user';
      return facing === state.facing ? state : { ...state, facing };
    }

    case 'MINIMIZE':
      if (!MINIMIZABLE.has(s) || state.minimized) return state;
      return { ...state, minimized: true };

    case 'RESTORE':
      if (!MINIMIZABLE.has(s) || !state.minimized) return state;
      return { ...state, minimized: false };

    case 'AUDIO_BLOCKED': {
      const audioBlocked = !!event.blocked;
      return audioBlocked === state.audioBlocked ? state : { ...state, audioBlocked };
    }

    case 'SERVER_STATE': {
      if (event.onThisDevice !== false) return state;
      const info = { callId: event.callId ?? null, conversationId: event.conversationId ?? null, state: event.state ?? null };
      if (s === 'idle') return { ...state, status: 'elsewhere', elsewhere: info };
      if (s === 'elsewhere') {
        if (state.elsewhere && String(state.elsewhere.callId) === String(info.callId) && state.elsewhere.state === info.state) return state;
        return { ...state, elsewhere: info };
      }
      return state;
    }

    case 'END': {
      if (s === 'idle' || s === 'ended') return state; // birinchi tugash sababi saqlanadi
      if (s === 'elsewhere') {
        if (!state.elsewhere || (event.callId && String(event.callId) !== String(state.elsewhere.callId))) return state;
        return backToIdle(state);
      }
      if (!sameCall(state, event)) return state;
      if (event.silent) return backToIdle(state);
      return ended(state, event.reason || 'hangup', { durationSec: event.durationSec ?? null });
    }

    case 'TIMEOUT':
      if (event.which === 'ring' && s === 'outgoing') return ended(state, 'timeout');
      if (event.which === 'incoming' && s === 'incoming') return backToIdle(state);
      if (event.which === 'connect' && s === 'connecting') return ended(state, 'failed');
      if (event.which === 'reconnect' && s === 'reconnecting') return ended(state, 'disconnected');
      return state;

    case 'ERROR':
      if (s === 'idle' || s === 'ended' || s === 'elsewhere' || !sameCall(state, event)) return state;
      return ended(state, event.code || 'failed');

    case 'SET_ERROR':
      // Qo'ng'iroq davomidagi media xatosi (kamera yoqilmadi, almashtirilmadi) — holat o'zgarmaydi.
      return { ...state, error: errorInfo(event.kind || 'media', event.error) };

    case 'RESET':
      if (s !== 'ended') return state;
      return backToIdle(state);

    case 'CLEAR_ERROR':
      return state.error ? { ...state, error: null } : state;

    default:
      return state;
  }
}

// Tugash sababi -> i18n kaliti (CALLS_SPEC §9.1 jadvali).
const REASON_KEYS = {
  timeout: 'call.endedNoAnswer',
  rejected: 'call.endedDeclined',
  busy: 'call.endedBusy',
  cancel: 'call.endedCancelled',
  callee_offline: 'call.endedOffline',
  offline: 'call.endedOffline',
  failed: 'call.endedFailed',
  media_error: 'call.endedFailed',
  bad_payload: 'call.endedFailed',
  disconnected: 'call.endedLost',
  not_in_call: 'call.endedLost',
  server_shutdown: 'call.endedLost',
  blocked: 'call.endedUnavailable',
  banned: 'call.endedUnavailable',
  admin: 'call.endedUnavailable',
  callee_unavailable: 'call.endedUnavailable',
  bad_grant: 'call.endedUnavailable',
  self_call: 'call.endedUnavailable',
  not_configured: 'call.endedUnavailable',
  rate_limited: 'call.endedRateLimited',
  already_in_call: 'call.busyToast',
};

/**
 * `hangup` davomiylik bilan -> "Qo'ng'iroq tugadi · 2:13"; davomiyliksiz (ulanmasdan tugatildi) ->
 * "Bekor qilindi". Qolganlari jadval bo'yicha, noma'lumi -> "Ulanib bo'lmadi".
 */
export function endReasonLabelKey(reason, role, durationSec) {
  if (reason === 'hangup') return durationSec !== null && durationSec !== undefined ? 'call.endedWithDuration' : 'call.endedCancelled';
  return REASON_KEYS[reason] || 'call.endedFailed';
}

/** Ekrandagi "jonli" (media ochiq) holatlar — tovush/taymer/remote audio uchun. */
export const isLiveStatus = (status) => status === 'connecting' || status === 'active' || status === 'reconnecting';
/** Qo'ng'iroq ekrani (InCallScreen) ko'rsatiladigan holatlar. */
export const isInCallStatus = (status) => ['starting', 'inviting', 'outgoing', 'accepting', 'connecting', 'active', 'reconnecting', 'ended'].includes(status);
