// Vocably Run colour themes (design §7). The synthwave scene changes its palette every
// RUN.speedStepEvery correct answers, the same step as the speed, and wraps after the last theme.
// The idea of a colour change per level comes from akarlsten/cuberun (MIT); the palettes are our own,
// built around Vocably's coral (#e0566a) and navy (#0b1020). Pure, so it is unit-tested
// (runTheme.test.js) and the scene only turns these hex strings into THREE.Color once.
import { RUN } from './run';

/**
 * Colour slots of a theme (sRGB hex). The scene eases every slot together.
 *   skyTop / skyMid  sky gradient above the horizon
 *   horizon          haze at the horizon; also the fog colour, so the grid melts into it
 *   glow             light band hugging the horizon, and the floor haze far away
 *   sunTop / sunBottom  vertical gradient of the sun disc
 *   floor            floor base
 *   grid             neon grid lines off the road and across it
 *   lane             the brighter lane lines on the road (3 lanes, 4 lines)
 *   arch             the gate arch and the neon rim of the word signs
 */
export const THEME_KEYS = ['skyTop', 'skyMid', 'horizon', 'glow', 'sunTop', 'sunBottom', 'floor', 'grid', 'lane', 'arch'];

export const RUN_THEMES = [
  {
    name: 'coral',
    skyTop: '#0b1020',
    skyMid: '#26163f',
    horizon: '#3d1d4c',
    glow: '#ff6f86',
    sunTop: '#ffd27a',
    sunBottom: '#e0566a',
    floor: '#0a0d1f',
    grid: '#e0566a',
    lane: '#ffc9d1',
    arch: '#4fe3ff',
  },
  {
    name: 'violet',
    skyTop: '#0b0e26',
    skyMid: '#22135a',
    horizon: '#391a6a',
    glow: '#b77bff',
    sunTop: '#ffd1f2',
    sunBottom: '#a066ff',
    floor: '#0b0b22',
    grid: '#9d6bff',
    lane: '#e3d4ff',
    arch: '#ff6fae',
  },
  {
    name: 'lagoon',
    skyTop: '#07111f',
    skyMid: '#0b2747',
    horizon: '#103a5a',
    glow: '#43d6ff',
    sunTop: '#d2fff6',
    sunBottom: '#26b3d6',
    floor: '#06101c',
    grid: '#27c4e8',
    lane: '#cff6ff',
    arch: '#ff6a8d',
  },
  {
    name: 'aurora',
    skyTop: '#06121a',
    skyMid: '#0b2a2f',
    horizon: '#11403b',
    glow: '#46f2b4',
    sunTop: '#f1ffb8',
    sunBottom: '#2fcf9c',
    floor: '#05120f',
    grid: '#2ee3aa',
    lane: '#d3ffee',
    arch: '#ff6fd8',
  },
  {
    name: 'ember',
    skyTop: '#130b1c',
    skyMid: '#3a1530',
    horizon: '#5c2234',
    glow: '#ff9f4a',
    sunTop: '#fff0a6',
    sunBottom: '#ff7340',
    floor: '#120a14',
    grid: '#ff9440',
    lane: '#ffe1c4',
    arch: '#5cc7ff',
  },
  {
    name: 'neon',
    skyTop: '#0e0a21',
    skyMid: '#30103f',
    horizon: '#4d1252',
    glow: '#ff52d9',
    sunTop: '#ffe27a',
    sunBottom: '#ff3fae',
    floor: '#0d0819',
    grid: '#ff4fc6',
    lane: '#ffd5f2',
    arch: '#7dffc4',
  },
];

/** How long a palette change takes. Never a flash: every slot eases over this. */
export const THEME_EASE_MS = 1000;

/** Level of a round with `correct` right answers: +1 every RUN.speedStepEvery (with the speed). */
export function levelFor(correct) {
  const n = Number(correct);
  return Number.isFinite(n) && n > 0 ? Math.floor(n / RUN.speedStepEvery) : 0;
}

/** Index into RUN_THEMES for a level; wraps (level 6 is theme 0 again), never out of range. */
export function themeIndex(level) {
  const n = RUN_THEMES.length;
  const l = Number.isFinite(level) ? Math.floor(level) : 0;
  return ((l % n) + n) % n;
}

export function themeFor(level) {
  return RUN_THEMES[themeIndex(level)];
}

/**
 * Progress (0 → 1) of a palette change `elapsedMs` after it started: smoothstep, so it starts and
 * ends gently, clamped to [0, 1]. A missing or invalid time finishes the change (never stuck).
 */
export function themeBlend(elapsedMs, durationMs = THEME_EASE_MS) {
  const e = Number(elapsedMs);
  if (Number.isNaN(e) || !(durationMs > 0)) return 1;
  const x = Math.min(1, Math.max(0, e / durationMs));
  return x * x * (3 - 2 * x);
}

/**
 * Word sign tones (the signs are the game: they must stay legible). Dark panel and white text while
 * a gate comes in; solid amber when the lane is locked; green for the right word and rose for a wrong
 * pick; the other lanes dim but stay readable. `rim` is the neon edge colour; null = the theme's arch.
 */
export const SIGN_TONES = {
  idle: { panel: '#0d1330', text: '#ffffff', edge: '#f6efe9', rim: null },
  locked: { panel: '#fbbf24', text: '#1b2033', edge: '#fff3c4', rim: '#fbbf24' },
  right: { panel: '#22c55e', text: '#052e16', edge: '#bbf7d0', rim: '#4ade80' },
  wrong: { panel: '#e11d48', text: '#ffffff', edge: '#fecdd3', rim: '#fb7185' },
  dim: { panel: '#141a36', text: '#a9b0d0', edge: '#3a4166', rim: null },
};

/** '#rrggbb' → [r, g, b] in 0..1 (sRGB). Throws on anything else. */
export function hexToRgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex));
  if (!m) throw new Error(`not a #rrggbb colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** WCAG relative luminance of an sRGB hex colour. */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two hex colours (1 … 21). */
export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
