import { describe, it, expect } from 'vitest';
import {
  newCard,
  nextReviewState,
  ratingFromOutcome,
  migrateLegacyCard,
  levelFromIntervalDays,
  localDateWithCutoff,
  computeStreakUpdate,
  MIN_EASE,
  MAX_EASE,
  LEECH_THRESHOLD,
} from './srs';

const noFuzz = () => 0.5; // fuzz factor lands exactly mid-range (1.0x) for deterministic assertions

describe('nextReviewState — new/learning card', () => {
  it('rating=1 (again) resets to step 0 and stays in learning', () => {
    const result = nextReviewState(newCard(), 1, new Date('2026-01-01T00:00:00Z'));
    expect(result.state).toBe('learning');
    expect(result.learningStep).toBe(0);
    expect(result.dueAt.getTime()).toBe(new Date('2026-01-01T00:01:00Z').getTime());
  });

  it('rating=3 (good) advances through learning steps then graduates to review', () => {
    let card = newCard();
    let now = new Date('2026-01-01T00:00:00Z');

    let r1 = nextReviewState(card, 3, now); // step 0 -> 1
    expect(r1.state).toBe('learning');
    expect(r1.learningStep).toBe(1);

    let r2 = nextReviewState(r1, 3, now); // step 1 -> 2
    expect(r2.state).toBe('learning');
    expect(r2.learningStep).toBe(2);

    let r3 = nextReviewState(r2, 3, now); // step 2 -> graduated
    expect(r3.state).toBe('review');
    expect(r3.intervalDays).toBe(1);
  });

  it('rating=4 (easy) graduates straight to review with the easy interval', () => {
    const result = nextReviewState(newCard(), 4, new Date('2026-01-01T00:00:00Z'));
    expect(result.state).toBe('review');
    expect(result.intervalDays).toBe(4);
  });

  it('reps always increments regardless of rating', () => {
    const result = nextReviewState(newCard(), 1, new Date());
    expect(result.reps).toBe(1);
  });
});

describe('nextReviewState — review card', () => {
  const reviewCard = { state: 'review' as const, ease: 2.5, intervalDays: 10, learningStep: 0, lapses: 0, reps: 5 };
  const now = new Date('2026-01-01T00:00:00Z');

  it('rating=1 (again) lapses, halves interval, drops ease, moves to relearning', () => {
    const result = nextReviewState(reviewCard, 1, now);
    expect(result.state).toBe('relearning');
    expect(result.lapses).toBe(1);
    expect(result.ease).toBeCloseTo(2.3, 5);
    expect(result.intervalDays).toBe(5);
  });

  it('rating=2 (hard) grows interval slowly and drops ease slightly', () => {
    const result = nextReviewState(reviewCard, 2, now, noFuzz);
    expect(result.state).toBe('review');
    expect(result.ease).toBeCloseTo(2.35, 5);
    expect(result.intervalDays).toBeCloseTo(10 * 1.2, 5);
  });

  it('rating=3 (good) multiplies interval by ease, ease unchanged', () => {
    const result = nextReviewState(reviewCard, 3, now, noFuzz);
    expect(result.ease).toBe(2.5);
    expect(result.intervalDays).toBeCloseTo(10 * 2.5, 5);
  });

  it('rating=4 (easy) grows ease and applies an extra 1.3x bonus', () => {
    const result = nextReviewState(reviewCard, 4, now, noFuzz);
    expect(result.ease).toBeCloseTo(2.65, 5);
    expect(result.intervalDays).toBeCloseTo(10 * 2.65 * 1.3, 5);
  });

  it('clamps ease within [MIN_EASE, MAX_EASE]', () => {
    const lowEase = { ...reviewCard, ease: MIN_EASE };
    const r1 = nextReviewState(lowEase, 1, now);
    expect(r1.ease).toBeGreaterThanOrEqual(MIN_EASE);

    const highEase = { ...reviewCard, ease: MAX_EASE };
    const r2 = nextReviewState(highEase, 4, now, noFuzz);
    expect(r2.ease).toBeLessThanOrEqual(MAX_EASE);
  });

  it('caps interval at 365 days', () => {
    const bigCard = { ...reviewCard, intervalDays: 300, ease: 3.0 };
    const result = nextReviewState(bigCard, 4, now, noFuzz);
    expect(result.intervalDays).toBeLessThanOrEqual(365);
  });

  it('applies +/-5% fuzz to the review interval', () => {
    const resultMin = nextReviewState(reviewCard, 3, now, () => 0);
    const resultMax = nextReviewState(reviewCard, 3, now, () => 1);
    expect(resultMin.intervalDays).toBeCloseTo(10 * 2.5 * 0.95, 5);
    expect(resultMax.intervalDays).toBeCloseTo(10 * 2.5 * 1.05, 5);
  });

  it('marks a card as a leech once lapses reach the threshold', () => {
    const almostLeech = { ...reviewCard, lapses: LEECH_THRESHOLD - 1 };
    const result = nextReviewState(almostLeech, 1, now);
    expect(result.lapses).toBe(LEECH_THRESHOLD);
    expect(result.isLeech).toBe(true);
  });

  it('is not a leech below the threshold', () => {
    const result = nextReviewState(reviewCard, 1, now);
    expect(result.isLeech).toBe(false);
  });
});

