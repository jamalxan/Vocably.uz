import { describe, it, expect } from 'vitest';
import { REFERRAL, generateReferralCode, normalizeReferralCode, referralLink, referralShareUrl, inviterRewardStatus, monthStart } from './referral';

describe('referral rules', () => {
  it('codes are 8 unambiguous characters', () => {
    let n = 0;
    const code = generateReferralCode(() => (n++ % 31) / 31);
    expect(code).toMatch(/^[A-HJ-KM-NP-Z2-9]{8}$/);
    expect(code).not.toMatch(/[01OIL]/);
  });
  it('normalises what arrives from a URL or cookie', () => {
    expect(normalizeReferralCode(' ab12cd34 ')).toBe('AB12CD34');
    for (const bad of ['', null, 'abc', 'A'.repeat(13), 'AB12-CD34', { $ne: 1 }]) expect(normalizeReferralCode(bad)).toBeNull();
  });
  it('builds the invite and share links', () => {
    expect(referralLink('AB12CD34', 'https://vocably.uz/')).toBe('https://vocably.uz/start?ref=AB12CD34');
    expect(referralShareUrl('AB12CD34', 'https://vocably.uz', 'Join me')).toBe('https://t.me/share/url?url=https%3A%2F%2Fvocably.uz%2Fstart%3Fref%3DAB12CD34&text=Join%20me');
  });
  it('inviter rewards are capped per month', () => {
    expect(inviterRewardStatus(0)).toBe('granted');
    expect(inviterRewardStatus(REFERRAL.maxRewardsPerMonth - 1)).toBe('granted');
    expect(inviterRewardStatus(REFERRAL.maxRewardsPerMonth)).toBe('capped');
    expect(monthStart(new Date('2026-11-17T23:00:00Z')).toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });
});
