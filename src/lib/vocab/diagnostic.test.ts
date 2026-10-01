import { describe, expect, it } from 'vitest';
import { DIAGNOSTIC_BANK, DIAG_LEVELS, DIAG_QUESTIONS_PER_LEVEL, buildDiagnostic, scoreDiagnostic } from './diagnostic';

const meaningOf = (id: string) => DIAGNOSTIC_BANK.find((b) => b.word === id)!.meaning;

describe('onboarding diagnostic', () => {
  it("bank: har darajada yetarli so'z, takrorlanmaydi", () => {
    for (const l of DIAG_LEVELS) expect(DIAGNOSTIC_BANK.filter((b) => b.level === l).length).toBeGreaterThanOrEqual(DIAG_QUESTIONS_PER_LEVEL + 2);
    expect(new Set(DIAGNOSTIC_BANK.map((b) => b.word)).size).toBe(DIAGNOSTIC_BANK.length);
  });

  it("savollar deterministik, 4 ta noyob variant, to'g'ri javob ichida, javob oshkor emas", () => {
    const a = buildDiagnostic('u1');
    expect(buildDiagnostic('u1')).toEqual(a);
    expect(a).toHaveLength(DIAG_LEVELS.length * DIAG_QUESTIONS_PER_LEVEL);
    for (const q of a) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(meaningOf(q.id));
      expect(Object.keys(q)).not.toContain('answer');
    }
  });

  it("hammasi to'g'ri -> C1; hammasi bilmayman -> A1", () => {
    const qs = buildDiagnostic('u2');
    expect(scoreDiagnostic('u2', qs.map((q) => ({ id: q.id, choice: meaningOf(q.id) }))).level).toBe('C1');
    const none = scoreDiagnostic('u2', qs.map((q) => ({ id: q.id, choice: null })));
    expect(none.level).toBe('A1');
    expect(none.score).toBe(0);
  });

  it("B1 gacha to'g'ri, undan keyin xato -> B1; bo'shliq darajani to'xtatadi", () => {
    const qs = buildDiagnostic('u3');
    const r = scoreDiagnostic('u3', qs.map((q) => ({ id: q.id, choice: q.level === 'A2' || q.level === 'B1' ? meaningOf(q.id) : null })));
    expect(r.level).toBe('B1');
    const gap = scoreDiagnostic('u3', qs.map((q) => ({ id: q.id, choice: q.level === 'A2' ? null : meaningOf(q.id) })));
    expect(gap.level).toBe('A1');
  });

  it("noma'lum id e'tiborga olinmaydi", () => {
    expect(scoreDiagnostic('u4', [{ id: 'zzz', choice: 'x' }]).correct).toBe(0);
  });
});
