// Vocably Run rules (TZ 2.0 §7, flagship games). Pure — tested in run.test.js.
// A gate carries 3 words, one per lane; the runner must be in the right lane when the gate arrives.
// 3 lives, speed +8% every 10 correct answers, the round ends on 0 lives or after 90 s.

export const RUN = {
  lanes: 3,
  lives: 3,
  roundMs: 90_000,
  /** Time a gate needs to reach the runner at speed ×1. */
  travelMs: 4200,
  /** The lane is locked this long before impact (the server grades while the gate finishes its run). */
  lockBeforeMs: 450,
  speedStepEvery: 10,
  speedStep: 0.08,
  basePoints: 100,
  maxComboBonus: 1, // combo multiplier caps at ×2
};

export const RUN_STORAGE_KEY = 'vocably.run.guest.v1';

export function speedFor(correct) {
  return Math.pow(1 + RUN.speedStep, Math.floor(Math.max(0, correct) / RUN.speedStepEvery));
}

export function travelMsFor(correct) {
  return Math.round(RUN.travelMs / speedFor(correct));
}

/** Combo before this answer → multiplier (×1.0 … ×2.0). */
export function comboMultiplier(combo) {
  return 1 + Math.min(RUN.maxComboBonus, Math.max(0, combo) * 0.1);
}

/** Score = correct × speed × combo (TZ). */
export function pointsFor({ correct, combo }) {
  return Math.round(RUN.basePoints * speedFor(correct) * comboMultiplier(combo));
}

export function initialRun() {
  return { lives: RUN.lives, score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, results: [], over: false };
}

/**
 * One gate resolved. `ok` comes from the server (signed-in) or the local key (guest);
 * `ok === null` means the grade never arrived (offline) — no life lost, no points.
 */
export function resolveGate(state, { ok, qid, wordId, word, prompt, responseMs, chosen }) {
  if (state.over) return state;
  const results = [...state.results, { qid, wordId, word, prompt, ok, responseMs, chosen }];
  if (ok === null) return { ...state, results };
  if (ok) {
    const points = pointsFor({ correct: state.correct, combo: state.combo });
    const combo = state.combo + 1;
    return { ...state, results, score: state.score + points, combo, maxCombo: Math.max(state.maxCombo, combo), correct: state.correct + 1 };
  }
  const lives = state.lives - 1;
  return { ...state, results, combo: 0, wrong: state.wrong + 1, lives, over: lives <= 0 };
}

/** Lane from a swipe/arrow: clamped to 0..2. */
export function moveLane(lane, dir) {
  return Math.max(0, Math.min(RUN.lanes - 1, lane + (dir < 0 ? -1 : 1)));
}

/** Missed words (unique, in order) — shown after the round and saved to SRS after sign-up. */
export function missedWords(results) {
  const seen = new Set();
  const out = [];
  for (const r of results) {
    if (r.ok !== false || !r.word || seen.has(r.word)) continue;
    seen.add(r.word);
    out.push({ word: r.word, prompt: r.prompt });
  }
  return out;
}

export function summary(state, durationMs) {
  const answered = state.correct + state.wrong;
  return {
    score: state.score,
    correct: state.correct,
    wrong: state.wrong,
    accuracy: answered ? Math.round((state.correct / answered) * 100) : 0,
    maxCombo: state.maxCombo,
    seconds: Math.round(Math.max(0, durationMs) / 1000),
    missed: missedWords(state.results),
  };
}

// --- Guest rounds (no account): questions from the public bank, graded on the device ---

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds guest gates from the public bank: { qid, prompt, promptKind, options:[{id,text}], answer, word }.
 * Distractors come from the same CEFR band where possible so lanes aren't trivially obvious.
 */
export function guestQuestions(bank, rand = Math.random, count = 30) {
  const order = shuffle(bank, rand);
  const out = [];
  for (let i = 0; i < count && order.length >= 3; i++) {
    const item = order[i % order.length];
    const same = bank.filter((b) => b.word !== item.word && b.cefr === item.cefr);
    const pool = same.length >= 2 ? same : bank.filter((b) => b.word !== item.word);
    const distractors = shuffle(pool, rand).slice(0, 2).map((b) => b.word);
    const words = shuffle([item.word, ...distractors], rand);
    const options = words.map((text, k) => ({ id: `o${k + 1}`, text }));
    const useDefinition = !!item.definition && rand() < 0.4;
    out.push({
      qid: `g${i + 1}`,
      prompt: useDefinition ? item.definition : item.uz,
      promptKind: useDefinition ? 'definition' : 'meaning',
      options,
      answer: options[words.indexOf(item.word)].id,
      word: item.word,
    });
  }
  return out;
}
