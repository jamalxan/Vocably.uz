// Browser helpers shared by the flagship games: guest results kept until sign-up, sound/vibration.
import { RUN_STORAGE_KEY } from './run';

const FX_KEY = 'vocably.flagship.fx';

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked — nothing to keep */ }
}

/** Guest round finished: remember missed words so they can go into SRS after sign-up. */
export function saveGuestMissed(words) {
  const prev = read(RUN_STORAGE_KEY, null);
  const merged = [...new Set([...(prev && !prev.claimed ? prev.words || [] : []), ...words])].slice(-30);
  write(RUN_STORAGE_KEY, { words: merged, at: Date.now(), claimed: false });
}

/**
 * Signed-in: posts pending guest words once. Returns the number of words added, or 0.
 * Safe to call on every dashboard mount (no-op when nothing is pending).
 */
export async function claimGuestMissed() {
  const pending = read(RUN_STORAGE_KEY, null);
  if (!pending || pending.claimed || !pending.words?.length) return 0;
  try {
    const r = await fetch('/api/flagship/run/claim', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: pending.words }),
    });
    if (r.status === 401) return 0; // still a guest
    const j = await r.json().catch(() => ({}));
    // 400 = nothing valid to save; drop it either way so we don't retry forever.
    if (r.ok || r.status === 400) write(RUN_STORAGE_KEY, { ...pending, claimed: true });
    return r.ok ? j.added || 0 : 0;
  } catch {
    return 0;
  }
}

export function readFx() {
  const v = read(FX_KEY, null);
  return { sound: v?.sound !== false, vibrate: v?.vibrate !== false };
}
export function writeFx(fx) {
  write(FX_KEY, fx);
}

let ctx = null;
/** Short tone — no audio files to download. */
export function beep(kind, fx) {
  if (fx?.vibrate && kind === 'wrong' && typeof navigator !== 'undefined') navigator.vibrate?.(90);
  if (!fx?.sound || typeof window === 'undefined') return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = kind === 'wrong' ? 'square' : 'sine';
    o.frequency.value = kind === 'wrong' ? 160 : kind === 'end' ? 520 : 880;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === 'wrong' ? 0.25 : 0.12));
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  } catch { /* audio blocked */ }
}
