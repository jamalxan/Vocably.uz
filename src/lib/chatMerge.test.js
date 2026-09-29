import { describe, it, expect } from 'vitest';
import { mergePolledMessages } from './chatMerge';

const msg = (id, t, extra = {}) => ({ id, createdAt: `2026-09-29T10:00:${String(t).padStart(2, '0')}Z`, ...extra });

describe('mergePolledMessages', () => {
  it('keeps bubbles the server does not know yet', () => {
    const prev = [msg('a', 1), msg('c1', 5, { clientMessageId: 'c1', _status: 'sending' })];
    const out = mergePolledMessages(prev, [msg('a', 1), msg('b', 2)]);
    expect(out.map((m) => m.id)).toEqual(['a', 'b', 'c1']);
  });

  it('drops the pending bubble once the server returns it', () => {
    const prev = [msg('c1', 5, { clientMessageId: 'c1', _status: 'sending' })];
    const out = mergePolledMessages(prev, [msg('srv1', 5, { clientMessageId: 'c1' })]);
    expect(out.map((m) => m.id)).toEqual(['srv1']);
  });

  it('keeps older pages loaded by scrolling up', () => {
    const prev = [msg('old', 0), msg('a', 1)];
    const out = mergePolledMessages(prev, [msg('a', 1), msg('b', 2)]);
    expect(out.map((m) => m.id)).toEqual(['old', 'a', 'b']);
  });

  it('keeps a failed bubble for Retry', () => {
    const prev = [msg('x', 3, { clientMessageId: 'x', _status: 'failed' })];
    expect(mergePolledMessages(prev, [msg('a', 1)]).map((m) => m.id)).toEqual(['a', 'x']);
  });
});