describe('ratingFromOutcome', () => {
  it('maps incorrect answers to 1 (again)', () => {
    expect(ratingFromOutcome(false)).toBe(1);
    expect(ratingFromOutcome(false, 500)).toBe(1);
  });
  it('maps a fast correct answer to 3 (good)', () => {
    expect(ratingFromOutcome(true, 2000)).toBe(3);
  });
  it('maps a slow (>8s) correct answer to 2 (hard)', () => {
    expect(ratingFromOutcome(true, 9000)).toBe(2);
  });
  it('defaults to 3 (good) when no response time is given', () => {
    expect(ratingFromOutcome(true)).toBe(3);
  });
});

describe('migrateLegacyCard', () => {
  it('maps a never-reviewed word (level 0) to a fresh new card', () => {
    const result = migrateLegacyCard({ level: 0, correct: 0, wrong: 0 });
    expect(result.state).toBe('new');
    expect(result.intervalDays).toBe(0);
  });
  it('maps a word with progress into review state at the legacy interval', () => {
    const result = migrateLegacyCard({ level: 3, correct: 3, wrong: 1 });
    expect(result.state).toBe('review');
    expect(result.intervalDays).toBe(7); // LEGACY_LEVEL_INTERVAL_DAYS[3]
    expect(result.lapses).toBe(1);
  });
});

describe('levelFromIntervalDays', () => {
  it('matches spec §5.2 mastery thresholds', () => {
    expect(levelFromIntervalDays(0)).toBe(0);
    expect(levelFromIntervalDays(1)).toBe(1);
    expect(levelFromIntervalDays(3)).toBe(2);
    expect(levelFromIntervalDays(7)).toBe(3);
    expect(levelFromIntervalDays(14)).toBe(4);
    expect(levelFromIntervalDays(21)).toBe(5);
    expect(levelFromIntervalDays(400)).toBe(5);
  });
});

describe('localDateWithCutoff', () => {
  it('returns the same calendar day when local time is after the cutoff', () => {
    // 14:00 in Asia/Tashkent (UTC+5) on 2026-03-10
    const date = new Date('2026-03-10T09:00:00Z');
    expect(localDateWithCutoff(date, 'Asia/Tashkent')).toBe('2026-03-10');
  });

  it('rolls back to the previous day when local time is before the 04:00 cutoff', () => {
    // 01:30 in Asia/Tashkent (UTC+5) on 2026-03-10 -> should count as 2026-03-09
    const date = new Date('2026-03-09T20:30:00Z');
    expect(localDateWithCutoff(date, 'Asia/Tashkent')).toBe('2026-03-09');
  });

  it('handles a different timezone correctly (not just UTC-based math)', () => {
    // 02:00 in America/New_York (UTC-5 in March, before DST) on 2026-03-10
    const date = new Date('2026-03-10T07:00:00Z');
    expect(localDateWithCutoff(date, 'America/New_York')).toBe('2026-03-09');
  });
});

describe('computeStreakUpdate', () => {
  const tz = 'Asia/Tashkent';

  it('starts a streak at 1 for the first-ever review', () => {
    const now = new Date('2026-03-10T09:00:00Z');
    const result = computeStreakUpdate(now, tz, 0, null);
    expect(result.streak).toBe(1);
    expect(result.lastReviewDate).toBe('2026-03-10');
  });

  it('does not increment streak for a second review on the same local day', () => {
    const now = new Date('2026-03-10T12:00:00Z');
    const result = computeStreakUpdate(now, tz, 5, '2026-03-10');
    expect(result.streak).toBe(5);
  });

  it('increments streak when reviewing on the consecutive local day', () => {
    const now = new Date('2026-03-10T09:00:00Z');
    const result = computeStreakUpdate(now, tz, 5, '2026-03-09');
    expect(result.streak).toBe(6);
  });

  it('resets streak to 1 after a missed day', () => {
    const now = new Date('2026-03-10T09:00:00Z');
    const result = computeStreakUpdate(now, tz, 5, '2026-03-01');
    expect(result.streak).toBe(1);
  });

  it('treats a 01:00 local review as still "yesterday" thanks to the 04:00 cutoff', () => {
    // 01:00 Tashkent time on 2026-03-11 == 2026-03-10T20:00:00Z
    const lateNight = new Date('2026-03-10T20:00:00Z');
    const result = computeStreakUpdate(lateNight, tz, 5, '2026-03-09');
    // Should count as continuing the streak for "2026-03-10", not starting fresh for "2026-03-11"
    expect(result.lastReviewDate).toBe('2026-03-10');
    expect(result.streak).toBe(6);
  });
});
