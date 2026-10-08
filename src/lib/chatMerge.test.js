import { describe, it, expect } from 'vitest';
import { mergePolledMessages, applyDeletedForEveryone } from './chatMerge';

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

describe('applyDeletedForEveryone', () => {
  const list = () => [
    msg('a', 1, { type: 'text', text: 'salom' }),
    msg('b', 2, { type: 'text', text: 'javob', replyTo: { messageId: 'a', type: 'text', text: 'salom' } }),
  ];

  it('turns the message into a tombstone and blanks quotes of it', () => {
    const out = applyDeletedForEveryone(list(), 'a', false);
    expect(out[0]).toMatchObject({ id: 'a', deletedForEveryone: true, text: '' });
    expect(out[1].replyTo).toMatchObject({ text: '', deleted: true });
    expect(out[1].text).toBe('javob');
  });

  it('drops the message entirely when silent', () => {
    const out = applyDeletedForEveryone(list(), 'a', true);
    expect(out.map((m) => m.id)).toEqual(['b']);
    expect(out[1 - 1].replyTo.deleted).toBe(true);
  });

  it('returns the same list when the message is not there', () => {
    const l = list();
    expect(applyDeletedForEveryone(l, 'zzz', false)).toBe(l);
  });
});
