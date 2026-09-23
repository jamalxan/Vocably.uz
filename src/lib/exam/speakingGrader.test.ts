import { describe, it, expect } from 'vitest';
import { selectPronunciationSample } from './speakingGrader';
import type { SpeakingRecording } from './types';

// EX-02 (Sprint 2, VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — gradeSpeaking()/
// assessPronunciation() themselves call the AI chain (network) and are not
// unit-tested here, same pattern as gradeEssay()/gradeSpeaking() elsewhere
// (see writingGrader.test.ts). selectPronunciationSample() is pure array
// logic — the part worth locking down with tests.
function recording(overrides: Partial<SpeakingRecording>): SpeakingRecording {
  return {
    part: 1,
    questionIndex: 0,
    audioFileId: '000000000000000000000001',
    transcript: 'some answer',
    durationSec: 10,
    recordedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('selectPronunciationSample', () => {
  it('returns null for an empty array', () => {
    expect(selectPronunciationSample([])).toBeNull();
  });

  it('prefers the Part 2 cue-card recording even when a longer Part 3 recording exists', () => {
    const part2 = recording({ part: 2, questionIndex: 0, durationSec: 5 });
    const part3Longer = recording({ part: 3, questionIndex: 0, durationSec: 60 });
    expect(selectPronunciationSample([part3Longer, part2])).toBe(part2);
  });

  it('returns the longest Part 3 recording when no Part 2 recording exists', () => {
    const short = recording({ part: 3, questionIndex: 0, durationSec: 8 });
    const long = recording({ part: 3, questionIndex: 1, durationSec: 22 });
    const medium = recording({ part: 3, questionIndex: 2, durationSec: 15 });
    expect(selectPronunciationSample([short, long, medium])).toBe(long);
  });

  it('returns the longest Part 1 recording when only Part 1 recordings exist', () => {
    const short = recording({ part: 1, questionIndex: 0, durationSec: 4 });
    const long = recording({ part: 1, questionIndex: 1, durationSec: 9 });
    expect(selectPronunciationSample([short, long])).toBe(long);
  });

  it('falls back to Part 1 when Part 3 recordings are absent but Part 1 ones exist', () => {
    const part1 = recording({ part: 1, questionIndex: 0, durationSec: 7 });
    expect(selectPronunciationSample([part1])).toBe(part1);
  });
});
