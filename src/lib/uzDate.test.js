import { describe, it, expect } from 'vitest';
import { formatDateLocale, formatUzDate } from './uzDate';

describe('formatUzDate', () => {
  it('uses real Uzbek month names (not ICU "M10")', () => {
    expect(formatUzDate('2026-10-01T10:00:00Z')).toBe('1-oktabr');
    expect(formatUzDate('2026-09-29T10:00:00Z', { year: true })).toBe('29-sentabr, 2026');
  });
  it('resolves the day in Tashkent time', () => {
    // 21:00 UTC on Sep 30 is already Oct 1 in Tashkent (UTC+5)
    expect(formatUzDate('2026-09-30T21:00:00Z')).toBe('1-oktabr');
  });
  it('returns empty string for invalid input', () => {
    expect(formatUzDate('nope')).toBe('');
  });
});

describe('formatDateLocale', () => {
  const d = '2026-09-29T10:00:00Z';

  it('uz keeps the Uzbek form', () => {
    expect(formatDateLocale('uz', d)).toBe('29-sentabr');
    expect(formatDateLocale('uz', d, { year: true })).toBe('29-sentabr, 2026');
  });

  it('ru uses Russian month names, not English ones', () => {
    expect(formatDateLocale('ru', d)).toBe('29 сентября');
    expect(formatDateLocale('ru', d, { year: true })).toBe('29 сентября 2026 г.');
  });

  it('en stays English, and an unknown locale falls back to it', () => {
    expect(formatDateLocale('en', d)).toBe('September 29');
    expect(formatDateLocale('en', d, { year: true })).toBe('September 29, 2026');
    expect(formatDateLocale('de', d)).toBe('September 29');
  });

  it('resolves the day in Tashkent time by default and in the given zone when asked', () => {
    // 21:00 UTC on Sep 30 is already Oct 1 in Tashkent (UTC+5), still Sep 30 in UTC
    expect(formatDateLocale('ru', '2026-09-30T21:00:00Z')).toBe('1 октября');
    expect(formatDateLocale('ru', '2026-09-30T21:00:00Z', { timeZone: 'UTC' })).toBe('30 сентября');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDateLocale('ru', 'nope')).toBe('');
  });
});
