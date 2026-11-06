import { describe, expect, it } from 'vitest';
import { isEmptyDraft, pruneDrafts, replyIdOf, sameDraftContent, setDraft } from './drafts';

// PARITY_PLAN WP6: the localStorage cache semantics (dirty flag, tombstones, legacy values).
describe('setDraft (WP6 cache)', () => {
  it('returns the same map when nothing changed (no needless server sync)', () => {
    const empty = {};
    expect(setDraft(empty, 'c1', { text: '' })).toBe(empty);
    const m = setDraft({}, 'c1', { text: 'hi' }, 1);
    expect(setDraft(m, 'c1', { text: 'hi' }, 2)).toBe(m);
    const clean = { c1: { text: 'hi', replyTo: null, updatedAt: 1, syncedAt: 50, dirty: false } };
    expect(setDraft(clean, 'c1', { text: 'hi' }, 2)).toBe(clean);
  });

  it('an edit is dirty and keeps the last server timestamp', () => {
    const m = setDraft({ c1: { text: 'a', replyTo: null, updatedAt: 1, syncedAt: 50, dirty: false } }, 'c1', { text: 'ab' }, 9);
    expect(m.c1).toEqual({ text: 'ab', replyTo: null, updatedAt: 9, syncedAt: 50, dirty: true });
  });

  it('a clean write (after send) produces a clean tombstone, and cleans a dirty equal entry', () => {
    const m = setDraft({ c1: { text: 'x', replyTo: { id: 'r' }, updatedAt: 1, syncedAt: 50, dirty: true } }, 'c1', { text: '' }, 9, { dirty: false });
    expect(m.c1).toEqual({ text: '', replyTo: null, updatedAt: 9, syncedAt: 50, dirty: false });
    const dirtyTomb = { c1: { text: '', replyTo: null, updatedAt: 1, syncedAt: 0, dirty: true } };
    expect(setDraft(dirtyTomb, 'c1', { text: '' }, 2, { dirty: false }).c1.dirty).toBe(false);
  });

  it('a reply-only draft is not empty; whitespace-only text without a reply is', () => {
    expect(isEmptyDraft({ text: '   ' })).toBe(true);
    expect(isEmptyDraft({ text: '', replyTo: { id: 'm1' } })).toBe(false);
    const m = setDraft({}, 'c1', { text: '', replyTo: { id: 'm1', text: 'q' } }, 1);
    expect(m.c1.replyTo).toEqual({ id: 'm1', text: 'q' });
  });

  it('caps text at 4000 chars', () => {
    expect(setDraft({}, 'c1', { text: 'x'.repeat(5000) }).c1.text).toHaveLength(4000);
  });
});

describe('content comparison', () => {
  it('compares text and reply id across local snapshots and server shapes', () => {
    expect(replyIdOf({ id: 'a' })).toBe('a');
    expect(replyIdOf('a')).toBe('a');
    expect(replyIdOf(null)).toBeNull();
    expect(sameDraftContent({ text: 'x', replyTo: { id: 'a', text: 'q' } }, { text: 'x', replyTo: { id: 'a' } })).toBe(true);
    expect(sameDraftContent({ text: 'x', replyTo: null }, { text: 'x', replyTo: { id: 'a' } })).toBe(false);
    expect(sameDraftContent({ text: 'x' }, { text: 'y' })).toBe(false);
  });
});

describe('pruneDrafts', () => {
  it('a legacy (pre-WP6) value without syncedAt is treated as an unsent local edit', () => {
    const now = 1_000_000;
    const out = pruneDrafts({ c1: { text: 'old', replyTo: null, updatedAt: now - 10 }, c2: { text: '', replyTo: null, updatedAt: now } }, now);
    expect(out.c1).toEqual({ text: 'old', replyTo: null, updatedAt: now - 10, syncedAt: 0, dirty: true });
    expect(out.c2.dirty).toBe(false);
  });
  it('keeps the dirty flag and server time of current values', () => {
    const now = 1_000_000;
    const out = pruneDrafts({ c1: { text: 'a', replyTo: null, updatedAt: now, syncedAt: 77, dirty: false } }, now);
    expect(out.c1).toMatchObject({ syncedAt: 77, dirty: false });
  });
});
