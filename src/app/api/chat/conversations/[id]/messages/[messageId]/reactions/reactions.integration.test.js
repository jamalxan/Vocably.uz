// POST/DELETE /api/chat/conversations/[id]/messages/[messageId]/reactions against in-memory MongoDB
// (docs/chat/PARITY_PLAN.md WP7): set, replace, toggle, remove, guards, realtime fan-out, GET shape.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const h = vi.hoisted(() => ({ afterTasks: [] }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, after: (fn) => h.afterTasks.push(fn) };
});
vi.mock('@/lib/realtime', () => ({
  emitEvent: vi.fn(async () => 200),
  pushNewMessage: vi.fn(async () => {}),
  pushMessagesRead: vi.fn(async () => {}),
  pushMessageEdited: vi.fn(async () => {}),
  pushMessageDeleted: vi.fn(async () => {}),
}));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock('@/lib/telegram', () => ({ sendMessage: vi.fn(async () => ({ message_id: 1 })) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M;
let realtime;
let route;
let messagesRoute;
let me;
let friend;
let convo;
let msg;
let phoneN = 0;

const reqAs = (user, body) => {
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' });
  return {
    headers: new Headers({ authorization: `Bearer ${token}` }),
    cookies: { get: () => undefined },
    nextUrl: new URL('http://localhost/x'),
    json: async () => body ?? {},
  };
};
const ctx = (params) => ({ params: Promise.resolve(params) });
const flushAfter = async () => {
  while (h.afterTasks.length) await h.afterTasks.shift()();
};
const mkUser = (over = {}) => {
  phoneN += 1;
  return M.User.create({ phone: `+99890050${String(phoneN).padStart(4, '0')}`, password: 'x', name: `U${phoneN}`, username: `react${phoneN}`, chatAccess: true, ...over });
};
const mkConvo = (a, b) => M.Conversation.create({ participantIds: [a._id, b._id], pairKey: [String(a._id), String(b._id)].sort().join('_') });
const mkMessage = (over = {}) => M.Message.create({ conversationId: convo._id, senderId: friend._id, type: 'text', text: 'salom', ...over });

const react = (user, emoji, message = msg, conversation = convo) =>
  route.POST(reqAs(user, { emoji }), ctx({ id: String(conversation._id), messageId: String(message._id) }));
const unreact = (user, message = msg, conversation = convo) =>
  route.DELETE(reqAs(user), ctx({ id: String(conversation._id), messageId: String(message._id) }));
const stored = async (message = msg) => ((await M.Message.findById(message._id).lean())?.reactions || []).map((r) => [String(r.userId), r.emoji]);

describeDb('message reactions route (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'jwt-secret';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Message.init();
    realtime = await import('@/lib/realtime');
    route = await import('./route');
    messagesRoute = await import('../../route');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    h.afterTasks.length = 0;
    vi.clearAllMocks();
    await Promise.all([M.User, M.Conversation, M.Message, M.Block, M.RateLimitHit].map((m) => m.deleteMany({})));
    me = await mkUser({ username: 'reactor' });
    friend = await mkUser({ username: 'friend' });
    convo = await mkConvo(me, friend);
    msg = await mkMessage();
  });

  it('sets a reaction, returns the full array and emits message:reacted to both participants after the response', async () => {
    const res = await react(me, '❤️');
    expect(res.status).toBe(200);
    const { reactions } = await res.json();
    expect(reactions).toHaveLength(1);
    expect(reactions[0]).toMatchObject({ emoji: '❤️', userId: String(me._id) });
    expect(new Date(reactions[0].at).getTime()).toBeGreaterThan(Date.now() - 60_000);

    expect(realtime.emitEvent).not.toHaveBeenCalled(); // only inside after()
    await flushAfter();
    expect(realtime.emitEvent).toHaveBeenCalledTimes(1);
    const [ids, event, payload] = realtime.emitEvent.mock.calls[0];
    expect(ids.map(String).sort()).toEqual([String(me._id), String(friend._id)].sort());
    expect(event).toBe('message:reacted');
    expect(payload).toEqual({ conversationId: String(convo._id), messageId: String(msg._id), reactions });
  });

  it('a different emoji replaces mine (one per user); the same emoji again toggles it off', async () => {
    await react(me, '❤️');
    await react(me, '👍');
    expect(await stored()).toEqual([[String(me._id), '👍']]);
    const off = await react(me, '👍');
    expect((await off.json()).reactions).toEqual([]);
    expect(await stored()).toEqual([]);
  });

  it('both participants keep their own entry (also when reacting concurrently); counts reach 2', async () => {
    await Promise.all([react(me, '❤️'), react(friend, '❤️')]);
    const list = await stored();
    expect(list).toHaveLength(2);
    expect(list.map(([u]) => u).sort()).toEqual([String(me._id), String(friend._id)].sort());
    // Removing mine leaves the friend's.
    await unreact(me);
    expect(await stored()).toEqual([[String(friend._id), '❤️']]);
  });

  it('DELETE removes mine and is idempotent', async () => {
    await react(me, '🔥');
    const first = await unreact(me);
    expect(first.status).toBe(200);
    expect((await first.json()).reactions).toEqual([]);
    const second = await unreact(me);
    expect(second.status).toBe(200);
    expect((await second.json()).reactions).toEqual([]);
    await flushAfter();
    expect(realtime.emitEvent).toHaveBeenCalledTimes(3);
  });

  it('DELETE on a legacy message without the field works', async () => {
    await M.Message.collection.updateOne({ _id: msg._id }, { $unset: { reactions: '' } });
    expect((await unreact(me)).status).toBe(200);
    expect((await react(me, '😂')).status).toBe(200);
    expect(await stored()).toEqual([[String(me._id), '😂']]);
  });

  it('accepts any single emoji (ZWJ, flags) and normalises ❤ to ❤️; rejects text with bad_emoji', async () => {
    expect((await react(me, '👨‍👩‍👧‍👦')).status).toBe(200);
    expect((await react(me, '🇺🇿')).status).toBe(200);
    await react(me, '❤');
    expect(await stored()).toEqual([[String(me._id), '❤️']]);
    for (const bad of ['ab', '😀😀', '', null, '$set']) {
      const r = await react(me, bad);
      expect(r.status).toBe(400);
      expect(await r.json()).toMatchObject({ code: 'bad_emoji', error: "Noto'g'ri emoji" });
    }
  });

  it('403 blocked in either direction', async () => {
    await M.Block.create({ blockerId: friend._id, blockedId: me._id });
    const r = await react(me, '👍');
    expect(r.status).toBe(403);
    expect((await r.json()).code).toBe('blocked');
    await M.Block.deleteMany({});
    await M.Block.create({ blockerId: me._id, blockedId: friend._id });
    expect((await react(me, '👍')).status).toBe(403);
    expect(await stored()).toEqual([]);
  });

  it('400 not_reactable for call rows and messages deleted for everyone', async () => {
    const now = new Date();
    const call = await mkMessage({
      type: 'call',
      text: '',
      call: { callId: crypto.randomUUID(), kind: 'audio', outcome: 'missed', startedAt: now, endedAt: now },
    });
    const r1 = await react(me, '👍', call);
    expect(r1.status).toBe(400);
    expect(await r1.json()).toMatchObject({ code: 'not_reactable', error: "Bu xabarga reaksiya qo'yib bo'lmaydi" });
    const gone = await mkMessage({ deletedForEveryone: true });
    expect((await react(me, '👍', gone)).status).toBe(400);
    expect((await unreact(me, gone)).status).toBe(400);
  });

  it('404 for a message deleted for me, another conversation, a non-member and a malformed id', async () => {
    const hidden = await mkMessage({ deletedFor: [me._id] });
    expect((await react(me, '👍', hidden)).status).toBe(404);

    const other = await mkUser();
    const otherConvo = await mkConvo(friend, other);
    const foreign = await M.Message.create({ conversationId: otherConvo._id, senderId: friend._id, type: 'text', text: 'x' });
    // my conversation id + a message of another conversation
    const r = await react(me, '👍', foreign, convo);
    expect(r.status).toBe(404);
    expect((await r.json()).code).toBe('not_found');
    // not a member of that conversation
    expect((await react(me, '👍', foreign, otherConvo)).status).toBe(404);
    expect((await react(other, '👍')).status).toBe(404);
    expect((await route.POST(reqAs(me, { emoji: '👍' }), ctx({ id: String(convo._id), messageId: 'nope' }))).status).toBe(404);
    expect(await stored(foreign)).toEqual([]);
  });

  it('429 after 60 reactions a minute', async () => {
    for (let i = 0; i < 60; i += 1) expect((await react(me, i % 2 ? '👍' : '❤️')).status).toBe(200);
    const r = await react(me, '🔥');
    expect(r.status).toBe(429);
    expect((await r.json()).code).toBe('rate_limited');
  });

  it('never touches the conversation preview; GET serialises reactions (and hides them on deleted rows)', async () => {
    await M.Conversation.updateOne({ _id: convo._id }, { $set: { lastMessagePreview: 'salom', lastMessageAt: msg.createdAt } });
    await react(me, '😮');
    const after = await M.Conversation.findById(convo._id).lean();
    expect(after.lastMessagePreview).toBe('salom');

    const gone = await mkMessage({ text: 'bye' });
    await react(me, '😢', gone);
    await M.Message.updateOne({ _id: gone._id }, { $set: { deletedForEveryone: true } });

    const res = await messagesRoute.GET(reqAs(me), ctx({ id: String(convo._id) }));
    const { messages } = await res.json();
    const byId = Object.fromEntries(messages.map((m) => [String(m._id), m]));
    expect(byId[String(msg._id)].reactions).toEqual([{ emoji: '😮', userId: String(me._id), at: expect.any(String) }]);
    expect(byId[String(gone._id)].reactions).toEqual([]);
  });
});
