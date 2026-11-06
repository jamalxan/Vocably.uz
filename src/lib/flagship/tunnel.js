// So'z tunneli rules (TZ 2.0 §7, flagship games). Pure — tested in tunnel.test.js.
// The meaning is shown, the player types the English word; every typed character becomes a ring of
// that glyph in a tunnel the camera flies through (mechanic adapted from Boom123bam/cooltypinggame,
// Apache-2.0 — see THIRD_PARTY_NOTICES.md). One 90 s round; finishing every word early adds a time
// bonus. Scores are display values — XP is computed on the server only.
import { comboMultiplier, speedBonus, missedTyped, charsPerMinute } from './typing';

export const TUNNEL = {
  roundMs: 90_000,
  basePoints: 100,
  finishBonusPerSec: 10,
  /** A verdict that has not arrived after this long is shown as "not counted". */
  gradeTimeoutMs: 4000,
  /** Rings per word in the scene pool; longer answers wrap (old rings are reused). */
  maxRings: 48,
  guestQuestions: 20,
};

export function initialTunnel() {
  return { score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, skipped: 0, correctChars: 0, results: [], over: false };
}

/** Points for one correct word (before the result is added to state). */
export function wordPoints({ combo, responseMs, typedLength }) {
  return Math.round(TUNNEL.basePoints * comboMultiplier(combo) * speedBonus(responseMs, typedLength));
}

/**
 * One word resolved. `ok` comes from the server (signed in) or the device (guest);
 * `ok === null` = the verdict never arrived — no points, combo kept, not counted as wrong.
 * `typed === ''` is a skip: wrong for SRS, shown as skipped.
 */
export function resolveWord(state, { ok, qid, word, prompt, typed = '', responseMs = 0, near = false }) {
  if (state.over) return state;
  const results = [...state.results, { qid, word, prompt, ok, typed, responseMs, near }];
  if (ok === null) return { ...state, results };
  if (ok) {
    const points = wordPoints({ combo: state.combo, responseMs, typedLength: typed.length });
    const combo = state.combo + 1;
    return {
      ...state,
      results,
      score: state.score + points,
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      correct: state.correct + 1,
      correctChars: state.correctChars + typed.trim().length,
    };
  }
  return { ...state, results, combo: 0, wrong: state.wrong + 1, skipped: state.skipped + (typed.trim() ? 0 : 1) };
}

/**
 * Early-finish bonus: per second left, scaled by accuracy (0..1), so skipping or mistyping every
 * word to reach the end fast earns nothing.
 */
export function finishBonus(msLeft, allAnswered, accuracy = 1) {
  if (!allAnswered) return 0;
  const share = Math.max(0, Math.min(1, accuracy));
  return Math.round(Math.max(0, Math.floor(msLeft / 1000)) * TUNNEL.finishBonusPerSec * share);
}

export function summary(state, durationMs, { msLeft = 0, allAnswered = false } = {}) {
  const answered = state.correct + state.wrong;
  const bonus = finishBonus(msLeft, allAnswered, answered ? state.correct / answered : 0);
  return {
    score: state.score + bonus,
    bonus,
    correct: state.correct,
    wrong: state.wrong,
    skipped: state.skipped,
    accuracy: answered ? Math.round((state.correct / answered) * 100) : 0,
    maxCombo: state.maxCombo,
    cpm: charsPerMinute(state.correctChars, durationMs),
    seconds: Math.round(Math.max(0, durationMs) / 1000),
    missed: missedTyped(state.results),
  };
}

/** Ring colour for the n-th typed glyph (hue walks around the wheel, as in the reference). */
export function ringHue(index) {
  return ((index * 23) % 360) / 360;
}
