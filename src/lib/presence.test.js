import { describe, it, expect } from 'vitest';
import { formatMuteUntil, isOnline } from './presence';

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

describe('isOnline', () => {
  const ago = (ms) => new Date(Date.now() - ms).toISOString();

  it('trusts a live "online" from the socket', () => {
    expect(isOnline(null, true)).toBe(true);
  });

  it('without a socket answer, recent activity (within throttle + slack) counts as online', () => {
    expect(isOnline(ago(2.5 * 60 * 1000), undefined)).toBe(true);
    expect(isOnline(ago(4 * 60 * 1000), undefined)).toBe(false);
  });

  // The other side's socket can be down while they keep reading/replying over REST (fallback
  // polling). A socket "offline" must not hide activity that happened seconds ago.
  it('a live "offline" still shows online right after real activity (under a minute)', () => {
    expect(isOnline(ago(20 * 1000), false)).toBe(true);
  });

  it('a live "offline" wins once the activity is older than a minute', () => {
    expect(isOnline(ago(90 * 1000), false)).toBe(false);
    expect(isOnline(null, false)).toBe(false);
  });
});
