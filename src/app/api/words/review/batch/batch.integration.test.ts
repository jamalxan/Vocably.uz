// Offline takrorlash paketi — haqiqiy MongoDB (xotirada): idempotentlik, XP berilmasligi, eskirgan javob, cheklar.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let M: any;
let POST: any;
let user: any;
let cat: any;
let word: any;

const post = (reviews: unknown, uid = String(user._id)) =>
  POST(
    new Request('http://localhost/api/words/review/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${jwt.sign({ userId: uid }, 'test-secret', { algorithm: 'HS256' })}` },
      body: JSON.stringify({ reviews }),
    })
  );
const rv = (seq: string, over: Record<string, unknown> = {}) => ({ clientSeq: seq, categoryId: String(cat._id), wordId: String(word._id), correct: true, clientTs: Date.now() - 3600_000, ...over });

describeDb('POST /api/words/review/batch (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    POST = (await import('./route')).POST;
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.User.deleteMany({});
    await M.OfflineReviewReceipt.deleteMany({});
    await M.ReviewEvent.deleteMany({});
    await M.RateLimitHit.deleteMany({});
    user = await M.User.create({ phone: '+998900000099', password: 'x', name: 'T', xp: 100, categories: [{ name: 'C', words: [{ word: 'alpha', syns: ['a'] }, { word: 'beta', syns: ['b'] }] }] });
    cat = user.categories[0];
    word = cat.words[0];
  });

  it('javob SRS holatini yangilaydi, XP o‘zgarmaydi, ReviewEvent yoziladi', async () => {
    const res = await post([rv('seq-aaaa-0001')]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ applied: 1, duplicates: 0, stale: 0 });
    const u = await M.User.findById(user._id).lean();
    const w = u.categories[0].words[0];
    expect(w.stats.reps).toBe(1);
    expect(w.stats.correct).toBe(1);
    expect(new Date(w.stats.lastReviewed).getTime()).toBeLessThan(Date.now() - 3000_000); // clientTs ishlatilgan
    expect(u.xp).toBe(100); // offline XP bermaydi
    expect(await M.ReviewEvent.countDocuments({ userId: user._id, mode: 'offline' })).toBe(1);
  });

  it('qayta yuborish (tarmoq qayta urinishi) ikki marta qo‘llanmaydi', async () => {
    await post([rv('seq-bbbb-0001')]);
    const again = await (await post([rv('seq-bbbb-0001')])).json();
    expect(again).toMatchObject({ applied: 0, duplicates: 1 });
    const w = (await M.User.findById(user._id).lean()).categories[0].words[0];
    expect(w.stats.reps).toBe(1);
  });

  it('parallel ikki bir xil paket — faqat bittasi qo‘llanadi', async () => {
    const [a, b] = await Promise.all([post([rv('seq-cccc-0001')]), post([rv('seq-cccc-0001')])]);
    const [ja, jb] = [await a.json(), await b.json()];
    expect(ja.applied + jb.applied).toBe(1);
    const w = (await M.User.findById(user._id).lean()).categories[0].words[0];
    expect(w.stats.reps).toBe(1);
  });

  it('serverda yangiroq takrorlangan so‘zga eski offline javob qo‘llanmaydi (stale)', async () => {
    await M.User.updateOne({ _id: user._id }, { $set: { 'categories.0.words.0.stats.lastReviewed': new Date() } });
    const body = await (await post([rv('seq-dddd-0001', { clientTs: Date.now() - 600_000 })])).json();
    expect(body).toMatchObject({ applied: 0, stale: 1 });
  });

  it('kelajak/eski vaqt, begona so‘z va noto‘g‘ri paket rad etiladi', async () => {
    const body = await (
      await post([
        rv('seq-eeee-0001', { clientTs: Date.now() + 3600_000 }),
        rv('seq-eeee-0002', { clientTs: Date.now() - 72 * 3600_000 }),
        rv('seq-eeee-0003', { wordId: new mongoose.Types.ObjectId().toString() }),
      ])
    ).json();
    expect(body.applied).toBe(0);
    expect(body.rejected.map((r: any) => r.reason).sort()).toEqual(['future', 'too_old', 'word_not_found']);
    expect((await post([])).status).toBe(400);
    expect((await post('nope' as any)).status).toBe(400);
  });

  it('tokensiz so‘rov 401; boshqa foydalanuvchi so‘zi o‘zgarmaydi', async () => {
    const res = await POST(new Request('http://localhost/api/words/review/batch', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
    const other = await M.User.create({ phone: '+998900000098', password: 'x', name: 'O' });
    const body = await (await post([rv('seq-ffff-0001')], String(other._id))).json();
    expect(body.rejected[0].reason).toBe('word_not_found'); // boshqa akkauntda bunday kategoriya/so'z yo'q
    const w = (await M.User.findById(user._id).lean()).categories[0].words[0];
    expect(w.stats?.reps || 0).toBe(0);
  });
});
