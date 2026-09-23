import { describe, it, expect } from 'vitest';
import { combineWritingBand, gradeEssay } from './writingGrader';
import type { WritingScore, WritingTask } from './types';

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

// N-03 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §3) — bo'sh/deyarli bo'sh insho
// AI'ni umuman chaqirmasdan, deterministik band 0 bilan qaytishi kerak. Bu
// yo'l tarmoqqa chiqmaydi (generateJsonWithMeta chaqirilmaydi), shuning uchun
// bu muhitda ham xavfsiz unit-testlanadi.
const task: WritingTask = {
  order: 2,
  minWords: 250,
  recommendedMin: 40,
  promptHtml: '<p>Some prompt</p>',
};

describe('gradeEssay — empty/short-circuit', () => {
  it('returns a deterministic band-0 result without calling the AI for empty text', async () => {
    const result = await gradeEssay(task, '');
    expect(result.band).toBe(0);
    expect(result.taskAchievement).toBe(0);
    expect(result.underMinWords).toBe(true);
    expect(result.graderModel).toBe('none');
  });

  it('short-circuits for text under the 20-word floor even if non-empty', async () => {
    const result = await gradeEssay(task, 'This is way too short to grade properly at all.');
    expect(result.band).toBe(0);
    expect(result.graderModel).toBe('none');
  });
});
