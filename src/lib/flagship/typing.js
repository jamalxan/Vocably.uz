// Shared rules for the typing games (So'z tunneli, Word Defense). Pure — tested in typing.test.js.
// Signed-in rounds are graded on the server (answering.ts → validateAnswer 'typed'); guest rounds
// use gradeGuest() below, which applies exactly the same normalisation so a guest and a signed-in
// player are judged the same way.
import { normalizeForCompare } from '../textCompare';
import { levenshtein } from '../levenshtein';
import { minPlausibleMs } from '../vocab/antiCheat';
import { typedAcceptedForWord } from '../vocab/typedForms';

/** Longest answer the input accepts (the server keeps 200; no IELTS word is near this). */
export const TYPED_MAX = 40;

/** The server's plausibility floor for a typed answer to this prompt (antiCheat.minPlausibleMs). */
export function typedFloorMs(prompt) {
  return minPlausibleMs({ inputType: 'typed', promptLength: String(prompt || '').length, units: 1 });
}

/** Same normalisation the server uses for typed answers. */
export function normalizeTyped(raw) {
  return normalizeForCompare(typeof raw === 'string' ? raw : '');
}

/**
 * Device grading for guest questions (they carry `word`/`accepted`; server questions never do).
 * Mirrors validateAnswer('typed'): empty = wrong, exact accepted form = right, one edit on a
 * 5+ letter word = wrong but "near".
 */
export function gradeGuest(q, raw) {
  const typed = normalizeTyped(raw);
  const accepted = q.accepted?.length ? q.accepted : [normalizeTyped(q.word)];
  if (!typed) return { ok: false, near: false, correctDisplay: q.word };
  if (accepted.includes(typed)) return { ok: true, near: false, correctDisplay: q.word };
  const near = accepted.some((a) => a.length >= 5 && levenshtein(typed, a) === 1);
  return { ok: false, near, correctDisplay: q.word };
}

/**
 * After a miss the server reveals the word; a correction (Word Defense) is checked on the device
 * against every form the server accepts for it (typedForms.ts: "look after (sb)" → "look after",
 * "to achieve" → "achieve"), ignoring spaces and hyphens.
 */
export function matchesRevealed(typed, revealed) {
  const squash = (s) => normalizeTyped(s).replace(/[\s-]+/g, '');
  const a = squash(typed);
  return !!a && typedAcceptedForWord(revealed).some((f) => squash(f) === a);
}

/** A Cyrillic keyboard layout is common in Uzbekistan; such input can never match an English word. */
export function hasCyrillic(text) {
  return /[Ѐ-ӿ]/.test(String(text || ''));
}

/**
 * "Skip" sends an empty (wrong) answer, so it unlocks only once the prompt could have been read:
 * the server's plausibility floor for this prompt has passed since it appeared.
 */
export function canSkip(prompt, shownAt, now) {
  return now - shownAt >= typedFloorMs(prompt);
}

/**
 * When to send a counted (first, server-graded) answer, and the time it reports. The interval runs
 * from the later of (its prompt appeared, the previous counted send) — so intervals never overlap
 * and their sum stays within the real session time — and the send is held back until the server's
 * plausibility floor for the prompt (+150 ms) has passed. A quick typist, or one who read the next
 * prompt while the previous answer was out, is never reported as "impossibly fast" (no XP).
 */
export function scheduleCounted({ now, spawnedAt, lastCountedAt = 0, prompt }) {
  const from = Math.max(spawnedAt, lastCountedAt || 0);
  const sendAt = Math.max(now, from + typedFloorMs(prompt) + 150);
  return { sendAt, responseMs: Math.round(sendAt - from) };
}

/**
 * Holds sends until their scheduleCounted() time (performance.now() clock). release() sends whatever
 * is still held at once — the round is ending and the answers must be queued before the session is
 * completed; cancel() drops them — the page was left.
 */
