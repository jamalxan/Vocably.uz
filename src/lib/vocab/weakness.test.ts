import { describe, it, expect } from 'vitest';
import { analyzeWeakness, buildSkillProfile, gameWeights } from './weakness';

describe('analyzeWeakness (TZ §20)', () => {
  it("ko'p xato qilingan so'z zaif deb topiladi va sabablari ko'rsatiladi", () => {
    const r = analyzeWeakness({
      skills: { recall: { correct: 2, wrong: 6 }, listening: { correct: 0, wrong: 3 } },
      lapses: 3,
      avgResponseMs: 11000,
      lastWrongAt: new Date(),
    });
    expect(r.isWeak).toBe(true);
    expect(r.score).toBeGreaterThan(50);
    expect(r.reasons).toEqual(expect.arrayContaining(['low_recall', 'poor_listening', 'high_failure', 'slow_response']));
    expect(r.primarySkill).toBe('listening');
    expect(r.accuracy).toBeLessThan(40);
  });

  it("yaxshi bilinadigan so'z zaif emas", () => {
    const r = analyzeWeakness({ skills: { recall: { correct: 15, wrong: 0 }, spelling: { correct: 8, wrong: 1 } }, avgResponseMs: 2000 });
    expect(r.isWeak).toBe(false);
    expect(r.score).toBeLessThan(25);
    expect(r.accuracy).toBeGreaterThan(85);
  });

  it("urinishsiz so'z accuracy null, zaif emas", () => {
    const r = analyzeWeakness({});
    expect(r.accuracy).toBeNull();
    expect(r.isWeak).toBe(false);
  });

  it('leech har doim zaif', () => {
    expect(analyzeWeakness({ isLeech: true }).isWeak).toBe(true);
  });

  it("eski umumiy hisoblagichlar (correct/wrong) ham hisobga olinadi", () => {
    const r = analyzeWeakness({ correct: 1, wrong: 5, lapses: 3 });
    expect(r.isWeak).toBe(true);
    expect(r.reasons).toContain('low_recall');
  });

  it("yaqinda qilingan xato ball'ni oshiradi", () => {
    const now = new Date();
    const fresh = analyzeWeakness({ skills: { recall: { correct: 5, wrong: 2 } }, lastWrongAt: now }, now);
    const stale = analyzeWeakness({ skills: { recall: { correct: 5, wrong: 2 } }, lastWrongAt: new Date(now.getTime() - 20 * 86400000) }, now);
    expect(fresh.score).toBeGreaterThan(stale.score);
  });
});

describe('buildSkillProfile / gameWeights (TZ §21)', () => {
  const words = [
    { skills: { listening: { correct: 2, wrong: 8 }, spelling: { correct: 18, wrong: 1 }, context: { correct: 7, wrong: 3 } } },
    { skills: { listening: { correct: 1, wrong: 4 }, spelling: { correct: 9, wrong: 0 } } },
  ];
  it("ko'nikmalarni weak/medium/strong ga ajratadi", () => {
    const p = buildSkillProfile(words);
    expect(p.listening.level).toBe('weak');
    expect(p.spelling.level).toBe('strong');
    expect(p.context.level).toBe('medium'); // 10 urinish, 70% aniqlik
  });
  it("yetarli ma'lumot bo'lmasa unknown", () => {
    const p = buildSkillProfile([{ skills: { recall: { correct: 1, wrong: 0 } } }]);
    expect(p.recall.level).toBe('unknown');
  });
  it("zaif ko'nikma o'yinlari ↑, kuchlilari ↓", () => {
    const p = buildSkillProfile(words);
    const w = gameWeights(p, ['listen_choose', 'listen_type', 'word_match']);
    expect(w.listen_choose).toBeGreaterThan(1);
    expect(w.listen_type).toBeLessThan(1);
    expect(w.word_match).toBe(1);
  });
});
