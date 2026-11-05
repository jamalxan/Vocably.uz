import { describe, it, expect } from 'vitest';
import { normalizeWelcomeTrial, WELCOME_TRIAL_DEFAULT } from './settings';

describe('normalizeWelcomeTrial', () => {
  it('default is 1 month of Premium, enabled', () => {
    expect(WELCOME_TRIAL_DEFAULT).toEqual({ enabled: true, tier: 'premium', months: 1, days: null });
    expect(normalizeWelcomeTrial(null)).toEqual(WELCOME_TRIAL_DEFAULT);
    expect(normalizeWelcomeTrial({})).toEqual(WELCOME_TRIAL_DEFAULT);
  });
  it('partial updates keep the rest; strings from forms/bot are accepted', () => {
    expect(normalizeWelcomeTrial({ enabled: false })).toEqual({ enabled: false, tier: 'premium', months: 1, days: null });
    expect(normalizeWelcomeTrial({ tier: 'STANDARD', months: '3' })).toEqual({ enabled: true, tier: 'standard', months: 3, days: null });
    expect(normalizeWelcomeTrial({ enabled: 'on' }, { enabled: false, tier: 'standard', months: 6 })).toEqual({ enabled: true, tier: 'standard', months: 6, days: null });
  });
  it('rejects a free/unknown tier or an odd term', () => {
    expect(normalizeWelcomeTrial({ tier: 'free' })).toBeNull();
    expect(normalizeWelcomeTrial({ tier: 'gold' })).toBeNull();
    expect(normalizeWelcomeTrial({ months: 2 })).toBeNull();
    expect(normalizeWelcomeTrial({ months: 'x' })).toBeNull();
    expect(normalizeWelcomeTrial({ days: 5 })).toBeNull();
  });
  it('TZ 2.0 §10: a trial term in days (7-day Premium); switching back to months clears days', () => {
    const week = normalizeWelcomeTrial({ days: '7' });
    expect(week).toEqual({ enabled: true, tier: 'premium', months: null, days: 7 });
    expect(normalizeWelcomeTrial({ enabled: false }, week)).toEqual({ enabled: false, tier: 'premium', months: null, days: 7 });
    expect(normalizeWelcomeTrial({ tier: 'standard' }, week)).toMatchObject({ tier: 'standard', days: 7 });
    expect(normalizeWelcomeTrial({ months: 1, days: null }, week)).toEqual({ enabled: true, tier: 'premium', months: 1, days: null });
  });
});
