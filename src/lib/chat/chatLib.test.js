import { describe, it, expect, vi } from 'vitest';
import { createUploadManager } from './uploadManager';
import { planImage } from './compressImage';
import { stageFiles, albumGroups, kindOf, ATTACH } from './attachments';
import { groupAlbums, albumRows, albumCaption } from './albums';
import { setDraft, getDraft, pruneDrafts, readDrafts, writeDrafts, DRAFT_TTL_MS } from './drafts';
import { partitionConversations, applyNewMessageToList, applyBulkAction, rowPreview } from './chatList';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('upload manager', () => {
  it('runs at most N uploads at once, reports progress, resolves with the key', async () => {
    let active = 0;
    let peak = 0;
    const resolvers = [];
    const presign = vi.fn(async (item) => ({ key: `k-${item.id}`, uploadUrl: 'u' }));
    const put = vi.fn((url, file, { onProgress }) => {
      active++;
      peak = Math.max(peak, active);
      return new Promise((resolve) => {
        onProgress(0.5);
        resolvers.push(() => {
          active--;
          resolve();
        });
      });
    });
    const m = createUploadManager({ presign, put, concurrency: 2 });
    const changes = [];
    const ps = [1, 2, 3, 4].map((i) => m.enqueue({ id: `f${i}`, file: new Blob(['x']), mimeType: 'image/jpeg', type: 'image', conversationId: 'c', onChange: (it) => changes.push([it.id, it.status, it.progress]) }));
    await tick();
    await tick();
    expect(m.stats()).toEqual({ queued: 2, running: 2 });
    expect(peak).toBe(2);
    resolvers.shift()();
    await tick();
    await tick();
    expect(m.stats().running).toBe(2);
    let settled = 0;
    ps.forEach((p) => p.then(() => settled++));
    while (settled < 4) {
      while (resolvers.length) resolvers.shift()();
      await tick();
    }
    const res = await Promise.all(ps);
    expect(res.map((r) => r.key)).toEqual(['k-f1', 'k-f2', 'k-f3', 'k-f4']);
    expect(peak).toBe(2);
    expect(changes.some(([, s, p]) => s === 'uploading' && p === 0.5)).toBe(true);
    expect(changes.filter(([, s]) => s === 'done')).toHaveLength(4);
  });

  it('a failed upload rejects and can be retried; cancel resolves null', async () => {
    let calls = 0;
    const presign = async (item) => ({ key: `k-${item.id}`, uploadUrl: 'u' });
    const put = vi.fn(async (url, file, { signal }) => {
      calls++;
      if (calls === 1) throw new Error('boom');
      if (signal.aborted) throw new DOMException('aborted', 'AbortError');
      await new Promise((r) => setTimeout(r, 5));
      if (signal.aborted) throw new DOMException('aborted', 'AbortError');
    });
    const m = createUploadManager({ presign, put, concurrency: 1 });
    const p1 = m.enqueue({ id: 'a', file: new Blob(['x']), mimeType: 'image/jpeg', type: 'image', conversationId: 'c' });
    await expect(p1).rejects.toThrow('boom');
    expect(m.get('a').status).toBe('failed');
    const p2 = m.retry('a');
    await expect(p2).resolves.toEqual({ key: 'k-a' });
    const p3 = m.enqueue({ id: 'b', file: new Blob(['x']), mimeType: 'image/jpeg', type: 'image', conversationId: 'c' });
    const p4 = m.enqueue({ id: 'c', file: new Blob(['x']), mimeType: 'image/jpeg', type: 'image', conversationId: 'c' });
    m.cancel('c'); // still queued
    await tick();
    m.cancel('b'); // running (its put is mid-flight)
    await expect(p4).resolves.toBeNull();
    await expect(p3).resolves.toBeNull();
    expect(m.get('b').status).toBe('cancelled');
  });
});

describe('image plan', () => {
  it('keeps small images and gifs, encodes big ones, downsizes long edges', () => {
    expect(planImage({ mimeType: 'image/jpeg', size: 100_000, width: 800, height: 600 })).toEqual({ action: 'keep' });
    expect(planImage({ mimeType: 'image/gif', size: 5_000_000, width: 4000, height: 3000 })).toEqual({ action: 'keep' });
    expect(planImage({ mimeType: 'image/jpeg', size: 6_000_000, width: 4000, height: 3000 })).toEqual({ action: 'encode', width: 2560, height: 1920, outType: 'image/jpeg', quality: 0.85 });
    expect(planImage({ mimeType: 'image/png', size: 900_000, width: 1000, height: 1000 })).toMatchObject({ action: 'encode', outType: 'image/png', width: 1000 });
    expect(planImage({ mimeType: 'image/png', size: 5_000_000, width: 1000, height: 1000 }).outType).toBe('image/jpeg');
    expect(planImage({ mimeType: 'application/pdf', size: 5_000_000 })).toEqual({ action: 'keep' });
  });
});

