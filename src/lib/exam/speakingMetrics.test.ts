import { describe, it, expect } from 'vitest';
import { computeSpeakingMetrics } from './speakingMetrics';

const rec = (part: 1 | 2 | 3, transcript: string, durationSec: number, questionIndex = 0) => ({
  part,
  questionIndex,
  audioFileId: 'x',
  transcript,
  durationSec,
  recordedAt: '2026-09-29T00:00:00Z',
});

describe('computeSpeakingMetrics', () => {
  it('measures speech rate, fillers and Part 2 length, with tips', () => {
    const m = computeSpeakingMetrics([
      rec(1, 'Um I like um my hometown because um it is like quiet', 12),
      rec(2, 'I would like to talk about a trip ' + 'we went to the mountains and it was beautiful '.repeat(3), 60),
    ]);
    expect(m.totalWords).toBe(47);
    expect(m.speakingSec).toBe(72);
    expect(m.wordsPerMinute).toBe(39);
    expect(m.fillers.top[0]).toEqual({ word: 'um', count: 3 });
    expect(m.part2Sec).toBe(60);
    expect(m.tipsUz.some((t) => t.includes('Part 2'))).toBe(true);
    expect(m.tipsUz.some((t) => t.includes('sekin'))).toBe(true);
  });

  it('handles no answers', () => {
    const m = computeSpeakingMetrics([rec(1, '', 0)]);
    expect(m.totalWords).toBe(0);
    expect(m.wordsPerMinute).toBeNull();
    expect(m.part2Sec).toBeNull();
  });
});
