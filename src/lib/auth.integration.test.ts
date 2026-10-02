// Sessiya tokenini bekor qilish (User.tokensValidAfter) — haqiqiy MongoDB (xotirada) ustida.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let auth: any;
let M: any;

const reqWith = (token: string | null, viaHeader = false) => {
  const headers = new Headers();
  if (token && viaHeader) headers.set('authorization', `Bearer ${token}`);
  return { headers, cookies: { get: (n: string) => (token && !viaHeader && n === 'vocably_session' ? { value: token } : undefined) } };
};
const sign = (userId: string, iatSec?: number) =>
  jwt.sign({ userId, ...(iatSec ? { iat: iatSec } : {}) }, process.env.JWT_SECRET as string, { algorithm: 'HS256', expiresIn: '30d' });

describeDb('getUserIdFromRequest — token bekor qilish (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    auth = await import('./auth');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });

  const makeUser = (phone: string, extra: Record<string, unknown> = {}) => M.User.create({ phone, password: 'x', name: 'T', ...extra });

  it('oddiy token (tokensValidAfter yo‘q) o‘tadi; cookie ham, Authorization ham', async () => {
    const u = await makeUser('+998900000001');
    const t = sign(String(u._id));
    expect(await auth.getUserIdFromRequest(reqWith(t))).toBe(String(u._id));
    expect(await auth.getUserIdFromRequest(reqWith(t, true))).toBe(String(u._id));
  });

  it('tokensValidAfter dan OLDIN berilgan token rad etiladi, keyin berilgani o‘tadi', async () => {
    const now = Math.floor(Date.now() / 1000);
    const u = await makeUser('+998900000002', { tokensValidAfter: new Date(now * 1000) });
    expect(await auth.getUserIdFromRequest(reqWith(sign(String(u._id), now - 600)))).toBeNull();
    expect(await auth.getUserIdFromRequest(reqWith(sign(String(u._id), now)))).toBe(String(u._id)); // bir soniyada — o'tadi
    expect(await auth.getUserIdFromRequest(reqWith(sign(String(u._id), now + 5)))).toBe(String(u._id));
  });

  it('revokeUserSessions keshni darhol yangilaydi (ayni jarayonda kechikishsiz)', async () => {
    const u = await makeUser('+998900000003');
    const old = sign(String(u._id), Math.floor(Date.now() / 1000) - 60);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBe(String(u._id)); // keshga tushdi
    await auth.revokeUserSessions(u._id);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBeNull();
  });

  it('yaroqsiz/imzosiz/realtime-token va tokensiz so‘rov null', async () => {
    const u = await makeUser('+998900000004');
    expect(await auth.getUserIdFromRequest(reqWith(null))).toBeNull();
    expect(await auth.getUserIdFromRequest(reqWith('garbage'))).toBeNull();
    expect(await auth.getUserIdFromRequest(reqWith(jwt.sign({ userId: String(u._id) }, 'wrong-secret')))).toBeNull();
    expect(await auth.getUserIdFromRequest(reqWith(jwt.sign({ userId: String(u._id), scope: 'realtime' }, 'test-secret')))).toBeNull();
  });

  it('logout {allDevices:true} barcha oldingi tokenlarni bekor qiladi; oddiy logout bekor qilmaydi', async () => {
    const { POST } = await import('@/app/api/auth/logout/route');
    const u = await makeUser('+998900000006');
    const old = sign(String(u._id), Math.floor(Date.now() / 1000) - 60);
    const mk = (body: unknown) => {
      const r: any = new Request('http://localhost/api/auth/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      r.cookies = { get: (n: string) => (n === 'vocably_session' ? { value: old } : undefined) };
      return r;
    };
    expect((await POST(mk({}))).status).toBe(200);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBe(String(u._id)); // oddiy chiqish — boshqa qurilmalarga ta'sir qilmaydi
    expect((await POST(mk({ allDevices: true }))).status).toBe(200);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBeNull();
    // yangi login (hozirgi soniya) o'tadi
    expect(await auth.getUserIdFromRequest(reqWith(sign(String(u._id))))).toBe(String(u._id));
  });

  it('parol tiklash eski sessiyalarni bekor qiladi', async () => {
    const u = await makeUser('+998900000005');
    const old = sign(String(u._id), Math.floor(Date.now() / 1000) - 120);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBe(String(u._id));
    const tokenStr = 'b'.repeat(32);
    await M.OtpSession.create({ sessionToken: tokenStr, purpose: 'reset', phone: u.phone, userId: u._id, status: 'verified', code: '123456' });
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(
      new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionToken: tokenStr, newPassword: 'Yangi-parol-123' }),
      })
    );
    expect(res.status).toBe(200);
    // Kesh 30 s — test uchun nusxani tozalash revokeUserSessions orqali (reset-password boshqa jarayon keshini ham 30 s ichida yangilaydi).
    await auth.revokeUserSessions(u._id, (await M.User.findById(u._id).lean()).tokensValidAfter);
    expect(await auth.getUserIdFromRequest(reqWith(old))).toBeNull();
  });
});
