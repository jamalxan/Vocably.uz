import { describe, expect, it, vi } from 'vitest';
import { ackDraft, createDraftSync, DEVICE_ID_KEY, draftFromServer, getDeviceId, mergeDraft, mergeDraftMap, serverTime } from './draftSync';

const T = (s) => `2026-11-06T10:00:${String(s).padStart(2, '0')}.000Z`;
const ms = (s) => Date.parse(T(s));
const local = (over = {}) => ({ text: 'local', replyTo: null, updatedAt: 1, syncedAt: ms(10), dirty: false, ...over });
const remote = (over = {}) => ({ text: 'remote', replyTo: null, updatedAt: T(20), ...over });

describe('mergeDraft (PARITY_PLAN WP6 rules)', () => {
  it('no server value -> local stays (same object)', () => {
    const l = local();
    expect(mergeDraft(l, null)).toBe(l);
    expect(mergeDraft(null, null)).toBeNull();
  });
  it('unsent local edits win over any server value', () => {
    const l = local({ dirty: true, syncedAt: 0 });
    expect(mergeDraft(l, remote({ updatedAt: T(59) }))).toBe(l);
  });
  it('a newer server value wins over a clean local one', () => {
    expect(mergeDraft(local(), remote(), 5)).toEqual({ text: 'remote', replyTo: null, updatedAt: 5, syncedAt: ms(20), dirty: false });
  });
  it('an older or equal server value loses', () => {
    const l = local({ syncedAt: ms(30) });
    expect(mergeDraft(l, remote())).toBe(l);
    expect(mergeDraft(l, remote({ updatedAt: T(30) }))).toBe(l);
  });
  it('a newer tombstone clears the local draft (no resurrection)', () => {
    expect(mergeDraft(local(), remote({ text: '', updatedAt: T(40) }))).toMatchObject({ text: '', dirty: false, syncedAt: ms(40) });
  });
  it('a stale non-empty server value cannot resurrect a newer local tombstone', () => {
    const tomb = local({ text: '', syncedAt: ms(40) });
    expect(mergeDraft(tomb, remote({ text: 'old', updatedAt: T(20) }))).toBe(tomb);
  });
  it('nothing local + server tombstone -> no entry; nothing local + server draft -> taken', () => {
    expect(mergeDraft(null, remote({ text: '' }))).toBeNull();
    expect(mergeDraft(undefined, remote()).text).toBe('remote');
  });
  it('a legacy local value (syncedAt 0, dirty) wins until it is flushed', () => {
    const legacy = { text: 'legacy', replyTo: null, updatedAt: 1, syncedAt: 0, dirty: true };
    expect(mergeDraft(legacy, remote())).toBe(legacy);
  });
  it('same content with a newer time only advances syncedAt', () => {
    expect(mergeDraft(local({ text: 'remote' }), remote())).toEqual(local({ text: 'remote', syncedAt: ms(20) }));
  });
  it('keeps the server reply snapshot', () => {
    const r = remote({ replyTo: { id: 'm1', text: 'q', senderId: 'u', type: 'text', mediaKey: null } });
    expect(mergeDraft(null, r).replyTo).toEqual(r.replyTo);
  });
});

describe('mergeDraftMap / ackDraft / helpers', () => {
  it('merges many and returns the same map when nothing changes', () => {
    const map = { a: local({ syncedAt: ms(30) }) };
    expect(mergeDraftMap(map, [['a', remote()]])).toBe(map);
    const next = mergeDraftMap(map, [['a', remote({ updatedAt: T(50) })], ['b', remote()], ['c', null]]);
    expect(next.a.text).toBe('remote');
    expect(next.b.text).toBe('remote');
    expect('c' in next).toBe(false);
    // tombstone over an existing entry removes nothing but the text
    expect(mergeDraftMap({ a: local() }, [['a', remote({ text: '', updatedAt: T(50) })]]).a.text).toBe('');
  });
  it('ack cleans the entry only if the sent content is still there', () => {
    const map = { a: local({ text: 'abc', dirty: true }) };
    const acked = ackDraft(map, 'a', { text: 'abc', replyTo: null }, { updatedAt: T(45) });
    expect(acked.a).toMatchObject({ dirty: false, syncedAt: ms(45) });
    const typedMore = ackDraft(map, 'a', { text: 'ab', replyTo: null }, { updatedAt: T(45) });
    expect(typedMore.a).toMatchObject({ dirty: true, syncedAt: ms(45) });
    expect(ackDraft(map, 'zzz', {}, { updatedAt: T(1) })).toBe(map);
  });
  it('serverTime and draftFromServer', () => {
    expect(serverTime(T(1))).toBe(ms(1));
    expect(serverTime('nope')).toBe(0);
    expect(serverTime(5)).toBe(5);
    expect(draftFromServer({ text: 'x', updatedAt: T(2) }, 7)).toEqual({ text: 'x', replyTo: null, updatedAt: 7, syncedAt: ms(2), dirty: false });
  });
  it('getDeviceId is stable per storage and sanitised', () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    const id = getDeviceId(storage, () => 'ab:cd/ef');
    expect(id).toBe('abcdef');
    expect(store.get(DEVICE_ID_KEY)).toBe('abcdef');
    expect(getDeviceId(storage, () => 'other')).toBe('abcdef');
    expect(getDeviceId({ getItem: () => { throw new Error('denied'); } }, () => 'x1')).toBe('x1');
  });
});

