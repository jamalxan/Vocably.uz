// Small pure validators for media metadata the client sends with a message (Telegram parity:
// albums, file names, voice waveforms). Server and client share them. Tested in mediaMeta.test.js.

export const ALBUM_MAX = 10;
export const WAVEFORM_SAMPLES = 60;
export const WAVEFORM_MAX = 31;

/** Album ids are client-made: 6–40 url-safe chars, else no album. */
export function cleanAlbumId(raw) {
  const s = String(raw ?? '').trim();
  return /^[A-Za-z0-9_-]{6,40}$/.test(s) ? s : null;
}

/** A display name for files: control characters and path separators out, 120 chars max. */
export function cleanFileName(raw) {
  const s = String(raw ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/]+/g, '-')
    .trim();
  if (!s || s === '.' || s === '..') return '';
  return s.slice(0, 120);
}

/** 1–100 integers in 0..31, or undefined (the bubble then draws a flat line). */
export function cleanWaveform(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out = raw.slice(0, 100).map((v) => Math.max(0, Math.min(WAVEFORM_MAX, Math.round(Number(v) || 0))));
  return out.length ? out : undefined;
}

/** Reduces raw amplitude samples (0..1) to WAVEFORM_SAMPLES ints in 0..31, normalised to the loudest. */
export function buildWaveform(samples, size = WAVEFORM_SAMPLES) {
  if (!samples?.length) return undefined;
  const bucket = samples.length / size;
  const bars = [];
  for (let i = 0; i < size; i++) {
    const from = Math.floor(i * bucket);
    const to = Math.max(from + 1, Math.floor((i + 1) * bucket));
    let peak = 0;
    for (let j = from; j < to && j < samples.length; j++) peak = Math.max(peak, Math.abs(samples[j]) || 0);
    bars.push(peak);
  }
  const max = Math.max(...bars) || 1;
  return bars.map((b) => Math.round((b / max) * WAVEFORM_MAX));
}

const UNITS = ['B', 'KB', 'MB', 'GB'];
export function formatBytes(n) {
  let v = Math.max(0, Number(n) || 0);
  let i = 0;
  while (v >= 1024 && i < UNITS.length - 1) {
    v /= 1024;
    i++;
  }
  return `${i === 0 ? v : v.toFixed(v >= 10 ? 0 : 1)} ${UNITS[i]}`;
}

/** File extension (lowercase, no dot) for the icon/label, from the name or the mime type. */
export function fileExtension(name, mimeType) {
  const fromName = String(name || '').match(/\.([a-z0-9]{1,6})$/i)?.[1];
  if (fromName) return fromName.toLowerCase();
  const sub = String(mimeType || '').split('/')[1]?.split(';')[0] || '';
  return sub.replace(/^x-/, '').slice(0, 6).toLowerCase();
}
