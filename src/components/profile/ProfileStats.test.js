import { describe, it, expect } from 'vitest';
import { skillSummary, trendPoints } from './ProfileStats';

const H = [
  // newest first, as /api/exam/attempts/history returns it
  { id: 'c', mode: 'section', submittedAt: '2026-09-28T10:00:00Z', testTitle: 'T3', overall: null, listening: null, reading: 7, writing: null, speaking: null },
  { id: 'b', mode: 'mock', submittedAt: '2026-09-20T10:00:00Z', testTitle: 'T2', overall: 6.5, listening: 6.5, reading: 6, writing: 6, speaking: 7 },
  { id: 'a', mode: 'section', submittedAt: '2026-09-10T10:00:00Z', testTitle: 'T1', overall: null, listening: 5.5, reading: 7.5, writing: null, speaking: null },
];

describe('skillSummary', () => {
  it('latest is the newest graded attempt, best the maximum', () => {
    const s = skillSummary(H);
    expect(s.reading).toEqual({ latest: 7, best: 7.5, attempts: 3 });
    expect(s.listening).toEqual({ latest: 6.5, best: 6.5, attempts: 2 });
    expect(s.speaking).toEqual({ latest: 7, best: 7, attempts: 1 });
  });
  it('an untouched skill has no band', () => {
    expect(skillSummary([]).writing).toEqual({ latest: null, best: null, attempts: 0 });
  });
});

describe('trendPoints', () => {
  it('is chronological, uses overall for a mock and the section mean otherwise', () => {
    const pts = trendPoints(H);
    expect(pts.map((p) => p.value)).toEqual([6.5, 6.5, 7]);
    expect(pts.map((p) => p.mock)).toEqual([false, true, false]);
  });
  it('skips unsubmitted and ungraded attempts', () => {
    expect(trendPoints([{ submittedAt: null, reading: 6 }, { submittedAt: 'x', reading: null }])).toEqual([]);
  });
});
