// POST /api/internal/call-event against in-memory MongoDB (docs/chat/CALLS_SPEC.md §6.3, §7.4, §15.2).
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const h = vi.hoisted(() => ({ afterTasks: [] }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, after: (fn) => h.afterTasks.push(fn) };
});
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock('@/lib/telegram', () => ({ sendMessage: vi.fn(async () => ({ message_id: 1 })) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
const SECRET = 'call-event-secret';
let mongod;
let M;
let POST;
let webPush;
let telegram;
let caller;
let callee;
let convo;

const T0 = new Date('2026-11-06T10:00:00Z');
const iso = (ms) => new Date(T0.getTime() + ms).toISOString();
let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;

const req = (body, secret = SECRET) => ({
  headers: new Headers({ 'x-internal-secret': secret }),
  json: async () => body,
});
const flushAfter = async () => {
  while (h.afterTasks.length) await h.afterTasks.shift()();
};

const event = (over = {}) => ({
  callId: uuid(),
  conversationId: String(convo._id),
  callerId: String(caller._id),
  calleeId: String(callee._id),
  kind: 'audio',
  outcome: 'missed',
  durationSec: null,
  startedAt: iso(0),
  acceptedAt: null,
  endedAt: iso(45_000),
  answered: false,
  ...over,
});
const ended = (over = {}) => event({ outcome: 'ended', durationSec: 133, acceptedAt: iso(5_000), endedAt: iso(138_000), answered: true, ...over });

describeDb('POST /api/internal/call-event (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.REALTIME_SHARED_SECRET = SECRET;
    process.env.APP_URL = 'https://vocably.uz';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Message.init();
    ({ POST } = await import('./route'));
    webPush = await import('@/lib/webPush');
    telegram = await import('@/lib/telegram');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    h.afterTasks.length = 0;
    vi.clearAllMocks();
    await Promise.all([M.User, M.Conversation, M.Message].map((m) => m.deleteMany({})));
    caller = await M.User.create({ phone: '+998900300001', password: 'x', name: 'Caller', username: 'caller1', chatAccess: true, telegramChatId: '111', tgMessageNotify: true });
    callee = await M.User.create({ phone: '+998900300002', password: 'x', name: 'Callee', username: 'callee1', chatAccess: true, telegramChatId: '222', tgMessageNotify: true });
    convo = await M.Conversation.create({
      participantIds: [caller._id, callee._id],
      pairKey: [String(caller._id), String(callee._id)].sort().join('_'),
      lastMessageAt: new Date('2026-11-01T00:00:00Z'),
      archivedBy: [callee._id],
      hiddenFor: [caller._id, callee._id],
    });
  });

  it('401 with a wrong secret', async () => {
    const res = await POST(req(event(), 'nope'));
    expect(res.status).toBe(401);
  });

  it.each([
    ['callId', { callId: 'x' }],
    ['conversationId', { conversationId: 'zz' }],
    ['calleeId', { calleeId: 'abc' }],
    ['kind', { kind: 'screen' }],
    ['outcome', { outcome: 'weird' }],
    ['durationSec', { durationSec: 10 }],
    ['acceptedAt', { acceptedAt: iso(1) }],
    ['startedAt', { startedAt: 'not a date' }],
    ['endedAt', { endedAt: iso(-1000) }],
    ['answered', { answered: 'yes' }],
  ])('400 for an invalid %s', async (field, over) => {
    const res = await POST(req(event(over)));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'bad payload', field });
  });

  it('400 for an ended call without a valid duration', async () => {
    expect((await (await POST(req(ended({ durationSec: -1 })))).json()).field).toBe('durationSec');
    expect((await (await POST(req(ended({ durationSec: 1.5 })))).json()).field).toBe('durationSec');
    expect((await (await POST(req(ended({ acceptedAt: null })))).json()).field).toBe('acceptedAt');
  });

  it('creates a call row (sender = caller, createdAt = endedAt) and updates the conversation', async () => {
    const body = ended();
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.created).toBe(true);
    expect(data.message).toMatchObject({ type: 'call', text: '', media: null, reactions: [], call: { callId: body.callId, kind: 'audio', outcome: 'ended', durationSec: 133 } });
    expect(data.message.id).toBe(String(data.message._id));
    const doc = await M.Message.findById(data.message.id).lean();
    expect(String(doc.senderId)).toBe(String(caller._id));
    expect(doc.createdAt.toISOString()).toBe(body.endedAt);
    expect(doc.readAt.toISOString()).toBe(body.endedAt);
    const c = await M.Conversation.findById(convo._id).lean();
    expect(c.lastMessagePreview).toBe("📞 Qo'ng'iroq (2:13)");
    expect(c.lastMessageAt.toISOString()).toBe(body.endedAt);
    expect(c.archivedBy).toHaveLength(0);
    expect(c.hiddenFor).toHaveLength(0);
  });

  it('readAt rule for every outcome and for answered:true', async () => {
    const cases = [
      [event({ outcome: 'missed' }), false],
      [event({ outcome: 'busy' }), false],
      [event({ outcome: 'cancelled' }), false],
      [event({ outcome: 'cancelled', answered: true }), true],
      [event({ outcome: 'declined' }), true],
      [event({ outcome: 'failed' }), true],
      [ended(), true],
    ];
    for (const [body, read] of cases) {
      const data = await (await POST(req(body))).json();
      expect(!!data.message.readAt).toBe(read);
    }
  });

  it('is idempotent on callId, also under a parallel race', async () => {
    const body = event();
    const first = await (await POST(req(body))).json();
    const second = await (await POST(req(body))).json();
    expect(second.created).toBe(false);
    expect(second.message.id).toBe(first.message.id);

    const raced = event();
    const both = await Promise.all([POST(req(raced)), POST(req(raced))]);
    const datas = await Promise.all(both.map((r) => r.json()));
    expect(both.map((r) => r.status)).toEqual([200, 200]);
    expect(new Set(datas.map((d) => d.message.id)).size).toBe(1);
    expect(await M.Message.countDocuments({ 'call.callId': raced.callId })).toBe(1);
  });

  it('404 when the pair is not the conversation participants', async () => {
    const stranger = await M.User.create({ phone: '+998900300003', password: 'x', name: 'S' });
    const res = await POST(req(event({ calleeId: String(stranger._id) })));
    expect(res.status).toBe(404);
  });

  it('a late event does not overwrite a newer conversation preview', async () => {
    await M.Conversation.updateOne({ _id: convo._id }, { $set: { lastMessageAt: new Date('2026-11-07T00:00:00Z'), lastMessagePreview: 'newer' } });
    await POST(req(event()));
    const c = await M.Conversation.findById(convo._id).lean();
    expect(c.lastMessagePreview).toBe('newer');
  });

  it('missed -> web push + Telegram to the callee with a call-back link; skipped push when muted', async () => {
    const body = event({ kind: 'video' });
    await POST(req(body));
    await flushAfter();
    expect(webPush.sendPushToUser).toHaveBeenCalledTimes(1);
    const [uid, push] = webPush.sendPushToUser.mock.calls[0];
    expect(String(uid)).toBe(String(callee._id));
    expect(push).toMatchObject({ title: '@caller1', body: "📞 Javobsiz qo'ng'iroq", tag: `call-${body.callId}`, url: '/app/friends/caller1?call=video' });
    expect(push.actions[0].action).toBe('callback');
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
    const [chatId, text, extra] = telegram.sendMessage.mock.calls[0];
    expect(chatId).toBe('222');
    expect(text).toContain("@caller1 sizga qo'ng'iroq qildi (javobsiz).");
    expect(extra.reply_markup.inline_keyboard[0][0].url).toBe('https://vocably.uz/app/friends/caller1?call=video');
    const c = await M.Conversation.findById(convo._id).lean();
    expect(c.tgCallNotifiedAt[String(callee._id)]).toBeTruthy();

    // muted: no push (and Telegram only when explicitly opted in)
    vi.clearAllMocks();
    await M.Conversation.updateOne({ _id: convo._id }, { $set: { mutedBy: [callee._id] }, $unset: { tgCallNotifiedAt: '' } });
    await POST(req(event()));
    await flushAfter();
    expect(webPush.sendPushToUser).not.toHaveBeenCalled();
    expect(telegram.sendMessage).not.toHaveBeenCalled();
  });

  it('the Telegram call throttle is per recipient and released when every send fails', async () => {
    telegram.sendMessage.mockRejectedValueOnce(new Error('telegram down'));
    await POST(req(event()));
    await flushAfter();
    let c = await M.Conversation.findById(convo._id).lean();
    expect(c.tgCallNotifiedAt?.[String(callee._id)]).toBeUndefined();

    await POST(req(event()));
    await flushAfter();
    await POST(req(event())); // within 60 s: throttled
    await flushAfter();
    expect(telegram.sendMessage).toHaveBeenCalledTimes(2);
    c = await M.Conversation.findById(convo._id).lean();
    expect(c.tgCallNotifiedAt[String(callee._id)]).toBeTruthy();
  });

  it('declined -> Telegram to the caller only; ended -> nobody; retries never notify', async () => {
    const body = event({ outcome: 'declined' });
    await POST(req(body));
    await flushAfter();
    expect(webPush.sendPushToUser).not.toHaveBeenCalled();
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
    expect(telegram.sendMessage.mock.calls[0][0]).toBe('111');
    expect(telegram.sendMessage.mock.calls[0][1]).toContain("@callee1 qo'ng'iroqni rad etdi.");

    vi.clearAllMocks();
    await POST(req(body)); // retry of the same call
    await POST(req(ended()));
    await flushAfter();
    expect(webPush.sendPushToUser).not.toHaveBeenCalled();
    expect(telegram.sendMessage).not.toHaveBeenCalled();
  });
});
