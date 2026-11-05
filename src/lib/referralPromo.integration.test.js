// Referral rewards and promo codes against in-memory MongoDB (TZ 2.0 §10 growth 3–4, §6.11 5).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, R, P, A;
const NOW = new Date('2026-11-05T10:00:00Z');
const DAY = 86400000;

describeDb('referral + promo (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await Promise.all([M.User.init(), M.Referral.init(), M.PromoCode.init()]);
    R = await import('./referralServer');
    P = await import('./promoServer');
    A = await import('./payments/approve');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.User, M.Referral, M.PromoCode, M.PaymentRequest, M.Notification].map((m) => m.deleteMany({})));
  });

  let n = 0;
  const mkUser = (over = {}) => {
    n += 1;
    return M.User.create({ phone: `+99890300${String(n).padStart(4, '0')}`, password: 'x', name: `U${n}`, username: `user${n}`, ...over });
  };

  it('a code is created once and survives parallel first calls', async () => {
    const u = await mkUser();
    const codes = await Promise.all([R.ensureReferralCode(u._id), R.ensureReferralCode(u._id), R.ensureReferralCode(u._id)]);
    expect(new Set(codes).size).toBe(1);
    expect(codes[0]).toMatch(/^[A-Z2-9]{8}$/);
    expect((await R.referralStats(u._id)).link).toContain(`/start?ref=${codes[0]}`);
  });

  it('sign-up with a friend’s code: both get 7 days Premium, the inviter is told', async () => {
    const owner = await mkUser();
    const code = await R.ensureReferralCode(owner._id);
    const joiner = await mkUser({ subscriptionTier: 'premium', subscriptionExpiresAt: new Date(NOW.getTime() + 7 * DAY) }); // welcome trial already on
    const r = await R.applyReferral(joiner, code.toLowerCase(), { now: NOW });
    expect(r).toMatchObject({ rewardStatus: 'granted', days: 7 });
    const [o, j] = await Promise.all([M.User.findById(owner._id).lean(), M.User.findById(joiner._id).lean()]);
    expect(o.subscriptionTier).toBe('premium');
    expect(o.subscriptionExpiresAt.getTime()).toBe(NOW.getTime() + 7 * DAY);
    expect(o.referral).toMatchObject({ rewardCount: 1, rewardedDays: 7 });
    expect(j.subscriptionExpiresAt.getTime()).toBe(NOW.getTime() + 14 * DAY); // trial 7 + referral 7
    expect(String(j.referral.invitedBy)).toBe(String(owner._id));
    expect(await M.Notification.countDocuments({ userId: owner._id, type: 'gift' })).toBe(1);
    expect(await M.Notification.countDocuments({ userId: joiner._id, type: 'gift' })).toBe(1);
    // Applying again (retried request) changes nothing.
    expect(await R.applyReferral(joiner, code, { now: NOW })).toBeNull();
    expect((await M.User.findById(owner._id).lean()).referral.rewardCount).toBe(1);
  });

  it('junk codes, own code and an active Standard subscriber', async () => {
    const owner = await mkUser();
    const code = await R.ensureReferralCode(owner._id);
    expect(await R.applyReferral(await mkUser(), 'NOPE1234', { now: NOW })).toBeNull();
    expect(await R.applyReferral(await mkUser(), { $ne: '' }, { now: NOW })).toBeNull();
    expect(await R.applyReferral(owner, code, { now: NOW })).toBeNull(); // yourself
    // A paid Standard term is extended, not replaced by 7 days of Premium.
    const std = await mkUser({ subscriptionTier: 'standard', subscriptionExpiresAt: new Date(NOW.getTime() + 20 * DAY) });
    await R.applyReferral(std, code, { now: NOW });
    const s = await M.User.findById(std._id).lean();
    expect(s.subscriptionTier).toBe('standard');
    expect(s.subscriptionExpiresAt.getTime()).toBe(NOW.getTime() + 27 * DAY);
  });

  it('the inviter is rewarded at most 20 times a month; the friend always gets the days', async () => {
    const owner = await mkUser();
    const code = await R.ensureReferralCode(owner._id);
    for (let i = 0; i < 20; i++) await R.applyReferral(await mkUser(), code, { now: new Date(NOW.getTime() + i * 1000) });
    const capped = await R.applyReferral(await mkUser(), code, { now: new Date(NOW.getTime() + 30_000) });
    expect(capped.rewardStatus).toBe('capped');
    const o = await M.User.findById(owner._id).lean();
    expect(o.referral.rewardCount).toBe(20);
    expect(o.subscriptionExpiresAt.getTime()).toBe(NOW.getTime() + 20 * 7 * DAY);
    expect(await M.Referral.countDocuments({ ownerId: owner._id, rewardStatus: 'capped' })).toBe(1);
    // Next month the counter starts again.
    const later = await R.applyReferral(await mkUser(), code, { now: new Date('2026-12-01T00:00:00Z') });
    expect(later.rewardStatus).toBe('granted');
  });

  it('promo code: priced on the server, slots reserved by pending requests, counted on approval', async () => {
    const creator = await mkUser();
    const buyer = await mkUser();
    await M.PromoCode.create({ code: 'ALI30', kind: 'creator', percentOff: 20, ownerId: creator._id, creatorShare: 30, maxUses: 2 });
    expect(await P.resolvePromo('nope', { userId: buyer._id, listPrice: 69000 })).toEqual({ error: 'not_found' });
    expect(await P.resolvePromo('ali30', { userId: creator._id, listPrice: 69000 })).toEqual({ error: 'own_code' });
    const q = await P.resolvePromo('ali30', { userId: buyer._id, listPrice: 69000 });
    expect(q.quote).toEqual({ listPrice: 69000, percentOff: 20, amount: 55200, discount: 13800 });

    const snap = P.promoSnapshot(q.promo, q.quote);
    const r1 = await M.PaymentRequest.create({ userId: buyer._id, tier: 'standard', months: 1, amount: 55200, method: 'manual', promo: snap });
    await M.PaymentRequest.create({ userId: buyer._id, tier: 'standard', months: 1, amount: 55200, method: 'manual', promo: snap });
    expect(await P.resolvePromo('ALI30', { userId: buyer._id, listPrice: 69000 })).toEqual({ error: 'exhausted' }); // 2 pending = 2 slots

    const ok = await A.approvePayment(r1._id, { by: null });
    expect(ok.ok).toBe(true);
    const pc = await M.PromoCode.findOne({ code: 'ALI30' }).lean();
    expect(pc).toMatchObject({ usedCount: 1, revenue: 55200, commission: 16560 });
    expect((await M.PaymentRequest.findById(r1._id).lean()).promo.commission).toBe(16560);
    // Approving twice (admin double click) is refused upstream, so numbers stay.
    expect((await A.approvePayment(r1._id, { by: null })).ok).toBe(false);
    expect((await M.PromoCode.findOne({ code: 'ALI30' }).lean()).usedCount).toBe(1);

    const list = await P.listPromoCodes();
    expect(list[0]).toMatchObject({ code: 'ALI30', kind: 'creator', usedCount: 1, pending: 1, revenue: 55200, commission: 16560, owner: { username: creator.username } });
  });

  it('inactive and expired codes are refused', async () => {
    const buyer = await mkUser();
    await M.PromoCode.create({ code: 'OFF', kind: 'promo', percentOff: 10, active: false });
    await M.PromoCode.create({ code: 'OLD', kind: 'promo', percentOff: 10, expiresAt: new Date('2026-01-01') });
    expect(await P.resolvePromo('OFF', { userId: buyer._id, listPrice: 69000 })).toEqual({ error: 'inactive' });
    expect(await P.resolvePromo('OLD', { userId: buyer._id, listPrice: 69000 })).toEqual({ error: 'expired' });
  });
});
