// "So'z dueli" (TZ 2.0 §6.8.4, §7 flagship table, §7.4 anti-cheat). Pure; tested in rules.test.js.
//
// Two players get the SAME 10 words, 7 seconds per word. The duel is asynchronous (each player
// plays when they like; the result shows once both are done) because the app runs on serverless
// functions without sockets. The server serves one question at a time, stamps when it was served
// and grades the answer itself — the right option never reaches the browser, and the response time
// is measured on the server (the client's clock is never trusted).
//
// Score per word: 0 when wrong or late, otherwise 100 + up to 50 for speed. Winner: higher score,
// then more correct answers, then less total time. Rating: classic ELO.

export const DUEL = {
  words: 10,
  options: 4,
  answerMs: 7000,
  /** Allowance on top of the 7 s for network + the server's own round trips (auth, rate limit) and a
   *  serverless cold start; it can't buy points (speed is capped at 7 s). Beyond it = timeout. */
  graceMs: 2500,
  /** Faster than a human can read a word and four options — counted, but flagged. */
  implausibleMs: 250,
  /** This many implausible answers mark the run as suspicious (no rating, no XP). */
  suspiciousAt: 4,
  basePoints: 100,
  speedPoints: 50,
  startRating: 1000,
  k: 32,
  /** Matchmaking: first look this close in rating, then anyone. */
  matchWindow: 200,
  /** An unanswered invite / open random duel expires after this. */
  inviteTtlMs: 48 * 3600_000,
  /** After joining, a player has this long to finish; unanswered words then count as timeouts. */
  playTtlMs: 24 * 3600_000,
  maxOpen: 5,
  /** Friend invites: after this many declined invites to the same person in 24 h, no more. */
  maxDeclinedPerDay: 3,
  /** Duel documents are kept this long (the hub shows the last 30 anyway). */
  keepDays: 90,
  xp: { win: 30, draw: 20, loss: 10 },
};

export const DUEL_DECK_NAME = "So'z dueli: xatolar";
const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/** Deterministic PRNG (mulberry32) so a duel's questions can be rebuilt in tests. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Short public code for share links: 8 chars, no look-alike letters. */
export function duelCode(rand = Math.random) {
  return Array.from({ length: 8 }, () => CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)]).join('');
}

const norm = (s) => String(s || '').trim().toLowerCase();

/** Clean pool: one entry per word, a translation present, no duplicate translations. */
export function cleanPool(pool) {
  const seenWord = new Set();
  const seenUz = new Set();
  const out = [];
  for (const e of pool || []) {
    const word = String(e?.word || '').trim();
    const uz = String(e?.uz || '').trim();
    if (!word || !uz || word.length > 40 || uz.length > 60) continue;
    if (seenWord.has(norm(word)) || seenUz.has(norm(uz))) continue;
    seenWord.add(norm(word));
    seenUz.add(norm(uz));
    out.push({ word, uz, cefr: e.cefr || '' });
  }
  return out;
}

/**
 * 10 questions both players share. Even questions: English word → Uzbek meaning; odd: Uzbek → English.
 * Distractors prefer the same CEFR level so the right answer doesn't stand out.
 * @returns {{ word: string, uz: string, cefr: string, dir: 'en_uz'|'uz_en', prompt: string, options: string[], answer: number }[] | null}
 */
export function buildDuelQuestions(pool, seed, count = DUEL.words) {
  const clean = cleanPool(pool);
  if (clean.length < Math.max(count, DUEL.options)) return null;
  const rand = rng(seed);
  const picked = shuffle(clean, rand).slice(0, count);
  return picked.map((e, i) => {
    const dir = i % 2 === 0 ? 'en_uz' : 'uz_en';
    const others = clean.filter((x) => x.word !== e.word);
    const same = shuffle(others.filter((x) => x.cefr && x.cefr === e.cefr), rand);
    const rest = shuffle(others.filter((x) => !(x.cefr && x.cefr === e.cefr)), rand);
    const distractors = [...same, ...rest].slice(0, DUEL.options - 1);
    const right = dir === 'en_uz' ? e.uz : e.word;
    const options = shuffle([right, ...distractors.map((d) => (dir === 'en_uz' ? d.uz : d.word))], rand);
    return { word: e.word, uz: e.uz, cefr: e.cefr, dir, prompt: dir === 'en_uz' ? e.word : e.uz, options, answer: options.indexOf(right) };
  });
}

