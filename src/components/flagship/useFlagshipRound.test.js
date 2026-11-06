import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnswerQueue } from '@/components/games/answerQueue';
import { completeRound, finishDeadline, startRound, waitUntil, FINISH_BUDGET_MS, REQUEST_TIMEOUT_MS } from './useFlagshipRound';

// fetch is stubbed: each endpoint plays a script of replies (the last one repeats). A stalled reply
// behaves like a real fetch: it never settles by itself and rejects with an AbortError once aborted.
const reply = (status, body = {}) => () => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
const stall = () => (init) =>
  new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')));
  });
const slow = (ms, body) => () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, status: 200, json: () => Promise.resolve(body) }), ms));

/** Stubs fetch with a script per endpoint ('start' | 'answer' | 'complete'); returns the call log. */
function stubApi(script) {
  const log = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url, init) => {
      const kind = String(url).split('/').pop();
      log.push(kind);
      const steps = script[kind] || [reply(404)];
      const step = steps.length > 1 ? steps.shift() : steps[0];
      return step(init);
    })
  );
  return log;
}

/** Records what a promise settles to, so a test can also assert that it is still pending. */
function track(promise) {
  const box = { done: false, value: undefined };
  promise.then((value) => Object.assign(box, { done: true, value }));
  return box;
}

const GRADED = { results: [{ qid: 'q1', isCorrect: false, correctDisplay: 'huge' }] };
const COMPLETED = { xp: { earned: 12 }, mistakes: [{ correctAnswer: 'huge', prompt: 'katta', yourAnswer: 'hug' }] };
const LOCAL = [{ word: '', prompt: 'katta', yours: 'hug' }]; // the round's own summary (signed in: no word before the verdict)
const LOCAL_LIST = [{ word: '', note: 'katta', yours: 'hug' }];
const SERVER_LIST = [{ word: 'huge', note: 'katta', yours: 'hug' }];

