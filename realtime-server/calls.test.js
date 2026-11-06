// node --test (no dependencies): drives calls.js with a fake io, fake clock and fake timers.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createCallManager, DEFAULT_LIMITS } = require('./calls');

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa'; // caller
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb'; // callee
const C = 'cccccccccccccccccccccccc'; // third user
const CONVO = 'dddddddddddddddddddddddd';
const CONVO2 = 'eeeeeeeeeeeeeeeeeeeeeeee';

let uuidN = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++uuidN).padStart(12, '0')}`;

function setup(opts = {}) {
  let t = 1_000_000;
  const timers = new Map();
  let timerId = 0;
  const emits = [];
  const persisted = [];
  const online = new Set(opts.online || [A, B, C]);

  const io = {
    to(target) {
      const op = {
        except: [],
        except(ids) {
          op.exceptIds = [].concat(ids);
          return op;
        },
        emit(event, payload) {
          emits.push({ target, except: op.exceptIds || [], event, payload });
        },
      };
      return op;
    },
  };

  const persistImpl =
    opts.persist ||
    (async (body) => {
      persisted.push(body);
      return { message: { id: `m-${body.callId}`, type: 'call', call: { callId: body.callId, outcome: body.outcome } } };
    });

  const mgr = createCallManager({
    io,
    verifyGrant: (g) => {
      if (g.startsWith('bad')) throw new Error('invalid signature');
      return JSON.parse(g);
    },
    persist: persistImpl,
    isOnline: (id) => online.has(id),
    now: () => t,
    setTimer: (fn, ms) => {
      const id = ++timerId;
      timers.set(id, { fn, at: t + ms });
      return id;
    },
    clearTimer: (id) => timers.delete(id),
    log: { error() {}, warn() {}, log() {} },
    limits: opts.limits,
  });

  function advance(ms) {
    const target = t + ms;
    for (;;) {
      let next = null;
      for (const [id, tm] of timers) if (tm.at <= target && (!next || tm.at < next[1].at)) next = [id, tm];
      if (!next) break;
      timers.delete(next[0]);
      t = next[1].at;
      next[1].fn();
    }
    t = target;
  }

  const sockets = [];
  function socket(userId, id) {
    const s = { id, userId, received: [], emit(event, payload) { s.received.push({ event, payload }); } };
    sockets.push(s);
    return s;
  }

  function grant(over = {}) {
    const claims = {
      scope: 'call',
      callId: uuid(),
      conversationId: CONVO,
      callerId: A,
      calleeId: B,
      kind: 'audio',
      from: { userId: A, username: 'alice', name: 'Alice', photoId: null },
      ...over,
    };
    return { claims, payload: { grant: JSON.stringify(claims), callId: claims.callId, conversationId: claims.conversationId, calleeId: claims.calleeId, kind: claims.kind } };
  }

  function invite(sock, over = {}, payloadOver = {}) {
    const g = grant(over);
    let ack;
    mgr.invite(sock, { ...g.payload, ...payloadOver }, (r) => {
      ack = r;
    });
    return { ack, callId: g.claims.callId, g };
  }

  const flush = () => new Promise((r) => setImmediate(r));
  const find = (event, pred = () => true) => emits.filter((e) => e.event === event && pred(e));
  const errorsOf = (s) => s.received.filter((r) => r.event === 'call:error').map((r) => r.payload.code);

  return { mgr, io, emits, persisted, online, advance, socket, grant, invite, flush, find, errorsOf, now: () => t, timers };
}

// Caller A (sockets a1, a2), callee B (sockets b1, b2), call accepted by b1.
async function connectedCall(h, { activate = true } = {}) {
  const a1 = h.socket(A, 'a1');
  const a2 = h.socket(A, 'a2');
  const b1 = h.socket(B, 'b1');
  const b2 = h.socket(B, 'b2');
  const { ack, callId } = h.invite(a1);
  assert.equal(ack.ok, true);
  h.mgr.accept(b1, { callId });
  if (activate) h.mgr.connected(a1, { callId });
  return { a1, a2, b1, b2, callId };
}

test('happy path: invite -> ringing -> accept -> sdp/ice -> connected -> end persists ended with duration', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const a2 = h.socket(A, 'a2');
  const b1 = h.socket(B, 'b1');
  const b2 = h.socket(B, 'b2');

  const { ack, callId } = h.invite(a1);
  assert.equal(ack.ok, true);
  assert.equal(ack.callId, callId);
  assert.equal(ack.expiresAt, h.now() + DEFAULT_LIMITS.RING_MS);
  assert.equal(h.mgr.size(), 1);
  assert.deepEqual(h.mgr.getUserCall(A), { callId, state: 'ringing' });
  assert.deepEqual(h.mgr.getUserCall(B), { callId, state: 'ringing' });

  const inv = h.find('call:invite');
  assert.equal(inv.length, 1);
  assert.equal(inv[0].target, `user:${B}`);
  assert.deepEqual(inv[0].payload.from, { userId: A, username: 'alice', name: 'Alice', photoId: null });
  const outgoing = h.find('call:state', (e) => e.target === `user:${A}`);
  assert.equal(outgoing.length, 1);
  assert.deepEqual(outgoing[0].except, ['a1']);
  assert.equal(outgoing[0].payload.state, 'outgoing');
  assert.equal(outgoing[0].payload.onThisDevice, false);
  assert.equal(outgoing[0].payload.peerId, B);

  h.mgr.ringing(b1, { callId });
  h.mgr.ringing(b2, { callId });
  const rings = h.find('call:ringing');
  assert.equal(rings.length, 1, 'ringing relayed once');
  assert.equal(rings[0].target, 'a1');

  h.mgr.accept(b2, { callId });
  assert.deepEqual(h.mgr.getUserCall(B), { callId, state: 'connecting' });
  assert.equal(h.find('call:accept')[0].target, 'a1');
  const elsewhere = h.find('call:end', (e) => e.payload.reason === 'answered_elsewhere');
  assert.equal(elsewhere.length, 1);
  assert.equal(elsewhere[0].target, `user:${B}`);
  assert.deepEqual(elsewhere[0].except, ['b2']);
  const connectingStates = h.find('call:state', (e) => e.payload.state === 'connecting');
  assert.equal(connectingStates.length, 2);
  connectingStates.forEach((e) => {
    assert.deepEqual(e.except.sort(), ['a1', 'b2']);
    assert.equal(e.payload.onThisDevice, false);
  });

  // a second accept from another tab is too late
  h.mgr.accept(b1, { callId });
  assert.deepEqual(h.errorsOf(b1), ['not_ringing']);

  h.mgr.relay(a1, 'call:sdp', { callId, description: { type: 'offer', sdp: 'v=0' } });
  h.mgr.relay(b2, 'call:sdp', { callId, description: { type: 'answer', sdp: 'v=0 a' } });
  h.mgr.relay(a1, 'call:ice', { callId, candidate: { candidate: 'candidate:1', sdpMid: '0' } });
  h.mgr.relay(b2, 'call:ice', { callId, candidate: null });
  const sdps = h.find('call:sdp');
  assert.deepEqual(sdps.map((e) => e.target), ['b2', 'a1']);
  assert.equal(sdps[0].payload.from, A);
  assert.deepEqual(h.find('call:ice').map((e) => e.target), ['b2', 'a1']);

  h.advance(2000);
  h.mgr.connected(a1, { callId });
  h.mgr.connected(b2, { callId }); // second one is a no-op
  const active = h.find('call:state', (e) => e.payload.state === 'active');
  assert.equal(active.filter((e) => e.payload.onThisDevice).length, 2);
  assert.deepEqual(active.filter((e) => e.payload.onThisDevice).map((e) => e.target).sort(), ['a1', 'b2']);
  assert.equal(active.filter((e) => !e.payload.onThisDevice).length, 2);
  assert.equal(active[0].payload.since, h.now());
  assert.deepEqual(h.mgr.getUserCall(A), { callId, state: 'active' });

  h.mgr.relay(b2, 'call:media', { callId, audio: false, video: true });
  assert.equal(h.find('call:media')[0].target, 'a1');
  assert.equal(h.find('call:media')[0].payload.audio, false);

  h.advance(133_400);
  h.mgr.end(a1, { callId, reason: 'hangup' });
  const ends = h.find('call:end', (e) => e.payload.reason === 'hangup');
  assert.equal(ends.length, 1);
  assert.deepEqual(ends[0].target, [`user:${A}`, `user:${B}`]);
  assert.equal(ends[0].payload.outcome, 'ended');
  assert.equal(ends[0].payload.durationSec, 133);
  assert.equal(h.mgr.size(), 0);
  assert.equal(h.mgr.getUserCall(A), null);
  assert.equal(h.mgr.getUserCall(B), null);

  await h.flush();
  assert.equal(h.persisted.length, 1);
  const body = h.persisted[0];
  assert.equal(body.outcome, 'ended');
  assert.equal(body.durationSec, 133);
  assert.equal(body.answered, true);
  assert.equal(body.callerId, A);
  assert.equal(body.calleeId, B);
  assert.ok(body.acceptedAt && body.startedAt && body.endedAt);
  assert.ok(new Date(body.endedAt) > new Date(body.acceptedAt));
  const news = h.find('message:new');
  assert.equal(news.length, 1);
  assert.deepEqual(news[0].target, [`user:${A}`, `user:${B}`]);
  assert.equal(news[0].payload.conversationId, CONVO);

  // ending twice is a no-op
  h.mgr.end(a1, { callId });
  assert.deepEqual(h.errorsOf(a1), ['not_in_call']);
  void a2;
});

test('ring timeout -> call:timeout to both rooms + missed', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const { callId } = h.invite(a1);
  h.advance(DEFAULT_LIMITS.RING_MS - 1);
  assert.equal(h.mgr.size(), 1);
  h.advance(1);
  assert.equal(h.mgr.size(), 0);
  const to = h.find('call:timeout');
  assert.equal(to.length, 1);
  assert.deepEqual(to[0].target, [`user:${A}`, `user:${B}`]);
  assert.equal(h.find('call:end').length, 0);
  await h.flush();
  assert.equal(h.persisted[0].outcome, 'missed');
  assert.equal(h.persisted[0].answered, false);
  assert.equal(h.persisted[0].durationSec, null);
  assert.equal(h.persisted[0].acceptedAt, null);
  assert.equal(h.persisted[0].callId, callId);
});

test('accept racing the ring timeout gets not_ringing', () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const b1 = h.socket(B, 'b1');
  const { callId } = h.invite(a1);
  h.advance(DEFAULT_LIMITS.RING_MS);
  h.mgr.accept(b1, { callId });
  assert.deepEqual(h.errorsOf(b1), ['not_in_call']);
});

test('connect timeout -> failed', async () => {
  const h = setup();
  await connectedCall(h, { activate: false });
  h.advance(DEFAULT_LIMITS.CONNECT_MS);
  assert.equal(h.mgr.size(), 0);
  const end = h.find('call:end', (e) => e.payload.reason === 'failed');
  assert.equal(end.length, 1);
  assert.equal(end[0].payload.outcome, 'failed');
  await h.flush();
  assert.equal(h.persisted[0].outcome, 'failed');
  assert.equal(h.persisted[0].answered, true);
});

test('busy: callee already in a call -> ack busy + call:busy + persist busy', async () => {
  const h = setup();
  await connectedCall(h);
  const c1 = h.socket(C, 'c1');
  const { ack, callId } = h.invite(c1, { callerId: C, calleeId: B, conversationId: CONVO2, from: { userId: C } });
  assert.deepEqual(ack, { ok: false, code: 'busy' });
  assert.deepEqual(c1.received.find((r) => r.event === 'call:busy').payload, { callId, conversationId: CONVO2 });
  assert.equal(h.mgr.getUserCall(C), null);
  await h.flush();
  const busy = h.persisted.find((p) => p.callId === callId);
  assert.equal(busy.outcome, 'busy');
  assert.equal(busy.callerId, C);
  assert.equal(busy.answered, false);
  const news = h.find('message:new', (e) => e.payload.message.call.callId === callId);
  assert.deepEqual(news[0].target, [`user:${C}`, `user:${B}`]);
});

test('offline: callee has no socket -> ack callee_offline + persist missed', async () => {
  const h = setup({ online: [A] });
  const a1 = h.socket(A, 'a1');
  const { ack } = h.invite(a1);
  assert.deepEqual(ack, { ok: false, code: 'callee_offline' });
  assert.equal(h.mgr.size(), 0);
  assert.equal(h.find('call:invite').length, 0);
  await h.flush();
  assert.equal(h.persisted[0].outcome, 'missed');
});

test('reject declined and busy', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const b1 = h.socket(B, 'b1');
  const first = h.invite(a1);
  h.mgr.reject(b1, { callId: first.callId, reason: 'declined' });
  const e1 = h.find('call:end', (e) => e.payload.callId === first.callId);
  assert.equal(e1.length, 1);
  assert.equal(e1[0].payload.reason, 'rejected');
  assert.equal(e1[0].payload.outcome, 'declined');
  assert.deepEqual(e1[0].target, [`user:${A}`, `user:${B}`]);

  const second = h.invite(a1);
  h.mgr.reject(b1, { callId: second.callId, reason: 'busy' });
  const e2 = h.find('call:end', (e) => e.payload.callId === second.callId)[0];
  assert.equal(e2.payload.reason, 'busy');
  assert.equal(e2.payload.outcome, 'busy');

  // the caller cannot "reject"
  const third = h.invite(a1);
  h.mgr.reject(a1, { callId: third.callId });
  assert.deepEqual(h.errorsOf(a1), ['not_in_call']);
  await h.flush();
  assert.deepEqual(h.persisted.map((p) => p.outcome), ['declined', 'busy']);
});

test('caller cancels while ringing and while connecting; callee hangup while connecting -> declined', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const b1 = h.socket(B, 'b1');
  const r = h.invite(a1);
  h.mgr.end(a1, { callId: r.callId, reason: 'cancel' });
  assert.deepEqual(h.find('call:end', (e) => e.payload.callId === r.callId)[0].payload, { callId: r.callId, reason: 'cancel', outcome: 'cancelled', durationSec: null });

  const c = h.invite(a1);
  h.mgr.accept(b1, { callId: c.callId });
  h.mgr.end(a1, { callId: c.callId, reason: 'hangup' });
  assert.equal(h.find('call:end', (e) => e.payload.callId === c.callId && e.payload.reason === 'cancel')[0].payload.outcome, 'cancelled');

  const d = h.invite(a1);
  h.mgr.accept(b1, { callId: d.callId });
  h.mgr.end(b1, { callId: d.callId, reason: 'hangup' });
  const de = h.find('call:end', (e) => e.payload.callId === d.callId && e.payload.reason === 'rejected')[0];
  assert.equal(de.payload.outcome, 'declined');

  const m = h.invite(a1);
  h.mgr.accept(b1, { callId: m.callId });
  h.mgr.end(b1, { callId: m.callId, reason: 'media_error' });
  const me = h.find('call:end', (e) => e.payload.callId === m.callId && e.payload.reason === 'media_error')[0];
  assert.equal(me.payload.outcome, 'failed');

  // callee ending while ringing = decline
  const n = h.invite(a1);
  h.mgr.end(b1, { callId: n.callId });
  assert.equal(h.find('call:end', (e) => e.payload.callId === n.callId)[0].payload.outcome, 'declined');

  await h.flush();
  assert.deepEqual(h.persisted.map((p) => p.outcome), ['cancelled', 'cancelled', 'declined', 'failed', 'declined']);
  assert.deepEqual(h.persisted.map((p) => p.answered), [false, true, true, true, false]);
});

test('caller socket disconnect while ringing -> cancelled/disconnected', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const a2 = h.socket(A, 'a2');
  const { callId } = h.invite(a1);
  h.mgr.onDisconnect(a2, { userNowOffline: false }); // another caller tab: no-op
  assert.equal(h.mgr.size(), 1);
  h.mgr.onDisconnect(a1, { userNowOffline: false });
  const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e.payload.reason, 'disconnected');
  assert.equal(e.payload.outcome, 'cancelled');
});

test('callee sockets disconnecting while ringing: only the last one -> missed/offline', async () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const b1 = h.socket(B, 'b1');
  const b2 = h.socket(B, 'b2');
  const { callId } = h.invite(a1);
  h.mgr.onDisconnect(b1, { userNowOffline: false });
  assert.equal(h.mgr.size(), 1);
  h.mgr.onDisconnect(b2, { userNowOffline: true });
  const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e.payload.reason, 'offline');
  assert.equal(e.payload.outcome, 'missed');
});

test('answered elsewhere + call:state for new sockets of users in a call', async () => {
  const h = setup();
  const { callId } = await connectedCall(h);
  const a3 = h.socket(A, 'a3');
  h.mgr.onConnect(a3);
  const st = a3.received.find((r) => r.event === 'call:state');
  assert.equal(st.payload.callId, callId);
  assert.equal(st.payload.onThisDevice, false);
  assert.equal(st.payload.state, 'active');
  assert.equal(st.payload.peerId, B);
  const c1 = h.socket(C, 'c1');
  h.mgr.onConnect(c1);
  assert.equal(c1.received.length, 0);
});

test('reconnect grace: bound socket drops, a new socket of the same user resumes', async () => {
  const h = setup();
  const { a1, b1, callId } = await connectedCall(h);
  h.mgr.onDisconnect(a1, { userNowOffline: true });
  assert.equal(h.mgr.size(), 1, 'state unchanged during grace');
  h.advance(5000);

  // another user cannot resume
  const c1 = h.socket(C, 'c1');
  let ackC;
  h.mgr.resume(c1, { callId }, (r) => {
    ackC = r;
  });
  assert.deepEqual(ackC, { ok: false, code: 'not_in_call' });

  const a9 = h.socket(A, 'a9');
  let ack;
  h.mgr.resume(a9, { callId }, (r) => {
    ack = r;
  });
  assert.equal(ack.ok, true);
  assert.equal(ack.state, 'active');
  assert.ok(ack.since);
  const res = h.find('call:resume');
  assert.equal(res.length, 1);
  assert.equal(res[0].target, 'b1');

  // the grace timer no longer fires
  h.advance(DEFAULT_LIMITS.GRACE_MS * 2);
  assert.equal(h.mgr.size(), 1);

  // relays now use the new socket id
  h.mgr.relay(b1, 'call:ice', { callId, candidate: { candidate: 'x' } });
  assert.equal(h.find('call:ice').at(-1).target, 'a9');
  // and the old socket id is no longer bound
  h.mgr.relay(a1, 'call:ice', { callId, candidate: { candidate: 'x' } });
  assert.deepEqual(h.errorsOf(a1), ['not_in_call']);
});

test('grace expiry while active -> ended with duration up to the disconnect', async () => {
  const h = setup();
  const { b1, callId } = await connectedCall(h);
  h.advance(10_000);
  h.mgr.onDisconnect(b1, { userNowOffline: true });
  h.advance(DEFAULT_LIMITS.GRACE_MS);
  const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e.payload.reason, 'disconnected');
  assert.equal(e.payload.outcome, 'ended');
  assert.equal(e.payload.durationSec, 10);
  await h.flush();
  assert.equal(h.persisted[0].durationSec, 10);
});

test('grace expiry while connecting -> failed', async () => {
  const h = setup();
  const { a1, callId } = await connectedCall(h, { activate: false });
  h.mgr.onDisconnect(a1, { userNowOffline: true });
  h.advance(DEFAULT_LIMITS.GRACE_MS);
  const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e.payload.outcome, 'failed');
  assert.equal(e.payload.reason, 'disconnected');
});

test('both bound sockets lost -> finishes immediately', () => {
  const h = setup();
  return connectedCall(h).then(({ a1, b1, callId }) => {
    h.advance(4000);
    h.mgr.onDisconnect(a1, { userNowOffline: true });
    h.advance(1000);
    h.mgr.onDisconnect(b1, { userNowOffline: true });
    const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
    assert.equal(e.payload.outcome, 'ended');
    assert.equal(e.payload.durationSec, 4);
    assert.equal(h.mgr.size(), 0);
  });
});

test('non-bound socket disconnect during an active call is a no-op', async () => {
  const h = setup();
  const { a2, b2 } = await connectedCall(h);
  h.mgr.onDisconnect(a2, { userNowOffline: false });
  h.mgr.onDisconnect(b2, { userNowOffline: false });
  h.advance(DEFAULT_LIMITS.GRACE_MS * 2);
  assert.equal(h.mgr.size(), 1);
});

test('grant checks: bad signature, tampered payload, foreign caller, replay, self call, already in call', () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  const b1 = h.socket(B, 'b1');

  let ack;
  h.mgr.invite(a1, { grant: 'bad.token', callId: uuid(), conversationId: CONVO, calleeId: B, kind: 'audio' }, (r) => {
    ack = r;
  });
  assert.deepEqual(ack, { ok: false, code: 'bad_grant' });

  assert.equal(h.invite(a1, {}, { calleeId: C }).ack.code, 'bad_grant', 'tampered calleeId');
  assert.equal(h.invite(a1, {}, { kind: 'video' }).ack.code, 'bad_grant', 'tampered kind');
  assert.equal(h.invite(b1).ack.code, 'bad_grant', 'callerId != socket.userId');
  assert.equal(h.invite(a1, { scope: 'realtime' }).ack.code, 'bad_grant', 'wrong scope');
  assert.equal(h.invite(a1, {}, { callId: 'not-a-uuid' }).ack.code, 'bad_payload');
  assert.equal(h.invite(a1, {}, { grant: 'x'.repeat(5000) }).ack.code, 'bad_payload');

  // replayed callId (after the first call finished)
  const first = h.invite(a1);
  assert.equal(first.ack.ok, true);
  h.mgr.end(a1, { callId: first.callId });
  let replay;
  h.mgr.invite(a1, first.g.payload, (r) => {
    replay = r;
  });
  assert.deepEqual(replay, { ok: false, code: 'bad_grant' });
  // the replay guard expires after 120 s
  h.advance(DEFAULT_LIMITS.REPLAY_MS + 1);

  const self = h.invite(a1, { calleeId: A });
  assert.equal(self.ack.code, 'self_call');

  const ok = h.invite(a1);
  assert.equal(ok.ack.ok, true);
  const again = h.invite(a1, { calleeId: C, conversationId: CONVO2 });
  assert.equal(again.ack.code, 'already_in_call');
  assert.equal(h.mgr.getUserCall(C), null);
});

test('6th invite in 30 s is rate limited', () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  for (let i = 0; i < 5; i += 1) {
    const r = h.invite(a1);
    assert.equal(r.ack.ok, true);
    h.mgr.end(a1, { callId: r.callId });
  }
  assert.equal(h.invite(a1).ack.code, 'rate_limited');
  h.advance(DEFAULT_LIMITS.INVITE_WINDOW_MS);
  assert.equal(h.invite(a1).ack.ok, true);
});

test('unauthorized sockets cannot relay sdp/ice/media or connect a call they are not bound to', async () => {
  const h = setup();
  const { a2, b2, callId } = await connectedCall(h, { activate: false });
  const c1 = h.socket(C, 'c1');
  const before = h.emits.length;
  h.mgr.relay(c1, 'call:sdp', { callId, description: { type: 'offer', sdp: 'v=0' } });
  h.mgr.relay(a2, 'call:sdp', { callId, description: { type: 'offer', sdp: 'v=0' } });
  h.mgr.relay(b2, 'call:ice', { callId, candidate: { candidate: 'x' } });
  h.mgr.relay(c1, 'call:media', { callId, audio: true, video: true });
  h.mgr.connected(c1, { callId });
  h.mgr.connected(a2, { callId });
  h.mgr.end(c1, { callId });
  h.mgr.accept(c1, { callId });
  h.mgr.ringing(c1, { callId });
  assert.equal(h.emits.length, before, 'nothing relayed or broadcast');
  assert.deepEqual(h.errorsOf(c1), ['not_in_call', 'not_in_call', 'not_in_call', 'not_in_call', 'not_in_call', 'not_in_call']);
  assert.deepEqual(h.errorsOf(a2), ['not_in_call', 'not_in_call']);
  assert.deepEqual(h.errorsOf(b2), ['not_in_call']);
  assert.deepEqual(h.mgr.getUserCall(A), { callId, state: 'connecting' });
});

test('payload caps: SDP > 64 KB, oversized candidate, malformed payloads, ICE count limit', async () => {
  const h = setup();
  const { a1, b1, callId } = await connectedCall(h);
  h.mgr.relay(a1, 'call:sdp', { callId, description: { type: 'offer', sdp: 'x'.repeat(70 * 1024) } });
  h.mgr.relay(a1, 'call:sdp', { callId, description: { type: 'pranswer', sdp: 'x' } });
  h.mgr.relay(a1, 'call:ice', { callId, candidate: { candidate: 'x'.repeat(3000) } });
  h.mgr.relay(a1, 'call:ice', { callId, candidate: 'string' });
  h.mgr.relay(a1, 'call:ice', { callId });
  h.mgr.relay(a1, 'call:media', { callId, audio: 'yes', video: true });
  h.mgr.relay(a1, 'call:sdp', null);
  h.mgr.relay(a1, 'call:sdp', ['x']);
  assert.deepEqual(h.errorsOf(a1), Array(8).fill('bad_payload'));
  assert.equal(h.find('call:sdp').length + h.find('call:ice').length + h.find('call:media').length, 0);

  for (let i = 0; i < DEFAULT_LIMITS.ICE_PER_SIDE + 5; i += 1) {
    h.mgr.relay(b1, 'call:ice', { callId, candidate: { candidate: `c${i}` } });
  }
  assert.equal(h.find('call:ice').length, DEFAULT_LIMITS.ICE_PER_SIDE);
  assert.deepEqual(h.errorsOf(b1), ['ice_limit']);
  // the other side keeps its own budget
  h.mgr.relay(a1, 'call:ice', { callId, candidate: { candidate: 'a' } });
  assert.equal(h.find('call:ice').length, DEFAULT_LIMITS.ICE_PER_SIDE + 1);
});

test('call:media is rate limited to 20 per 10 s per side', async () => {
  const h = setup();
  const { a1, callId } = await connectedCall(h);
  for (let i = 0; i < 25; i += 1) h.mgr.relay(a1, 'call:media', { callId, audio: i % 2 === 0, video: false });
  assert.equal(h.find('call:media').length, 20);
  h.advance(DEFAULT_LIMITS.MEDIA_WINDOW_MS);
  h.mgr.relay(a1, 'call:media', { callId, audio: true, video: false });
  assert.equal(h.find('call:media').length, 21);
});

test('malformed and unknown call ids', () => {
  const h = setup();
  const a1 = h.socket(A, 'a1');
  h.mgr.accept(a1, 'nope');
  h.mgr.accept(a1, { callId: 'x' });
  h.mgr.accept(a1, { callId: uuid() });
  assert.deepEqual(h.errorsOf(a1), ['bad_payload', 'bad_payload', 'not_in_call']);
});

test('forceEnd with and without peerId', async () => {
  const h = setup();
  const { callId } = await connectedCall(h);
  assert.equal(h.mgr.forceEnd({ userId: A, peerId: C, reason: 'blocked' }), false, 'different peer');
  assert.equal(h.mgr.size(), 1);
  assert.equal(h.mgr.forceEnd({ userId: B, peerId: A, reason: 'blocked' }), true);
  const e = h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e.payload.reason, 'blocked');
  assert.equal(e.payload.outcome, 'ended');
  assert.equal(h.mgr.forceEnd({ userId: A, reason: 'admin' }), false, 'no call any more');

  const a1 = h.socket(A, 'a1x');
  const r = h.invite(a1);
  assert.equal(h.mgr.forceEnd({ userId: A, reason: 'banned' }), true);
  const e2 = h.find('call:end', (x) => x.payload.callId === r.callId && x.payload.reason !== 'answered_elsewhere')[0];
  assert.equal(e2.payload.outcome, 'cancelled');
  assert.equal(e2.payload.reason, 'banned');
  await h.flush();
  assert.equal(h.persisted.length, 2);
});

test('finish is idempotent: a timer firing after an end emits nothing', async () => {
  const h = setup();
  const { a1, callId } = await connectedCall(h);
  h.mgr.onDisconnect(a1, { userNowOffline: true }); // grace running
  h.mgr.forceEnd({ userId: A, reason: 'admin' });
  h.advance(DEFAULT_LIMITS.GRACE_MS + DEFAULT_LIMITS.CONNECT_MS);
  assert.equal(h.find('call:end', (x) => x.payload.callId === callId && x.payload.reason !== 'answered_elsewhere').length, 1);
  await h.flush();
  assert.equal(h.persisted.length, 1);
});

test('shutdown finishes every call and waits for persists', async () => {
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  const done = [];
  const h = setup({
    persist: async (body) => {
      await gate;
      done.push(body.outcome);
      return null;
    },
  });
  await connectedCall(h);
  const c1 = h.socket(C, 'c1');
  h.online.add(C);
  // C calls a fourth user
  const r = h.invite(c1, { callerId: C, calleeId: 'ffffffffffffffffffffffff', conversationId: CONVO2 });
  h.online.add('ffffffffffffffffffffffff');
  assert.equal(r.ack.code, 'callee_offline');
  const r2 = h.invite(c1, { callerId: C, calleeId: 'ffffffffffffffffffffffff', conversationId: CONVO2 });
  assert.equal(r2.ack.ok, true);
  const p = h.mgr.shutdown('server_shutdown');
  assert.equal(h.mgr.size(), 0);
  assert.deepEqual(
    h.find('call:end', (e) => e.payload.reason === 'server_shutdown').map((e) => e.payload.outcome).sort(),
    ['cancelled', 'ended']
  );
  release();
  await p;
  assert.deepEqual(done.sort(), ['cancelled', 'ended', 'missed']);
});

test('custom limits from env are honoured', () => {
  const h = setup({ limits: { RING_MS: 8000 } });
  const a1 = h.socket(A, 'a1');
  h.invite(a1);
  h.advance(8000);
  assert.equal(h.find('call:timeout').length, 1);
});

test('takeover: a new socket of the same user resumes before the old disconnect is noticed', async () => {
  const h = setup();
  const { a1, b1, callId } = await connectedCall(h);
  const a7 = h.socket(A, 'a7');
  let ack;
  h.mgr.resume(a7, { callId }, (r) => {
    ack = r;
  });
  assert.equal(ack.ok, true);
  assert.equal(h.find('call:resume')[0].target, 'b1');
  assert.equal(h.find('call:state', (e) => e.target === 'a1' && e.payload.onThisDevice === false).length, 1);
  // the late disconnect of the old socket no longer starts a grace period
  h.mgr.onDisconnect(a1, { userNowOffline: false });
  h.advance(DEFAULT_LIMITS.GRACE_MS * 2);
  assert.equal(h.mgr.size(), 1);
  // resume while ringing or for an unknown call
  let ack2;
  h.mgr.resume(b1, { callId: uuid() }, (r) => {
    ack2 = r;
  });
  assert.deepEqual(ack2, { ok: false, code: 'not_in_call' });
});
