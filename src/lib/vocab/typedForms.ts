// Accepted typed forms for the typing games (word_tunnel, word_defense). Shared by the server grader
// (games.ts → question.accepted) and the device-side correction check in Word Defense
// (flagship/typing.js), so both accept exactly the same spellings. Pure and tiny: safe to ship to
// the browser.
import { normalizeForCompare } from '../textCompare';

/** Object placeholders in dictionary headwords: "rely on sb/sth", "look after (sb)", "sb's". */
const PLACEHOLDERS = new Set(['sb', 'sth', 'smb', 'smth', 'sbs', 'sths']);
/** A slash inside a token splits only real words ("colour/color", "sb/sth"), never "24/7" or "w/o". */
const ALT_PART = /^[a-z][a-z-]+$/;
/** Upper bound on generated forms, so a pathological headword cannot blow up the list. */
const MAX_FORMS = 48;

const clean = (s: string) => normalizeForCompare(s).replace(/\s+/g, ' ').trim();

/** "rely on sb" → "rely on". A phrase made only of placeholders is kept as it is. */
function dropPlaceholders(s: string): string {
  const kept = s.split(' ').filter((t) => !PLACEHOLDERS.has(t));
  return kept.length ? kept.join(' ') : s;
}

/** Every combination of one option per slot, in order (the first is all-first-options), capped. */
function combine(slots: string[][]): string[] {
  let acc = [''];
  for (const options of slots) {
    const next: string[] = [];
    for (const head of acc) for (const o of options) if (next.length < MAX_FORMS) next.push(head + o);
    acc = next;
  }
  return acc;
}

/**
 * Optional parts in brackets: "(of)" may be left out or typed ("in charge" / "in charge of"); a
 * placeholder "(sb)" is left out. The first variant has every bracket removed (the primary form).
 */
function bracketVariants(phrase: string): string[] {
  const slots = phrase.split(/(\([^)]*\))/).map((part) => {
    if (!part.startsWith('(') || !part.endsWith(')')) return [part];
    const inner = clean(part.slice(1, -1));
    const content = inner.split(' ').filter((t) => t && !PLACEHOLDERS.has(t)).join(' ');
    return [' ', ` ${content} `, ` ${inner} `];
  });
  return combine(slots).map(clean).filter(Boolean);
}

/** Word alternatives inside a token: "look after/for" → "look after" | "look for". */
function slashVariants(phrase: string): string[] {
  const slots = phrase.split(' ').map((token, i) => {
    const alts = token.split('/');
    const options = alts.length > 1 && alts.every((a) => ALT_PART.test(a)) ? alts : [token];
    return options.map((o) => (i ? ` ${o}` : o));
  });
  return combine(slots);
}

/**
 * Accepted typed forms for a headword. The first entry is the primary form (used for the length /
 * first-letter hints). Accepted, besides the headword exactly as shown:
 * - hyphen / space / no space: "long-term", "long term", "longterm";
 * - without a leading "to ": "to improve" → "improve";
 * - optional bracketed parts left out or typed: "in charge (of)" → "in charge", "in charge of";
 * - placeholders left out or typed: "rely on sb/sth" → "rely on", "rely on sb", "rely on sth";
 * - each side of an alternative: "affect / influence", "colour/color".
 * A placeholder alone ("sth") is never an answer.
 */
export function typedAcceptedForWord(word: string): string[] {
  const out = new Set<string>();
  const add = (s: string) => {
    const n = clean(s);
    if (n && out.size < MAX_FORMS) out.add(n);
  };
  const addSpellings = (v: string) => {
    for (const w of [v, v.replace(/^to\s+/, '')]) {
      if (!w) continue;
      add(w);
      if (w.includes('-')) {
        add(w.replace(/-/g, ' '));
        add(w.replace(/-/g, ''));
      } else if (w.includes(' ')) {
        add(w.replace(/ /g, '-'));
      }
    }
  };
  const literal = clean(word);
  const sides = literal.split(/\s+\/\s*|\s*\/\s+/);
  const phrases = sides.length > 1 && sides.every((p) => /[a-z]{2,}/.test(p)) ? sides : [literal];
  for (const phrase of phrases) {
    for (const b of bracketVariants(phrase)) {
      for (const s of slashVariants(b)) {
        addSpellings(dropPlaceholders(s));
        // With the placeholder typed out: accepted as written, without spelling variants.
        if (dropPlaceholders(s) !== s) add(s);
      }
    }
  }
  add(literal); // exactly what the verdict shows ("in charge (of)") is never graded wrong
  if (!out.size) add(word);
  return Array.from(out);
}
