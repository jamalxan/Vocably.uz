'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createPersister } = require('./persist');

const quiet = { error() {}, warn() {}, log() {} };
const body = { callId: '00000000-0000-4000-8000-000000000001', outcome: 'missed' };
const res = (status, json = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => json });

test('500, 500, 200 -> resolves the message after 2 retries', async () => {
  const calls = [];
  const sleeps = [];
  const statuses = [500, 500, 200];
  const persist = createPersister({
    url: 'https://vocably.uz/',
    secret: 's3cret',
    log: quiet,
    sleep: async (ms) => sleeps.push(ms),
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      const status = statuses.shift();
      return res(status, { message: { id: 'm1' } });
    },
  });
  const out = await persist(body);
  assert.deepEqual(out, { message: { id: 'm1' } });
  assert.equal(calls.length, 3);
  assert.deepEqual(sleeps, [1000, 3000]);
  assert.equal(calls[0].url, 'https://vocably.uz/api/internal/call-event');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['X-Internal-Secret'], 's3cret');
  assert.deepEqual(JSON.parse(calls[0].init.body), body);
});

test('400 -> no retry, resolves null', async () => {
  let n = 0;
  const persist = createPersister({ url: 'http://x', secret: 's', log: quiet, sleep: async () => {}, fetchImpl: async () => (n++, res(400)) });
  assert.equal(await persist(body), null);
  assert.equal(n, 1);
});

test('network errors on every attempt -> 4 attempts, logs the body, resolves null', async () => {
  let n = 0;
  const errors = [];
  const persist = createPersister({
    url: 'http://x',
    secret: 's',
    log: { ...quiet, error: (...a) => errors.push(a.join(' ')) },
    sleep: async () => {},
    fetchImpl: async () => {
      n += 1;
      throw new Error('ECONNREFUSED');
    },
  });
  assert.equal(await persist(body), null);
  assert.equal(n, 4);
  assert.ok(errors.some((e) => e.includes('call-event saqlanmadi') && e.includes(body.callId)));
});

test('a hung request is aborted after timeoutMs and retried', async () => {
  let n = 0;
  const persist = createPersister({
    url: 'http://x',
    secret: 's',
    timeoutMs: 20,
    retryDelaysMs: [0],
    log: quiet,
    sleep: async () => {},
    fetchImpl: (url, init) => {
      n += 1;
      if (n === 2) return Promise.resolve(res(200, { message: { id: 'late' } }));
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    },
  });
  assert.deepEqual(await persist(body), { message: { id: 'late' } });
  assert.equal(n, 2);
});

test('without NEXTJS_INTERNAL_URL: warns once, always resolves null', async () => {
  const warns = [];
  let fetched = false;
  const persist = createPersister({ url: '', log: { ...quiet, warn: (m) => warns.push(m) }, fetchImpl: async () => { fetched = true; } });
  assert.equal(await persist(body), null);
  assert.equal(await persist(body), null);
  assert.equal(fetched, false);
  assert.equal(warns.length, 1);
  assert.match(warns[0], /history disabled/);
});
