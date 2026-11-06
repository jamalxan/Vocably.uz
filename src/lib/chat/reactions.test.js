import { describe, expect, it } from 'vitest';
import {
  QUICK_REACTIONS,
  applyReaction,
  groupReactions,
  isAllowedEmoji,
  myReaction,
  nextReactionFor,
  normalizeEmoji,
  serializeReactions,
} from './reactions';

const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const at = (s) => new Date(`2026-11-06T10:00:${String(s).padStart(2, '0')}Z`);

describe('emoji validation', () => {
  it('accepts the quick set', () => {
    QUICK_REACTIONS.forEach((e) => expect(isAllowedEmoji(e)).toBe(true));
  });

  it.each([
    ['ZWJ family', '👨‍👩‍👧‍👦'],
    ['ZWJ profession', '👩‍💻'],
    ['rainbow flag', '🏳️‍🌈'],
    ['country flag', '🇺🇿'],
    ['skin tone', '👍🏽'],
    ['keycap', '1️⃣'],
    ['plain', '🤖'],
  ])('accepts a single emoji: %s', (_, e) => {
    expect(normalizeEmoji(e)).toBe(e);
  });

  it.each([
    ['text', 'ab'],
    ['letter', 'a'],
    ['two emoji', '😀😀'],
    ['emoji + text', '😀a'],
    ['empty', ''],
    ['spaces', '   '],
    ['digit', '1'],
    ['too long', '👍'.repeat(20)],
    ['not a string', 42],
    ['null', null],
  ])('rejects %s', (_, e) => {
    expect(isAllowedEmoji(e)).toBe(false);
  });

  it('normalises the text-style heart to the emoji presentation and trims', () => {
    expect(normalizeEmoji('❤')).toBe('❤️');
    expect(normalizeEmoji(' 🔥 ')).toBe('🔥');
  });
});

describe('applyReaction / nextReactionFor', () => {
  it('sets, replaces (one per user) and removes', () => {
    let list = applyReaction([], { userId: A, emoji: '❤️', at: at(1) });
    list = applyReaction(list, { userId: B, emoji: '❤️', at: at(2) });
    expect(list).toHaveLength(2);
    list = applyReaction(list, { userId: A, emoji: '👍', at: at(3) });
    expect(list.map((r) => [r.userId, r.emoji])).toEqual([[B, '❤️'], [A, '👍']]);
    list = applyReaction(list, { userId: A, emoji: null });
    expect(list.map((r) => r.userId)).toEqual([B]);
  });

  it('does not mutate the input and tolerates ObjectId-like ids', () => {
    const src = [{ emoji: '❤️', userId: { toString: () => A }, at: at(1) }];
    const out = applyReaction(src, { userId: A, emoji: null });
    expect(out).toEqual([]);
    expect(src).toHaveLength(1);
  });

  it('toggle: the same emoji removes, another emoji replaces', () => {
    const list = [{ emoji: '❤️', userId: A, at: at(1) }];
    expect(myReaction(list, A)).toBe('❤️');
    expect(myReaction(list, B)).toBeNull();
    expect(nextReactionFor(list, A, '❤️')).toBeNull();
    expect(nextReactionFor(list, A, '👍')).toBe('👍');
    expect(nextReactionFor(list, B, '❤️')).toBe('❤️');
  });
});

describe('groupReactions', () => {
  it('counts, marks mine and orders by the first reaction of each emoji', () => {
    const list = [
      { emoji: '👍', userId: B, at: at(5) },
      { emoji: '❤️', userId: A, at: at(1) },
      { emoji: '👍', userId: 'c'.repeat(24), at: at(2) },
    ];
    expect(groupReactions(list, A)).toEqual([
      { emoji: '❤️', count: 1, mine: true },
      { emoji: '👍', count: 2, mine: false },
    ]);
  });

  it('a later reaction with an existing emoji does not move the chip', () => {
    const list = [
      { emoji: '🔥', userId: A, at: at(1) },
      { emoji: '❤️', userId: B, at: at(2) },
    ];
    const after = applyReaction(list, { userId: A, emoji: '❤️', at: at(3) });
    expect(groupReactions(after, B)).toEqual([{ emoji: '❤️', count: 2, mine: true }]);
  });

  it('empty / missing input', () => {
    expect(groupReactions(undefined, A)).toEqual([]);
    expect(groupReactions([{ userId: A }], A)).toEqual([]);
  });
});

describe('serializeReactions', () => {
  it('stringifies ids and dates', () => {
    expect(serializeReactions([{ emoji: '❤️', userId: { toString: () => A }, at: at(1) }])).toEqual([
      { emoji: '❤️', userId: A, at: '2026-11-06T10:00:01.000Z' },
    ]);
    expect(serializeReactions(undefined)).toEqual([]);
  });
});
