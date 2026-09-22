import { describe, it, expect } from 'vitest';
import {
  normalize,
  expandOptional,
  isCorrect,
  isSetCorrect,
  listeningBand,
  readingBand,
  generalTrainingReadingBand,
  overallBand,
  officialStyleOverallBand,
  roundOverall,
} from './scoring';

// TZ-vocably-v2.md §22 Faza 1, qadam 3 — "TZ §10.1 va §10.2 ga qat'iy amal qiling.
// Unit testlar bilan."

describe('normalize', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(normalize('  The   Museum  ')).toBe('the museum');
  });

  it('converts smart quotes/apostrophes to plain ones', () => {
    expect(normalize('it’s a “test”')).toBe('it\'s a "test"');
  });

  it('strips a single trailing punctuation mark', () => {
    expect(normalize('museum.')).toBe('museum');
    expect(normalize('museum!')).toBe('museum');
  });
});

describe('expandOptional', () => {
  it('returns the string unchanged when there are no parentheses', () => {
    expect(expandOptional('museum')).toEqual(['museum']);
  });

  it('expands "(the) old museum" into both variants', () => {
    expect(expandOptional('(the) old museum')).toEqual(['old museum', 'the old museum']);
  });
});

describe('isCorrect', () => {
  it('matches an exact accepted answer case-insensitively', () => {
    expect(isCorrect('Museum', { accepted: ['museum'] })).toBe(true);
    expect(isCorrect('MUSEUM', { accepted: ['museum'] })).toBe(true);
  });

  it('rejects an empty answer', () => {
    expect(isCorrect('', { accepted: ['museum'] })).toBe(false);
  });

  it('accepts both variants of an optional-parenthesis answer key', () => {
    const key = { accepted: ['(the) old museum'] };
    expect(isCorrect('old museum', key)).toBe(true);
    expect(isCorrect('the old museum', key)).toBe(true);
    expect(isCorrect('a old museum', key)).toBe(false);
  });

  it('accepts both British and American spelling when both are listed', () => {
    const key = { accepted: ['colour', 'color'] };
    expect(isCorrect('colour', key)).toBe(true);
    expect(isCorrect('color', key)).toBe(true);
  });

  it('rejects an answer that exceeds the word limit even if otherwise correct', () => {
    const limit = { maxWords: 2, label: 'NO MORE THAN TWO WORDS' };
    expect(isCorrect('the old museum', { accepted: ['the old museum'] }, limit)).toBe(false); // 3 so'z, limit 2
    expect(isCorrect('old museum', { accepted: ['old museum'] }, limit)).toBe(true); // 2 so'z, limit ichida
  });

  it('matches via regex pattern when accepted list does not match', () => {
    const key = { accepted: [], pattern: '\\d{4}' };
    expect(isCorrect('1932', key)).toBe(true);
    expect(isCorrect('abcd', key)).toBe(false);
  });

  it('ignores trailing punctuation and smart quotes when comparing', () => {
    expect(isCorrect('museum.', { accepted: ['museum'] })).toBe(true);
  });
});

describe('isSetCorrect', () => {
  const key = { accepted: ['B', 'D'] };

  it('accepts the exact correct set regardless of order', () => {
    expect(isSetCorrect(['B', 'D'], key)).toBe(true);
    expect(isSetCorrect(['D', 'B'], key)).toBe(true);
  });

  it('gives no partial credit for one correct and one wrong letter', () => {
    expect(isSetCorrect(['B', 'C'], key)).toBe(false);
  });

  it('rejects a subset (only one of the two required letters)', () => {
    expect(isSetCorrect(['B'], key)).toBe(false);
  });

  it('rejects a superset (an extra, unrequired letter)', () => {
    expect(isSetCorrect(['B', 'D', 'A'], key)).toBe(false);
  });

  it('rejects an empty selection', () => {
    expect(isSetCorrect([], key)).toBe(false);
  });

  it('is case-insensitive like isCorrect', () => {
    expect(isSetCorrect(['b', 'd'], key)).toBe(true);
  });
});

