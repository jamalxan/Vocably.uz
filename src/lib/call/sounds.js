'use client';
// Qo'ng'iroq va xabar tovushlari — faqat WebAudio (binar fayl yo'q, CSP o'zgarmaydi), CALLS_SPEC §9.4.
// Bitta umumiy AudioContext: iOS Safari/Chrome uni faqat foydalanuvchi harakati (gesture) ichida
// ishga tushirishga ruxsat beradi, shuning uchun `unlockAudio()` birinchi bosish/tugmada chaqiriladi
// (installAudioUnlock). Kontekst hali `suspended` bo'lsa har bir play funksiyasi jim (no-op) — kiruvchi
// qo'ng'iroq ekrani o'shanda "Ovozni yoqish" tugmasini ko'rsatadi.

let ctx = null;
let installed = false;
const live = new Set(); // { osc, gain } — stopAll() uchun
const loops = new Map(); // 'ringtone' | 'ringback' -> timeout id

function getCtx(create) {
  if (ctx || !create || typeof window === 'undefined') return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Foydalanuvchi harakati ichida chaqiriladi; kontekstni yaratadi/davom ettiradi. */
export function unlockAudio() {
  const c = getCtx(true);
  if (!c) return Promise.resolve(false);
  if (c.state === 'running') return Promise.resolve(true);
  return c
    .resume()
    .then(() => c.state === 'running')
    .catch(() => false);
}

export function isAudioUnlocked() {
  return !!ctx && ctx.state === 'running';
}

/** Bir martalik `pointerdown`/`keydown` tinglovchisi — (main) zonadagi birinchi harakatda ochadi. */
export function installAudioUnlock() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const onGesture = () => {
    unlockAudio().then((ok) => {
      if (!ok) return;
      window.removeEventListener('pointerdown', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
    });
  };
  window.addEventListener('pointerdown', onGesture, true);
  window.addEventListener('keydown', onGesture, true);
}

function tone(freq, at, dur, gainValue) {
  const c = ctx;
  if (!c || c.state !== 'running') return;
  const start = c.currentTime + Math.max(0, at);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  // Qisqa atak/so'nish — "chiq-chiq" (click) eshitilmasin.
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
  gain.gain.setValueAtTime(gainValue, start + Math.max(0.01, dur - 0.02));
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain).connect(c.destination);
  const entry = { osc, gain };
  live.add(entry);
  osc.onended = () => {
    live.delete(entry);
    try {
      gain.disconnect();
    } catch {
      // allaqachon uzilgan
    }
  };
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function loop(name, periodMs, play) {
  stopLoop(name);
  if (!isAudioUnlocked()) return;
  const step = () => {
    play();
    loops.set(name, setTimeout(step, periodMs));
  };
  step();
}

function stopLoop(name) {
  clearTimeout(loops.get(name));
  loops.delete(name);
}

const RING_NOTES = [659, 784, 880, 784];

/** Kiruvchi: 4 notali kuy (150 ms dan) 1.6 s davomida, so'ng 1.4 s jimlik. */
export function startRingtone() {
  loop('ringtone', 3000, () => {
    [0, 0.8].forEach((offset) => RING_NOTES.forEach((f, i) => tone(f, offset + i * 0.15, 0.15, 0.3)));
  });
}

/** Chiquvchi (jiringlamoqda): 425 Hz, 1 s ovoz / 4 s jimlik. */
export function startRingback() {
  loop('ringback', 5000, () => tone(425, 0, 1, 0.15));
}

export function stopRingtone() {
  stopLoop('ringtone');
}

export function stopRingback() {
  stopLoop('ringback');
}

export function playConnected() {
  tone(880, 0, 0.08, 0.2);
}

/** Band: 425 Hz 0.5 s / 0.5 s x 4. */
export function playBusy() {
  for (let i = 0; i < 4; i++) tone(425, i, 0.5, 0.15);
}

/** Tugadi: 660 -> 520 -> 440 Hz, 120 ms dan. */
export function playEnd() {
  [660, 520, 440].forEach((f, i) => tone(f, i * 0.12, 0.12, 0.2));
}

/** Ilova ichidagi yangi xabar toast'i (PARITY_PLAN WP1). */
export function playMessageBlip() {
  tone(1046, 0, 0.06, 0.15);
}

export function stopAll() {
  [...loops.keys()].forEach(stopLoop);
  live.forEach(({ osc }) => {
    try {
      osc.stop();
    } catch {
      // allaqachon to'xtagan
    }
  });
  live.clear();
}
