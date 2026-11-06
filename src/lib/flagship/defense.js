// Word Defense rules (TZ 2.0 §7, flagship games). Pure — tested in defense.test.js.
// Enemies carry a meaning toward the base; typing the English word for the targeted enemy shoots it.
// Original design; the "educational tower defence" idea is credited to pshenok/server-survival (MIT)
// in THIRD_PARTY_NOTICES.md — no code or assets from it.
//
// Timing rule (anti-cheat, server-side assessSession): several enemies are on screen at once, so
// "time since this enemy appeared" would overlap between answers and their sum could exceed the
// real session time (flag `response_time_exceeds_elapsed` → no XP). Instead each counted answer
// reports the time since the later of (its enemy appeared, the previous counted answer). Those
// intervals never overlap, so their sum is ≤ the round length. Breaches (an enemy reached the
// base unanswered) report a fixed time just above the server's plausibility floor.
import { comboMultiplier, missedTyped, charsPerMinute, typedFloorMs, normalizeTyped } from './typing';

export const DEFENSE = {
  hp: 5,
  roundMs: 150_000,
  /** World units from the spawn line to the base (the 3D lane; the 2D lane maps 0..1). */
  laneLength: 40,
  // Pacing follows kills, not the clock, so a slow typist is never swamped (pre-mortem simulation:
  // a time-based ramp made the median phone player lose in under 45 s).
  travelMs: 18_000,
  travelFloorMs: 9_000,
  speedUpEvery: 4,
  speedUpStep: 0.05,
  spawnStartMs: 5_000,
  spawnStepMs: 120,
  spawnFloorMs: 2_600,
  firstSpawnMs: 600,
  basePoints: 100,
  correctionPoints: 25,
  /** Lateral slots (world x) so labels never sit on top of each other. */
  slots: [-2.6, -0.9, 0.9, 2.6],
  /** No verdict after this long → the enemy is removed without score or HP loss. */
  gradeTimeoutMs: 4000,
  guestQuestions: 20,
};

/** Travel time for an enemy spawned after `kills` kills: −5 % every 4 kills, floor 9 s. */
export function travelMsFor(kills) {
  const steps = Math.floor(Math.max(0, kills) / DEFENSE.speedUpEvery);
  return Math.max(DEFENSE.travelFloorMs, Math.round(DEFENSE.travelMs * Math.pow(1 - DEFENSE.speedUpStep, steps)));
}

/** Gap before the next spawn: 5 s, 0.12 s shorter per kill, never under 2.6 s. */
export function spawnIntervalFor(kills) {
  return Math.max(DEFENSE.spawnFloorMs, DEFENSE.spawnStartMs - DEFENSE.spawnStepMs * Math.max(0, kills));
}

/** How many enemies may be on the lane at once: 2 → 3 → 4 as the player proves they keep up. */
export function maxAliveFor(kills) {
  return kills < 4 ? 2 : kills < 10 ? 3 : 4;
}

/**
 * Index of the next question to spawn, or -1. Skips questions whose prompt equals a living enemy's
 * (two identical labels would make the target ambiguous); the server accepts answers in any order.
 */
export function pickNextQuestion(qs, spawned, alivePrompts) {
  const alive = new Set([...alivePrompts].map((p) => normalizeTyped(p)));
  for (let i = 0; i < qs.length; i++) {
    if (spawned.has(qs[i].qid)) continue;
    if (alive.has(normalizeTyped(qs[i].prompt))) continue;
    return i;
  }
  return -1;
}