describe('band tables', () => {
  it('listeningBand and readingBand cover the full 0-40 range without gaps', () => {
    for (let raw = 0; raw <= 40; raw++) {
      expect(typeof listeningBand(raw).band).toBe('number');
      expect(typeof readingBand(raw).band).toBe('number');
    }
    expect(listeningBand(40).band).toBe(9.0);
    expect(readingBand(40).band).toBe(9.0);
    expect(listeningBand(0).band).toBe(0.0);
  });

  it('readingBand uses the Academic table by default and is not affected by unrelated calls', () => {
    expect(readingBand(23).band).toBe(6.0); // Academic: 23-26 -> 6.0
  });

  it('readingBand switches to the General Training table when module is "general" (P0-03)', () => {
    // Academic 23 raw -> 6.0, but GT 23 raw -> 5.0 (different table entirely)
    expect(readingBand(23, 'general').band).toBe(5.0);
    expect(readingBand(23, 'general').estimated).toBe(false);
  });

  it('readingBand honours a test-specific bandTable override over the module default', () => {
    const override = [{ min: 0, max: 40, band: 9.0 }];
    expect(readingBand(1, 'academic', override)).toEqual({ band: 9.0, estimated: false });
  });

  it('generalTrainingReadingBand matches the documented rows', () => {
    expect(generalTrainingReadingBand(40).band).toBe(9.0);
    expect(generalTrainingReadingBand(16).band).toBe(4.0);
  });

  it('generalTrainingReadingBand no longer flat-clamps below-range scores to 4.0 (P0-03 fix) and flags them as estimated', () => {
    // Old (buggy) behaviour: raw=0 and raw=14 both mapped to 4.0. Now they must differ
    // and must be marked estimated (below the lowest documented table row of 15).
    const zero = generalTrainingReadingBand(0);
    const fourteen = generalTrainingReadingBand(14);
    expect(zero.estimated).toBe(true);
    expect(fourteen.estimated).toBe(true);
    expect(zero.band).toBeLessThan(fourteen.band);
    expect(zero.band).toBe(0);
    expect(fourteen.band).toBe(3.5); // linear estimate toward (15 -> 4.0), rounded to nearest 0.5
  });
});

describe('officialStyleOverallBand', () => {
  it('returns null (pending) when a section included in the attempt has not been graded yet', () => {
    // Mock attempt with listening+reading+writing: L and R done, Writing still AI-queued.
    expect(
      officialStyleOverallBand(['listening', 'reading', 'writing'], { listening: 6.5, reading: 6.5, writing: null, speaking: null })
    ).toBeNull();
  });

  it('returns the rounded average once every section in the attempt is graded', () => {
    expect(
      officialStyleOverallBand(['listening', 'reading', 'writing'], { listening: 6.5, reading: 6.5, writing: 5.0, speaking: null })
    ).toBe(6.0);
  });

  it('treats a single-section practice attempt as complete once that one section is graded', () => {
    expect(officialStyleOverallBand(['reading'], { listening: null, reading: 7.0, writing: null, speaking: null })).toBe(7.0);
  });
});

describe('roundOverall / overallBand', () => {
  it('rounds .25 up to .5 and .75 up to the next whole band (IELTS rule)', () => {
    expect(roundOverall(6.25)).toBe(6.5);
    expect(roundOverall(6.75)).toBe(7.0);
    expect(roundOverall(6.1)).toBe(6.0);
    expect(roundOverall(6.4)).toBe(6.5);
  });

  it('averages only the sections that are present', () => {
    expect(overallBand({ listening: 6.5, reading: 6.5, writing: 5.0, speaking: 7.0 })).toBe(6.5);
    expect(overallBand({ listening: 6.5, reading: 6.5, writing: null, speaking: null })).toBe(6.5);
  });

  it('returns null when nothing is graded yet', () => {
    expect(overallBand({ listening: null, reading: null, writing: null, speaking: null })).toBeNull();
  });
});
