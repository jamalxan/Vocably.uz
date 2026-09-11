import { describe, it, expect } from 'vitest';
import { combineWritingBand } from './writingGrader';
import type { WritingScore } from './types';

// gradeEssay() itself calls the AI chain — not unit-tested here (no network
// in this environment either). combineWritingBand is the pure part that
// matters for trust: TZ §3.8 "(task1 + task2*2) / 3, 0.5 ga yaxlitlanadi".
function score(band: number): WritingScore {
  return {
    taskAchievement: band,
    coherenceCohesion: band,
    lexicalResource: band,
    grammaticalRange: band,
    band,
    feedbackUz: '',
    criteriaFeedbackUz: { taskAchievement: '', coherenceCohesion: '', lexicalResource: '', grammaticalRange: '' },
    corrections: [],
  };
}

describe('combineWritingBand', () => {
  it('weighs Task 2 twice as heavily as Task 1', () => {
    // (5 + 7*2) / 3 = 6.333... -> rounds to nearest 0.5 -> 6.5
    expect(combineWritingBand(score(5), score(7))).toBe(6.5);
  });

  it('returns the same band when both tasks match', () => {
    expect(combineWritingBand(score(6.5), score(6.5))).toBe(6.5);
  });

  it('rounds to the nearest 0.5, not the IELTS overall .25/.75 rule', () => {
    // (6 + 6.5*2) / 3 = 6.333... -> 6.5 (plain nearest-half, not overall-band asymmetric rounding)
    expect(combineWritingBand(score(6), score(6.5))).toBe(6.5);
    // (6 + 6*2) / 3 = 6 exactly
    expect(combineWritingBand(score(6), score(6))).toBe(6);
  });

  it('clamps to the 0-9 range', () => {
    expect(combineWritingBand(score(9), score(9))).toBe(9);
    expect(combineWritingBand(score(0), score(0))).toBe(0);
  });
});
