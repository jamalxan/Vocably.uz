// POST /api/chat/messages/forward (PARITY_PLAN WP5) against in-memory MongoDB: happy path with an album,
// idempotent retry, blocked target partial failure, call rows skipped, copy cap, rate limit, deliveries.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const h = vi.hoisted(() => ({ afterTasks: [], copies: [] }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, after: (fn) => h.afterTasks.push(fn) };
});
vi.mock('@/lib/realtime', () => ({
  emitEvent: vi.fn(async () => 200),
  pushNewMessage: vi.fn(async () => {}),
  pushMessagesRead: vi.fn(async () => {}),
}));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock('@/lib/chatNotify', () => ({ notifyRecipientViaTelegram: vi.fn(async () => {}) }));
vi.mock('@/lib/s3', () => ({
  copyObject: vi.fn(async (src, dst) => h.copies.push([src, dst])),
  buildObjectKey: (conv, type) => `conversations/${conv}/${type}/${Math.random().toString(36).slice(2)}.bin`,
}));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M;
let route;
let realtime;
let webPush;
let chatNotify;
let me;
let friend;
let third;
let source;
let toFriend2;
let toThird;
let phoneN = 0;

const reqAs = (user, body) => {
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' });
  return {
    headers: new Headers({ authorization: `Bearer ${token}` }),
    cookies: { get: () => undefined },
    nextUrl: new URL('http://localhost/api/chat/messages/forward'),
    json: async () => body ?? {},
  };
};
const flushAfter = async () => {
  while (h.afterTasks.length) await h.afterTasks.shift()();
};
const mkUser = (over = {}) => {
  phoneN += 1;
  return M.User.create({ phone: `+99890050${String(phoneN).padStart(4, '0')}`, password: 'x', name: `U${phoneN}`, username: `fwd${phoneN}`, chatAccess: true, ...over });
};
const mkConvo = (a, b) => M.Conversation.create({ participantIds: [a._id, b._id], pairKey: [String(a._id), String(b._id)].sort().join('_') });
const at = (s) => new Date(Date.UTC(2026, 10, 6, 9, 0, s));
const post = async (user, body) => {
  const res = await route.POST(reqAs(user, body));
  return { status: res.status, data: await res.json() };
};

