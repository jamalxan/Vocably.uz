import { describe, expect, it } from 'vitest';
import { groupMessages, sameGroup } from './grouping';

const at = (h, min, day = 5) => new Date(2026, 10, day, h, min).toISOString();
const msg = (senderId, createdAt, extra = {}) => ({ senderId, createdAt, type: 'text', ...extra });

describe('groupMessages (WP8.2)', () => {
  it('joins consecutive messages of one sender within 5 minutes', () => {
    const list = [msg('a', at(10, 0)), msg('a', at(10, 2)), msg('a', at(10, 6))];
    expect(groupMessages(list)).toEqual([
      { first: true, last: false },
      { first: false, last: false },
      { first: false, last: true },
    ]);
  });

  it('a gap over 5 minutes or another sender starts a new group', () => {
    const list = [msg('a', at(10, 0)), msg('a', at(10, 6)), msg('b', at(10, 7)), msg('a', at(10, 8))];
    expect(groupMessages(list).every((g) => g.first && g.last)).toBe(true);
  });

  it('never groups across a day boundary (midnight)', () => {
    const list = [msg('a', at(23, 58, 5)), msg('a', at(0, 1, 6))];
    expect(groupMessages(list)).toEqual([
      { first: true, last: true },
      { first: true, last: true },
    ]);
  });

  it('call rows break groups and stand alone', () => {
    const list = [msg('a', at(9, 0)), msg('a', at(9, 1), { type: 'call' }), msg('a', at(9, 2))];
    expect(groupMessages(list).every((g) => g.first && g.last)).toBe(true);
  });

  it('deleted rows still belong to the sender group', () => {
    const list = [msg('a', at(9, 0)), msg('a', at(9, 1), { deletedForEveryone: true }), msg('a', at(9, 2))];
    expect(groupMessages(list)).toEqual([
      { first: true, last: false },
      { first: false, last: false },
      { first: false, last: true },
    ]);
  });

  it('compares sender ids as strings and tolerates bad dates', () => {
    expect(sameGroup(msg({ toString: () => 'x' }, at(9, 0)), msg('x', at(9, 1)))).toBe(true);
    expect(sameGroup(msg('a', 'nope'), msg('a', at(9, 1)))).toBe(false);
    expect(groupMessages([])).toEqual([]);
  });
});
