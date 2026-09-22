import { describe, it, expect } from 'vitest';
import { wordOverlapRatio, splitByLongestSilences, splitTextIntoChunks, assignSourcesToTests } from './processAudio';

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

describe('assignSourcesToTests', () => {
  const assets = [{ _id: 'a1' }, { _id: 'a2' }, { _id: 'a3' }];
  const tests = [{ index: 1 }, { index: 2 }, { index: 3 }];

  it('assigns strictly by content score when every asset has a clear best match', () => {
    const scores = new Map([
      ['a1', new Map([[1, 0.9], [2, 0.1], [3, 0.05]])],
      ['a2', new Map([[1, 0.1], [2, 0.85], [3, 0.2]])],
      ['a3', new Map([[1, 0.05], [2, 0.1], [3, 0.8]])],
    ]);
    const result = assignSourcesToTests(assets, tests, scores);
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.method === 'content')).toBe(true);
    expect(result.find((r) => r.sourceAssetId === 'a1')!.testIndex).toBe(1);
    expect(result.find((r) => r.sourceAssetId === 'a2')!.testIndex).toBe(2);
    expect(result.find((r) => r.sourceAssetId === 'a3')!.testIndex).toBe(3);
  });

  it('resolves a conflict (two assets both scoring highest against the same test) by greedily giving it to the stronger match', () => {
    // Both a1 and a2 "want" test 1, but a1's match is much stronger. a2 should
    // fall through to its next-best (test 2), not steal test 1 from a1.
    const scores = new Map([
      ['a1', new Map([[1, 0.95], [2, 0.2]])],
      ['a2', new Map([[1, 0.9], [2, 0.5]])],
    ]);
    const result = assignSourcesToTests(assets.slice(0, 2), tests.slice(0, 2), scores);
    expect(result.find((r) => r.sourceAssetId === 'a1')!.testIndex).toBe(1);
    expect(result.find((r) => r.sourceAssetId === 'a2')!.testIndex).toBe(2);
    // No test or asset should ever be claimed twice.
    const testIndexes = result.map((r) => r.testIndex);
    expect(new Set(testIndexes).size).toBe(testIndexes.length);
  });

  it('ignores scores below the confidence threshold, leaving that asset for order-fallback', () => {
    const scores = new Map([
      ['a1', new Map([[1, 0.05], [2, 0.03]])], // too low to trust
    ]);
    const result = assignSourcesToTests(assets.slice(0, 1), tests.slice(0, 1), scores);
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('order-fallback');
    expect(result[0].matchScore).toBe(0);
  });

  it('falls back entirely to order-based assignment when there are no content scores at all (e.g. no GROQ_API_KEY)', () => {
    const result = assignSourcesToTests(assets, tests, new Map());
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.method === 'order-fallback')).toBe(true);
    // Order-fallback pairs remaining assets with remaining tests in their original order.
    expect(result.find((r) => r.sourceAssetId === 'a1')!.testIndex).toBe(1);
    expect(result.find((r) => r.sourceAssetId === 'a2')!.testIndex).toBe(2);
    expect(result.find((r) => r.sourceAssetId === 'a3')!.testIndex).toBe(3);
  });

  it('fills only the unmatched remainder with order-fallback when some assets matched by content', () => {
    const scores = new Map([['a2', new Map([[3, 0.9]])]]); // a2 confidently matches test 3
    const result = assignSourcesToTests(assets, tests, scores);
    expect(result.find((r) => r.sourceAssetId === 'a2')).toMatchObject({ testIndex: 3, method: 'content' });
    // a1 and a3 (unmatched by content) fill the remaining tests (1, 2) in order.
    const fallback = result.filter((r) => r.method === 'order-fallback');
    expect(fallback).toHaveLength(2);
    expect(fallback.map((r) => r.testIndex).sort()).toEqual([1, 2]);
  });

  it('never assigns more pairs than the smaller of assets/tests count', () => {
    const result = assignSourcesToTests(assets, tests.slice(0, 2), new Map());
    expect(result).toHaveLength(2); // only 2 tests exist, one asset is left unmatched
  });
});
