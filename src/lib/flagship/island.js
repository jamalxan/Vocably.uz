// So'z oroli rules (flagship games). Pure — tested in island.test.js.
// The player walks a small island in third person. Eight beacons stand around it; reaching one
// opens a question (a meaning or a definition, three English words). The right word lights the
// beacon; a wrong one breaks it and costs one of 3 hearts. Each beacon is asked once. The round ends
// when every beacon is resolved, at 0 hearts, or after 180 s; lighting all of them lights the tower.
//
// The world is flat for the rules: x to the right, z toward the camera, the tower at the origin.
import { comboMultiplier, missedWords } from './run';

export const ISLAND = {
  hearts: 3,
  roundMs: 180_000,
  /** Radius of the walkable plateau, and of the tower's base the hero walks around. */
  walkRadius: 13.2,
  towerRadius: 2.3,
  /** A beacon opens when the hero is this close. */
  reach: 2.3,
  /** Walking speed, world units per second. */
  speed: 6.4,
  basePoints: 100,
  /** How long the verdict stays up before the hero can walk on. */
  gapMs: 1500,
  spawn: { x: 0, z: 9.4 },
};

/** The eight beacon sites: a ring around the tower, pushed in and out so the walk is not a circle. */
export const BEACONS = [
  { x: -5.4, z: 6.2 },
  { x: 6.3, z: 5.1 },
  { x: 10.4, z: -1.2 },
  { x: 6.6, z: -8.4 },
  { x: -0.6, z: -11.2 },
  { x: -7.8, z: -7.4 },
  { x: -11.0, z: -0.4 },
  { x: -1.0, z: -5.6 },
];

/** Same lock as the other choice game: past the server's plausibility floor for a choice answer. */
export function unlockMsFor(prompt) {
  return 350 + Math.min(1200, String(prompt || '').length * 6) + 200;
}

/** Points for lighting a beacon: base × combo (≤ ×2) × time bonus (×1.5 at the start → ×1.0 at the end). */
export function pointsFor({ combo, timeLeft }) {
  const t = Math.min(1, Math.max(0, timeLeft || 0));
  return Math.round(ISLAND.basePoints * comboMultiplier(combo) * (1 + 0.5 * t));
}

export function initialIsland(count = BEACONS.length) {
  const n = Math.max(0, Math.min(BEACONS.length, count));
  return { hearts: ISLAND.hearts, score: 0, combo: 0, maxCombo: 0, lit: 0, broken: 0, results: [], beacons: Array.from({ length: n }, () => 'idle'), over: false };
}

/** Every beacon is lit or broken: nothing is left to walk to. */
export function allResolved(state) {
  return state.beacons.every((b) => b !== 'idle');
}

/**
 * One beacon answered. `ok` comes from the server (signed in) or the local key (guest);
 * `ok === null` means no verdict arrived (offline): the beacon stays open for another try later
 * and nothing is lost.
 */
export function resolveBeacon(state, { index, ok, qid, word, prompt, responseMs, timeLeft = 0 }) {
  if (state.over || state.beacons[index] !== 'idle') return state;
  const results = [...state.results, { qid, word, prompt, ok, responseMs, index }];
  if (ok === null) return { ...state, results };
  const beacons = state.beacons.slice();
  if (ok) {
    beacons[index] = 'lit';
    const combo = state.combo + 1;
    return { ...state, results, beacons, score: state.score + pointsFor({ combo: state.combo, timeLeft }), combo, maxCombo: Math.max(state.maxCombo, combo), lit: state.lit + 1 };
  }
  beacons[index] = 'broken';
  const hearts = state.hearts - 1;
  return { ...state, results, beacons, combo: 0, broken: state.broken + 1, hearts, over: hearts <= 0 };
}

export function summary(state, durationMs) {
  const answered = state.lit + state.broken;
  return {
    score: state.score,
    correct: state.lit,
    wrong: state.broken,
    total: state.beacons.length,
    accuracy: answered ? Math.round((state.lit / answered) * 100) : 0,
    maxCombo: state.maxCombo,
    seconds: Math.round(Math.max(0, durationMs) / 1000),
    hearts: Math.max(0, state.hearts),
    allLit: state.beacons.length > 0 && state.lit === state.beacons.length,
    missed: missedWords(state.results),
  };
}

// --- movement ---

/** Keeps a point on the plateau and out of the tower: the hero slides along both edges. */
export function clampToIsland(x, z) {
  let nx = x;
  let nz = z;
  const r = Math.hypot(nx, nz);
  if (r > ISLAND.walkRadius) {
    nx *= ISLAND.walkRadius / r;
    nz *= ISLAND.walkRadius / r;
  } else if (r < ISLAND.towerRadius) {
    // inside the tower's base: push straight out (from the exact centre, toward the camera)
    const k = r > 1e-6 ? ISLAND.towerRadius / r : 0;
    nx = k ? nx * k : 0;
    nz = k ? nz * k : ISLAND.towerRadius;
  }
  return { x: nx, z: nz };
}

/**
 * One step of the hero. `dir` is the stick or keyboard direction (x right, z toward the camera,
 * length ≤ 1); `dest` is an optional tap-to-walk target. Returns the new { x, z, angle, moving, dest }:
 * `angle` faces the direction of travel (0 = away from the camera) and is kept when standing still.
 */
export function stepHero(hero, { dir = { x: 0, z: 0 }, dest = null, dt = 0 }) {
  let dx = dir.x;
  let dz = dir.z;
  let target = dest;
  const stick = Math.hypot(dx, dz);
  if (stick > 0.12) {
    target = null; // steering by hand cancels a tap target
    if (stick > 1) {
      dx /= stick;
      dz /= stick;
    }
  } else {
    dx = 0;
    dz = 0;
    if (target) {
      const tx = target.x - hero.x;
      const tz = target.z - hero.z;
      const d = Math.hypot(tx, tz);
      if (d < 0.25) target = null;
      else {
        dx = tx / d;
        dz = tz / d;
      }
    }
  }
  const moving = Math.hypot(dx, dz) > 0.01;
  if (!moving) return { x: hero.x, z: hero.z, angle: hero.angle, moving: false, dest: target };
  const step = ISLAND.speed * Math.min(0.05, Math.max(0, dt));
  const next = clampToIsland(hero.x + dx * step, hero.z + dz * step);
  // Walked into an edge and stopped: a tap target behind it can never be reached, so drop it.
  if (target && Math.hypot(next.x - hero.x, next.z - hero.z) < step * 0.2) target = null;
  return { x: next.x, z: next.z, angle: Math.atan2(dx, -dz), moving: true, dest: target };
}

/** Index of the closest beacon that is still idle and within reach, or -1. */
export function beaconInReach(x, z, beacons, reach = ISLAND.reach) {
  let best = -1;
  let bestD = reach * reach;
  for (let i = 0; i < beacons.length; i++) {
    if (beacons[i] !== 'idle') continue;
    const d = (BEACONS[i].x - x) ** 2 + (BEACONS[i].z - z) ** 2;
    if (d <= bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}

/** The closest idle beacon wherever it is: { index, distance, bearing } (bearing 0 = up the screen), or null. */
export function nextBeacon(x, z, beacons) {
  let best = null;
  for (let i = 0; i < beacons.length; i++) {
    if (beacons[i] !== 'idle') continue;
    const dx = BEACONS[i].x - x;
    const dz = BEACONS[i].z - z;
    const distance = Math.hypot(dx, dz);
    if (!best || distance < best.distance) best = { index: i, distance, bearing: Math.atan2(dx, -dz) };
  }
  return best;
}