/** A free lateral slot (prefers the ones farthest from living enemies), or a random one if all are taken. */
export function pickSlot(usedSlots, rand = Math.random) {
  const free = DEFENSE.slots.map((_, i) => i).filter((i) => !usedSlots.includes(i));
  const pool = free.length ? free : DEFENSE.slots.map((_, i) => i);
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

/**
 * Moves an enemy along the lane by `dtMs` of game time; returns its progress 0 (spawn) … 1 (base).
 * An enemy waiting for its verdict (`pending`) is frozen behind a shield and cannot breach.
 */
export function advance(enemy, dtMs) {
  if (!enemy.pending) enemy.travelled = (enemy.travelled || 0) + Math.max(0, dtMs);
  enemy.progress = (enemy.travelled || 0) / enemy.travelMs;
  return enemy.progress;
}

/** Targetable enemies: alive and not waiting for a verdict. */
export function targetable(enemies) {
  return enemies.filter((e) => e.alive && !e.pending);
}

/** Default target: the targetable enemy closest to the base. */
export function frontTarget(enemies) {
  let best = null;
  for (const e of targetable(enemies)) if (!best || e.progress > best.progress) best = e;
  return best ? best.id : null;
}

/** Tab / ↑ / ↓: next target by distance to the base (dir 1 = farther, -1 = closer), wrapping. */
export function cycleTarget(enemies, currentId, dir = 1) {
  const list = targetable(enemies).sort((a, b) => b.progress - a.progress);
  if (!list.length) return null;
  const i = list.findIndex((e) => e.id === currentId);
  if (i < 0) return list[0].id;
  return list[(i + (dir < 0 ? -1 : 1) + list.length) % list.length].id;
}

/** responseMs for a counted answer (see the timing rule at the top of the file). */
export function responseMsFor({ now, spawnedAt, lastCountedAt = 0 }) {
  return Math.max(0, Math.round(now - Math.max(spawnedAt, lastCountedAt || 0)));
}

/** responseMs reported for a breach (empty answer): just above the server floor for that prompt. */
export function breachResponseMs(prompt) {
  return typedFloorMs(prompt) + 400;
}

export function initialDefense() {
  return { hp: DEFENSE.hp, score: 0, combo: 0, maxCombo: 0, kills: 0, wrong: 0, breaches: 0, unanswered: 0, corrections: 0, correctChars: 0, results: [], over: false };
}

/** Points for a first-try kill: base × combo × (1 + 0.5 × distance still left). */
export function killPoints({ combo, progress }) {
  const left = Math.max(0, Math.min(1, 1 - progress));
  return Math.round(DEFENSE.basePoints * comboMultiplier(combo) * (1 + 0.5 * left));
}

/**
 * First (counted) answer for an enemy resolved. ok: true = destroyed, false = the enemy keeps coming
 * and shows the correct word (a correction kill is then possible), null = no verdict (offline):
 * the enemy is removed without points so the round can go on.
 */
export function resolveShot(state, { ok, qid, word, prompt, typed = '', responseMs = 0, progress = 0 }) {
  // No `over` guard: the shot was fired before the base fell and the server counts it, so the
  // result screen must too (the round waits for in-flight verdicts before it ends).
  const results = [...state.results, { qid, word, prompt, ok, typed, responseMs }];
  if (ok === null) return { ...state, results };
  if (ok) {
    const combo = state.combo + 1;
    return {
      ...state,
      results,
      score: state.score + killPoints({ combo: state.combo, progress }),
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      kills: state.kills + 1,
      correctChars: state.correctChars + typed.trim().length,
    };
  }
  return { ...state, results, combo: 0, wrong: state.wrong + 1 };
}

/** The player typed the revealed word after a miss: enemy destroyed for a few points, combo stays 0. */
export function resolveCorrection(state) {
  if (state.over) return state;
  return { ...state, score: state.score + DEFENSE.correctionPoints, corrections: state.corrections + 1 };
}

/**
 * An enemy reached the base: −1 HP, combo reset. `answered` = it already had a counted (wrong)
 * answer; otherwise this breach is the counted (empty) answer and goes into the missed list.
 */
export function resolveBreach(state, { qid, word = '', prompt = '', answered = false }) {
  if (state.over) return state;
  const hp = state.hp - 1;
  const results = answered ? state.results : [...state.results, { qid, word, prompt, ok: false, typed: '', responseMs: 0, breach: true }];
  return { ...state, results, hp, combo: 0, breaches: state.breaches + 1, unanswered: state.unanswered + (answered ? 0 : 1), over: hp <= 0 };
}

/** Fills in the word of a breach once the server has revealed it. */
export function noteWord(state, qid, word) {
  if (!word) return state;
  let changed = false;
  const results = state.results.map((r) => {
    if (r.qid !== qid || r.word) return r;
    changed = true;
    return { ...r, word };
  });
  return changed ? { ...state, results } : state;
}

export function summary(state, durationMs, { resolved = 0 } = {}) {
  const counted = state.kills + state.wrong + state.unanswered;
  return {
    score: state.score,
    kills: state.kills,
    wrong: state.wrong,
    breaches: state.breaches,
    corrections: state.corrections,
    hp: state.hp,
    accuracy: counted ? Math.round((state.kills / counted) * 100) : 0,
    maxCombo: state.maxCombo,
    waves: resolved,
    cpm: charsPerMinute(state.correctChars, durationMs),
    seconds: Math.round(Math.max(0, durationMs) / 1000),
    missed: missedTyped(state.results),
  };
}
