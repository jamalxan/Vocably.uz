'use client';
// Qurilma imkoniyatlari va brauzer API o'rovchilari (CALLS_SPEC §9.3): getUserMedia, kameralar,
// ovoz chiqishi (setSinkId), tebranish, ekran uyg'oq turishi (Wake Lock), Media Session.
// Barchasi himoyalangan: API bo'lmasa (iOS'da vibrate yo'q, Firefox'da setSinkId yo'q) jim o'tadi.

const AUDIO_CONSTRAINTS = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
const videoConstraints = (facing) => ({ width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 }, facingMode: facing });

/** Xavfsiz kontekst + getUserMedia + RTCPeerConnection (Telegram/Instagram WebView'da yo'q). */
export function mediaSupported() {
  if (typeof window === 'undefined') return false;
  return !!window.isSecureContext && !!navigator.mediaDevices?.getUserMedia && typeof window.RTCPeerConnection === 'function';
}

/**
 * Qo'ng'iroq uchun oqim. Faqat video so'rovi muvaffaqiyatsiz bo'lsa — faqat audio bilan qayta
 * urinadi (`videoFailed:true`); audio xatosi yuqoriga otiladi (mediaErrorMessage uchun).
 */
export async function getLocalStream(kind, { facing = 'user', videoOff = false } = {}) {
  const md = navigator.mediaDevices;
  const wantVideo = kind === 'video' && !videoOff;
  if (!wantVideo) return { stream: await md.getUserMedia({ audio: AUDIO_CONSTRAINTS, video: false }), videoFailed: false };
  try {
    return { stream: await md.getUserMedia({ audio: AUDIO_CONSTRAINTS, video: videoConstraints(facing) }), videoFailed: false };
  } catch (err) {
    // Mikrofonning o'zi ham ishlamasa — shu (audio) xato foydalanuvchiga ko'rsatiladi.
    const stream = await md.getUserMedia({ audio: AUDIO_CONSTRAINTS, video: false });
    return { stream, videoFailed: true, videoError: err };
  }
}

/** Bitta video trek (kamera yoqish / almashtirish). */
export async function getVideoTrack(facing = 'user') {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraints(facing) });
  return stream.getVideoTracks()[0];
}

export async function listCameras() {
  try {
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.filter((d) => d.kind === 'videoinput');
  } catch {
    return [];
  }
}

export async function listOutputs() {
  try {
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.filter((d) => d.kind === 'audiooutput');
  } catch {
    return [];
  }
}

/** Ovoz chiqishini tanlash faqat desktop Chromium'da (setSinkId) va 1 dan ortiq qurilma bo'lsa. */
export async function canChooseOutput() {
  if (typeof window === 'undefined' || !window.HTMLMediaElement || !('setSinkId' in window.HTMLMediaElement.prototype)) return false;
  return (await listOutputs()).length > 1;
}

let vibrateTimer = null;
/** Kiruvchi qo'ng'iroqda tebranish sikli (Android); iOS'da `navigator.vibrate` yo'q. */
export function vibrateLoop(on) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  clearInterval(vibrateTimer);
  vibrateTimer = null;
  try {
    if (!on) {
      navigator.vibrate(0);
      return;
    }
    navigator.vibrate([500, 300, 500, 300]);
    vibrateTimer = setInterval(() => navigator.vibrate([500, 300, 500, 300]), 1600);
  } catch {
    // ba'zi brauzerlar foydalanuvchi harakatisiz rad etadi
  }
}

let wakeLock = null;
export async function requestWakeLock() {
  try {
    if (wakeLock || typeof navigator === 'undefined' || !navigator.wakeLock?.request) return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener?.('release', () => {
      wakeLock = null;
    });
  } catch {
    wakeLock = null;
  }
}

export function releaseWakeLock() {
  const lock = wakeLock;
  wakeLock = null;
  lock?.release?.().catch?.(() => {});
}

/** Android Chrome bildirishnoma panelidagi boshqaruv (tugatish, mikrofon, kamera). */
export function setMediaSession(title, artist, handlers = {}) {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
  try {
    if (typeof window.MediaMetadata === 'function') navigator.mediaSession.metadata = new window.MediaMetadata({ title, artist });
    const map = { hangup: handlers.hangup, togglemicrophone: handlers.toggleMicrophone, togglecamera: handlers.toggleCamera };
    Object.entries(map).forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn || null);
      } catch {
        // bu brauzerda qo'llab-quvvatlanmaydigan action
      }
    });
  } catch {
    // Media Session yo'q yoki cheklangan
  }
}

export function clearMediaSession() {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
  try {
    navigator.mediaSession.metadata = null;
    ['hangup', 'togglemicrophone', 'togglecamera'].forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // qo'llab-quvvatlanmaydi
      }
    });
  } catch {
    // e'tiborsiz
  }
}
