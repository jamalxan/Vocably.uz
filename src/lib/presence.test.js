import { describe, it, expect } from 'vitest';
import { formatLastSeen, formatMuteUntil, isOnline } from './presence';

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

describe('formatLastSeen', () => {
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const ago = (ms) => new Date(Date.now() - ms).toISOString();
  const seen = (ms) => formatLastSeen(ago(ms), false);

  it('counts whole units only, never the next unit up', () => {
    expect(seen(59.6 * MIN)).toBe("oxirgi marta ko'rilgan 59 daqiqa oldin");
    expect(seen(90 * MIN)).toBe("oxirgi marta ko'rilgan 1 soat oldin");
    expect(seen(23.7 * HOUR)).toBe("oxirgi marta ko'rilgan 23 soat oldin");
    expect(seen(36 * HOUR)).toBe("oxirgi marta ko'rilgan 1 kun oldin");
    expect(seen(6.7 * DAY)).toBe("oxirgi marta ko'rilgan 6 kun oldin");
  });

  it('never says "0 daqiqa"', () => {
    expect(seen(61 * 1000)).toBe("oxirgi marta ko'rilgan 1 daqiqa oldin");
  });

  // The socket keeps a user "online" for hours without a single chat request, so the stored
  // lastActiveAt is hours old at the moment they leave. The moment the socket reported them
  // offline is the real "last seen".
  it('uses the moment the socket went offline when it is newer than the stored activity', () => {
    expect(formatLastSeen(ago(3 * HOUR), false, ago(2 * MIN))).toBe("oxirgi marta ko'rilgan 2 daqiqa oldin");
    expect(formatLastSeen(null, false, ago(5 * MIN))).toBe("oxirgi marta ko'rilgan 5 daqiqa oldin");
  });

  it('a socket-offline moment a few seconds ago is "last seen", not "online"', () => {
    expect(formatLastSeen(ago(3 * HOUR), false, ago(5 * 1000))).toBe("oxirgi marta ko'rilgan 1 daqiqa oldin");
  });

  it('keeps the stored activity when it is the newer one', () => {
    expect(formatLastSeen(ago(10 * MIN), false, ago(2 * HOUR))).toBe("oxirgi marta ko'rilgan 10 daqiqa oldin");
  });

  it('still says online while the socket is connected', () => {
    expect(formatLastSeen(ago(3 * HOUR), true, ago(2 * HOUR))).toBe('Onlayn');
  });
});
