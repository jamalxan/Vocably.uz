// 14-day refund flow on a real (in-memory) MongoDB: request → admin decision → subscription shortened.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M;
let refund;

const DAY = 86_400_000;

describeDb('refunds (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    M = await import('@/lib/models');
    refund = await import('./refund');
    await mongoose.connect(mongod.getUri());
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.User.deleteMany({});
    await M.PaymentRequest.deleteMany({});
    await M.Notification.deleteMany({});
  });

  const setup = async ({ paidDaysAgo = 2, months = 3, expiresInDays = 90 } = {}) => {
    const now = Date.now();
    const user = await M.User.create({ phone: `+99890${Math.floor(1e6 + Math.random() * 8e6)}`, password: 'x', subscriptionTier: 'premium', subscriptionExpiresAt: new Date(now + expiresInDays * DAY) });
    const pay = await M.PaymentRequest.create({ userId: user._id, tier: 'premium', months, amount: 329000, method: 'payme', status: 'approved', reviewedAt: new Date(now - paidDaysAgo * DAY) });
    return { user, pay };
  };

  it('request → approve: the paid term is taken back, the user is told, it cannot be decided twice', async () => {
    const { user, pay } = await setup({ expiresInDays: 120 });
    const r = await refund.requestRefund(user._id, String(pay._id), 'not for me');
    expect(r).toMatchObject({ ok: true, refund: { status: 'requested', reason: 'not for me' } });
    expect((await refund.requestRefund(user._id, String(pay._id))).status).toBe(400); // already requested

    const d = await refund.decideRefund(pay._id, { approve: true });
    expect(d.ok).toBe(true);
    const u = await M.User.findById(user._id).lean();
    expect(u.subscriptionTier).toBe('premium');
    const left = (u.subscriptionExpiresAt - Date.now()) / DAY;
    expect(left).toBeGreaterThan(25);
    expect(left).toBeLessThan(35);
    expect((await refund.decideRefund(pay._id, { approve: true })).ok).toBe(false);
    expect(await M.Notification.countDocuments({ userId: user._id, type: 'payment' })).toBe(2);
  });

  it('refund of the only paid term → back to Free', async () => {
    const { user, pay } = await setup({ months: 1, expiresInDays: 28 });
    await refund.requestRefund(user._id, String(pay._id));
    await refund.decideRefund(pay._id, { approve: true });
    expect((await M.User.findById(user._id).lean()).subscriptionTier).toBe('free');
  });

  it('declined: subscription untouched, the user may ask again inside the window', async () => {
    const { user, pay } = await setup();
    await refund.requestRefund(user._id, String(pay._id));
    await refund.decideRefund(pay._id, { approve: false, note: 'used 40 AI checks' });
    expect((await M.User.findById(user._id).lean()).subscriptionTier).toBe('premium');
    expect((await refund.requestRefund(user._id, String(pay._id))).ok).toBe(true);
  });

  it('rules: 14 days, own payments only, once per account', async () => {
    const late = await setup({ paidDaysAgo: 15 });
    expect((await refund.requestRefund(late.user._id, String(late.pay._id))).error).toMatch(/14 kun/);

    const a = await setup();
    const b = await setup();
    expect((await refund.requestRefund(a.user._id, String(b.pay._id))).status).toBe(404); // someone else's payment
    expect((await refund.requestRefund(a.user._id, 'not-an-id')).status).toBe(400);

    await refund.requestRefund(a.user._id, String(a.pay._id));
    await refund.decideRefund(a.pay._id, { approve: true });
    const again = await M.PaymentRequest.create({ userId: a.user._id, tier: 'premium', months: 1, amount: 129000, method: 'manual', status: 'approved', reviewedAt: new Date() });
    expect((await refund.requestRefund(a.user._id, String(again._id))).error).toMatch(/bir marta/);
  });

  it('parallel requests: only one goes through', async () => {
    const { user, pay } = await setup();
    const rs = await Promise.all(Array.from({ length: 6 }, () => refund.requestRefund(user._id, String(pay._id))));
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
  });
});
