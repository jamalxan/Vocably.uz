'use strict';
// Presence: offline grace (short reconnects do not flash "last seen") and hidden presence
// (lastSeenVisibility 'nobody' -> the ticket carries hp:true and nobody learns the status).
// socket.io-client comes from the app's node_modules (parent directory), not a server dependency.

const { test, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { io: ioClient } = require('socket.io-client');
const { createRealtimeServer } = require('./server');

const SECRET = 'test-secret-presence';
const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const GRACE = 200;
const quiet = { log() {}, warn() {}, error() {} };

const servers = [];
after(async () => {
  await Promise.all(servers.map((s) => s.close()));
});

async function start(extraEnv = {}) {
  const rt = createRealtimeServer({
    env: { REALTIME_SHARED_SECRET: SECRET, PRESENCE_OFFLINE_GRACE_MS: String(GRACE), ...extraEnv },
    fetchImpl: async () => ({ ok: true }),
    log: quiet,
  });
  const { port } = await rt.listen(0, '127.0.0.1');
  servers.push(rt);
  return { rt, url: `http://127.0.0.1:${port}` };
}

function connect(url, userId, claims = {}) {
  const token = jwt.sign({ userId, scope: 'realtime', ...claims }, SECRET, { expiresIn: '60s' });
  const s = ioClient(url, { auth: { token }, transports: ['websocket'], reconnection: false, forceNew: true });
  const events = [];
  s.on('presence:update', (p) => events.push(p));
  return new Promise((resolve, reject) => {
    s.once('connect', () => resolve({ s, events }));
    s.once('connect_error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const query = (s, ids) => new Promise((resolve) => s.emit('presence:query', ids, resolve));
const updatesFor = (events, userId) => events.filter((e) => e.userId === userId);

test('a short disconnect inside the grace window broadcasts nothing', async () => {
  const { url } = await start();
  const b = await connect(url, B);
  let a = await connect(url, A);
  await sleep(50);
  a.s.disconnect();
  await sleep(GRACE / 4);
  assert.strictEqual((await query(b.s, [A]))[A], true, 'still online during grace');
  a = await connect(url, A);
  await sleep(GRACE + 100);
  assert.deepStrictEqual(updatesFor(b.events, A).map((e) => e.online), [true], 'only the first online, no offline/online flap');
  a.s.disconnect();
  b.s.disconnect();
});

test('offline is broadcast once the grace window passes', async () => {
  const { url } = await start();
  const b = await connect(url, B);
  const a = await connect(url, A);
  await sleep(50);
  a.s.disconnect();
  await sleep(GRACE / 4);
  assert.deepStrictEqual(updatesFor(b.events, A).map((e) => e.online), [true]);
  await sleep(GRACE + 100);
  assert.deepStrictEqual(updatesFor(b.events, A).map((e) => e.online), [true, false]);
  assert.strictEqual((await query(b.s, [A]))[A], false);
  b.s.disconnect();
});

test('hidden presence: no broadcasts, query answers null', async () => {
  const { url } = await start();
  const b = await connect(url, B);
  const a = await connect(url, A, { hp: true });
  await sleep(50);
  assert.strictEqual((await query(b.s, [A]))[A], null);
  a.s.disconnect();
  await sleep(GRACE + 100);
  assert.deepStrictEqual(updatesFor(b.events, A), []);
  b.s.disconnect();
});

test('turning hidden presence off later makes the user visible again', async () => {
  const { url } = await start();
  const b = await connect(url, B);
  const hidden = await connect(url, A, { hp: true });
  await sleep(50);
  hidden.s.disconnect();
  await sleep(20);
  const visible = await connect(url, A);
  await sleep(50);
  assert.strictEqual((await query(b.s, [A]))[A], true);
  assert.ok(updatesFor(b.events, A).some((e) => e.online === true), 'visible reconnect announces online');
  visible.s.disconnect();
  b.s.disconnect();
});
