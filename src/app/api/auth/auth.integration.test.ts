// Auth yo'llari — haqiqiy MongoDB (xotirada) ustida: OTP atomikligi, NoSQL inyeksiya himoyasi, bir martalik sessiyalar, rate limit.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let routes: { verify: any; reset: any; login: any };
let M: any;

const TOKEN = 'a'.repeat(32);
const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://localhost${url}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

describeDb('auth routes (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    routes = {
      verify: (await import('./verify-code/route')).POST,
      reset: (await import('./reset-password/route')).POST,
      login: (await import('./login/route')).POST,
    };
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.OtpSession.deleteMany({});
    await M.User.deleteMany({});
    await M.RateLimitHit.deleteMany({});
  });

  const registerSession = (over: Record<string, unknown> = {}) =>
    M.OtpSession.create({
      sessionToken: TOKEN,
      purpose: 'register',
      phone: '+998901112233',
      name: 'Reg',
      passwordHash: bcrypt.hashSync('secret123', 4),
      telegramChatId: 5,
      code: '123456',
      status: 'code_sent',
      ...over,
    });

  describe('verify-code', () => {
    it('NoSQL inyeksiya: sessionToken uchun {"$ne":""} rad etiladi (ixtiyoriy sessiya tanlanmaydi)', async () => {
      await registerSession();
      const res = await routes.verify(post('/api/auth/verify-code', { sessionToken: { $ne: '' }, code: '123456' }));
      expect(res.status).toBe(400);
      expect(await M.User.countDocuments()).toBe(0);
      expect(await M.OtpSession.countDocuments()).toBe(1); // sessiya o'zgarmagan
    });

    it('format: kod 6 raqam, token 32 hex bo‘lmasa 400', async () => {
      await registerSession();
      for (const body of [
        { sessionToken: TOKEN, code: '12345' },
        { sessionToken: TOKEN, code: 'abcdef' },
        { sessionToken: TOKEN, code: { $gt: '' } },
        { sessionToken: 'short', code: '123456' },
        { sessionToken: [TOKEN], code: '123456' },
      ]) {
        expect((await routes.verify(post('/api/auth/verify-code', body))).status).toBe(400);
      }
      expect((await M.OtpSession.findOne({ sessionToken: TOKEN })).attempts).toBe(0); // format xatosi urinish sarflamaydi
    });

    it('PARALLEL taxmin: 60 ta bir vaqtdagi noto‘g‘ri kod ko‘pi bilan 5 ta haqiqiy urinish sarflaydi', async () => {
      await registerSession();
      const results = await Promise.all(
        Array.from({ length: 60 }, (_, i) => routes.verify(post('/api/auth/verify-code', { sessionToken: TOKEN, code: String(100000 + i) }, { 'x-forwarded-for': `10.1.0.${i + 1}` })))
      );
      const bodies = await Promise.all(results.map((r: Response) => r.json()));
      // Har so‘rov boshqa IP dan — IP limiti emas, aynan sessiya darajasidagi atomik hisoblagich sinaladi.
      const wrong = bodies.filter((b: any) => b.error === "Kod noto'g'ri").length;
      const exhausted = bodies.filter((b: any) => /Urinishlar soni tugadi/.test(b.error)).length;
      expect(wrong).toBeLessThanOrEqual(5); // avval hammasi `attempts=0` ni ko'rib, barcha 60 kodni tekshirardi
      const gone = bodies.filter((b: any) => /Sessiya muddati tugagan/.test(b.error)).length; // chegara tugagach sessiya o'chiriladi
      expect(wrong + exhausted + gone).toBe(60);
      // chegara tugagach TO'G'RI kod ham ishlamaydi
      const late = await routes.verify(post('/api/auth/verify-code', { sessionToken: TOKEN, code: '123456' }));
      expect(late.status).toBe(400);
      expect(await M.User.countDocuments()).toBe(0);
    });

    it('bitta IP dan 30 tadan ko‘p kod urinishi 429 (sessiya limitidan alohida)', async () => {
      await registerSession();
      const statuses: number[] = [];
      for (let i = 0; i < 34; i++) statuses.push((await routes.verify(post('/api/auth/verify-code', { sessionToken: TOKEN, code: '000000' }, { 'x-forwarded-for': '198.51.100.7' }))).status);
      expect(statuses.slice(30).every((s) => s === 429)).toBe(true);
    });

    it('to‘g‘ri kod bilan 5 ta parallel so‘rov — aynan bitta hisob yaratiladi (bir martalik)', async () => {
      await registerSession();
      const results = await Promise.all(Array.from({ length: 5 }, () => routes.verify(post('/api/auth/verify-code', { sessionToken: TOKEN, code: '123456' }))));
      const ok = results.filter((r: Response) => r.status === 200);
      expect(ok).toHaveLength(1);
      expect(await M.User.countDocuments({ phone: '+998901112233' })).toBe(1);
      expect(ok[0].headers.get('set-cookie')).toContain('vocably_session');
      expect(await M.OtpSession.countDocuments()).toBe(0);
    });

    it('reset maqsadida to‘g‘ri kod sessiyani "verified" qiladi', async () => {
      const user = await M.User.create({ phone: '+998909998877', name: 'U', password: 'x' });
      await registerSession({ purpose: 'reset', userId: user._id, passwordHash: null, phone: user.phone });
      const res = await routes.verify(post('/api/auth/verify-code', { sessionToken: TOKEN, code: '123456' }));
      expect(res.status).toBe(200);
      expect((await M.OtpSession.findOne({ sessionToken: TOKEN })).status).toBe('verified');
    });
  });

  describe('reset-password', () => {
    const verifiedReset = async () => {
      const user = await M.User.create({ phone: '+998909998877', name: 'U', password: bcrypt.hashSync('oldpass1', 4) });
      await M.OtpSession.create({ sessionToken: TOKEN, purpose: 'reset', phone: user.phone, userId: user._id, status: 'verified', code: '1' });
      return user;
    };

    it('NoSQL inyeksiya: {"$ne":""} bilan boshqa foydalanuvchining tasdiqlangan sessiyasi tanlanmaydi, parol o‘zgarmaydi', async () => {
      const user = await verifiedReset();
      const res = await routes.reset(post('/api/auth/reset-password', { sessionToken: { $ne: '' }, newPassword: 'hacked123' }));
      expect(res.status).toBe(400);
      const fresh = await M.User.findById(user._id);
      expect(bcrypt.compareSync('oldpass1', fresh.password)).toBe(true);
      expect(await M.OtpSession.countDocuments()).toBe(1);
    });

    it('to‘g‘ri sessiya parolni o‘zgartiradi va sessiya bir martalik (ikkinchi urinish rad)', async () => {
      const user = await verifiedReset();
      const [a, b] = await Promise.all([
        routes.reset(post('/api/auth/reset-password', { sessionToken: TOKEN, newPassword: 'newpass-1' })),
        routes.reset(post('/api/auth/reset-password', { sessionToken: TOKEN, newPassword: 'newpass-2' })),
      ]);
      expect([a.status, b.status].sort()).toEqual([200, 400]);
      const fresh = await M.User.findById(user._id);
      expect(bcrypt.compareSync('newpass-1', fresh.password) || bcrypt.compareSync('newpass-2', fresh.password)).toBe(true);
    });

    it('parol uzunligi: 6 dan qisqa va 128 dan uzun rad etiladi', async () => {
      await verifiedReset();
      expect((await routes.reset(post('/api/auth/reset-password', { sessionToken: TOKEN, newPassword: '12345' }))).status).toBe(400);
      expect((await routes.reset(post('/api/auth/reset-password', { sessionToken: TOKEN, newPassword: 'x'.repeat(129) }))).status).toBe(400);
      expect(await M.OtpSession.countDocuments()).toBe(1); // yaroqsiz parol sessiyani sarflamadi
    });

    it('tasdiqlanmagan (code_sent) yoki register sessiyasi bilan ishlamaydi', async () => {
      await M.OtpSession.create({ sessionToken: TOKEN, purpose: 'reset', phone: '+998901', userId: new mongoose.Types.ObjectId(), status: 'code_sent', code: '1' });
      expect((await routes.reset(post('/api/auth/reset-password', { sessionToken: TOKEN, newPassword: 'whatever1' }))).status).toBe(400);
    });
  });

  describe('login', () => {
    const mkUser = () => M.User.create({ phone: '+998931606706', name: 'L', password: bcrypt.hashSync('Correct-1', 4) });

    it('to‘g‘ri parol cookie beradi; noto‘g‘ri 400; operator obyekti parol sifatida rad etiladi', async () => {
      await mkUser();
      const ok = await routes.login(post('/api/auth/login', { phone: '931606706', password: 'Correct-1' }));
      expect(ok.status).toBe(200);
      expect(ok.headers.get('set-cookie')).toMatch(/vocably_session=.*HttpOnly/i);
      expect((await routes.login(post('/api/auth/login', { phone: '931606706', password: 'wrong' }))).status).toBe(400);
      expect((await routes.login(post('/api/auth/login', { phone: '931606706', password: { $ne: '' } }))).status).toBe(400);
    });

    it('telefon NoSQL obyekt/juda uzun bo‘lsa rad etiladi; juda uzun parol rad etiladi', async () => {
      await mkUser();
      expect((await routes.login(post('/api/auth/login', { phone: { $ne: '' }, password: 'x' }))).status).toBe(400);
      expect((await routes.login(post('/api/auth/login', { phone: '9'.repeat(40), password: 'x' }))).status).toBe(400);
      expect((await routes.login(post('/api/auth/login', { phone: '931606706', password: 'x'.repeat(200) }))).status).toBe(400);
    });

    it('IP bo‘yicha chegara: bitta IP’dan 40 tadan ko‘p urinish 429 (turli raqamlar bilan ham)', async () => {
      const statuses: number[] = [];
      for (let i = 0; i < 45; i++) {
        const r = await routes.login(post('/api/auth/login', { phone: `9316067${String(10 + i).padStart(2, '0')}`, password: 'x' }, { 'x-forwarded-for': '203.0.113.9' }));
        statuses.push(r.status);
      }
      expect(statuses.slice(0, 40).every((s) => s !== 429)).toBe(true);
      expect(statuses.slice(40).every((s) => s === 429)).toBe(true);
      // boshqa IP ta'sirlanmaydi
      expect((await routes.login(post('/api/auth/login', { phone: '931606706', password: 'x' }, { 'x-forwarded-for': '203.0.113.10' }))).status).not.toBe(429);
    });
  });
});
