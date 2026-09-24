import { describe, it, expect } from 'vitest';
import { formatMuteUntil } from './presence';

describe('formatMuteUntil', () => {
  it('returns null for falsy input', () => {
    expect(formatMuteUntil(null)).toBe(null);
    expect(formatMuteUntil(undefined)).toBe(null);
  });

  it('returns null for a time already in the past', () => {
    expect(formatMuteUntil(new Date(Date.now() - 1000).toISOString())).toBe(null);
  });

  it('formats a future time under an hour in minutes', () => {
    const iso = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    expect(formatMuteUntil(iso)).toMatch(/daqiqagacha ovozsiz$/);
  });

  it('formats a future time under a day in hours', () => {
    const iso = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    expect(formatMuteUntil(iso)).toMatch(/soatgacha ovozsiz$/);
  });

  it('formats a future time of a day or more in days', () => {
    const iso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatMuteUntil(iso)).toMatch(/kungacha ovozsiz$/);
  });
});
