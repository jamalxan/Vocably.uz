import { describe, it, expect } from 'vitest';
import { SUBSCRIPTION_TIERS, TIER_CONFIG, hasReachedMonthlyLimit, monthlyGradingLimitMessage } from './entitlements';

// BILL-01/02 — bu yerda faqat pure/DB'siz mantiq test qilinadi
// (hasReachedMonthlyLimit, TIER_CONFIG shakli). Haqiqiy DB'ga bog'liq
// checkAndIncrementAiRateLimit integratsiyasi (src/lib/ai/client.js) shu
// loyihaning boshqa AI-limit funksiyalari kabi alohida test qilinmaydi.
describe('TIER_CONFIG', () => {
  it('has an entry for every declared tier', () => {
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(TIER_CONFIG[tier]).toBeDefined();
    }
  });

  it('FREE has a finite monthly AI grading limit', () => {
    expect(TIER_CONFIG.free.monthlyAiGradingLimit).toBeGreaterThan(0);
  });

  it('STANDARD and PREMIUM have unlimited (null) AI grading', () => {
    expect(TIER_CONFIG.standard.monthlyAiGradingLimit).toBeNull();
    expect(TIER_CONFIG.premium.monthlyAiGradingLimit).toBeNull();
  });

  it('FREE is priced at 0, paid tiers are priced above 0', () => {
    expect(TIER_CONFIG.free.priceMonthly).toBe(0);
    expect(TIER_CONFIG.free.priceYearly).toBe(0);
    expect(TIER_CONFIG.standard.priceMonthly).toBeGreaterThan(0);
    expect(TIER_CONFIG.premium.priceMonthly).toBeGreaterThan(TIER_CONFIG.standard.priceMonthly);
  });

  it('every tier has a non-empty features list', () => {
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(TIER_CONFIG[tier].features.length).toBeGreaterThan(0);
    }
  });
});

describe('hasReachedMonthlyLimit', () => {
  const limit = TIER_CONFIG.free.monthlyAiGradingLimit;

  it('FREE: false while under the limit', () => {
    expect(hasReachedMonthlyLimit('free', 1)).toBe(false);
    expect(hasReachedMonthlyLimit('free', limit)).toBe(false);
  });

  it('FREE: true once the count exceeds the limit', () => {
    expect(hasReachedMonthlyLimit('free', limit + 1)).toBe(true);
  });

  it('STANDARD/PREMIUM: never reached, regardless of count', () => {
    expect(hasReachedMonthlyLimit('standard', 100000)).toBe(false);
    expect(hasReachedMonthlyLimit('premium', 100000)).toBe(false);
  });

  it('unknown tier: treated as no limit (config lookup misses, limit undefined)', () => {
    expect(hasReachedMonthlyLimit('nonexistent', 100000)).toBe(false);
  });
});

describe('monthlyGradingLimitMessage', () => {
  it('mentions the free limit number and points to /narxlar', () => {
    const msg = monthlyGradingLimitMessage();
    expect(msg).toContain(String(TIER_CONFIG.free.monthlyAiGradingLimit));
    expect(msg).toMatch(/narxlar/);
  });
});
