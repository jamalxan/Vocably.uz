// POST /api/chat/conversations/[id]/calls (call grant) + the call-row guards in the messages
// routes, against in-memory MongoDB (docs/chat/CALLS_SPEC.md §6.1, §6.5, §15.2).
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const h = vi.hoisted(() => ({ afterTasks: [], online: true, inCall: false }));
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, after: (fn) => h.afterTasks.push(fn) };
});
vi.mock('@/lib/realtime', () => ({
  isUserOnline: vi.fn(async () => h.online),
  getUserCallState: vi.fn(async () => ({ inCall: h.inCall })),
  emitEvent: vi.fn(async () => 200),
  forceEndCall: vi.fn(async () => true),
  pushNewMessage: vi.fn(async () => {}),
  pushMessagesRead: vi.fn(async () => {}),
  pushMessageEdited: vi.fn(async () => {}),
  pushMessageDeleted: vi.fn(async () => {}),
}));
vi.mock('@/lib/webPush', () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock('@/lib/telegram', () => ({ sendMessage: vi.fn(async () => ({ message_id: 1 })) }));

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
const SECRET = 'calls-route-secret';
let mongod;
let M;
let realtime;
let callsRoute;
let messagesRoute;
let pinRoute;
let callEventRoute;
let blockRoute;
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
  return M.User.create({ phone: `+99890040${String(phoneN).padStart(4, '0')}`, password: 'x', name: `U${phoneN}`, username: `user${phoneN}`, chatAccess: true, ...over });
};
const mkConvo = (a, b) => M.Conversation.create({ participantIds: [a._id, b._id], pairKey: [String(a._id), String(b._id)].sort().join('_') });

