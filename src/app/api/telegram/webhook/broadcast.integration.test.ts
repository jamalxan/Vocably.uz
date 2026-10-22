// Bot reklama flow: admin sends media → preview → button → send to everyone.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let POST: any;
let M: any;

const SECRET = 'hook-secret-123';
const ADMIN_CHAT = 777000;
const calls: { method: string; body: any }[] = [];

const post = (update: Record<string, unknown>) =>
  POST(
    new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': SECRET },
      body: JSON.stringify(update),
    })
  );
const adminMessage = (extra: Record<string, unknown>, messageId = 10) => post({ message: { message_id: messageId, chat: { id: ADMIN_CHAT }, from: { id: ADMIN_CHAT }, ...extra } });
const adminCallback = (data: string) => post({ callback_query: { id: 'cb1', data, message: { message_id: 99, chat: { id: ADMIN_CHAT } } } });
const sent = (method: string) => calls.filter((c) => c.method === method);

describeDb('telegram webhook — reklama broadcast (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET;
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_ADMIN_CHAT_ID = String(ADMIN_CHAT);
    vi.stubGlobal('fetch', async (url: string, init: any) => {
      const method = String(url).split('/').pop() as string;
      calls.push({ method, body: init?.body ? JSON.parse(init.body) : null });
      return new Response(JSON.stringify({ ok: true, result: { message_id: 555 } }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    POST = (await import('./route')).POST;
  }, 120_000);
  afterAll(async () => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    calls.length = 0;
    await Promise.all([M.User.deleteMany({}), M.BroadcastDraft.deleteMany({}), M.Announcement.deleteMany({}), M.Notification.deleteMany({}), M.AppSetting.deleteMany({})]);
    await M.User.create([
      { phone: '+998900000001', password: 'x', name: 'Admin', role: 'admin', telegramChatId: ADMIN_CHAT },
      { phone: '+998900000002', password: 'x', name: 'A', telegramChatId: 1001 },
      { phone: '+998900000003', password: 'x', name: 'B', telegramChatId: 1002 },
      { phone: '+998900000004', password: 'x', name: 'C' }, // not linked to the bot
    ]);
  });

  it('photo → draft + preview; button line; send → copied to linked users, announcement for all', async () => {
    const photo = { photo: [{ file_id: 'small' }, { file_id: 'big-photo' }], caption: 'Chegirma!\nBugun 50% arzon' };
    expect((await adminMessage(photo)).status).toBe(200);

    const draft = await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT });
    expect(draft).toMatchObject({ kind: 'photo', telegramFileId: 'big-photo', text: 'Chegirma!\nBugun 50% arzon', step: 'ready', messageId: 10 });
    const preview = sent('sendMessage').at(-1)!.body;
    expect(preview.text).toContain('Reklama tayyor');
    expect(preview.text).toContain('Telegram <b>3</b>');
    expect(preview.reply_markup.inline_keyboard[0][0].callback_data).toBe('bc:send');

    await adminCallback('bc:btn');
    expect((await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT })).step).toBe('awaiting_button');
    await adminMessage({ text: 'nonsense without link' }, 11);
    expect((await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT })).buttons).toHaveLength(0);
    await adminMessage({ text: "Saytga o'tish | https://vocably.uz/pricing" }, 12);
    const withBtn = await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT });
    expect(withBtn.buttons.map((b: any) => b.url)).toEqual(['https://vocably.uz/pricing']);
    expect(withBtn.step).toBe('ready');
    expect(withBtn.messageId).toBe(10); // the button line did not replace the media draft

    calls.length = 0;
    await adminCallback('bc:send');

    const copies = sent('copyMessage');
    expect(copies.map((c) => c.body.chat_id).sort()).toEqual([1001, 1002, ADMIN_CHAT].sort());
    expect(copies[0].body).toMatchObject({ from_chat_id: ADMIN_CHAT, message_id: 10 });
    expect(copies[0].body.reply_markup.inline_keyboard[0][0]).toEqual({ text: "Saytga o'tish", url: 'https://vocably.uz/pricing' });

    const ann = await M.Announcement.findOne({});
    expect(ann).toMatchObject({ title: 'Chegirma!', body: 'Bugun 50% arzon', source: 'bot', recipientCount: 4, telegramCount: 3 });
    expect(ann.media).toMatchObject({ kind: 'photo', telegramFileId: 'big-photo' });
    expect(await M.Notification.countDocuments({ type: 'announcement', link: `/app/announcements/${ann._id}` })).toBe(4);
    expect(await M.BroadcastDraft.countDocuments({})).toBe(0);
    expect(sent('sendMessage').at(-1)!.body.text).toContain('Yuborildi');
  });

  it('cancel drops the draft; a new message replaces the old one; voice/video_note are accepted', async () => {
    await adminMessage({ voice: { file_id: 'v1', mime_type: 'audio/ogg' } }, 20);
    expect((await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT })).kind).toBe('voice');
    await adminMessage({ video_note: { file_id: 'n1' } }, 21);
    const d = await M.BroadcastDraft.findOne({ chatId: ADMIN_CHAT });
    expect(d).toMatchObject({ kind: 'video_note', messageId: 21 });
    await adminCallback('bc:cancel');
    expect(await M.BroadcastDraft.countDocuments({})).toBe(0);
    expect(await M.Announcement.countDocuments({})).toBe(0);
  });

  it('non-admin chats are untouched; callbacks from a stranger do nothing', async () => {
    await post({ message: { message_id: 1, chat: { id: 1001 }, from: { id: 1001 }, photo: [{ file_id: 'x' }] } });
    expect(await M.BroadcastDraft.countDocuments({})).toBe(0);
    await adminMessage({ text: 'Salom hammaga' }, 30);
    await post({ callback_query: { id: 'cb2', data: 'bc:send', message: { message_id: 5, chat: { id: 1001 } } } });
    expect(await M.Announcement.countDocuments({})).toBe(0);
    expect(await M.BroadcastDraft.countDocuments({})).toBe(1);
  });

  it('/admin trial off|on|<tier> <months> updates the welcome-trial setting', async () => {
    await adminMessage({ text: '/admin trial' }, 40);
    expect(sent('sendMessage').at(-1)!.body.text).toContain('yoqilgan');
    await adminMessage({ text: '/admin trial off' }, 41);
    expect((await M.AppSetting.findOne({ key: 'welcomeTrial' })).value).toEqual({ enabled: false, tier: 'premium', months: 1 });
    await adminMessage({ text: '/admin trial standard 3' }, 42);
    expect((await M.AppSetting.findOne({ key: 'welcomeTrial' })).value).toEqual({ enabled: true, tier: 'standard', months: 3 });
    await adminMessage({ text: '/admin trial gold 2' }, 43);
    expect(sent('sendMessage').at(-1)!.body.text).toContain("Noto'g'ri");
    expect(await M.BroadcastDraft.countDocuments({})).toBe(0); // commands never become drafts
  });
});
