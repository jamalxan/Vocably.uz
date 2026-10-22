// Payme / Click callback lifecycles against a real (in-memory) MongoDB:
// order → provider transaction → plan activation, plus the edge cases a
// provider retry or an admin decision in between can produce.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';

vi.mock('@/lib/telegram', () => ({ sendMessage: vi.fn(async () => ({ ok: true })), getBotUsername: () => 'bot' }));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, payme, click, approve, pending;

describeDb('payment providers (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.PAYME_MERCHANT_ID = 'm1';
    process.env.PAYME_SECRET_KEY = 'payme-key';
    process.env.CLICK_SERVICE_ID = '11';
    process.env.CLICK_MERCHANT_ID = '22';
    process.env.CLICK_SECRET_KEY = 'click-key';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    payme = await import('./payme');
    click = await import('./click');
    approve = await import('./approve');
    pending = await import('./pending');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.PaymentRequest.deleteMany({}), M.User.deleteMany({}), M.Notification.deleteMany({})]);
  });

  const makeUser = (phone = '+998900000001') => M.User.create({ phone, password: 'x', name: 'Test' });
  const makeRequest = (user, extra = {}) =>
    M.PaymentRequest.create({ userId: user._id, tier: 'standard', months: 1, amount: 69000, method: 'payme', ...extra });

  describe('payme', () => {
    const account = (r) => ({ order_id: String(r._id) });

    it('CheckPerform → Create → Perform opens the plan once; Perform retry is idempotent', async () => {
      const user = await makeUser();
      const r = await makeRequest(user);

      expect(await payme.handlePayme('CheckPerformTransaction', { account: account(r), amount: 6900000 })).toEqual({ result: { allow: true } });
      expect((await payme.handlePayme('CheckPerformTransaction', { account: account(r), amount: 1 })).error.code).toBe(-31001);

      const created = await payme.handlePayme('CreateTransaction', { id: 'tx1', time: Date.now(), account: account(r), amount: 6900000 });
      expect(created.result.state).toBe(1);
      expect(created.result.transaction).toBe(String(r._id));
      // The same order can't get a second transaction while one is open.
      expect((await payme.handlePayme('CreateTransaction', { id: 'tx2', time: Date.now(), account: account(r), amount: 6900000 })).error.code).toBe(-31051);
      expect((await payme.handlePayme('CheckPerformTransaction', { account: account(r), amount: 6900000 })).error.code).toBe(-31051);

      const performed = await payme.handlePayme('PerformTransaction', { id: 'tx1' });
      expect(performed.result.state).toBe(2);
      const again = await payme.handlePayme('PerformTransaction', { id: 'tx1' });
      expect(again.result).toEqual(performed.result);

      const fresh = await M.PaymentRequest.findById(r._id);
      expect(fresh.status).toBe('approved');
      expect(fresh.provider.state).toBe(2);
      const u = await M.User.findById(user._id);
      expect(u.subscriptionTier).toBe('standard');
      expect(u.subscriptionExpiresAt.getTime()).toBeGreaterThan(Date.now() + 27 * 24 * 3600 * 1000);
      expect(await M.Notification.countDocuments({ userId: user._id, type: 'payment' })).toBe(1);

      const check = await payme.handlePayme('CheckTransaction', { id: 'tx1' });
      expect(check.result.state).toBe(2);
      expect(check.result.perform_time).toBeGreaterThan(0);
    });

    it('Perform on an order the admin already rejected is refused and does not open the plan', async () => {
      const user = await makeUser();
      const r = await makeRequest(user);
      await payme.handlePayme('CreateTransaction', { id: 'tx1', time: Date.now(), account: account(r), amount: 6900000 });
      await approve.rejectPayment(r._id, { reason: 'test' });

      const out = await payme.handlePayme('PerformTransaction', { id: 'tx1' });
      expect(out.error?.code).toBe(-31008);
      const fresh = await M.PaymentRequest.findById(r._id);
      expect(fresh.status).toBe('rejected');
      expect(fresh.provider.state).not.toBe(2);
      expect((await M.User.findById(user._id)).subscriptionTier).toBe('free');
    });

    it('Cancel before perform cancels the order; cancel after perform is recorded but keeps the plan', async () => {
      const user = await makeUser();
      const r1 = await makeRequest(user);
      await payme.handlePayme('CreateTransaction', { id: 'a', time: Date.now(), account: account(r1), amount: 6900000 });
      const c1 = await payme.handlePayme('CancelTransaction', { id: 'a', reason: 3 });
      expect(c1.result.state).toBe(-1);
      expect((await M.PaymentRequest.findById(r1._id)).status).toBe('cancelled');

      const r2 = await makeRequest(user);
      await payme.handlePayme('CreateTransaction', { id: 'b', time: Date.now(), account: account(r2), amount: 6900000 });
      await payme.handlePayme('PerformTransaction', { id: 'b' });
      const c2 = await payme.handlePayme('CancelTransaction', { id: 'b', reason: 5 });
      expect(c2.result.state).toBe(-2);
      expect((await M.PaymentRequest.findById(r2._id)).status).toBe('approved');
      expect((await M.User.findById(user._id)).subscriptionTier).toBe('standard');
    });

    it('unknown order / transaction and expired transactions', async () => {
      expect((await payme.handlePayme('CheckPerformTransaction', { account: { order_id: 'nope' }, amount: 1 })).error.code).toBe(-31050);
      expect((await payme.handlePayme('PerformTransaction', { id: 'zzz' })).error.code).toBe(-31003);
      const user = await makeUser();
      const r = await makeRequest(user);
      const old = Date.now() - payme.PAYME_TIMEOUT_MS - 1000;
      await payme.handlePayme('CreateTransaction', { id: 'old', time: old, account: account(r), amount: 6900000 });
      const out = await payme.handlePayme('PerformTransaction', { id: 'old' });
      expect(out.error.code).toBe(-31008);
      const fresh = await M.PaymentRequest.findById(r._id);
      expect(fresh.status).toBe('cancelled');
      expect(fresh.provider.reason).toBe(4);
    });
  });

  describe('click', () => {
    const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
    const base = (r, action) => ({
      click_trans_id: '555',
      service_id: '11',
      merchant_trans_id: String(r._id),
      amount: '69000.00',
      action: String(action),
      error: '0',
      error_note: 'Success',
      sign_time: '2026-10-22 10:00:00',
    });
    const signed = (p, prepareId) => ({
      ...p,
      ...(prepareId != null ? { merchant_prepare_id: String(prepareId) } : {}),
      sign_string: md5([p.click_trans_id, p.service_id, 'click-key', p.merchant_trans_id, ...(prepareId != null ? [prepareId] : []), p.amount, p.action, p.sign_time].join('')),
    });

    it('prepare → complete opens the plan; bad signature and repeated complete are refused', async () => {
      const user = await makeUser();
      const r = await makeRequest(user, { method: 'click' });

      const bad = await click.handleClick('prepare', { ...signed(base(r, 0)), sign_string: 'x' });
      expect(bad.error).toBe(-1);

      const prep = await click.handleClick('prepare', signed(base(r, 0)));
      expect(prep.error).toBe(0);
      expect(prep.merchant_prepare_id).toBeGreaterThan(0);

      const done = await click.handleClick('complete', signed(base(r, 1), prep.merchant_prepare_id));
      expect(done.error).toBe(0);
      expect((await M.PaymentRequest.findById(r._id)).status).toBe('approved');
      expect((await M.User.findById(user._id)).subscriptionTier).toBe('standard');

      const twice = await click.handleClick('complete', signed(base(r, 1), prep.merchant_prepare_id));
      expect(twice.error).toBe(-4);
    });

    it('complete with a provider error cancels the order', async () => {
      const user = await makeUser();
      const r = await makeRequest(user, { method: 'click' });
      const prep = await click.handleClick('prepare', signed(base(r, 0)));
      const out = await click.handleClick('complete', signed({ ...base(r, 1), error: '-5017' }, prep.merchant_prepare_id));
      expect(out.error).toBe(-9);
      expect((await M.PaymentRequest.findById(r._id)).status).toBe('cancelled');
      expect((await M.User.findById(user._id)).subscriptionTier).toBe('free');
    });
  });

  describe('pending requests', () => {
    it('abandoned online requests (never reached the provider) are cancelled; manual and in-progress ones stay', async () => {
      const user = await makeUser();
      const abandoned = await makeRequest(user);
      const inProgress = await makeRequest(user, { method: 'click', provider: { txId: '9', state: 1, createdAt: new Date() } });
      const manual = await makeRequest(user, { method: 'manual', receiptFileId: 'f' });

      const n = await pending.cancelAbandonedOnlineRequests(user._id);
      expect(n).toBe(1);
      expect((await M.PaymentRequest.findById(abandoned._id)).status).toBe('cancelled');
      expect((await M.PaymentRequest.findById(inProgress._id)).status).toBe('pending');
      expect((await M.PaymentRequest.findById(manual._id)).status).toBe('pending');
      // Only receipts waiting for the admin count toward the cap.
      expect(await pending.countAwaitingReview(user._id)).toBe(1);
    });
  });
});
