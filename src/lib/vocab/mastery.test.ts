import { describe, it, expect } from 'vitest';
import { applySkillResult, bandLabel, computeMastery, retentionScore, speedScore, statusForScore } from './mastery';
import { MASTERY_ALGORITHM_VERSION } from './config';

describe('statusForScore (TZ §6.1 bandlari)', () => {
  it('chegaralarni to\'g\'ri xaritalaydi', () => {
    expect(statusForScore(0)).toBe('new');
    expect(statusForScore(20)).toBe('new');
    expect(statusForScore(21)).toBe('learning');
    expect(statusForScore(40)).toBe('learning');
    expect(statusForScore(41)).toBe('familiar');
    expect(statusForScore(60)).toBe('familiar');
    expect(statusForScore(61)).toBe('strong');
    expect(statusForScore(80)).toBe('strong');
    expect(statusForScore(81)).toBe('advanced');
    expect(statusForScore(95)).toBe('advanced');
    expect(statusForScore(96)).toBe('mastered');
    expect(statusForScore(100)).toBe('mastered');
  });
  it('diapazondan chiqqan qiymatlarni qisqartiradi', () => {
    expect(statusForScore(-10)).toBe('new');
    expect(statusForScore(250)).toBe('mastered');
  });
  it("o'zbekcha yorliq qaytaradi", () => {
    expect(bandLabel('mastered')).toBe("O'zlashtirilgan");
  });
});

describe('speedScore / retentionScore', () => {
  it('tez javob 1 ga, sekin javob 0 ga yaqin', () => {
    expect(speedScore(1000)).toBe(1);
    expect(speedScore(20000)).toBe(0);
    expect(speedScore(null)).toBeNull();
    const mid = speedScore(7000) as number;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
  it('lapse\'lar saqlanishni kamaytiradi', () => {
    const clean = retentionScore(30, 0, 8) as number;
    const lapsed = retentionScore(30, 4, 8) as number;
    expect(lapsed).toBeLessThan(clean);
    expect(retentionScore(0, 0, 0)).toBeNull();
  });
});

describe('computeMastery', () => {
  it("dalilsiz so'z — NEW, 0 ball", () => {
    const r = computeMastery({});
    expect(r.score).toBe(0);
    expect(r.status).toBe('new');
    expect(r.version).toBe(MASTERY_ALGORITHM_VERSION);
  });

  it("bitta to'g'ri javob yuqori mastery bermaydi (dalil omili)", () => {
    const r = computeMastery({ skills: { recall: { correct: 1, wrong: 0 } }, avgResponseMs: 1500, streakCount: 1 });
    expect(r.score).toBeLessThan(35);
  });

  it('bitta formatni ko\'p takrorlash 60 dan oshirmaydi (TZ §7.3)', () => {
    const r = computeMastery({
      skills: { recall: { correct: 40, wrong: 0 } },
      avgResponseMs: 1500,
      streakCount: 40,
      intervalDays: 10,
      reps: 40,
    });
    expect(r.formatsProven).toBe(1);
    expect(r.score).toBeLessThanOrEqual(60);
  });

  it("turli formatlarda barqaror muvaffaqiyat yuqori mastery beradi", () => {
    const r = computeMastery({
      skills: {
        recall: { correct: 12, wrong: 0 },
        listening: { correct: 8, wrong: 0 },
        spelling: { correct: 8, wrong: 0 },
        context: { correct: 8, wrong: 0 },
        writing: { correct: 4, wrong: 0 },
      },
      avgResponseMs: 2000,
      streakCount: 12,
      intervalDays: 45,
      reps: 30,
      lapses: 0,
    });
    expect(r.formatsProven).toBe(4);
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(['advanced', 'mastered']).toContain(r.status);
  });

  it('xatolar mastery ni pasaytiradi', () => {
    const good = computeMastery({ skills: { recall: { correct: 10, wrong: 0 } }, reps: 10, intervalDays: 7 });
    const bad = computeMastery({ skills: { recall: { correct: 3, wrong: 7 } }, reps: 10, intervalDays: 7, lapses: 3 });
    expect(bad.score).toBeLessThan(good.score);
  });

  it("eski (skills'siz) umumiy hisoblagichlar recall sifatida talqin qilinadi", () => {
    const legacy = computeMastery({ correct: 12, wrong: 1, reps: 13, intervalDays: 30 });
    expect(legacy.score).toBeGreaterThan(30);
    expect(legacy.dimensions.recall).not.toBeNull();
  });

  it("uzoq SRS tarixi bor eski so'z shifti 78 gacha yumshatiladi", () => {
    const r = computeMastery({ correct: 30, wrong: 1, reps: 30, intervalDays: 60, lapses: 1, streakCount: 20, avgResponseMs: 1800 });
    expect(r.score).toBeGreaterThan(60);
    expect(r.score).toBeLessThanOrEqual(78);
  });
});

describe('applySkillResult', () => {
  it("to'g'ri javob streak ni oshiradi, xato nolga tushiradi", () => {
    let s = applySkillResult({}, 'recall', true, 2000);
    s = applySkillResult(s, 'recall', true, 3000);
    expect(s.streakCount).toBe(2);
    expect(s.skills?.recall).toEqual({ correct: 2, wrong: 0 });
    s = applySkillResult(s, 'listening', false, 4000);
    expect(s.streakCount).toBe(0);
    expect(s.skills?.listening).toEqual({ correct: 0, wrong: 1 });
    expect(s.lastFormat).toBe('listening');
    expect(s.lastWrongAt).toBeTruthy();
  });
  it("birinchi recall yozuvi eski umumiy hisoblagichlarni yo'qotmaydi", () => {
    const s = applySkillResult({ correct: 9, wrong: 3 }, 'recall', true, 2000);
    expect(s.skills?.recall).toEqual({ correct: 10, wrong: 3 });
    // boshqa ko'nikma eski hisoblagichlarni o'ziga olmaydi
    const l = applySkillResult({ correct: 9, wrong: 3 }, 'listening', false, 2000);
    expect(l.skills?.listening).toEqual({ correct: 0, wrong: 1 });
  });
  it("javob vaqti eksponensial o'rtacha bilan yangilanadi", () => {
    let s = applySkillResult({}, 'recall', true, 2000);
    expect(s.avgResponseMs).toBe(2000);
    s = applySkillResult(s, 'recall', true, 4000);
    expect(s.avgResponseMs).toBe(Math.round(2000 * 0.7 + 4000 * 0.3));
  });
  it("yaroqsiz vaqt o'rtachaga ta'sir qilmaydi va asl obyektni o'zgartirmaydi", () => {
    const orig = { skills: { recall: { correct: 1, wrong: 0 } }, avgResponseMs: 2000 };
    const s = applySkillResult(orig, 'recall', true, NaN);
    expect(s.avgResponseMs).toBe(2000);
    expect(orig.skills.recall.correct).toBe(1);
  });
});
