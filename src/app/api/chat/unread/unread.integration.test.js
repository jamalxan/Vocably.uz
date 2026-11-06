// GET /api/chat/unread hisobi (src/lib/chat/unread.js) — MongoMemoryServer ustida (PARITY_PLAN WP1).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, U;

describeDb('chat unread counts (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    U = await import('@/lib/chat/unread');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.User, M.Conversation, M.Message].map((m) => m.deleteMany({})));
  });

  let n = 0;
  const mkUser = () => {
    n += 1;
    return M.User.create({ phone: `+99890300${String(n).padStart(4, '0')}`, password: 'x', name: `U${n}`, username: `unread${n}` });
  };
  const mkConvo = (a, b, over = {}) =>
    M.Conversation.create({ participantIds: [a._id, b._id], pairKey: [String(a._id), String(b._id)].sort().join('_'), lastMessageAt: new Date(), ...over });
  const mkMsg = (convo, sender, over = {}) =>
    M.Message.create({ conversationId: convo._id, senderId: sender._id, type: 'text', text: 'salom', ...over });

  it('counts only incoming unread; excludes own, read, deletedFor me and silently deleted', async () => {
    const [me, f1] = await Promise.all([mkUser(), mkUser()]);
    const c = await mkConvo(me, f1);
    await mkMsg(c, f1);
    await mkMsg(c, f1);
    await mkMsg(c, me);
    await mkMsg(c, f1, { readAt: new Date() });
    await mkMsg(c, f1, { deletedFor: [me._id] });
    await mkMsg(c, f1, { deletedForEveryoneSilently: true });
    expect(await U.countUnread(me._id)).toEqual({ total: 2, mutedTotal: 0, chats: 1 });
    expect(await U.countUnread(f1._id)).toEqual({ total: 1, mutedTotal: 0, chats: 1 });
  });

  it('excludes archived and hidden chats, and messages before my clearedAt', async () => {
    const [me, a, b, c] = await Promise.all([mkUser(), mkUser(), mkUser(), mkUser()]);
    const archived = await mkConvo(me, a, { archivedBy: [me._id] });
    const hidden = await mkConvo(me, b, { hiddenFor: [me._id] });
    const cleared = await mkConvo(me, c, { clearedAt: { [String(me._id)]: new Date('2026-11-06T10:00:00Z') } });
    await mkMsg(archived, a);
    await mkMsg(hidden, b);
    await mkMsg(cleared, c, { createdAt: new Date('2026-11-06T09:00:00Z') });
    await mkMsg(cleared, c, { createdAt: new Date('2026-11-06T11:00:00Z') });
    expect(await U.countUnread(me._id)).toEqual({ total: 1, mutedTotal: 0, chats: 1 });
    const byId = await U.unreadByConversation(me._id, [archived, hidden, cleared]);
    expect(byId.get(String(archived._id))).toBe(1);
    expect(byId.get(String(cleared._id))).toBe(1);
  });

  it('splits muted chats (permanent and timed) into mutedTotal', async () => {
    const [me, a, b, c] = await Promise.all([mkUser(), mkUser(), mkUser(), mkUser()]);
    const permanent = await mkConvo(me, a, { mutedBy: [me._id] });
    const timed = await mkConvo(me, b, { mutedUntil: { [String(me._id)]: new Date(Date.now() + 3600_000) } });
    const expired = await mkConvo(me, c, { mutedUntil: { [String(me._id)]: new Date(Date.now() - 3600_000) } });
    await mkMsg(permanent, a);
    await mkMsg(timed, b);
    await mkMsg(timed, b);
    await mkMsg(expired, c);
    expect(await U.countUnread(me._id)).toEqual({ total: 1, mutedTotal: 3, chats: 1 });
  });
});
