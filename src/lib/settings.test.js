import { describe, it, expect } from 'vitest';
import { normalizeWelcomeTrial, WELCOME_TRIAL_DEFAULT } from './settings';

describe('normalizeWelcomeTrial', () => {
  it('default is 1 month of Premium, enabled', () => {
    expect(WELCOME_TRIAL_DEFAULT).toEqual({ enabled: true, tier: 'premium', months: 1 });
    expect(normalizeWelcomeTrial(null)).toEqual(WELCOME_TRIAL_DEFAULT);
    expect(normalizeWelcomeTrial({})).toEqual(WELCOME_TRIAL_DEFAULT);
  });
  it('partial updates keep the rest; strings from forms/bot are accepted', () => {
    expect(normalizeWelcomeTrial({ enabled: false })).toEqual({ enabled: false, tier: 'premium', months: 1 });
    expect(normalizeWelcomeTrial({ tier: 'STANDARD', months: '3' })).toEqual({ enabled: true, tier: 'standard', months: 3 });
    expect(normalizeWelcomeTrial({ enabled: 'on' }, { enabled: false, tier: 'standard', months: 6 })).toEqual({ enabled: true, tier: 'standard', months: 6 });
  });
  it('rejects a free/unknown tier or an odd term', () => {
    expect(normalizeWelcomeTrial({ tier: 'free' })).toBeNull();
    expect(normalizeWelcomeTrial({ tier: 'gold' })).toBeNull();
    expect(normalizeWelcomeTrial({ months: 2 })).toBeNull();
    expect(normalizeWelcomeTrial({ months: 'x' })).toBeNull();
  });
});
