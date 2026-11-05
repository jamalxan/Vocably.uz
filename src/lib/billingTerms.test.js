import { describe, it, expect } from 'vitest';
import { termLabel, savingsPercent, refundEligibility, refundSubscriptionUpdate, REFUND_WINDOW_DAYS, BILLING_MONTHS } from './billingTerms';
import { priceFor } from './payments/config';
import { activationUpdate } from './subscription';

const D = (s) => new Date(s);
const paid = (over = {}) => ({ status: 'approved', reviewedAt: D('2026-11-01T10:00:00Z'), tier: 'premium', months: 3, amount: 329000, refund: { status: 'none' }, ...over });

describe('billing terms', () => {
  it('offers 1, 3 and 12 months; 3 months is ~15% off', () => {
    expect(BILLING_MONTHS).toEqual([1, 3, 12]);
    expect(priceFor('standard', 3)).toBe(176000);
    expect(priceFor('premium', 3)).toBe(329000);
    expect(savingsPercent(69000, 3, 176000)).toBe(15);
    expect(savingsPercent(129000, 3, 329000)).toBe(15);
    expect(priceFor('premium', 6)).toBeNull();
  });

  it('labels terms in both languages, including trial days', () => {
    expect(termLabel({ months: 1 })).toBe('1 oy');
    expect(termLabel({ months: 3 })).toBe('3 oy');
    expect(termLabel({ months: 12 })).toBe('1 yil');
    expect(termLabel({ days: 7 })).toBe('7 kun');
    expect(termLabel({ months: 3 }, 'en')).toBe('3 months');
    expect(termLabel({ months: 12 }, 'en')).toBe('1 year');
    expect(termLabel({ days: 7 }, 'en')).toBe('7 days');
  });

  it('a 7-day trial ends exactly 7 days later', () => {
    const now = D('2026-11-05T09:00:00Z');
    const u = activationUpdate({ subscriptionTier: 'free' }, 'premium', { days: 7, now });
    expect(u.subscriptionExpiresAt.toISOString()).toBe('2026-11-12T09:00:00.000Z');
  });
});

describe('14-day refund', () => {
  it('is open for 14 days after the payment was confirmed', () => {
    expect(REFUND_WINDOW_DAYS).toBe(14);
    const ok = refundEligibility(paid(), { now: D('2026-11-15T09:59:00Z') });
    expect(ok).toMatchObject({ ok: true });
    expect(ok.deadline.toISOString()).toBe('2026-11-15T10:00:00.000Z');
    expect(refundEligibility(paid(), { now: D('2026-11-15T10:01:00Z') }).reason).toBe('expired');
  });

  it('needs a confirmed payment, one request at a time, once per account', () => {
    expect(refundEligibility(paid({ status: 'pending' })).reason).toBe('not_paid');
    expect(refundEligibility(paid({ reviewedAt: null })).reason).toBe('not_paid');
    const now = D('2026-11-02T00:00:00Z');
    expect(refundEligibility(paid({ refund: { status: 'requested' } }), { now }).reason).toBe('already');
    expect(refundEligibility(paid({ refund: { status: 'approved' } }), { now }).reason).toBe('already');
    expect(refundEligibility(paid({ refund: { status: 'declined' } }), { now }).ok).toBe(true); // may ask again
    expect(refundEligibility(paid({ refund: undefined }), { now }).ok).toBe(true); // old documents
    expect(refundEligibility(paid(), { now, hadRefund: true }).reason).toBe('used');
  });

  it('takes the refunded term back; nothing left → Free now', () => {
    const now = D('2026-11-05T00:00:00Z');
    // bought 3 months on top of an existing month: expiry Mar 1 → Dec 1
    expect(refundSubscriptionUpdate({ subscriptionTier: 'premium', subscriptionExpiresAt: D('2027-03-01T00:00:00Z') }, paid(), { now }).subscriptionExpiresAt.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(refundSubscriptionUpdate({ subscriptionTier: 'premium', subscriptionExpiresAt: D('2027-02-01T00:00:00Z') }, paid(), { now })).toMatchObject({ subscriptionTier: 'free', subscriptionExpiresAt: null });
    // the user has since moved to another tier — leave the subscription to the admin
    expect(refundSubscriptionUpdate({ subscriptionTier: 'standard', subscriptionExpiresAt: D('2027-02-01T00:00:00Z') }, paid(), { now })).toBeNull();
  });
});
