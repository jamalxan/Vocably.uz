import { describe, it, expect } from 'vitest';
import { findWeakestMockSkill, recommendNextPractice } from './mockRecommendation';

describe('findWeakestMockSkill', () => {
  it('picks the lowest-banded skill', () => {
    expect(findWeakestMockSkill({ listening: 7, reading: 5.5, writing: 6 })).toEqual({ skill: 'reading', band: 5.5 });
  });

  it('ignores null/undefined bands (not yet graded)', () => {
    expect(findWeakestMockSkill({ listening: 7, reading: null, writing: undefined })).toEqual({ skill: 'listening', band: 7 });
  });

  it('returns null when no band is available at all', () => {
    expect(findWeakestMockSkill({})).toBeNull();
    expect(findWeakestMockSkill({ listening: null, reading: null, writing: null })).toBeNull();
  });

  it('breaks ties deterministically in listening > reading > writing order', () => {
    expect(findWeakestMockSkill({ listening: 6, reading: 6, writing: 6 })).toEqual({ skill: 'listening', band: 6 });
    expect(findWeakestMockSkill({ reading: 6, writing: 6 })).toEqual({ skill: 'reading', band: 6 });
  });
});

describe('recommendNextPractice', () => {
  it('builds a message naming the weakest skill and its band', () => {
    const rec = recommendNextPractice({ listening: 7, reading: 5.5, writing: 6.5 });
    expect(rec).not.toBeNull();
    expect(rec?.weakestSkill).toBe('reading');
    expect(rec?.band).toBe(5.5);
    expect(rec?.message).toContain('Reading');
    expect(rec?.message).toContain('5.5');
  });

  it('returns null when there is nothing to recommend from', () => {
    expect(recommendNextPractice({})).toBeNull();
  });
});