/** A signed-in round with one counted answer still queued (as when End is pressed with a verdict in flight). */
function signedIn() {
  const queue = createAnswerQueue('s1', { requestTimeoutMs: REQUEST_TIMEOUT_MS });
  queue.add({ qid: 'q1', answer: 'hug', responseMs: 2400, attempt: 1 });
  return { session: { sessionId: 's1' }, queue, saveGuest: false, practice: false, reason: null };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('completeRound, signed in', () => {
  it('retries a flush that failed with 500, so the answer is stored before complete is called', async () => {
    const log = stubApi({ answer: [reply(500), reply(200, GRADED)], complete: [reply(200, COMPLETED)] });
    const round = signedIn();
    const done = track(completeRound(round, LOCAL));
    await vi.advanceTimersByTimeAsync(599);
    expect(log).toEqual(['answer']);
    await vi.advanceTimersByTimeAsync(1);
    expect(log).toEqual(['answer', 'answer', 'complete']);
    expect(done.value).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
    expect(round.queue.size).toBe(0);
  });

  it('never completes over answers that keep failing (3 attempts, 600 / 1200 ms apart): retry, and "send again" works later', async () => {
    const log = stubApi({ answer: [reply(500)], complete: [reply(200, COMPLETED)] });
    const round = signedIn();
    const done = track(completeRound(round, LOCAL));
    await vi.advanceTimersByTimeAsync(600);
    expect(log).toEqual(['answer', 'answer']);
    await vi.advanceTimersByTimeAsync(1199);
    expect(done.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(log).toEqual(['answer', 'answer', 'answer']); // completeGame was never called
    expect(done.value).toEqual({ xp: null, flagged: false, missed: LOCAL_LIST, retry: true });
    expect(round.queue.size).toBe(1); // kept for "send again"

    // "Send again" once the connection is back: the kept answer goes first, then complete.
    const again = stubApi({ answer: [reply(200, GRADED)], complete: [reply(200, COMPLETED)] });
    expect(await completeRound(round, LOCAL)).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
    expect(again).toEqual(['answer', 'complete']);
  });

  it('does not retry a fatal flush (409) and completes at once', async () => {
    const log = stubApi({ answer: [reply(409, { code: 'already_completed' })], complete: [reply(200, COMPLETED)] });
    const done = await completeRound(signedIn(), LOCAL);
    expect(log).toEqual(['answer', 'complete']);
    expect(done).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
  });

  it('a stalled request: the result is shown by the deadline with retry, and `later` lands once a retry gets through', async () => {
    const log = stubApi({ answer: [stall(), reply(200, GRADED)], complete: [reply(200, COMPLETED)] });
    const done = track(completeRound(signedIn(), LOCAL, { deadlineMs: 3000 }));
    await vi.advanceTimersByTimeAsync(2999);
    expect(done.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(done.value).toMatchObject({ xp: null, flagged: false, missed: LOCAL_LIST, retry: true });
    expect(done.value.later).toBeInstanceOf(Promise);

    const late = track(done.value.later);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 3000); // the stalled POST is aborted at 8 s…
    expect(log).toEqual(['answer']);
    expect(late.done).toBe(false);
    await vi.advanceTimersByTimeAsync(600); // …and sent again 600 ms later
    expect(log).toEqual(['answer', 'answer', 'complete']);
    expect(late.value).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
  });

  it('a second call while the save is running joins it: exactly one complete request', async () => {
    const log = stubApi({ answer: [reply(200, GRADED)], complete: [slow(1000, COMPLETED)] });
    const round = signedIn();
    const first = track(completeRound(round, LOCAL));
    const second = track(completeRound(round, LOCAL, { deadlineMs: 5000 }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(log).toEqual(['answer', 'complete']);
    expect(first.value).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
    expect(second.value).toEqual(first.value);
    expect(vi.getTimerCount()).toBe(0); // the deadline timer is cleared
  });

  it('retries complete once after 1200 ms on a 5xx, and offers retry when it fails again', async () => {
    let log = stubApi({ answer: [reply(200, GRADED)], complete: [reply(502), reply(200, { ...COMPLETED, notice: { reason: 'impossible_response_time' } })] });
    let done = track(completeRound(signedIn(), LOCAL));
    await vi.advanceTimersByTimeAsync(1199);
    expect(log).toEqual(['answer', 'complete']);
    await vi.advanceTimersByTimeAsync(1);
    expect(log).toEqual(['answer', 'complete', 'complete']);
    expect(done.value).toEqual({ xp: 12, flagged: true, missed: SERVER_LIST, retry: false });

    log = stubApi({ answer: [reply(200, GRADED)], complete: [reply(500)] });
    done = track(completeRound(signedIn(), LOCAL));
    await vi.advanceTimersByTimeAsync(1200);
    expect(log).toEqual(['answer', 'complete', 'complete']);
    expect(done.value).toEqual({ xp: null, flagged: false, missed: LOCAL_LIST, retry: true });
  });

  it('aborts a stalled complete after the request limit and retries it', async () => {
    const log = stubApi({ answer: [reply(200, GRADED)], complete: [stall(), reply(200, COMPLETED)] });
    const done = track(completeRound(signedIn(), LOCAL));
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1199);
    expect(log).toEqual(['answer', 'complete']);
    await vi.advanceTimersByTimeAsync(1);
    expect(log).toEqual(['answer', 'complete', 'complete']);
    expect(done.value).toEqual({ xp: 12, flagged: false, missed: SERVER_LIST, retry: false });
  });

  it('never rejects, even on an unexpected error (the result is still shown)', async () => {
    stubApi({ complete: [reply(200, COMPLETED)] });
    const broken = { session: { sessionId: 's1' }, queue: null, saveGuest: false }; // no queue: drain throws
    expect(await completeRound(broken, LOCAL, { deadlineMs: 3000 })).toEqual({ xp: null, flagged: false, missed: LOCAL_LIST, retry: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats 410 / 404 on complete as final: no retry, no XP, the local list', async () => {
    for (const status of [410, 404]) {
      const log = stubApi({ answer: [reply(200, GRADED)], complete: [reply(status)] });
      expect(await completeRound(signedIn(), LOCAL)).toEqual({ xp: null, flagged: false, missed: LOCAL_LIST, retry: false });
      expect(log).toEqual(['answer', 'complete']);
    }
  });
});

describe('completeRound, guest', () => {
  it('keeps the local list, sends nothing and never offers a retry', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const done = await completeRound({ session: null, queue: null, saveGuest: true }, [{ word: 'huge', prompt: 'katta', note: 'katta, ulkan', yours: 'hug' }]);
    expect(done).toEqual({ xp: null, flagged: false, missed: [{ word: 'huge', note: 'katta, ulkan', yours: 'hug' }], retry: false });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('startRound', () => {
  it("gives a signed-in round's answer queue the request time limit", async () => {
    const log = stubApi({ start: [reply(200, { sessionId: 's9', questions: [{ qid: 'q1', prompt: 'katta' }] })], answer: [stall()] });
    const round = await startRound({ gameKey: 'word_tunnel', audience: 'user', toQuestion: (q) => q, guestQuestions: () => [] });
    round.queue.add({ qid: 'q1', answer: 'huge', responseMs: 2000, attempt: 1 });
    const flushed = track(round.queue.flush());
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1);
    expect(flushed.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(flushed.value).toMatchObject({ ok: false, error: { status: 0 } });
    expect(round.queue.size).toBe(1);
    expect(log).toEqual(['start', 'answer']);
  });
});

describe('waitUntil', () => {
  it('resolves at once when the condition already holds', async () => {
    const box = track(waitUntil(() => true, 4500));
    await vi.advanceTimersByTimeAsync(0);
    expect(box.done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('resolves at the first check after the condition starts to hold', async () => {
    let inflight = 1;
    setTimeout(() => {
      inflight = 0;
    }, 120);
    const box = track(waitUntil(() => inflight === 0, 4500, 50));
    await vi.advanceTimersByTimeAsync(149);
    expect(box.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(box.done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('gives up after the timeout and stops polling', async () => {
    const box = track(waitUntil(() => false, 4500, 50));
    await vi.advanceTimersByTimeAsync(4499);
    expect(box.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(box.done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('finishDeadline', () => {
  it('is what is left of the finishing budget, never under 2 s', () => {
    expect(FINISH_BUDGET_MS).toBe(8000);
    expect(finishDeadline(0)).toBe(8000);
    expect(finishDeadline(4500)).toBe(3500);
    expect(finishDeadline(7000)).toBe(2000);
    expect(finishDeadline(-10)).toBe(8000);
  });
});
