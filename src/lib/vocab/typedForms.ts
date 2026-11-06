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
/**
 * Longest headword that is parsed into forms. Nothing near it is ever asked (games.ts typeableWord
 * stops at 60 characters, the answer input holds 40); a longer one is accepted only as written, so
 * a huge headword costs one linear pass instead of a parse.
 */
const MAX_PARSED_CHARS = 80;
/** A letter or digit next to a bracket can put it inside a word: "colo(u)r", "(un)able" (bracketVariants). */
const WORD_CHAR = /[\p{L}\p{N}]/u;

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
 * [start, end] index pairs of the bracket groups ("(…)" unless told otherwise), in order, found with
 * one linear scan: a group ends at the first ")" after its "(", and an unclosed "(" is plain text.
 * (A regex such as /\([^)]*\)/ rescans to the end of the string from every unclosed "(", which is
 * quadratic on a long headword.)
 */
function bracketRanges(s: string, open = '(', close = ')'): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (let from = 0; ; ) {
    const start = s.indexOf(open, from);
    const end = start < 0 ? -1 : s.indexOf(close, start + 1);
    if (end < 0) return ranges;
    ranges.push([start, end]);
    from = end + 1;
  }
}

/** "[…]" labels are never typed: "ascertain [formal]" → "ascertain". */
function dropLabels(s: string): string {
  let out = '';
  let from = 0;
  for (const [start, end] of bracketRanges(s, '[', ']')) {
    out += `${s.slice(from, start)} `;
    from = end + 1;
  }
  return out + s.slice(from);
}

/**
 * Optional parts in brackets. A bracketed word may be left out or typed ("in charge (of)" →
 * "in charge" / "in charge of"); a placeholder "(sb)", "(sb/sth)" is left out or typed. A bracket
 * inside a word (one token with no placeholder, touching a letter or digit) is joined to it:
 * "colo(u)r" → "color" / "colour". One that touches a single side may also be a word written
 * without a space, so the spaced reading follows the joined one: "(un)able" → "able", "unable"
 * (then "un able"); "interested(in)" → "interested", "interestedin", "interested in". A slash in a
 * word bracket picks one of its parts, never none: "organi(s/z)e" → "organise" / "organize". The
 * first variant has every optional bracket left out (the primary form).
 */
function bracketVariants(phrase: string): string[] {
  const slots: string[][] = [];
  let from = 0;
  for (const [start, end] of bracketRanges(phrase)) {
    slots.push([phrase.slice(from, start)]);
    const inner = clean(phrase.slice(start + 1, end));
    const content = inner.split(' ').filter((t) => t && !PLACEHOLDERS.has(t)).join(' ');
    const left = WORD_CHAR.test(phrase.charAt(start - 1));
    const right = WORD_CHAR.test(phrase.charAt(end + 1));
    const parts = inner.split('/').map(clean);
    if ((!left && !right) || inner.includes(' ') || parts.some((p) => PLACEHOLDERS.has(p))) {
      slots.push([' ', ` ${content} `, ` ${inner} `]);
    } else if (parts.length > 1) {
      slots.push(parts);
    } else {
      slots.push(left && right ? ['', inner] : ['', inner, ` ${inner} `]);
    }
    from = end + 1;
  }
  slots.push([phrase.slice(from)]);
  return combine(slots).map(clean).filter(Boolean);
}

/** The words a player types for a phrase: brackets left out, placeholders not counted. */
function typedWords(phrase: string): string[] {
  return (bracketVariants(phrase)[0] || '').split(' ').filter((t) => t && !PLACEHOLDERS.has(t));
}

/**
 * Whole phrases split by a bare slash: "deal with/cope with" → "deal with" | "cope with". Only for
 * parallel phrases: every side has 2+ typed words and they all start, or all end, with the same
 * word. Read word by word, such a headword repeats that word ("deal with with", "look look for").
 * Any other slash is between single words and is left to slashVariants ("look after/for" →
 * "look after" | "look for", "get on/along with" → "get on with" | "get along with"), so a lone word
 * or a fragment of a phrase ("for", "get on", "off" in "tell sb/sth off") is never an answer of its
 * own. A slash inside brackets does not split. [] when there is no such split.
 */