describe('attachments', () => {
  const f = (name, type, size) => ({ name, type, size });
  it('classifies and limits', () => {
    expect(kindOf(f('a.jpg', 'image/jpeg', 1))).toBe('image');
    expect(kindOf(f('a.svg', 'image/svg+xml', 1))).toBe('file');
    expect(kindOf(f('a.jpg', 'image/jpeg', 1), { asFile: true })).toBe('file');
    let n = 0;
    const r = stageFiles([f('a.jpg', 'image/jpeg', 100), f('b.mp4', 'video/mp4', ATTACH.maxBytes.video + 1), f('c.pdf', 'application/pdf', 10)], { makeId: () => `id${++n}` });
    expect(r.accepted.map((a) => [a.id, a.type])).toEqual([['id1', 'image'], ['id2', 'file']]);
    expect(r.rejected[0]).toMatchObject({ reason: 'too_big' });
    const many = stageFiles(Array.from({ length: 12 }, (_, i) => f(`${i}.jpg`, 'image/jpeg', 1)), { makeId: () => 'x' });
    expect(many.accepted).toHaveLength(10);
    expect(many.rejected.filter((x) => x.reason === 'too_many')).toHaveLength(2);
  });
  it('albums: 2+ media together, files alone', () => {
    const a = [{ type: 'image' }, { type: 'video' }, { type: 'file' }];
    const g = albumGroups(a);
    expect(g.albums).toHaveLength(1);
    expect(g.albums[0]).toHaveLength(2);
    expect(g.singles).toEqual([{ type: 'file' }]);
    expect(albumGroups([{ type: 'image' }]).albums).toHaveLength(0);
  });
});

describe('album rendering', () => {
  it('groups consecutive same-album messages', () => {
    const ms = [
      { id: 1, senderId: 'a', albumId: 'x', createdAt: 1 },
      { id: 2, senderId: 'a', albumId: 'x', createdAt: 2 },
      { id: 3, senderId: 'b', albumId: 'x', createdAt: 3 },
      { id: 4, senderId: 'a', albumId: null, createdAt: 4 },
      { id: 5, senderId: 'a', albumId: 'y', createdAt: 5 },
    ];
    const items = groupAlbums(ms);
    expect(items.map((i) => i.kind)).toEqual(['album', 'message', 'message', 'message']);
    expect(items[0].messages.map((m) => m.id)).toEqual([1, 2]);
  });
  it('row layouts and caption', () => {
    expect(albumRows(3)).toEqual([1, 2]);
    expect(albumRows(10)).toEqual([2, 2, 3, 3]);
    expect(albumRows(11)).toEqual([3, 3, 3, 2]);
    expect(albumCaption([{ text: '' }, { text: 'hi' }])).toBe('hi');
  });
});

describe('drafts', () => {
  it('set/get/prune', () => {
    let m = setDraft({}, 'c1', { text: 'hello' }, 1000);
    expect(getDraft(m, 'c1')).toEqual({ text: 'hello', replyTo: null, updatedAt: 1000 });
    m = setDraft(m, 'c1', { text: '  ' }, 2000);
    expect(getDraft(m, 'c1')).toBeNull();
    m = setDraft(m, 'c2', { text: '', replyTo: { id: 'm1' } }, 3000);
    expect(getDraft(m, 'c2').replyTo).toEqual({ id: 'm1' });
    const old = { c3: { text: 'x', updatedAt: 0 }, c4: 'junk', c5: { text: 'y', updatedAt: Date.now() } };
    expect(Object.keys(pruneDrafts(old, DRAFT_TTL_MS + 10))).toEqual(['c5']);
  });
  it('storage wrapper never throws', () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    writeDrafts('u1', setDraft({}, 'c1', { text: 'draft' }), storage);
    expect(readDrafts('u1', storage).c1.text).toBe('draft');
    expect(readDrafts('u1', { getItem: () => '{bad json' })).toEqual({});
    expect(() => writeDrafts('u1', {}, { setItem: () => { throw new Error('quota'); } })).not.toThrow();
  });
});

describe('chat list', () => {
  const list = [
    { id: 'a', lastMessageAt: '2026-01-01', unreadCount: 2 },
    { id: 'b', lastMessageAt: '2026-01-03', pinned: true },
    { id: 'c', lastMessageAt: '2026-01-02', archived: true, unreadCount: 1 },
    { id: 'd', lastMessageAt: '2026-01-04' },
  ];
  it('pinned first, archive apart', () => {
    const p = partitionConversations(list);
    expect(p.main.map((c) => c.id)).toEqual(['b', 'd', 'a']);
    expect(p.archived.map((c) => c.id)).toEqual(['c']);
    expect(p.archivedUnread).toBe(1);
  });
  it('new message updates the row and unarchives', () => {
    const next = applyNewMessageToList(list, { conversationId: 'c', preview: 'hey', createdAt: '2026-01-05', incoming: true });
    const c = next.find((x) => x.id === 'c');
    expect(c).toMatchObject({ archived: false, unreadCount: 2, lastMessagePreview: 'hey' });
    expect(applyNewMessageToList(list, { conversationId: 'zzz', preview: '', createdAt: 1, incoming: true })).toBe(list);
  });
  it('bulk actions and previews', () => {
    expect(applyBulkAction(list, ['a'], 'delete').map((c) => c.id)).toEqual(['b', 'c', 'd']);
    expect(applyBulkAction(list, ['b'], 'archive').find((c) => c.id === 'b')).toMatchObject({ archived: true, pinned: false });
    expect(applyBulkAction(list, ['a'], 'read').find((c) => c.id === 'a').unreadCount).toBe(0);
    expect(rowPreview({ lastMessagePreview: 'last' }, { text: ' typing ' })).toEqual({ kind: 'draft', text: 'typing' });
    expect(rowPreview({ lastMessagePreview: 'last' }, null)).toEqual({ kind: 'message', text: 'last' });
  });
});
