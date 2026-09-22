import { describe, it, expect } from 'vitest';
import { wordOverlapRatio, splitByLongestSilences, splitTextIntoChunks } from './processAudio';

describe('wordOverlapRatio', () => {
  it('returns 1 when one text is fully contained in the other', () => {
    expect(wordOverlapRatio('hello world', 'hello world this is a longer transcript')).toBe(1);
  });

  it('returns 0 for completely unrelated text', () => {
    expect(wordOverlapRatio('apples oranges bananas', 'xyz qwerty foobar')).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(wordOverlapRatio('', 'something')).toBe(0);
  });
});

describe('splitTextIntoChunks', () => {
  it('splits words into the requested number of roughly equal chunks', () => {
    const text = Array.from({ length: 12 }, (_, i) => `w${i}`).join(' ');
    const chunks = splitTextIntoChunks(text, 4);
    expect(chunks).toHaveLength(4);
    expect(chunks.join(' ').split(/\s+/)).toHaveLength(12);
  });
});

describe('splitByLongestSilences', () => {
  it('splits into exactly `count` ranges spanning the full duration', () => {
    const silences = [
      { startSec: 30, endSec: 32 },
      { startSec: 60, endSec: 63 },
      { startSec: 90, endSec: 91 },
      { startSec: 10, endSec: 10.4 }, // too short a gap, but still a candidate — ranked lower
    ];
    const ranges = splitByLongestSilences(120, silences, 4);
    expect(ranges).toHaveLength(4);
    expect(ranges[0].startSec).toBe(0);
    expect(ranges[ranges.length - 1].endSec).toBe(120);
    // Ranges should be contiguous (each range's end = next range's start).
    for (let i = 0; i < ranges.length - 1; i++) {
      expect(ranges[i].endSec).toBe(ranges[i + 1].startSec);
    }
  });

  it('picks the longest silences as boundaries, not just the earliest ones', () => {
    // A short blip at 20s should be ignored in favour of the much longer gap at 60s
    // when only 1 boundary (2 parts) is requested.
    const silences = [
      { startSec: 20, endSec: 20.5 },
      { startSec: 60, endSec: 65 },
    ];
    const ranges = splitByLongestSilences(100, silences, 2);
    expect(ranges).toHaveLength(2);
    expect(ranges[0].endSec).toBeCloseTo(62.5, 1); // midpoint of the 60-65 silence
  });

  it('falls back to even splits when there are no usable silences at all', () => {
    const ranges = splitByLongestSilences(100, [], 4);
    expect(ranges).toHaveLength(4);
    expect(ranges[0].startSec).toBe(0);
    expect(ranges[ranges.length - 1].endSec).toBe(100);
  });
});