describe('createDraftSync', () => {
  const okResponse = (draft) => ({ ok: true, json: async () => ({ draft }) });
  const setup = (fetchImpl) => {
    const acks = [];
    const sync = createDraftSync({ fetchImpl, deviceId: 'dev1', debounceMs: 600, onAck: (...a) => acks.push(a) });
    return { sync, acks };
  };

  it('debounces 600 ms and coalesces edits into one PUT with the last value', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn(async () => okResponse({ text: 'abc', replyTo: null, updatedAt: T(5) }));
      const { sync, acks } = setup(fetchImpl);
      sync.schedule('c1', { text: 'a' });
      await vi.advanceTimersByTimeAsync(300);
      sync.schedule('c1', { text: 'ab' });
      await vi.advanceTimersByTimeAsync(300);
      sync.schedule('c1', { text: 'abc', replyTo: { id: 'm1', text: 'q' } });
      expect(fetchImpl).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(600);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      const [url, init] = fetchImpl.mock.calls[0];
      expect(url).toBe('/api/chat/conversations/c1/draft');
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body)).toEqual({ text: 'abc', replyTo: 'm1', deviceId: 'dev1' });
      expect(acks).toHaveLength(1);
      expect(acks[0][0]).toBe('c1');
      expect(acks[0][2].updatedAt).toBe(T(5));
    } finally {
      vi.useRealTimers();
    }
  });

  it('different conversations are independent', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn(async () => okResponse({ text: '', updatedAt: T(1) }));
      const { sync } = setup(fetchImpl);
      sync.schedule('c1', { text: 'a' });
      sync.schedule('c2', { text: 'b' });
      await vi.advanceTimersByTimeAsync(600);
      expect(fetchImpl.mock.calls.map(([u]) => u).sort()).toEqual(['/api/chat/conversations/c1/draft', '/api/chat/conversations/c2/draft']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('flush sends pending drafts at once with keepalive', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ text: 'x', updatedAt: T(1) }));
    const { sync } = setup(fetchImpl);
    sync.schedule('c1', { text: 'x' });
    await sync.flush({ keepalive: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1].keepalive).toBe(true);
    await sync.flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries once on a network error, then gives up silently', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    });
    const { sync, acks } = setup(fetchImpl);
    sync.schedule('c1', { text: 'x' });
    await sync.flush();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(acks).toHaveLength(0);

    const flaky = vi.fn().mockRejectedValueOnce(new Error('blip')).mockResolvedValueOnce(okResponse({ text: 'x', updatedAt: T(2) }));
    const second = setup(flaky);
    second.sync.schedule('c1', { text: 'x' });
    await second.sync.flush();
    expect(flaky).toHaveBeenCalledTimes(2);
    expect(second.acks).toHaveLength(1);
  });

  it('an HTTP error (429) is not retried and not acked', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 429, json: async () => ({}) }));
    const { sync, acks } = setup(fetchImpl);
    sync.schedule('c1', { text: 'x' });
    await sync.flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(acks).toHaveLength(0);
  });

  it('clearAfterSend cancels the pending PUT; an in-flight PUT is followed by a tombstone', async () => {
    let release;
    const calls = [];
    const fetchImpl = vi.fn((url, init) => {
      calls.push(JSON.parse(init.body).text);
      if (calls.length === 1) return new Promise((r) => (release = () => r(okResponse({ text: 'typed', updatedAt: T(1) }))));
      return Promise.resolve(okResponse({ text: '', updatedAt: T(2) }));
    });
    const { sync } = setup(fetchImpl);

    sync.schedule('c1', { text: 'never sent' });
    sync.clearAfterSend('c1');
    await sync.flush();
    expect(fetchImpl).not.toHaveBeenCalled();

    sync.schedule('c1', { text: 'typed' });
    const inflight = sync.flush();
    expect(sync.isPending('c1')).toBe(true);
    sync.clearAfterSend('c1');
    release();
    await inflight;
    expect(calls).toEqual(['typed', '']);
    expect(sync.isPending('c1')).toBe(false);
  });

  it('a value scheduled while a PUT is in flight is sent after it (no out-of-order overwrite)', async () => {
    let release;
    const bodies = [];
    const fetchImpl = vi.fn((url, init) => {
      bodies.push(JSON.parse(init.body).text);
      if (bodies.length === 1) return new Promise((r) => (release = () => r(okResponse({ text: 'a', updatedAt: T(1) }))));
      return Promise.resolve(okResponse({ text: 'ab', updatedAt: T(2) }));
    });
    const { sync } = setup(fetchImpl);
    sync.schedule('c1', { text: 'a' });
    const first = sync.flush();
    sync.schedule('c1', { text: 'ab' });
    const second = sync.flush();
    release();
    await Promise.all([first, second]);
    expect(bodies).toEqual(['a', 'ab']);
  });
});
