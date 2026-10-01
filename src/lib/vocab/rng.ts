// Deterministik (seed asosida) tasodifiy sonlar — savol generatsiyasi testlarda
// aynan qayta hosil bo'lishi va sessiya qayta tiklanganda bir xil bo'lishi uchun.
export type Rand = () => number;

export function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — kichik, tez, yetarli darajada bir tekis PRNG. */
export function seededRandom(seed: string | number): Rand {
  let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates; yangi massiv qaytaradi. */
export function shuffle<T>(arr: readonly T[], rand: Rand = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sample<T>(arr: readonly T[], n: number, rand: Rand = Math.random): T[] {
  return shuffle(arr, rand).slice(0, Math.max(0, n));
}

export function pick<T>(arr: readonly T[], rand: Rand = Math.random): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(rand() * arr.length)];
}

/** Vazn bo'yicha tanlash (vazn > 0). */
export function weightedPick<T>(items: readonly T[], weight: (t: T) => number, rand: Rand = Math.random): T | undefined {
  if (!items.length) return undefined;
  const weights = items.map((i) => Math.max(0, weight(i)));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(rand() * items.length)];
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
