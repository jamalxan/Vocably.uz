// POST /api/internal/presence-offline against in-memory MongoDB.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
const SECRET = 'presence-offline-secret';
let mongod;
let M;
let POST;
let user;

const req = (body, secret = SECRET) => ({
  headers: new Headers({ 'x-internal-secret': secret }),
  json: async () => body,
});
const stored = async () => (await M.User.findById(user._id).select('lastActiveAt').lean()).lastActiveAt;
const ago = (ms) => new Date(Date.now() - ms);

describeDb('POST /api/internal/presence-offline (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.REALTIME_SHARED_SECRET = SECRET;
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    ({ POST } = await import('./route'));
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.User.deleteMany({});
    user = await M.User.create({ name: 'Ali', phone: '+998900000001', password: 'x', lastActiveAt: ago(3 * 60 * 60 * 1000) });
  });

  it('rejects a wrong secret and leaves the user untouched', async () => {
    const before = await stored();
    const res = await POST(req({ userId: String(user._id), at: new Date().toISOString() }, 'nope'));
    expect(res.status).toBe(401);
    expect(await stored()).toEqual(before);
  });

  it('moves lastActiveAt forward to the moment the user left', async () => {
    const at = ago(25 * 1000);
    const res = await POST(req({ userId: String(user._id), at: at.toISOString() }));
    expect(res.status).toBe(200);
    expect((await stored()).getTime()).toBe(at.getTime());
  });

  it('fills an empty lastActiveAt', async () => {
    await M.User.updateOne({ _id: user._id }, { $set: { lastActiveAt: null } });
    const at = ago(25 * 1000);
    await POST(req({ userId: String(user._id), at: at.toISOString() }));
    expect((await stored()).getTime()).toBe(at.getTime());
  });

  it('never moves lastActiveAt backwards', async () => {
    const fresh = ago(5 * 1000);
    await M.User.updateOne({ _id: user._id }, { $set: { lastActiveAt: fresh } });
    const res = await POST(req({ userId: String(user._id), at: ago(60 * 1000).toISOString() }));
    expect(res.status).toBe(200);
    expect((await stored()).getTime()).toBe(fresh.getTime());
  });

  it('clamps a time in the future to now', async () => {
    const t0 = Date.now();
    await POST(req({ userId: String(user._id), at: new Date(t0 + 60 * 60 * 1000).toISOString() }));
    const got = (await stored()).getTime();
    expect(got).toBeGreaterThanOrEqual(t0);
    expect(got).toBeLessThanOrEqual(Date.now());
  });

  it('rejects a bad payload', async () => {
    expect((await POST(req({ userId: 'nope', at: new Date().toISOString() }))).status).toBe(400);
    expect((await POST(req({ userId: String(user._id), at: 'yesterday' }))).status).toBe(400);
    expect((await POST(req({ userId: String(user._id) }))).status).toBe(400);
  });
});
