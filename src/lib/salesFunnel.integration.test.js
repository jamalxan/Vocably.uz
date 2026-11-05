// Sales funnel on a real (in-memory) MongoDB: beacon dedup, bots/signed-in skipped, report counts.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M;
let POST;
let report;
const UA = 'Mozilla/5.0 (Windows NT 10.0) Chrome/130 Safari/537.36';
const vid = (i) => `v${String(i).padStart(19, '0')}`;
const beacon = (body, headers = {}) =>
  POST(new Request('http://localhost/api/funnel', { method: 'POST', headers: { 'user-agent': UA, 'x-forwarded-for': '10.7.0.1', ...headers }, body: JSON.stringify(body) }));

describeDb('sales funnel (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    POST = (await import('@/app/api/funnel/route')).POST;
    report = (await import('./salesFunnelServer')).salesFunnelReport;
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.FunnelHit.deleteMany({}), M.User.deleteMany({}), M.PaymentRequest.deleteMany({}), M.RateLimitHit.deleteMany({})]);
  });

  it('one row per visitor per stage per day; bots, junk and signed-in visitors are ignored', async () => {
    for (let i = 0; i < 3; i++) expect((await beacon({ stage: 'landing', vid: vid(1), path: '/' })).status).toBe(204);
    await beacon({ stage: 'landing', vid: vid(2), path: '/games/run?x=1' });
    await beacon({ stage: 'landing', vid: vid(3), path: '/' }, { 'user-agent': 'Googlebot/2.1' });
    await beacon({ stage: 'signup', vid: vid(4) });
    const u = await M.User.create({ phone: '+998900000001', password: 'x' });
    const token = jwt.sign({ userId: String(u._id) }, 'test-secret');
    await beacon({ stage: 'landing', vid: vid(5), path: '/' }, { authorization: `Bearer ${token}` });
    const rows = await M.FunnelHit.find().lean();
    expect(rows.map((r) => r.vid).sort()).toEqual([vid(1), vid(2)]);
    expect(rows.find((r) => r.vid === vid(2)).path).toBe('/games/run');
  });

  it('report: stages, signups, first-time payers only, revenue and refunds', async () => {
    for (let i = 0; i < 10; i++) await beacon({ stage: 'landing', vid: vid(i), path: i < 7 ? '/' : '/games/run' });
    for (let i = 0; i < 4; i++) await beacon({ stage: 'onboarding_start', vid: vid(i) });
    for (let i = 0; i < 2; i++) await beacon({ stage: 'onboarding_done', vid: vid(i) });
    const old = new Date(Date.now() - 200 * 86_400_000);
    const a = await M.User.create({ phone: '+998900000002', password: 'x' });
    const b = await M.User.create({ phone: '+998900000003', password: 'x' });
    await M.User.create({ phone: '+998900000004', password: 'x', createdAt: old });
    await M.PaymentRequest.create({ userId: a._id, tier: 'premium', months: 1, amount: 129000, status: 'approved', reviewedAt: new Date() });
    // b renewed: first payment long ago → not a new conversion, but revenue counts
    await M.PaymentRequest.create({ userId: b._id, tier: 'standard', months: 1, amount: 69000, status: 'approved', reviewedAt: old });
    await M.PaymentRequest.create({ userId: b._id, tier: 'standard', months: 3, amount: 176000, status: 'approved', reviewedAt: new Date(), refund: { status: 'approved', decidedAt: new Date() } });

    const r = await report({ days: 30 });
    expect(r.steps.map((s) => [s.key, s.count])).toEqual([['landing', 10], ['onboarding_start', 4], ['onboarding_done', 2], ['signup', 2], ['payment', 1]]);
    expect(r.steps[1].fromPrev).toBe(40);
    expect(r.landings[0]).toEqual({ path: '/', visitors: 7 });
    expect(r.revenue).toBe(129000 + 176000);
    expect(r.refunds).toEqual({ count: 1, amount: 176000 });
    expect((await report({ days: 12345 })).range).toBe(30);
  });
});
