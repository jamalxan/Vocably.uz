import { describe, expect, it, vi } from 'vitest';
import {
  albumIdMapper,
  cleanBatchId,
  forwardClientMessageId,
  forwardedFromFor,
  materializeCopies,
  partitionSources,
  planForwardCopies,
  sortSources,
  validateForwardBody,
} from './forward';

const id = (n) => String(n).padStart(24, '0');
const ME = id(1);
const ALICE = id(2);
const msg = (n, over = {}) => ({ _id: id(100 + n), senderId: ALICE, type: 'text', text: `m${n}`, createdAt: new Date(Date.UTC(2026, 10, 1, 10, 0, n)), ...over });

describe('validateForwardBody', () => {
  const ok = { sourceConversationId: id(9), messageIds: [id(101)], targetConversationIds: [id(7)] };
  it('accepts a minimal body, dedupes ids and keeps order', () => {
    const v = validateForwardBody({ ...ok, messageIds: [id(102), id(101), id(102)], targetConversationIds: [id(7), id(8), id(7)], hideAuthor: true, comment: '  hi  ' });
    expect(v).toEqual({ sourceConversationId: id(9), messageIds: [id(102), id(101)], targetIds: [id(7), id(8)], hideAuthor: true, comment: 'hi' });
  });
  it.each([
    [{}, 'bad_request'],
    [{ ...ok, messageIds: [] }, 'bad_request'],
    [{ ...ok, targetConversationIds: [] }, 'bad_request'],
    [{ ...ok, messageIds: ['nope'] }, 'bad_request'],
    [{ ...ok, sourceConversationId: 'x' }, 'bad_request'],
    [{ ...ok, comment: 'x'.repeat(4001) }, 'bad_request'],
    [{ ...ok, targetConversationIds: Array.from({ length: 11 }, (_, i) => id(200 + i)) }, 'too_many'],
    [{ ...ok, messageIds: Array.from({ length: 51 }, (_, i) => id(300 + i)) }, 'too_many'],
    // 20 x 6 = 120 > 100 nusxa
    [{ ...ok, messageIds: Array.from({ length: 20 }, (_, i) => id(300 + i)), targetConversationIds: Array.from({ length: 6 }, (_, i) => id(200 + i)) }, 'too_many'],
  ])('rejects %#', (body, code) => {
    expect(validateForwardBody(body).code).toBe(code);
  });
  it('hideAuthor only on a literal true', () => {
    expect(validateForwardBody({ ...ok, hideAuthor: 'yes' }).hideAuthor).toBe(false);
  });
});

describe('ids', () => {
  it('clientMessageId is stable per batch, source and target', () => {
    expect(forwardClientMessageId('batch1', 'a', 'b')).toBe('batch1:a:b');
    expect(forwardClientMessageId('batch1', 'a', 'b')).toBe(forwardClientMessageId('batch1', 'a', 'b'));
    expect(forwardClientMessageId('x'.repeat(40), id(1), id(2)).length).toBeLessThanOrEqual(100);
  });
  it('cleanBatchId keeps a sane client id, replaces junk', () => {
    expect(cleanBatchId('0b6f2c1e-1111-4222-8333-944445555666')).toBe('0b6f2c1e-1111-4222-8333-944445555666');
    expect(cleanBatchId('bad id!', () => 'fresh-id-1')).toBe('fresh-id-1');
    expect(cleanBatchId(undefined, () => 'fresh-id-2')).toBe('fresh-id-2');
  });
});

describe('partitionSources', () => {
  it('skips calls and missing/deleted messages, sorts the rest by time', () => {
    const found = [msg(3), msg(1), msg(2, { type: 'call' }), msg(4, { deletedFor: [ME] }), msg(5, { deletedForEveryone: true })];
    const requested = [id(103), id(101), id(102), id(104), id(105), id(199)];
    const { usable, skipped } = partitionSources(requested, found, ME);
    expect(usable.map((m) => m.text)).toEqual(['m1', 'm3']);
    expect(skipped).toEqual([
      { id: id(102), reason: 'call' },
      { id: id(104), reason: 'not_found' },
      { id: id(105), reason: 'not_found' },
      { id: id(199), reason: 'not_found' },
    ]);
  });
  it('sortSources breaks createdAt ties by id', () => {
    const t = new Date();
    expect(sortSources([{ _id: 'b', createdAt: t }, { _id: 'a', createdAt: t }]).map((m) => m._id)).toEqual(['a', 'b']);
  });
});

