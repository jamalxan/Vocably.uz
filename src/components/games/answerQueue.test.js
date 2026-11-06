import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnswerQueue } from './answerQueue';

// fetch is stubbed (the queue posts through api.js). A stalled request behaves like a real one: it
// never settles by itself, and it rejects with an AbortError once its signal is aborted.
const reply = (status, body = {}) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
const stalled = (init) =>
  new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')));
  });
const answer = (qid) => ({ qid, answer: 'huge', responseMs: 1500, attempt: 1 });

/** Records what a promise settles to, so a test can also assert that it is still pending. */
function track(promise) {
  const box = { done: false, value: undefined };
  promise.then((value) => Object.assign(box, { done: true, value }));
  return box;
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('createAnswerQueue', () => {
  it('with requestTimeoutMs aborts a stalled flush: the answers stay pending and the next flush sends them', async () => {
    const fetch = vi.fn((url, init) => (fetch.mock.calls.length === 1 ? stalled(init) : reply(200, { results: [{ qid: 'q1', isCorrect: true }] })));
    vi.stubGlobal('fetch', fetch);
    const queue = createAnswerQueue('s1', { requestTimeoutMs: 8000 });
    queue.add(answer('q1'));

    const first = track(queue.flush());
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    await vi.advanceTimersByTimeAsync(7999);
    expect(first.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(first.done).toBe(true);
    expect(first.value).toMatchObject({ ok: false, results: [], error: { status: 0, code: 'network' } });
    expect(first.value.fatal).toBeUndefined(); // a normal, non-fatal failure
    expect(queue.size).toBe(1);

    const second = await queue.flush(); // 'flushing' was freed: a new request goes out
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(second).toEqual({ ok: true, results: [{ qid: 'q1', isCorrect: true }] });
    expect(queue.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0); // the time limit is cleared once a request settles
  });

  it('without options sends no signal and waits for a stalled request as long as it takes (unchanged)', async () => {
    const fetch = vi.fn((url, init) => stalled(init));
    vi.stubGlobal('fetch', fetch);
    const queue = createAnswerQueue('s1');
    queue.add(answer('q1'));

    const first = track(queue.flush());
    expect(Object.hasOwn(fetch.mock.calls[0][1], 'signal')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(first.done).toBe(false);
    queue.flush(); // joins the request still in flight
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(queue.size).toBe(1);
  });

  it('a fatal reply (409) drops the answers and is reported as fatal', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(409, { error: 'Sessiya allaqachon yakunlangan', code: 'already_completed' })));
    const queue = createAnswerQueue('s1', { requestTimeoutMs: 8000 });
    queue.add(answer('q1'));
    const res = await queue.flush();
    expect(res).toMatchObject({ ok: false, results: [], fatal: { status: 409 } });
    expect(queue.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
