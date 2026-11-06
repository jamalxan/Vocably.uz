// GET/PUT/DELETE /api/chat/conversations/[id]/draft (PARITY_PLAN WP6) against in-memory MongoDB:
// owner-only access, 4000-char cap, tombstones, replyTo validation, draft:update self-push in after(),
// rate limit, the conversation list carrying the viewer's draft, and the draft cleared by a send.
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
}));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock('@/lib/chatNotify', () => ({ notifyRecipientViaTelegram: vi.fn(async () => {}) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M;
let realtime;
let draftRoute;
let listRoute;
let messagesRoute;
let me;
let friend;
let convo;
let phoneN = 0;

const reqAs = (user, body, { search = '' } = {}) => {
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' });
  return {
    headers: new Headers({ authorization: `Bearer ${token}` }),
    cookies: { get: () => undefined },
    nextUrl: new URL(`http://localhost/x${search}`),
    json: async () => body ?? {},
  };
};
const ctx = (params) => ({ params: Promise.resolve(params) });
const flushAfter = async () => {
  while (h.afterTasks.length) await h.afterTasks.shift()();
};
const mkUser = (over = {}) => {
  phoneN += 1;
  return M.User.create({ phone: `+99890060${String(phoneN).padStart(4, '0')}`, password: 'x', name: `U${phoneN}`, username: `drf${phoneN}`, chatAccess: true, ...over });
};
const mkConvo = (a, b) => M.Conversation.create({ participantIds: [a._id, b._id], pairKey: [String(a._id), String(b._id)].sort().join('_') });
const put = async (user, body, id = convo._id) => {
  const res = await draftRoute.PUT(reqAs(user, body), ctx({ id: String(id) }));
  return { status: res.status, data: await res.json() };
};
const get = async (user, id = convo._id) => {
  const res = await draftRoute.GET(reqAs(user), ctx({ id: String(id) }));
  return { status: res.status, data: await res.json() };
};
const storedDraft = async (user) => {
  const c = await M.Conversation.findById(convo._id).lean();
  return c.drafts?.[String(user._id)] ?? null;
};

describeDb('draft routes (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'jwt-secret';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Message.init();
    realtime = await import('@/lib/realtime');
    draftRoute = await import('./route');
    listRoute = await import('@/app/api/chat/conversations/route');
    messagesRoute = await import('../messages/route');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    h.afterTasks.length = 0;
    vi.clearAllMocks();
    await Promise.all([M.User, M.Conversation, M.Message, M.Block, M.RateLimitHit].map((m) => m.deleteMany({})));
    me = await mkUser({ username: 'drafter' });
    friend = await mkUser({ username: 'buddy' });
    convo = await mkConvo(me, friend);
  });

  it('PUT stores the draft with the server time, GET returns it, and the other tabs get draft:update', async () => {
    expect((await get(me)).data.draft).toBeNull();
    const before = Date.now();
    const { status, data } = await put(me, { text: 'salom ', deviceId: 'tab-1' });
    expect(status).toBe(200);
    expect(data.draft.text).toBe('salom ');
    expect(data.draft.replyTo).toBeNull();
    expect(Date.parse(data.draft.updatedAt)).toBeGreaterThanOrEqual(before - 5);
    expect((await storedDraft(me)).text).toBe('salom ');
    expect((await get(me)).data.draft).toEqual(data.draft);

    expect(realtime.emitEvent).not.toHaveBeenCalled();
    await flushAfter();
    expect(realtime.emitEvent).toHaveBeenCalledWith([me._id], 'draft:update', { conversationId: String(convo._id), draft: data.draft, deviceId: 'tab-1' });
  });

  it('the other participant can neither read nor see my draft; a stranger gets 404', async () => {
    await put(me, { text: 'secret' });
    expect((await get(friend)).data.draft).toBeNull();
    const stranger = await mkUser();
    expect((await get(stranger)).status).toBe(404);
    expect((await put(stranger, { text: 'x' })).status).toBe(404);
    const listRes = await listRoute.GET(reqAs(friend));
    const { conversations } = await listRes.json();
    expect(conversations[0].draft).toBeNull();
  });

  it('empty text without a reply is stored as a tombstone (not deleted); DELETE does the same', async () => {
    await put(me, { text: 'abc' });
    const { data } = await put(me, { text: '   ' });
    expect(data.draft.text).toBe('');
    const stored = await storedDraft(me);
    expect(stored.text).toBe('');
    expect(stored.updatedAt).toBeTruthy();

    await put(me, { text: 'again' });
    const res = await draftRoute.DELETE(reqAs(me, null, { search: '?deviceId=tab-2' }), ctx({ id: String(convo._id) }));
    expect(res.status).toBe(200);
    expect((await res.json()).draft.text).toBe('');
    expect((await storedDraft(me)).text).toBe('');
  });

  it('validates text length and type', async () => {
    expect((await put(me, { text: 'x'.repeat(4001) })).status).toBe(400);
    expect((await put(me, { text: 42 })).status).toBe(400);
    expect((await put(me, { text: 'x'.repeat(4000) })).status).toBe(200);
  });

  it('replyTo must be a visible message of this conversation, otherwise it is stored as null', async () => {
    const mine = await M.Message.create({ conversationId: convo._id, senderId: friend._id, type: 'text', text: 'quote me please' });
    const { data } = await put(me, { text: '', replyTo: String(mine._id) });
    expect(data.draft.replyTo).toMatchObject({ id: String(mine._id), senderId: String(friend._id), type: 'text', text: 'quote me please' });
    expect(String((await storedDraft(me)).replyTo)).toBe(String(mine._id));

    const other = await mkConvo(me, await mkUser());
    const foreign = await M.Message.create({ conversationId: other._id, senderId: me._id, type: 'text', text: 'elsewhere' });
    expect((await put(me, { text: 'hi', replyTo: String(foreign._id) })).data.draft.replyTo).toBeNull();
    const hidden = await M.Message.create({ conversationId: convo._id, senderId: friend._id, type: 'text', text: 'gone', deletedFor: [me._id] });
    expect((await put(me, { text: 'hi', replyTo: String(hidden._id) })).data.draft.replyTo).toBeNull();
    // A reply-only draft whose target is invalid becomes a tombstone.
    expect((await put(me, { text: '', replyTo: 'not-an-id' })).data.draft.text).toBe('');
  });

  it('rate limit: 60 writes per window, then 429', async () => {
    for (let i = 0; i < 60; i++) expect((await put(me, { text: `t${i}` })).status).toBe(200);
    expect((await put(me, { text: 'one more' })).status).toBe(429);
  });

  it('the conversation list carries only the viewer\'s draft', async () => {
    const quoted = await M.Message.create({ conversationId: convo._id, senderId: friend._id, type: 'text', text: 'q' });
    await put(me, { text: 'list draft', replyTo: String(quoted._id) });
    const res = await listRoute.GET(reqAs(me));
    const { conversations } = await res.json();
    expect(conversations[0].draft).toMatchObject({ text: 'list draft', replyTo: { id: String(quoted._id) } });
  });

  it('sending a message clears the sender\'s draft (tombstone) and pushes draft:update; no event when already empty', async () => {
    await put(me, { text: 'about to send' });
    h.afterTasks.length = 0;
    vi.clearAllMocks();
    const res = await messagesRoute.POST(reqAs(me, { type: 'text', text: 'about to send', clientMessageId: 'cm-1' }), ctx({ id: String(convo._id) }));
    expect(res.status).toBe(200);
    expect((await storedDraft(me)).text).toBe('');
    await flushAfter();
    const draftEvents = realtime.emitEvent.mock.calls.filter(([, ev]) => ev === 'draft:update');
    expect(draftEvents).toHaveLength(1);
    expect(draftEvents[0][0]).toEqual([me._id]);
    expect(draftEvents[0][2]).toMatchObject({ conversationId: String(convo._id), draft: { text: '', replyTo: null }, deviceId: null });

    vi.clearAllMocks();
    await messagesRoute.POST(reqAs(me, { type: 'text', text: 'second', clientMessageId: 'cm-2' }), ctx({ id: String(convo._id) }));
    await flushAfter();
    expect(realtime.emitEvent.mock.calls.filter(([, ev]) => ev === 'draft:update')).toHaveLength(0);
    // The recipient's own draft is untouched by my send.
    await put(friend, { text: 'friend typing' });
    await messagesRoute.POST(reqAs(me, { type: 'text', text: 'third', clientMessageId: 'cm-3' }), ctx({ id: String(convo._id) }));
    expect((await storedDraft(friend)).text).toBe('friend typing');
  });
});
