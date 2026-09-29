import { describe, it, expect } from 'vitest';
import { formatUzDate } from './uzDate';

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
