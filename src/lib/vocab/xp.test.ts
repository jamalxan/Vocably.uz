import { describe, it, expect } from 'vitest';
import { computeSessionXp, idempotencyKeys, levelInfo, xpForLevel } from './xp';
import { DAILY_GAME_XP_CAP, LEVEL_CONFIG, LEVEL_NAMES, XP_TABLE } from './config';

describe('daraja tizimi (TZ §14)', () => {
  it('20 ta daraja va nomlar mavjud', () => {
    expect(LEVEL_CONFIG.maxLevel).toBe(20);
    expect(LEVEL_NAMES[0]).toBe('Beginner');
    expect(LEVEL_NAMES[19]).toBe('Master');
  });
  it("XP chegaralari qat'iy o'sib boradi", () => {
    let prev = -1;
    for (let l = 1; l <= 20; l++) {
      const x = xpForLevel(l);
      expect(x).toBeGreaterThan(prev);
      prev = x;
    }
    expect(xpForLevel(1)).toBe(0);
  });
  it("0 XP — 1-daraja, progress 0", () => {
    const i = levelInfo(0);
    expect(i.level).toBe(1);
    expect(i.name).toBe('Beginner');
    expect(i.progress).toBe(0);
    expect(i.nextLevelXp).toBe(xpForLevel(2));
  });
  it("chegarada aynan keyingi darajaga o'tadi", () => {
    const need = xpForLevel(5);
    expect(levelInfo(need - 1).level).toBe(4);
    expect(levelInfo(need).level).toBe(5);
  });
  it("oxirgi darajada progress 1 va nextLevelXp null", () => {
    const i = levelInfo(10_000_000);
    expect(i.level).toBe(20);
    expect(i.progress).toBe(1);
    expect(i.nextLevelXp).toBeNull();
    expect(i.xpToNext).toBe(0);
  });
  it("manfiy yoki yaroqsiz XP 1-daraja bo'ladi", () => {
    expect(levelInfo(-50).level).toBe(1);
    expect(levelInfo(NaN as unknown as number).level).toBe(1);
  });
});

describe('computeSessionXp (TZ §12)', () => {
  const base = { difficulty: 'medium' as const, correctCount: 8, wrongCount: 2, questionCount: 10, completed: true };
  it('to\'g\'ri javoblar + yakunlash bonusi', () => {
    const r = computeSessionXp(base);
    expect(r.correct).toBe(8 * XP_TABLE.correctAnswer);
    expect(r.completion).toBe(XP_TABLE.gameComplete);
    expect(r.perfectBonus).toBe(0);
    expect(r.total).toBe(8 * XP_TABLE.correctAnswer + XP_TABLE.gameComplete);
  });
  it('mukammal sessiya bonus oladi', () => {
    const r = computeSessionXp({ ...base, correctCount: 10, wrongCount: 0 });
    expect(r.perfectBonus).toBe(XP_TABLE.perfectSessionBonus);
  });
  it("qiyinroq o'yin ko'proq XP beradi", () => {
    const easy = computeSessionXp({ ...base, difficulty: 'easy' }).total;
    const expert = computeSessionXp({ ...base, difficulty: 'expert' }).total;
    expect(expert).toBeGreaterThan(easy);
  });
  it("yakunlanmagan sessiya yakunlash bonusini olmaydi", () => {
    const r = computeSessionXp({ ...base, completed: false });
    expect(r.completion).toBe(0);
  });
  it('shubhali sessiya 0 XP', () => {
    const r = computeSessionXp({ ...base, suspicious: true });
    expect(r.total).toBe(0);
    expect(r.reason).toBe('suspicious');
  });
  it("javobsiz sessiya 0 XP", () => {
    expect(computeSessionXp({ ...base, correctCount: 0, wrongCount: 0 }).total).toBe(0);
  });
  it('kunlik chegara XP ni kesadi', () => {
    const r = computeSessionXp({ ...base, earnedTodayFromGames: DAILY_GAME_XP_CAP - 10 });
    expect(r.total).toBe(10);
    expect(r.capped).toBe(true);
    const over = computeSessionXp({ ...base, earnedTodayFromGames: DAILY_GAME_XP_CAP + 500 });
    expect(over.total).toBe(0);
  });
  it("yangi va o'zlashtirilgan so'zlar XP qo'shadi", () => {
    const r = computeSessionXp({ ...base, newWordsLearned: 2, wordsMastered: 1 });
    expect(r.newWords).toBe(2 * XP_TABLE.newWord);
    expect(r.mastered).toBe(XP_TABLE.wordMastered);
  });
});

describe('idempotency kalitlari (TZ §51)', () => {
  it('barqaror va noyob', () => {
    expect(idempotencyKeys.gameComplete('abc')).toBe('game:abc:complete');
    expect(idempotencyKeys.quest('daily_games_2', '2026-10-01')).toBe('quest:daily_games_2:2026-10-01');
    expect(idempotencyKeys.quest('x', '2026-10-01')).not.toBe(idempotencyKeys.quest('x', '2026-10-02'));
    expect(idempotencyKeys.achievement('first_word')).toBe('achievement:first_word');
  });
});