describeDb('multi-forward route (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'jwt-secret';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Message.init();
    realtime = await import('@/lib/realtime');
    webPush = await import('@/lib/webPush');
    chatNotify = await import('@/lib/chatNotify');
    route = await import('./route');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    h.afterTasks.length = 0;
    h.copies.length = 0;
    vi.clearAllMocks();
    await Promise.all([M.User, M.Conversation, M.Message, M.Block, M.RateLimitHit].map((m) => m.deleteMany({})));
    me = await mkUser({ username: 'sender', name: 'Sender' });
    friend = await mkUser({ username: 'friendx', name: 'Friend' });
    third = await mkUser({ username: 'thirdx', name: 'Third' });
    const other = await mkUser({ username: 'other', name: 'Other' });
    source = await mkConvo(me, friend);
    toFriend2 = await mkConvo(me, other);
    toThird = await mkConvo(me, third);
  });

  const seedSource = async () => {
    const text = await M.Message.create({ conversationId: source._id, senderId: friend._id, type: 'text', text: 'hello', createdAt: at(1) });
    const img1 = await M.Message.create({ conversationId: source._id, senderId: me._id, type: 'image', albumId: 'albumSRC1', media: { key: `conversations/${source._id}/image/a.jpg`, mimeType: 'image/jpeg', size: 5 }, createdAt: at(2) });
    const img2 = await M.Message.create({ conversationId: source._id, senderId: me._id, type: 'image', albumId: 'albumSRC1', text: 'pics', media: { key: `conversations/${source._id}/image/b.jpg`, mimeType: 'image/jpeg', size: 6 }, createdAt: at(3) });
    return { text, img1, img2 };
  };

  it('copies 3 messages (one album) to 2 targets in source order, with one notification per target', async () => {
    const { text, img1, img2 } = await seedSource();
    const { status, data } = await post(me, {
      sourceConversationId: String(source._id),
      messageIds: [String(img2._id), String(text._id), String(img1._id)],
      targetConversationIds: [String(toFriend2._id), String(toThird._id)],
      clientBatchId: 'batch-0001',
    });
    expect(status).toBe(200);
    expect(data.results.map((r) => r.ok)).toEqual([true, true]);
    expect(h.copies).toHaveLength(4); // 2 media x 2 targets
    for (const target of [toFriend2, toThird]) {
      const copies = await M.Message.find({ conversationId: target._id }).sort({ createdAt: 1 }).lean();
      expect(copies.map((c) => c.type)).toEqual(['text', 'image', 'image']);
      expect(copies[0].forwardedFrom).toMatchObject({ name: 'Friend', hidden: false });
      expect(String(copies[0].forwardedFrom.messageId)).toBe(String(text._id));
      expect(copies[1].albumId).toBeTruthy();
      expect(copies[1].albumId).toBe(copies[2].albumId);
      expect(copies[1].albumId).not.toBe('albumSRC1');
      expect(copies[2].text).toBe('pics');
      expect(copies[1].media.key.startsWith(`conversations/${target._id}/`)).toBe(true);
      const convo = await M.Conversation.findById(target._id).lean();
      expect(convo.lastMessagePreview).toBe('pics');
    }
    const albumA = (await M.Message.findOne({ conversationId: toFriend2._id, type: 'image' }).lean()).albumId;
    const albumB = (await M.Message.findOne({ conversationId: toThird._id, type: 'image' }).lean()).albumId;
    expect(albumA).not.toBe(albumB);

    // Yetkazishlar after() ichida: javobdan oldin hech narsa ketmagan.
    expect(realtime.pushNewMessage).not.toHaveBeenCalled();
    await flushAfter();
    expect(realtime.pushNewMessage).toHaveBeenCalledTimes(6);
    expect(realtime.emitEvent).toHaveBeenCalledTimes(6);
    expect(realtime.emitEvent.mock.calls.every(([ids, event, payload]) => ids.map(String).join() === String(me._id) && event === 'message:new' && payload.self === true)).toBe(true);
    expect(webPush.sendPushToUser).toHaveBeenCalledTimes(2);
    expect(chatNotify.notifyRecipientViaTelegram).toHaveBeenCalledTimes(2);
    // Bitta nishonda tartib saqlangan.
    const toThirdPushes = realtime.pushNewMessage.mock.calls.filter(([uid]) => String(uid) === String(third._id)).map(([, , p]) => p.type);
    expect(toThirdPushes).toEqual(['text', 'image', 'image']);
  });

  it('a retry with the same clientBatchId creates no duplicates', async () => {
    const { text } = await seedSource();
    const body = { sourceConversationId: String(source._id), messageIds: [String(text._id)], targetConversationIds: [String(toThird._id)], clientBatchId: 'batch-retry1' };
    const first = await post(me, body);
    const second = await post(me, body);
    expect(second.status).toBe(200);
    expect(await M.Message.countDocuments({ conversationId: toThird._id })).toBe(1);
    expect(String(second.data.results[0].messages[0].id)).toBe(String(first.data.results[0].messages[0].id));
  });

  it('a blocked target fails alone; the other target succeeds', async () => {
    const { text } = await seedSource();
    await M.Block.create({ blockerId: third._id, blockedId: me._id });
    const { status, data } = await post(me, {
      sourceConversationId: String(source._id),
      messageIds: [String(text._id)],
      targetConversationIds: [String(toThird._id), String(toFriend2._id)],
    });
    expect(status).toBe(200);
    expect(data.results[0]).toMatchObject({ conversationId: String(toThird._id), ok: false, code: 'blocked' });
    expect(data.results[1]).toMatchObject({ conversationId: String(toFriend2._id), ok: true });
    expect(await M.Message.countDocuments({ conversationId: toThird._id })).toBe(0);
  });

  it('a target I am not a member of is not_found; a banned peer is unavailable', async () => {
    const { text } = await seedSource();
    const stranger = await mkConvo(friend, third);
    await M.User.updateOne({ _id: third._id }, { $set: { chatBanned: true } });
    const { data } = await post(me, { sourceConversationId: String(source._id), messageIds: [String(text._id)], targetConversationIds: [String(stranger._id), String(toThird._id)] });
    expect(data.results.map((r) => r.code)).toEqual(['not_found', 'unavailable']);
  });

  it('call rows are skipped and reported; only calls -> 400', async () => {
    const { text } = await seedSource();
    const call = await M.Message.create({ conversationId: source._id, senderId: me._id, type: 'call', call: { callId: 'c-1', kind: 'audio', outcome: 'missed', startedAt: at(5), endedAt: at(6) }, createdAt: at(5) });
    const mixed = await post(me, { sourceConversationId: String(source._id), messageIds: [String(call._id), String(text._id)], targetConversationIds: [String(toThird._id)] });
    expect(mixed.status).toBe(200);
    expect(mixed.data.skipped).toEqual([{ id: String(call._id), reason: 'call' }]);
    expect(await M.Message.countDocuments({ conversationId: toThird._id, type: 'call' })).toBe(0);
    const only = await post(me, { sourceConversationId: String(source._id), messageIds: [String(call._id)], targetConversationIds: [String(toThird._id)] });
    expect(only.status).toBe(400);
    expect(only.data.code).toBe('call');
  });

  it('hideAuthor and comment: the comment goes first, copies carry the hidden flag', async () => {
    const { text } = await seedSource();
    const { data } = await post(me, { sourceConversationId: String(source._id), messageIds: [String(text._id)], targetConversationIds: [String(toThird._id)], hideAuthor: true, comment: 'look' });
    expect(data.results[0].messages.map((m) => m.text)).toEqual(['look', 'hello']);
    const copies = await M.Message.find({ conversationId: toThird._id }).sort({ createdAt: 1 }).lean();
    expect(copies[0].forwardedFrom).toBeNull();
    expect(copies[1].forwardedFrom.hidden).toBe(true);
  });

  it('validation: too many copies, foreign source, empty arrays', async () => {
    const many = Array.from({ length: 30 }, () => new mongoose.Types.ObjectId().toString());
    const targets = Array.from({ length: 4 }, () => new mongoose.Types.ObjectId().toString());
    expect((await post(me, { sourceConversationId: String(source._id), messageIds: many, targetConversationIds: targets })).data.code).toBe('too_many');
    expect((await post(me, { sourceConversationId: String(source._id), messageIds: [], targetConversationIds: [String(toThird._id)] })).data.code).toBe('bad_request');
    const foreign = await mkConvo(friend, third);
    const res = await post(me, { sourceConversationId: String(foreign._id), messageIds: [many[0]], targetConversationIds: [String(toThird._id)] });
    expect(res.status).toBe(404);
  });

  it('rate limit: one hit per batch, the 11th batch in a window is 429', async () => {
    const { text } = await seedSource();
    const body = (i) => ({ sourceConversationId: String(source._id), messageIds: [String(text._id)], targetConversationIds: [String(toThird._id), String(toFriend2._id)], clientBatchId: `batch-rl-${String(i).padStart(3, '0')}` });
    for (let i = 0; i < 10; i++) expect((await post(me, body(i))).status).toBe(200);
    expect((await post(me, body(10))).status).toBe(429);
  });
});
