import { describe, it, expect } from 'vitest';
import { countByKind, countByStatus, filterTests, statusKind, testKind } from './testListFilter';

const T = (id, title, q) => ({ id, title, sections: { reading: { durationSec: 1200, questionCount: q } } });
const tests = [T('a', 'Printing Press, Coral Reefs, Placebo', 40), T('b', 'Reading 1: The Rosetta Stone', 13), T('c', 'Reading 2: The Steam Engine', 14)];
const statuses = { a: { status: 'graded', band: 7 }, b: { status: 'in_progress' } };

describe('testListFilter', () => {
  it('to‘liq test 40 savol, qolgani qisqa mashq', () => {
    expect(testKind(tests[0], 'reading')).toBe('full');
    expect(testKind(tests[1], 'reading')).toBe('short');
    expect(testKind({ sections: {} }, 'reading')).toBe('short');
  });

  it('holat: urinish yo‘q → boshlanmagan; graded/submitted → tugallangan; qolgani davom etmoqda', () => {
    expect(statusKind(undefined)).toBe('notStarted');
    expect(statusKind({ status: 'graded' })).toBe('done');
    expect(statusKind({ status: 'submitted' })).toBe('done');
    expect(statusKind({ status: 'in_progress' })).toBe('inProgress');
    expect(statusKind({ status: 'expired' })).toBe('inProgress');
  });

  it('filtrlar birgalikda ishlaydi va asl raqam saqlanadi', () => {
    expect(filterTests(tests, statuses, {}, 'reading').map((x) => x.index)).toEqual([0, 1, 2]);
    expect(filterTests(tests, statuses, { kind: 'short' }, 'reading').map((x) => x.index)).toEqual([1, 2]);
    expect(filterTests(tests, statuses, { status: 'notStarted' }, 'reading').map((x) => x.test.id)).toEqual(['c']);
    expect(filterTests(tests, statuses, { kind: 'short', status: 'inProgress' }, 'reading').map((x) => x.test.id)).toEqual(['b']);
    expect(filterTests(tests, statuses, { query: '  steam ' }, 'reading').map((x) => x.index)).toEqual([2]);
    expect(filterTests(tests, statuses, { query: 'zzz' }, 'reading')).toEqual([]);
  });

  it('hisoblagichlar', () => {
    expect(countByKind(tests, 'reading')).toEqual({ all: 3, full: 1, short: 2 });
    expect(countByStatus(tests, statuses)).toEqual({ all: 3, notStarted: 1, inProgress: 1, done: 1 });
  });
});