describeDb('call grant route (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'jwt-secret';
    process.env.REALTIME_SHARED_SECRET = SECRET;
    process.env.NEXT_PUBLIC_REALTIME_URL = 'https://ws.vocably.uz';
    process.env.TURN_SECRET = 'turn-secret';
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Message.init();
    realtime = await import('@/lib/realtime');
    callsRoute = await import('./route');
    messagesRoute = await import('../messages/route');
    pinRoute = await import('../messages/[messageId]/pin/route');
    callEventRoute = await import('@/app/api/internal/call-event/route');
    blockRoute = await import('@/app/api/chat/block/route');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    h.afterTasks.length = 0;
    h.online = true;
    h.inCall = false;
    vi.clearAllMocks();
    await Promise.all([M.User, M.Conversation, M.Message, M.Block, M.RateLimitHit].map((m) => m.deleteMany({})));
    me = await mkUser({ username: 'caller', name: 'Caller' });
    friend = await mkUser({ username: 'friend', name: 'Friend' });
    convo = await mkConvo(me, friend);
    convo.nicknames = new Map([[String(me._id), 'Bestie']]);
    await convo.save();
  });

  const grantFor = (user = me, body = { kind: 'audio' }, id = String(convo._id)) => callsRoute.POST(reqAs(user, body), ctx({ id }));

  it('mints a 60 s HS256 grant bound to the pair, plus ICE servers and the peer card', async () => {
    const res = await grantFor(me, { kind: 'video' });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const data = await res.json();
    const claims = jwt.verify(data.grant, SECRET, { algorithms: ['HS256'] });
    expect(claims).toMatchObject({
      scope: 'call',
      callId: data.callId,
      conversationId: String(convo._id),
      callerId: String(me._id),
      calleeId: String(friend._id),
      kind: 'video',
      from: { userId: String(me._id), username: 'caller', name: 'Caller', photoId: null },
    });
    expect(claims.exp - claims.iat).toBe(60);
    expect(data.callId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(new Date(data.expiresAt).getTime()).toBe(claims.exp * 1000);
    expect(data.turn).toBe(true);
    expect(data.iceServers[1].username).toMatch(new RegExp(`^\\d+:${me._id}$`));
    expect(data.iceTtlSec).toBe(600);
    expect(data.ttl).toBe(600);
    expect(data.peer).toEqual({ id: String(friend._id), username: 'friend', name: 'Friend', nickname: 'Bestie', photoId: null });
    // the grant is not a session token
    const asSession = { headers: new Headers({ authorization: `Bearer ${data.grant}` }), cookies: { get: () => undefined } };
    const { getUserIdFromRequest } = await import('@/lib/auth');
    process.env.JWT_SECRET_BACKUP = process.env.JWT_SECRET;
    process.env.JWT_SECRET = SECRET; // even if both secrets were equal, a scoped token is never a session
    expect(await getUserIdFromRequest(asSession)).toBeNull();
    process.env.JWT_SECRET = process.env.JWT_SECRET_BACKUP;
  });

  it('400 bad kind, 404 non-member, 503 without the realtime secret', async () => {
    expect((await grantFor(me, { kind: 'screen' })).status).toBe(400);
    const stranger = await mkUser();
    const r404 = await grantFor(stranger);
    expect(r404.status).toBe(404);
    expect((await r404.json()).code).toBe('not_found');
    const saved = process.env.REALTIME_SHARED_SECRET;
    delete process.env.REALTIME_SHARED_SECRET;
    const r503 = await grantFor(me);
    process.env.REALTIME_SHARED_SECRET = saved;
    expect(r503.status).toBe(503);
    expect((await r503.json()).code).toBe('not_configured');
  });

  it('403 when blocked in either direction', async () => {
    await M.Block.create({ blockerId: friend._id, blockedId: me._id });
    const a = await grantFor(me);
    expect(a.status).toBe(403);
    expect((await a.json()).code).toBe('blocked');
    await M.Block.deleteMany({});
    await M.Block.create({ blockerId: me._id, blockedId: friend._id });
    expect((await grantFor(me)).status).toBe(403);
  });

  it('403 when the callee has no chat access or is banned', async () => {
    await M.User.updateOne({ _id: friend._id }, { $set: { chatAccess: false } });
    const r = await grantFor(me);
    expect(r.status).toBe(403);
    expect((await r.json()).code).toBe('callee_unavailable');
    await M.User.updateOne({ _id: friend._id }, { $set: { chatAccess: true, chatBanned: true } });
    expect((await grantFor(me)).status).toBe(403);
  });

  it('429 after 10 grants a minute', async () => {
    for (let i = 0; i < 10; i += 1) expect((await grantFor(me)).status).toBe(200);
    const r = await grantFor(me);
    expect(r.status).toBe(429);
    expect((await r.json()).code).toBe('rate_limited');
  });

  it('404 callee_offline records a missed call and pushes it to both sides', async () => {
    h.online = false;
    const r = await grantFor(me);
    expect(r.status).toBe(404);
    const data = await r.json();
    expect(data.code).toBe('callee_offline');
    expect(data.grant).toBeUndefined();
    const row = await M.Message.findOne({ 'call.callId': data.callId }).lean();
    expect(row.call.outcome).toBe('missed');
    expect(row.readAt).toBeNull();
    await flushAfter();
    expect(realtime.emitEvent).toHaveBeenCalledWith([String(me._id), String(friend._id)], 'message:new', expect.objectContaining({ conversationId: String(convo._id) }));
  });

  it('409 busy records a busy call', async () => {
    h.inCall = true;
    const r = await grantFor(me);
    expect(r.status).toBe(409);
    const data = await r.json();
    expect(data.code).toBe('busy');
    expect((await M.Message.findOne({ 'call.callId': data.callId }).lean()).call.outcome).toBe('busy');
  });

  it('unknown presence (realtime unreachable) does not block the grant', async () => {
    h.online = null;
    realtime.getUserCallState.mockResolvedValueOnce(null);
    expect((await grantFor(me)).status).toBe(200);
  });

  it('blocking force-ends a call between the pair', async () => {
    const res = await blockRoute.POST(reqAs(me, { userId: String(friend._id) }));
    expect(res.status).toBe(200);
    await flushAfter();
    expect(realtime.forceEndCall).toHaveBeenCalledWith(me._id, 'blocked', friend._id);
  });

  describe('call rows in the messages routes', () => {
    async function seedCallRow(outcome = 'missed') {
      const now = new Date();
      const body = {
        callId: crypto.randomUUID(),
        conversationId: String(convo._id),
        callerId: String(me._id),
        calleeId: String(friend._id),
        kind: 'audio',
        outcome,
        durationSec: null,
        startedAt: now.toISOString(),
        acceptedAt: null,
        endedAt: now.toISOString(),
        answered: false,
      };
      const res = await callEventRoute.POST({ headers: new Headers({ 'x-internal-secret': SECRET }), json: async () => body });
      return (await res.json()).message;
    }

    it('POST {type:"call"} is rejected', async () => {
      const r = await messagesRoute.POST(reqAs(me, { type: 'call', call: { outcome: 'ended' } }), ctx({ id: String(convo._id) }));
      expect(r.status).toBe(400);
      expect(await M.Message.countDocuments({ type: 'call' })).toBe(0);
    });

    it('a call row cannot be forwarded or pinned; a reply to it drops the quote', async () => {
      const row = await seedCallRow();
      const other = await mkUser();
      const convo2 = await mkConvo(me, other);
      const fwd = await messagesRoute.POST(
        reqAs(me, { type: 'text', forwardOf: { conversationId: String(convo._id), messageId: String(row.id) } }),
        ctx({ id: String(convo2._id) })
      );
      expect(fwd.status).toBe(400);
      expect((await fwd.json()).error).toBe("Bu xabarni yuborib bo'lmaydi");

      const pin = await pinRoute.POST(reqAs(friend), ctx({ id: String(convo._id), messageId: String(row.id) }));
      expect(pin.status).toBe(400);
      expect((await pin.json()).error).toBe("Qo'ng'iroqni qadab bo'lmaydi");

      const reply = await messagesRoute.POST(reqAs(friend, { type: 'text', text: 'hey', replyTo: String(row.id) }), ctx({ id: String(convo._id) }));
      expect(reply.status).toBe(200);
      expect((await reply.json()).message.replyTo).toBeNull();
    });

    it('GET returns the call subdocument only on call rows; the missed call is unread for the callee only', async () => {
      await seedCallRow('missed');
      await messagesRoute.POST(reqAs(me, { type: 'text', text: 'hello' }), ctx({ id: String(convo._id) }));
      await flushAfter();
      const list = await (await messagesRoute.GET(reqAs(me, null, { search: '?noRead=1' }), ctx({ id: String(convo._id) }))).json();
      const callRow = list.messages.find((m) => m.type === 'call');
      const textRow = list.messages.find((m) => m.type === 'text');
      expect(callRow.call.outcome).toBe('missed');
      expect(textRow.call).toBeNull();

      const unreadFor = (uid) => M.Message.countDocuments({ conversationId: convo._id, senderId: { $ne: uid }, readAt: null });
      expect(await unreadFor(friend._id)).toBe(2);
      expect(await unreadFor(me._id)).toBe(0);
      const c = await M.Conversation.findById(convo._id).lean();
      expect(c.lastMessagePreview).toBe('hello');
    });

    it('message POST deliveries run after the response (inside after())', async () => {
      const r = await messagesRoute.POST(reqAs(me, { type: 'text', text: 'x' }), ctx({ id: String(convo._id) }));
      expect(r.status).toBe(200);
      expect(realtime.pushNewMessage).not.toHaveBeenCalled();
      await flushAfter();
      expect(realtime.pushNewMessage).toHaveBeenCalledTimes(1);
    });
  });
});