function phraseAlternatives(phrase: string): string[] {
  const groups = bracketRanges(phrase);
  const sides: string[] = [];
  let from = 0;
  let g = 0;
  for (let i = phrase.indexOf('/'); i >= 0; i = phrase.indexOf('/', i + 1)) {
    while (g < groups.length && groups[g][1] < i) g += 1;
    const bracketed = g < groups.length && groups[g][0] < i;
    const bare = i > 0 && phrase[i - 1] !== ' ' && i + 1 < phrase.length && phrase[i + 1] !== ' ';
    if (bracketed || !bare) continue;
    sides.push(phrase.slice(from, i));
    from = i + 1;
  }
  if (!sides.length) return [];
  sides.push(phrase.slice(from));
  const words = sides.map(typedWords);
  if (!sides.every((p, i) => /[a-z]{2,}/.test(p) && words[i].length >= 2)) return [];
  const shared = (pick: (w: string[]) => string) => words.every((w) => pick(w) === pick(words[0]));
  return shared((w) => w[0]) || shared((w) => w[w.length - 1]) ? sides.map(clean) : [];
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
 * first-letter hints and for counting the words a player types). Accepted, besides the headword
 * exactly as shown:
 * - hyphen / space / no space: "long-term", "long term", "longterm";
 * - without a leading "to ": "to improve" → "improve";
 * - optional bracketed parts left out or typed: "in charge (of)" → "in charge", "in charge of";
 * - optional letters both ways, the bracket-free spelling first: "colo(u)r" → "color", "colour";
 *   one of the letters in a slashed bracket: "organi(s/z)e" → "organise", "organize";
 * - placeholders left out or typed: "rely on sb/sth" → "rely on", "rely on sb", "rely on sth";
 * - without "[…]" labels: "ascertain [formal]" → "ascertain";
 * - each side of an alternative: "affect / influence", "colour/color", "get on/along with" →
 *   "get on with", "get along with"; parallel phrases whole, first ("deal with/cope with" →
 *   "deal with", "cope with", then the word-level reading).
 * A placeholder alone ("sth") is never an answer. A headword longer than MAX_PARSED_CHARS is
 * accepted only as written.
 */
export function typedAcceptedForWord(word: string): string[] {
  const raw = typeof word === 'string' ? word : '';
  const literal = clean(raw);
  if (raw.length > MAX_PARSED_CHARS) return literal ? [literal] : [];
  const out = new Set<string>();
  // One slot stays free for the literal headword, which is always accepted.
  const add = (s: string, cap = MAX_FORMS - 1) => {
    const n = clean(s);
    if (n && out.size < cap) out.add(n);
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
  const unlabelled = clean(dropLabels(literal));
  const sides = unlabelled.split(/\s+\/\s*|\s*\/\s+/);
  const spaced = sides.length > 1 && sides.every((p) => /[a-z]{2,}/.test(p)) ? sides : [unlabelled];
  for (const side of spaced) {
    // Whole-phrase alternatives first, then the word-level reading of the same side.
    for (const phrase of [...phraseAlternatives(side), side]) {
      for (const b of bracketVariants(phrase)) {
        for (const s of slashVariants(b)) {
          if (out.size >= MAX_FORMS - 1) break; // full: the rest could only be dropped
          addSpellings(dropPlaceholders(s));
          // With the placeholder typed out: accepted as written, without spelling variants.
          if (dropPlaceholders(s) !== s) add(s);
        }
      }
    }
  }
  add(literal, MAX_FORMS); // exactly what the verdict shows ("in charge (of)") is never graded wrong
  return Array.from(out);
}
