// Foydalanuvchi yuklagan audio (Speaking yozuvlari) xavfsizligi. Muammo: `speaking-recording` mijoz e'lon qilgan MIME turini ("text/html")
// o'zgartirmay GridFS'ga yozardi, `/api/exam/audio/[fileId]` esa uni SHU tur bilan qaytarardi — ilova originida HTML sifatida
// ochilib, saqlangan XSS bo'lishi mumkin edi (CSP'da 'unsafe-inline' ruxsat etilgan). Himoya ikki qatlamli:
//   1) yuklashda: tur BAYTLARdan aniqlanadi (magic bytes), hajm cheklanadi, e'lon qilingan tur e'tiborga olinmaydi;
//   2) berishda: saqlangan tur ro'yxatdan o'tkaziladi, aks holda `application/octet-stream`; `nosniff` + `sandbox` CSP.

export const AUDIO_UPLOAD_MAX_BYTES = 12 * 1024 * 1024;
export const AUDIO_UPLOAD_MIN_BYTES = 2000;
export const MAX_RECORDING_SEC = 900;

export type AudioMime = 'audio/webm' | 'audio/ogg' | 'audio/mpeg' | 'audio/mp4' | 'audio/wav';

/** Boshlang'ich baytlardan audio konteynerini aniqlaydi. Taniy olmasa null (rad etiladi). */
export function detectAudioType(b: Uint8Array): AudioMime | null {
  if (b.length < 12) return null;
  // WebM / Matroska (EBML sarlavhasi)
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'audio/webm';
  // Ogg ("OggS")
  if (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return 'audio/ogg';
  // WAV: "RIFF" .... "WAVE"
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45) return 'audio/wav';
  // MP4/M4A: "ftyp" 4-bayt ofsetda
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'audio/mp4';
  // MP3: "ID3" yoki kadr sinxronizatsiyasi (0xFF 0xEx)
  if ((b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return 'audio/mpeg';
  return null;
}

const SAFE_AUDIO_RE = /^(audio\/(webm|ogg|mpeg|mp3|mp4|x-m4a|m4a|aac|wav|x-wav|wave|opus|flac)|video\/webm)$/;
const SAFE_IMAGE_RE = /^image\/(png|jpeg|webp|gif)$/;

/**
 * Saqlangan `contentType`ni berishdan oldin tozalaydi: parametrlar (`;codecs=…`) olib tashlanadi, ro'yxatda bo'lmasa
 * `application/octet-stream` (brauzer ko'rsatmaydi/bajarmaydi).
 */
export function safeServedContentType(stored: string | undefined | null, kind: 'audio' | 'image'): string {
  const base = String(stored || '').split(';')[0].trim().toLowerCase();
  const ok = kind === 'audio' ? SAFE_AUDIO_RE.test(base) : SAFE_IMAGE_RE.test(base);
  return ok ? base : 'application/octet-stream';
}

/** Foydalanuvchi yuklagan kontent uchun qat'iy sarlavhalar (origin ichida render/bajarilishining oldini oladi). */
export function mediaResponseHeaders(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    // Hujjat sifatida ochilib qolsa ham skript/ulanish ishlamaydi (originsiz sandbox).
    'Content-Security-Policy': "default-src 'none'; sandbox",
    ...(contentType === 'application/octet-stream' ? { 'Content-Disposition': 'attachment' } : {}),
  };
}

/** `durationSec` ni 0..MAX_RECORDING_SEC oralig'iga keltiradi. */
export function clampDuration(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(MAX_RECORDING_SEC, Math.round(n))) : 0;
}
