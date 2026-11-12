import { describe, expect, it } from 'vitest';
import {
  EMPTY_UNREAD,
  applyUnreadOnMessage,
  mergePresence,
  badgeLabel,
  nextBackoffMs,
  sameUnread,
  shouldToast,
  titleWithBadge,
  unreadFromConversations,
} from './clientState';

const ME = 'me000000000000000000000a';
const FRIEND = 'fr000000000000000000000b';
const msg = (over = {}) => ({ id: 'm1', senderId: FRIEND, type: 'text', text: 'salom', readAt: null, ...over });

describe('nextBackoffMs', () => {
  it('2, 4, 8, 16, 30 s and then stays at the 30 s cap', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 50].map(nextBackoffMs)).toEqual([2000, 4000, 8000, 16000, 30000, 30000, 30000, 30000]);
  });
  it('bad input counts as the first attempt', () => {
    expect(nextBackoffMs(undefined)).toBe(2000);
    expect(nextBackoffMs(-3)).toBe(2000);
    expect(nextBackoffMs('2')).toBe(8000);
  });
});

describe('applyUnreadOnMessage', () => {
  const base = { total: 2, mutedTotal: 1, chats: 1 };
  const ctx = (over = {}) => ({ conversationId: 'c1', message: msg(), silent: false, myId: ME, activeConversationId: null, hidden: false, ...over });

  it('an incoming message in another chat bumps the total (and chats for a newly unread chat)', () => {
    expect(applyUnreadOnMessage(base, ctx({ wasUnread: true }))).toEqual({ total: 3, mutedTotal: 1, chats: 1 });
    expect(applyUnreadOnMessage(base, ctx({ wasUnread: false }))).toEqual({ total: 3, mutedTotal: 1, chats: 2 });
  });
  it('own message: unchanged, same object', () => {
    expect(applyUnreadOnMessage(base, ctx({ message: msg({ senderId: ME }) }))).toBe(base);
  });
  it('muted chat goes to mutedTotal only', () => {
    expect(applyUnreadOnMessage(base, ctx({ silent: true }))).toEqual({ total: 2, mutedTotal: 2, chats: 1 });
  });
  it('the open, visible chat is not counted', () => {
    expect(applyUnreadOnMessage(base, ctx({ activeConversationId: 'c1' }))).toBe(base);
  });
  it('the open chat in a hidden tab is counted', () => {
    expect(applyUnreadOnMessage(base, ctx({ activeConversationId: 'c1', hidden: true })).total).toBe(3);
  });
  it('an already read message (answered call) is not counted', () => {
    expect(applyUnreadOnMessage(base, ctx({ message: msg({ type: 'call', readAt: '2026-11-06T10:00:00Z' }) }))).toBe(base);
  });
  it('a missed call (readAt null) from the friend is counted', () => {
    expect(applyUnreadOnMessage(base, ctx({ message: msg({ type: 'call', readAt: null }) })).total).toBe(3);
  });
  it('no message: unchanged', () => {
    expect(applyUnreadOnMessage(base, ctx({ message: null }))).toBe(base);
  });
});

describe('unreadFromConversations', () => {
  const future = new Date(Date.now() + 3600_000).toISOString();
  const past = new Date(Date.now() - 3600_000).toISOString();
  it('sums unread, skips archived, splits muted (permanent and timed)', () => {
    const list = [
      { id: 'a', unreadCount: 3 },
      { id: 'b', unreadCount: 2, archived: true },
      { id: 'c', unreadCount: 4, muted: true },
      { id: 'd', unreadCount: 1, muted: true, mutedUntil: future },
      { id: 'e', unreadCount: 5, muted: true, mutedUntil: past },
      { id: 'f', unreadCount: 0 },
    ];
    expect(unreadFromConversations(list)).toEqual({ total: 8, mutedTotal: 5, chats: 2 });
  });
  it('empty or missing list', () => {
    expect(unreadFromConversations([])).toEqual(EMPTY_UNREAD);
    expect(unreadFromConversations(null)).toEqual(EMPTY_UNREAD);
  });
});

describe('sameUnread', () => {
  it('compares the three counters', () => {
    expect(sameUnread({ total: 1, mutedTotal: 0, chats: 1 }, { total: 1, mutedTotal: 0, chats: 1 })).toBe(true);
    expect(sameUnread({ total: 1, mutedTotal: 0, chats: 1 }, { total: 1, mutedTotal: 1, chats: 1 })).toBe(false);
    expect(sameUnread(null, EMPTY_UNREAD)).toBe(false);
  });
});

describe('titleWithBadge', () => {
  it('0 -> no prefix, 3 -> (3), 120 -> (99+)', () => {
    expect(titleWithBadge('Vocably', 0)).toBe('Vocably');
    expect(titleWithBadge('Vocably', 3)).toBe('(3) Vocably');
    expect(titleWithBadge('Vocably', 120)).toBe('(99+) Vocably');
  });
  it('replaces an existing prefix instead of stacking', () => {
    expect(titleWithBadge('(3) Vocably', 5)).toBe('(5) Vocably');
    expect(titleWithBadge('(99+) Vocably', 0)).toBe('Vocably');
    expect(titleWithBadge(titleWithBadge('Friends · Vocably', 2), 2)).toBe('(2) Friends · Vocably');
  });
  it('does not strip a title that only starts with a parenthesis', () => {
    expect(titleWithBadge('(beta) Vocably', 1)).toBe('(1) (beta) Vocably');
  });
});

describe('badgeLabel', () => {
  it('caps at 99+', () => {
    expect(badgeLabel(7)).toBe('7');
    expect(badgeLabel(99)).toBe('99');
    expect(badgeLabel(100)).toBe('99+');
  });
});

describe('shouldToast', () => {
  const ctx = (over = {}) => ({ conversationId: 'c1', message: msg(), silent: false, myId: ME, activeConversationId: null, hidden: false, ...over });
  it.each([
    ['incoming text in another chat', {}, true],
    ['own message (other device)', { message: msg({ senderId: ME }) }, false],
    ['call row', { message: msg({ type: 'call' }) }, false],
    ['muted chat', { silent: true }, false],
    ['open and visible chat', { activeConversationId: 'c1' }, false],
    ['open chat but hidden tab', { activeConversationId: 'c1', hidden: true }, true],
    ['another chat is open', { activeConversationId: 'c2' }, true],
    ['legacy edited event', { message: msg({ _event: 'edited' }) }, false],
    ['no conversation id', { conversationId: null }, false],
  ])('%s', (_label, over, expected) => {
    expect(shouldToast(ctx(over))).toBe(expected);
  });
});

describe('mergePresence', () => {
  it('reports users who were online and are now offline', () => {
    const r = mergePresence({ a: true, b: true, c: false }, { a: false, b: true, c: false, d: false });
    expect(r.next).toEqual({ a: false, b: true, c: false, d: false });
    expect(r.wentOffline).toEqual(['a']);
  });

  it('a broadcast "offline" counts even for a user never seen online here', () => {
    expect(mergePresence({}, { a: false }, { broadcast: true }).wentOffline).toEqual(['a']);
    expect(mergePresence({}, { a: false }).wentOffline).toEqual([]);
  });

  it('returns the same object when nothing changes', () => {
    const prev = { a: true, b: null };
    const r = mergePresence(prev, { a: true, b: null });
    expect(r.next).toBe(prev);
    expect(r.wentOffline).toEqual([]);
  });

  it('hidden presence (null) is never a "went offline"', () => {
    expect(mergePresence({ a: true }, { a: null }).wentOffline).toEqual([]);
  });
});
