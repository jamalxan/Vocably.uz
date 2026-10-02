// Telegram webhook OTP oqimi: kontakt egasi tekshiruvi (fail-closed), webhook sirri.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let POST: any;
let M: any;

const SECRET = 'hook-secret-123';
const CHAT = 4242; // yuboruvchi Telegram foydalanuvchisi (chat id = user id shaxsiy chatda)
const VICTIM_PHONE = '+998901112233';
const TOKEN = 'b'.repeat(32);

const update = (contact: Record<string, unknown> | null, headers: Record<string, string> = { 'x-telegram-bot-api-secret-token': SECRET }) =>
  new Request('http://localhost/api/telegram/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ message: { chat: { id: CHAT }, from: { id: CHAT }, text: '', ...(contact ? { contact } : {}) } }),
  });

describeDb('telegram webhook (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET;
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    // Telegram API ga chiqmaymiz
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ ok: true, result: {} }), { status: 200, headers: { 'content-type': 'application/json' } }));
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    POST = (await import('./route')).POST;
  }, 120_000);
  afterAll(async () => {
    vi.unstubAllGlobals();
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await M.OtpSession.deleteMany({});
    await M.OtpSession.create({
      sessionToken: TOKEN,
      purpose: 'reset',
      phone: VICTIM_PHONE,
      userId: new mongoose.Types.ObjectId(),
      telegramChatId: CHAT,
      status: 'awaiting_telegram',
    });
  });

  const state = async () => (await M.OtpSession.findOne({ sessionToken: TOKEN })).toObject();

  it('webhook sirisiz yoki noto‘g‘ri sir bilan 401, hech narsa o‘zgarmaydi', async () => {
    const bad = await POST(update({ phone_number: VICTIM_PHONE, user_id: CHAT }, {}));
    expect(bad.status).toBe(401);
    const wrong = await POST(update({ phone_number: VICTIM_PHONE, user_id: CHAT }, { 'x-telegram-bot-api-secret-token': 'nope' }));
    expect(wrong.status).toBe(401);
    expect((await state()).status).toBe('awaiting_telegram');
  });

  it('o‘z kontakti (user_id = yuboruvchi) va raqam mos — kod yuboriladi', async () => {
    const res = await POST(update({ phone_number: '998901112233', user_id: CHAT }));
    expect(res.status).toBe(200);
    const s = await state();
    expect(s.status).toBe('code_sent');
    expect(s.code).toMatch(/^\d{6}$/);
  });

  it('FAIL-CLOSED: user_id YO‘Q kontakt (qo‘lda yaratilgan karta) rad etiladi — kod berilmaydi', async () => {
    await POST(update({ phone_number: VICTIM_PHONE }));
    const s = await state();
    expect(s.status).toBe('awaiting_telegram');
    expect(s.code).toBeNull();
  });

  it('boshqa odamning kontakti (user_id farqli) rad etiladi', async () => {
    await POST(update({ phone_number: VICTIM_PHONE, user_id: 999 }));
    const s = await state();
    expect(s.status).toBe('awaiting_telegram');
    expect(s.code).toBeNull();
  });

  it('o‘z kontakti, lekin raqam sessiyadagi bilan mos emas — rad etiladi', async () => {
    await POST(update({ phone_number: '+998909999999', user_id: CHAT }));
    expect((await state()).status).toBe('awaiting_telegram');
  });
});
