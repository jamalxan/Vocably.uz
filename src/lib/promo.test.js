import { describe, it, expect } from 'vitest';
import { normalizePromoCode, promoRejection, priceWithPromo, commissionFor, cleanPromoInput } from './promo';

const NOW = new Date('2026-11-05T10:00:00Z');
const promo = (over = {}) => ({ code: 'WELCOME20', active: true, percentOff: 20, maxUses: null, expiresAt: null, ownerId: null, usedCount: 0, ...over });

describe('promo rules', () => {
  it('normalises typed codes', () => {
    expect(normalizePromoCode(' welcome 20 ')).toBe('WELCOME20');
    for (const bad of ['', 'ab', 'A'.repeat(21), 'WEL-COME', null]) expect(normalizePromoCode(bad)).toBeNull();
  });
  it('rejects for the right reason', () => {
    expect(promoRejection(null)).toBe('not_found');
    expect(promoRejection(promo({ active: false }), { now: NOW })).toBe('inactive');
    expect(promoRejection(promo({ expiresAt: new Date('2026-11-01') }), { now: NOW })).toBe('expired');
    expect(promoRejection(promo({ expiresAt: new Date('2026-12-01') }), { now: NOW })).toBeNull();
    expect(promoRejection(promo({ maxUses: 3 }), { now: NOW, uses: 3 })).toBe('exhausted');
    expect(promoRejection(promo({ maxUses: 3 }), { now: NOW, uses: 2 })).toBeNull();
    expect(promoRejection(promo({ ownerId: 'u1' }), { now: NOW, userId: 'u1' })).toBe('own_code');
    expect(promoRejection(promo({ ownerId: 'u1' }), { now: NOW, userId: 'u2' })).toBeNull();
  });
  it('prices round to 100 so‘m and never go negative', () => {
    expect(priceWithPromo(69000, 20)).toEqual({ listPrice: 69000, percentOff: 20, amount: 55200, discount: 13800 });
    expect(priceWithPromo(129000, 15)).toEqual({ listPrice: 129000, percentOff: 15, amount: 109700, discount: 19300 }); // 109 650 → 109 700
    expect(priceWithPromo(69000, 100).amount).toBe(0);
    expect(priceWithPromo(69000, 150).percentOff).toBe(100);
    expect(priceWithPromo(69000, -5)).toMatchObject({ amount: 69000, discount: 0 });
  });
  it('creator commission', () => {
    expect(commissionFor(55200, 30)).toBe(16560);
    expect(commissionFor(55200, 0)).toBe(0);
    expect(commissionFor(55200, 'x')).toBe(0);
  });
  it('admin input is validated field by field', () => {
    expect(cleanPromoInput({ code: 'spring 25', percentOff: 25 }, { now: NOW })).toEqual({ code: 'SPRING25', kind: 'promo', percentOff: 25, creatorShare: 0, maxUses: null, expiresAt: null, note: '' });
    expect(cleanPromoInput({ code: 'x', percentOff: 25 }).error).toBe('bad_code');
    expect(cleanPromoInput({ code: 'ABC', percentOff: 0 }).error).toBe('bad_percent');
    expect(cleanPromoInput({ code: 'ABC', percentOff: 10.5 }).error).toBe('bad_percent');
    expect(cleanPromoInput({ code: 'ABC', kind: 'creator', percentOff: 10, creatorShare: 101 }).error).toBe('bad_share');
    expect(cleanPromoInput({ code: 'ABC', percentOff: 10, maxUses: 0 }).error).toBe('bad_max');
    expect(cleanPromoInput({ code: 'ABC', percentOff: 10, expiresAt: '2026-01-01' }, { now: NOW }).error).toBe('bad_expiry');
    const c = cleanPromoInput({ code: 'ALI', kind: 'creator', percentOff: 10, creatorShare: 30, maxUses: '50', expiresAt: '2027-01-01', note: ' blogger ' }, { now: NOW });
    expect(c).toMatchObject({ code: 'ALI', kind: 'creator', percentOff: 10, creatorShare: 30, maxUses: 50, note: 'blogger' });
    expect(c.expiresAt.toISOString()).toBe('2027-01-01T00:00:00.000Z');
    // promo kind ignores a creator share
    expect(cleanPromoInput({ code: 'ABC', percentOff: 10, creatorShare: 50 }).creatorShare).toBe(0);
  });
});
