// Telegram Login Widget yo'li — haqiqiy MongoDB (xotirada): imzo, mavjud hisobga kirish, yangi hisob, login CSRF himoyasi.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { signTelegramLogin } from '@/lib/telegramLogin';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
const BOT = '424242:test-bot-token';
let mongod: MongoMemoryServer;
let POST: any;
let M: any;

const signed = (over: Record<string, unknown> = {}) => {
  const d = { id: 9001, first_name: 'Dilnoza', last_name: 'K', username: 'dilnoza', auth_date: Math.floor(Date.now() / 1000) - 5, ...over };
  return { ...d, hash: signTelegramLogin(d, BOT) };
};
const req = (body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }, ip = '10.9.0.1') =>
  new Request('http://localhost/api/auth/telegram', { method: 'POST', headers: { 'x-forwarded-for': ip, ...headers }, body: JSON.stringify(body) });
const sessionUser = (res: Response) => {
  const cookie = res.headers.get('set-cookie') || '';
  const token = /=([^;]+)/.exec(cookie)?.[1] || '';
  return (jwt.verify(token, 'test-secret') as any).userId;
};

describeDb('POST /api/auth/telegram (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    process.env.TELEGRAM_BOT_TOKEN = BOT;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    POST = (await import('./telegram/route')).POST;
  }, 120_000);
  afterAll(async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.User.deleteMany({});
    await M.RateLimitHit.deleteMany({});
  });

  it('bot orqali telefon bilan ochilgan hisobga kiradi (yangi hisob yaratmaydi)', async () => {
    const u = await M.User.create({ phone: '+998901112233', password: 'x', telegramChatId: 9001, name: 'Old' });
    const res = await POST(req(signed()));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, isNew: false, name: 'Old' });
    expect(sessionUser(res)).toBe(String(u._id));
    expect(await M.User.countDocuments()).toBe(1);
  });

  it('yangi Telegram — yangi hisob: tg:<id>, ism, Telegram eslatmalari yoqilgan, ishlatib bo‘lmaydigan parol', async () => {
    const res = await POST(req(signed()));
    expect(res.status).toBe(200);
    expect((await res.json()).isNew).toBe(true);
    const u = await M.User.findOne({ telegramChatId: 9001 }).lean();
    expect(u).toMatchObject({ phone: 'tg:9001', name: 'Dilnoza K' });
    expect(u.vocabReminders.telegram).toBe(true);
    expect(u.password).toMatch(/^\$2[aby]\$/);
    expect(u.categories[0].words).toHaveLength(5);
    expect(sessionUser(res)).toBe(String(u._id));
    // ikkinchi marta — o'sha hisob
    const again = await POST(req(signed()));
    expect((await again.json()).isNew).toBe(false);
    expect(await M.User.countDocuments()).toBe(1);
  });

  it('parallel ikki bosish bitta hisob yaratadi', async () => {
    const rs = await Promise.all([POST(req(signed())), POST(req(signed()))]);
    expect(rs.map((r) => r.status)).toEqual([200, 200]);
    expect(await M.User.countDocuments({ telegramChatId: 9001 })).toBe(1);
  });

  it('soxta imzo, eskirgan sana, boshqa id — 401, sessiya berilmaydi', async () => {
    for (const body of [{ ...signed(), id: 1 }, signed({ auth_date: Math.floor(Date.now() / 1000) - 7200 }), { ...signed(), hash: 'f'.repeat(64) }]) {
      const res = await POST(req(body));
      expect(res.status).toBe(401);
      expect(res.headers.get('set-cookie')).toBeNull();
    }
    expect(await M.User.countDocuments()).toBe(0);
  });

  it('JSON bo‘lmagan so‘rov (boshqa saytdan forma — login CSRF) 415', async () => {
    const res = await POST(req(signed(), { 'content-type': 'text/plain' }));
    expect(res.status).toBe(415);
    expect(await M.User.countDocuments()).toBe(0);
  });

  it('IP bo‘yicha chegaralangan', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 22; i++) statuses.push((await POST(req({ ...signed(), hash: '0'.repeat(64) }, undefined, '10.9.9.9'))).status);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });
});
