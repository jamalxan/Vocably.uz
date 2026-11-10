// So'z orbitasi rules (flagship games). Pure — tested in orbit.test.js.
// An English sentence with one word missing is shown; three planets orbit ahead of the ship, each
// carrying a word. Flying to the planet with the word that completes the sentence scores; a wrong
// planet, or running out of fuel (the per-question clock), costs one of 3 shields. The round ends
// at 0 shields, when the questions run out, or after 120 s.
//
// The skill is context: the word has to fit the sentence, not match a translation. Signed-in rounds
// are graded on the server (kind `fill_choice`, the client never gets the answer); guest rounds use
// the public bank (runBank.js + orbitBank.js) and are graded on the device.
import { comboMultiplier, missedWords } from './run';

export const ORBIT = {
  planets: 3,
  shields: 3,
  roundMs: 120_000,
  /** Fuel for one question at the start; it shrinks as the player proves they keep up. */
  questionMs: 14_000,
  questionFloorMs: 8_000,
  speedStepEvery: 4,
  speedStep: 0.06,
  basePoints: 100,
  /** Pause between questions, while the verdict shows and the planets leave. */
  gapMs: 1300,
  guestQuestions: 16,
  blank: '_____',
};

/** Fuel for a question after `correct` right answers: −6 % every 4, never under 8 s. */
export function questionMsFor(correct) {
  const steps = Math.floor(Math.max(0, correct) / ORBIT.speedStepEvery);
  return Math.max(ORBIT.questionFloorMs, Math.round(ORBIT.questionMs * Math.pow(1 - ORBIT.speedStep, steps)));
}

/**
 * How long the planets stay locked after a sentence appears. It is the server's plausibility floor
 * for a choice answer (antiCheat: 350 ms + 6 ms per prompt character, capped at 1200 ms) plus a
 * margin, so a real answer is never flagged as impossibly fast; the planets fly in meanwhile.
 */
export function unlockMsFor(prompt) {
  return 350 + Math.min(1200, String(prompt || '').length * 6) + 200;
}

/** Points for a right answer: base × combo (≤ ×2) × fuel bonus (×1.5 with a full tank → ×1.0 empty). */
export function pointsFor({ combo, fuelLeft }) {
  const fuel = Math.min(1, Math.max(0, fuelLeft || 0));
  return Math.round(ORBIT.basePoints * comboMultiplier(combo) * (1 + 0.5 * fuel));
}

export function initialOrbit() {
  return { shields: ORBIT.shields, score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, results: [], over: false };
}

/**
 * One sentence resolved. `ok` comes from the server (signed in) or the local key (guest);
 * `ok === null` means the grade never arrived (offline): no shield lost, no points.
 * `timeout` marks a question whose fuel ran out (it is sent as an empty answer, so `ok` is false).
 */
export function resolveAnswer(state, { ok, qid, word, prompt, responseMs, chosen, fuelLeft = 0, timeout = false }) {
  if (state.over) return state;
  const results = [...state.results, { qid, word, prompt, ok, responseMs, chosen, timeout }];
  if (ok === null) return { ...state, results };
  if (ok) {
    const combo = state.combo + 1;
    return {
      ...state,
      results,
      score: state.score + pointsFor({ combo: state.combo, fuelLeft }),
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      correct: state.correct + 1,
    };
  }
  const shields = state.shields - 1;
  return { ...state, results, combo: 0, wrong: state.wrong + 1, shields, over: shields <= 0 };
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
    shields: Math.max(0, state.shields),
    missed: missedWords(state.results),
  };
}

/** The sentence split around its gap, for rendering: [before, after]; no gap → [text, null]. */
export function splitAtBlank(prompt) {
  const text = String(prompt || '');
  const at = text.indexOf(ORBIT.blank);
  if (at < 0) return [text, null];
  return [text.slice(0, at), text.slice(at + ORBIT.blank.length)];
}

// --- Guest rounds (no account): sentences from the public bank, graded on the device ---

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds guest questions: { qid, prompt, hint, options:[{id,text}], answer, word }. Every bank word
 * with a sentence is asked at most once; the two other planets carry words of the same CEFR band
 * (where possible), so the right planet is not obvious from difficulty alone.
 */
export function guestQuestions(bank, sentences, rand = Math.random, count = ORBIT.guestQuestions) {
  const usable = bank.filter((b) => {
    const s = sentences[b.word];
    return !!s && s.en.toLowerCase().includes(b.word.toLowerCase());
  });
  const out = [];
  for (const item of shuffle(usable, rand)) {
    if (out.length >= count) break;
    const en = sentences[item.word].en;
    const at = en.toLowerCase().indexOf(item.word.toLowerCase());
    const same = bank.filter((b) => b.word !== item.word && b.cefr === item.cefr);
    const pool = same.length >= 2 ? same : bank.filter((b) => b.word !== item.word);
    const distractors = shuffle(pool, rand).slice(0, ORBIT.planets - 1).map((b) => b.word);
    const words = shuffle([item.word, ...distractors], rand);
    const options = words.map((text, k) => ({ id: `o${k + 1}`, text }));
    out.push({
      qid: `g${out.length + 1}`,
      prompt: en.slice(0, at) + ORBIT.blank + en.slice(at + item.word.length),
      hint: sentences[item.word].uz || '',
      options,
      answer: options[words.indexOf(item.word)].id,
      word: item.word,
    });
  }
  return out;
}
