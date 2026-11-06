import { afterEach, describe, expect, it, vi } from 'vitest';
import { completeGame, sendAnswers } from './api';

const aborted = () => new DOMException('The operation was aborted.', 'AbortError');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('games api: abort signals', () => {
  it('sendAnswers and completeGame pass an optional signal to fetch, and no signal key without one', async () => {
    const fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ results: [] }) }));
    vi.stubGlobal('fetch', fetch);
    const { signal } = new AbortController();
    await sendAnswers('s1', [], { signal });
    await completeGame('s1', { signal });
    await sendAnswers('s1', []);
    await completeGame('s1');
    expect(fetch.mock.calls.map(([, init]) => init.signal)).toEqual([signal, signal, undefined, undefined]);
    expect(fetch.mock.calls.slice(2).map(([, init]) => Object.hasOwn(init, 'signal'))).toEqual([false, false]);
  });

  it('an aborted request fails like a dropped connection (status 0), also while its body is still arriving', async () => {
    const ctrl = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn((url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(aborted()))))
    );
    const sent = sendAnswers('s1', [], { signal: ctrl.signal });
    ctrl.abort();
    await expect(sent).rejects.toMatchObject({ status: 0, code: 'network' });

    // Headers arrived (200), then the time limit hit while the JSON body was being read.
    const late = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => {
            late.abort();
            return Promise.reject(aborted());
          },
        })
      )
    );
    await expect(completeGame('s1', { signal: late.signal })).rejects.toMatchObject({ status: 0, code: 'network' });
  });
});
