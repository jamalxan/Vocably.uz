// Vocabulary World — Starter Island xaritasi: sahna (StarterIsland3D) va personaj
// harakati (PlayerHero3D) bir xil o'lchamlardan foydalanadi, shunda personaj
// suv ustida yurmaydi va ko'prik/qirg'oq balandligi geometriyaga mos keladi.

export const SHORE = { x: 0, z: 12, radius: 13, walkRadius: 12.2, groundY: 0.95 };
export const VILLAGE = { x: 0, z: -22, radius: 14, walkRadius: 13.2, groundY: 0.95 };
// Ko'prik qirg'oq (shimoliy cheti z=-1) va qishloq (janubiy cheti z=-8) orasidagi lagun ustidan o'tadi.
export const BRIDGE = { minX: -1.6, maxX: 1.6, minZ: -10.5, maxZ: 1.5, centerZ: -4.5, length: 11, deckY: 1.36 };
// Pristan qirg'oqning g'arbiy chetidan suvga chiqadi.
export const DOCK = { minX: -24, maxX: -12, minZ: 10.2, maxZ: 13.8, deckY: 0.7 };

export const SPAWN = { x: 0, z: 19 };

export const PORTAL_RADIUS = 2.8;

// Har bir portal mavjud, server-authoritative o'yinga (/app/games/:key) olib boradi —
// ball, XP, kunlik limit va anti-cheat o'sha yerda hisoblanadi.
export const PORTALS = [
  { key: 'memory', title: 'Xotira kartalari', x: -7, z: 12, color: '#00f0b5', shape: 'torus' },
  { key: 'listen_choose', title: 'Eshiting va tanlang', x: 7, z: 12, color: '#38bdf8', shape: 'sphere' },
  { key: 'speed_challenge', title: 'Tezlik sinovi', x: -9, z: -14, color: '#3b82f6', shape: 'box' },
  { key: 'fill_gap', title: "Bo'sh joyni to'ldiring", x: 9, z: -14, color: '#a855f7', shape: 'octahedron' },
  { key: 'image_to_word', title: "Rasm → so'z", x: -11, z: -21, color: '#eab308', shape: 'dodecahedron' },
  { key: 'vocabulary_boss', title: 'Vocabulary Boss', x: 0, z: -18, color: '#ef4444', shape: 'boss' },
];

const inDisc = (disc, r, x, z) => (x - disc.x) ** 2 + (z - disc.z) ** 2 <= r * r;
const inRect = (rect, x, z) => x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ;

export function isWalkable(x, z) {
  return (
    inRect(BRIDGE, x, z) ||
    inRect(DOCK, x, z) ||
    inDisc(SHORE, SHORE.walkRadius, x, z) ||
    inDisc(VILLAGE, VILLAGE.walkRadius, x, z)
  );
}

/** Personaj oyog'i turadigan balandlik (yuriladigan joydan tashqarida — null). */
export function groundHeightAt(x, z) {
  if (inRect(BRIDGE, x, z)) return BRIDGE.deckY;
  if (inRect(DOCK, x, z)) return DOCK.deckY;
  if (inDisc(SHORE, SHORE.walkRadius, x, z)) return SHORE.groundY;
  if (inDisc(VILLAGE, VILLAGE.walkRadius, x, z)) return VILLAGE.groundY;
  return null;
}

/**
 * (x,z) dan (x+dx, z+dz) ga harakat: yuriladigan joydan chiqib ketsa, devor bo'ylab
 * sirpanish uchun alohida X yoki Z o'qi bo'yicha harakat sinab ko'riladi.
 */
export function resolveMove(x, z, dx, dz) {
  if (isWalkable(x + dx, z + dz)) return { x: x + dx, z: z + dz };
  if (dx && isWalkable(x + dx, z)) return { x: x + dx, z };
  if (dz && isWalkable(x, z + dz)) return { x, z: z + dz };
  return { x, z };
}

/** Eng yaqin portal (PORTAL_RADIUS ichida) yoki null. */
export function nearestPortal(x, z, portals = PORTALS, radius = PORTAL_RADIUS) {
  let best = null;
  let bestD = radius * radius;
  for (const p of portals) {
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d <= bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

/** Burchaklar orasidagi eng qisqa farq (-PI..PI) — aylanish ±PI chegarasida teskari aylanmasin. */
export function shortestAngleDelta(from, to) {
  const twoPi = Math.PI * 2;
  let d = (to - from) % twoPi;
  if (d > Math.PI) d -= twoPi;
  if (d < -Math.PI) d += twoPi;
  return d;
}
