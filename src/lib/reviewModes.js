// SRS review modes (TZ 2.0 §6.3.3): Tanish = recognition (word → meaning, self-rated),
// Yozish = production (meaning → type the word, auto-graded), Aralash = mixed.
// Pure — tested in reviewModes.test.js.
import { levenshtein } from './levenshtein';
import { normalizeForCompare } from './textCompare';
import { ratingFromOutcome } from './srs';

export const REVIEW_MODES = ['recognition', 'production', 'mixed'];
export const REVIEW_MODE_STORAGE_KEY = 'vocably.reviewMode';

/** Stable 0/1 per word, so a mixed session doesn't flip a card's side on re-render. */
function bit(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 2;
}

/**
 * Which side this card shows. Production needs a meaning to prompt with — words without
 * translations fall back to recognition in every mode.
 */
export function cardModeFor(mode, word) {
  const hasMeaning = Array.isArray(word?.syns) && word.syns.some((s) => String(s).trim());
  if (!hasMeaning) return 'recognition';
  if (mode === 'production') return 'production';
  if (mode === 'mixed') return bit(word?._id ?? word?.word) ? 'production' : 'recognition';
  return 'recognition';
}

/**
 * Typed answer → verdict. One-letter slips on longer words count as "close": correct for the
 * schedule, but rated Hard so the word comes back sooner.
 */
export function gradeTyped(input, target) {
  const a = normalizeForCompare(input);
  const b = normalizeForCompare(target);
  if (!a) return { verdict: 'wrong', distance: b.length };
  if (a === b) return { verdict: 'exact', distance: 0 };
  const distance = levenshtein(a, b);
  if (b.length >= 5 && distance === 1) return { verdict: 'close', distance };
  return { verdict: 'wrong', distance };
}

/** SRS rating for a typed answer (TZ §7 mapping; a typo caps at Hard). */
export function ratingForTyped(verdict, responseMs) {
  if (verdict === 'wrong') return 1;
  if (verdict === 'close') return 2;
  return ratingFromOutcome(true, responseMs);
}

/** "The ___ was enormous" — hides the word in an example sentence for a production hint. */
export function blankOut(sentence, word) {
  if (!sentence || !word) return '';
  const esc = String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${esc}\\w*`, 'gi');
  return re.test(sentence) ? sentence.replace(re, '_____') : '';
}