/** What the browser may see of a question: never the answer. */
export function publicQuestion(q, index) {
  return { index, dir: q.dir, prompt: q.prompt, options: q.options, total: DUEL.words, limitMs: DUEL.answerMs };
}

/**
 * Grade one answer with the server-measured time.
 * @returns {{ ok: boolean, late: boolean, implausible: boolean, ms: number, points: number }}
 */
export function gradeAnswer(q, choice, ms) {
  const time = Math.max(0, Math.round(ms));
  const late = time > DUEL.answerMs + DUEL.graceMs;
  const valid = Number.isInteger(choice) && choice >= 0 && choice < q.options.length;
  const ok = !late && valid && choice === q.answer;
  const implausible = ok && time < DUEL.implausibleMs;
  const speed = Math.max(0, 1 - Math.min(time, DUEL.answerMs) / DUEL.answerMs);
  return { ok, late, implausible, ms: Math.min(time, DUEL.answerMs + DUEL.graceMs), points: ok ? DUEL.basePoints + Math.round(DUEL.speedPoints * speed) : 0 };
}

/** A timeout recorded by the server (the player never answered in time). */
export function timeoutAnswer() {
  return { ok: false, late: true, implausible: false, ms: DUEL.answerMs + DUEL.graceMs, points: 0, choice: null };
}

/** Totals of one player's answers. */
export function tally(answers) {
  const list = answers || [];
  return {
    score: list.reduce((s, a) => s + (a.points || 0), 0),
    correct: list.filter((a) => a.ok).length,
    totalMs: list.reduce((s, a) => s + (a.ms || 0), 0),
    implausible: list.filter((a) => a.implausible).length,
  };
}

export const isSuspicious = (t) => t.implausible >= DUEL.suspiciousAt;

/** 'a' | 'b' | 'draw'. Score, then correct answers, then less total time. */
export function decideWinner(ta, tb) {
  if (ta.score !== tb.score) return ta.score > tb.score ? 'a' : 'b';
  if (ta.correct !== tb.correct) return ta.correct > tb.correct ? 'a' : 'b';
  if (ta.totalMs !== tb.totalMs) return ta.totalMs < tb.totalMs ? 'a' : 'b';
  return 'draw';
}

/** Classic ELO. `result`: 1 = A won, 0.5 = draw, 0 = A lost. Returns new ratings (integers). */
export function eloUpdate(ra, rb, result, k = DUEL.k) {
  const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  const da = Math.round(k * (result - ea));
  return { a: ra + da, b: rb - da, deltaA: da, deltaB: -da };
}

export const resultFor = (winner, side) => (winner === 'draw' ? 0.5 : winner === side ? 1 : 0);

export function xpFor(winner, side) {
  if (winner === 'draw') return DUEL.xp.draw;
  return winner === side ? DUEL.xp.win : DUEL.xp.loss;
}

/** Words this player got wrong (for the "add to vocabulary" step). */
export function missedWords(questions, answers) {
  return (questions || [])
    .map((q, i) => ({ q, a: (answers || [])[i] }))
    .filter(({ a }) => !a || !a.ok)
    .map(({ q }) => ({ word: q.word, uz: q.uz, cefr: q.cefr }));
}

/** Review of one player's run, safe to show once that player has finished. */
export function reviewRows(questions, answers) {
  return (questions || []).map((q, i) => {
    const a = (answers || [])[i];
    return { word: q.word, uz: q.uz, ok: !!a?.ok, late: !!a?.late, ms: a?.ms ?? null, points: a?.points || 0 };
  });
}