describe('forwardedFromFor', () => {
  const authors = new Map([[ALICE, { _id: ALICE, name: 'Alice', username: 'alice' }]]);
  it('labels the original author', () => {
    expect(forwardedFromFor(msg(1), authors)).toEqual({ userId: ALICE, name: 'Alice', messageId: id(101), hidden: false });
  });
  it('keeps the first author of a forward of a forward', () => {
    const fwd = msg(2, { senderId: ME, forwardedFrom: { userId: ALICE, name: 'Alice A.', messageId: id(55) } });
    expect(forwardedFromFor(fwd, authors)).toEqual({ userId: ALICE, name: 'Alice A.', messageId: id(55), hidden: false });
  });
  it('falls back to @username and sets the hidden flag', () => {
    const a = new Map([[ALICE, { _id: ALICE, name: '', username: 'alice' }]]);
    expect(forwardedFromFor(msg(1), a, true)).toMatchObject({ name: '@alice', hidden: true });
  });
  it('a hidden forward stays hidden when forwarded again', () => {
    expect(forwardedFromFor(msg(1, { forwardedFrom: { userId: ALICE, name: 'A', hidden: true } }), authors).hidden).toBe(true);
  });
});

describe('planForwardCopies', () => {
  const authors = new Map([[ALICE, { _id: ALICE, name: 'Alice' }]]);
  const media = (key) => ({ key, mimeType: 'image/jpeg', size: 10 });

  it('regroups an album under one fresh id per target and keeps source order', () => {
    const sources = [
      msg(3, { type: 'image', media: media('k3'), albumId: 'albumAAA', text: 'caption' }),
      msg(1),
      msg(2, { type: 'image', media: media('k2'), albumId: 'albumAAA' }),
      msg(4, { type: 'sticker', stickerId: 'st1', text: '' }),
    ];
    let n = 0;
    const makeId = () => `new${++n}xxxxx`;
    const now = new Date('2026-11-06T00:00:00Z');
    const planned = planForwardCopies({ sources, targetConversationId: id(7), senderId: ME, authorsById: authors, clientBatchId: 'b1', now, newAlbumId: albumIdMapper(makeId) });
    expect(planned.map((p) => p.type)).toEqual(['text', 'image', 'image', 'sticker']);
    expect(planned[1].albumId).toBe('new1xxxxx');
    expect(planned[2].albumId).toBe('new1xxxxx');
    expect(planned[0].albumId).toBeNull();
    expect(planned[2].text).toBe('caption');
    expect(planned[3].stickerId).toBe('st1');
    expect(planned[1].copyFrom).toBe('k2');
    expect(planned.map((p) => p.createdAt.getTime() - now.getTime())).toEqual([0, 1, 2, 3]);
    expect(planned[0].clientMessageId).toBe(`b1:${id(101)}:${id(7)}`);
    expect(planned.every((p) => String(p.senderId) === ME && p.forwardedFrom.name === 'Alice')).toBe(true);
  });

  it('a second target gets a different album id', () => {
    const sources = [msg(1, { type: 'image', media: media('k'), albumId: 'albumAAA' })];
    const a = planForwardCopies({ sources, targetConversationId: id(7), senderId: ME, authorsById: authors });
    const b = planForwardCopies({ sources, targetConversationId: id(8), senderId: ME, authorsById: authors });
    expect(a[0].albumId).toBeTruthy();
    expect(a[0].albumId).not.toBe(b[0].albumId);
  });

  it('hideAuthor sets forwardedFrom.hidden', () => {
    const [p] = planForwardCopies({ sources: [msg(1)], targetConversationId: id(7), senderId: ME, authorsById: authors, hideAuthor: true });
    expect(p.forwardedFrom.hidden).toBe(true);
  });
});

describe('materializeCopies', () => {
  it('copies media into the target folder and strips copyFrom', async () => {
    const copy = vi.fn(async () => {});
    const keyFor = vi.fn((conv, type) => `conversations/${conv}/${type}/new.jpg`);
    const { docs } = await materializeCopies(
      [
        { conversationId: id(7), type: 'image', media: { key: 'old', mimeType: 'image/jpeg', size: 1 }, copyFrom: 'old' },
        { conversationId: id(7), type: 'text', text: 'x' },
      ],
      { copy, keyFor }
    );
    expect(copy).toHaveBeenCalledWith('old', `conversations/${id(7)}/image/new.jpg`);
    expect(docs[0].media.key).toBe(`conversations/${id(7)}/image/new.jpg`);
    expect(docs[0].copyFrom).toBeUndefined();
    expect(docs[1]).toEqual({ conversationId: id(7), type: 'text', text: 'x' });
  });
  it('a failed copy fails the target', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await materializeCopies([{ conversationId: id(7), type: 'file', media: { key: 'a', mimeType: 'application/pdf', size: 1 }, copyFrom: 'a' }], {
      copy: async () => {
        throw new Error('s3 down');
      },
      keyFor: () => 'k',
    });
    expect(res.error).toBeTruthy();
    err.mockRestore();
  });
});