export function createSendHold() {
  const held = new Map();
  let seq = 0;
  const run = (id) => {
    const h = held.get(id);
    held.delete(id);
    h?.send();
  };
  return {
    at(sendAt, now, send) {
      if (!(sendAt > now + 4)) {
        send();
        return;
      }
      const id = ++seq;
      held.set(id, { send, timer: setTimeout(() => run(id), sendAt - now) });
    },
    release() {
      for (const [id, h] of [...held]) {
        clearTimeout(h.timer);
        run(id);
      }
    },
    cancel() {
      for (const h of held.values()) clearTimeout(h.timer);
      held.clear();
    },
    get size() {
      return held.size;
    },
  };
}

/** Letter slots shown under the prompt: only when the question carries `answerLength` (easy/medium). */
export function slotsFor(q) {
  const length = Number.isInteger(q?.answerLength) && q.answerLength > 0 ? Math.min(q.answerLength, TYPED_MAX) : 0;
  if (!length) return null;
  // Easy questions carry the first-letter hint ("i_ _ _ (7 harf)"); its first character is the letter.
  const first = q.first || (typeof q.hint === 'string' && /^\p{L}/u.test(q.hint) ? q.hint.charAt(0) : '');
  return { length, first };
}

/** Combo before this answer → multiplier ×1.0 … ×2.0 (same curve as Vocably Run). */
export function comboMultiplier(combo) {
  return 1 + Math.min(1, Math.max(0, combo) * 0.1);
}

/**
 * Speed bonus for a correct typed answer: ×1.5 when fast for its length, sliding to ×1.0.
 * Fast = 1.2 s + 0.18 s per character (reading the prompt + typing at ~65 wpm).
 */
export function speedBonus(responseMs, typedLength) {
  const len = Math.max(1, typedLength || 1);
  const fast = 1200 + 180 * len;
  const slow = fast + 5000;
  const ms = Math.max(0, Number(responseMs) || 0);
  if (ms <= fast) return 1.5;
  if (ms >= slow) return 1;
  return 1.5 - (0.5 * (ms - fast)) / (slow - fast);
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Hides the answer if a definition happens to contain it ("improve" in "to improve …"). */
export function maskAnswer(text, word) {
  const w = String(word || '').trim();
  if (!w) return text;
  return String(text || '').replace(new RegExp(`\\b${escapeRe(w)}\\w*`, 'gi'), '_____');
}

/**
 * Guest questions from the public bank: { qid, prompt, promptKind, answerLength, first, word, accepted }.
 * Guests get the "easy" hint (first letter + length) — they meet the game cold on a landing page.
 * The first three prompts are always Uzbek meanings; after that ~25 % are English definitions.
 */
export function guestTypedQuestions(bank, rand = Math.random, count = 20) {
  const order = shuffle(bank, rand).slice(0, Math.min(count, bank.length));
  return order.map((item, i) => {
    const useDefinition = i >= 3 && !!item.definition && rand() < 0.25;
    return {
      qid: `g${i + 1}`,
      prompt: useDefinition ? maskAnswer(item.definition, item.word) : item.uz,
      promptKind: useDefinition ? 'definition' : 'meaning',
      answerLength: item.word.length,
      first: item.word.charAt(0),
      word: item.word,
      accepted: [normalizeTyped(item.word)],
    };
  });
}

/** Server question → the shape the typing games use (no answer fields exist to copy). */
export function fromServerQuestion(q) {
  return {
    qid: q.qid,
    prompt: q.prompt,
    promptKind: q.kind === 'type_definition' ? 'definition' : 'meaning',
    answerLength: Number.isInteger(q.answerLength) ? q.answerLength : undefined,
    hint: typeof q.hint === 'string' ? q.hint : undefined,
  };
}

/** Missed words (unique, in order) for the result screen and the guest "save after sign-up". */
export function missedTyped(results) {
  const seen = new Set();
  const out = [];
  for (const r of results) {
    if (r.ok !== false || !r.word || seen.has(r.word)) continue;
    seen.add(r.word);
    // `yours`: what was typed (empty for a skip or a breach), shown as "Siz yozdingiz: …".
    out.push({ word: r.word, prompt: r.prompt, yours: String(r.typed || '').trim() });
  }
  return out;
}

/** Characters per minute over the correct answers only (typing speed that actually counted). */
export function charsPerMinute(correctChars, durationMs) {
  const min = Math.max(0, durationMs) / 60_000;
  return min > 0 ? Math.round(correctChars / min) : 0;
}
