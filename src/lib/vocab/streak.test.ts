import { describe, it, expect } from 'vitest';
import { applyStreakActivity, daysBetween, effectiveStreak, type StreakState } from './streak';

const TZ = 'Asia/Tashkent';
// Toshkent UTC+5: 2026-10-01 12:00 UTC = 17:00 Toshkent
const at = (iso: string) => new Date(iso);

const fresh: StreakState = { streak: 0, lastDate: null, freezes: 0, longest: 0 };

describe('daysBetween', () => {
  it('kunlar farqi', () => {
    expect(daysBetween('2026-10-01', '2026-10-01')).toBe(0);
    expect(daysBetween('2026-10-01', '2026-10-03')).toBe(2);
    expect(daysBetween('2026-09-30', '2026-10-01')).toBe(1);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
  });
});

describe('applyStreakActivity (TZ §15)', () => {
  it('birinchi faollik streak 1, milestone 1', () => {
    const r = applyStreakActivity(fresh, at('2026-10-01T12:00:00Z'), TZ);
    expect(r.streak).toBe(1);
    expect(r.extended).toBe(true);
    expect(r.milestone).toBe(1);
    expect(r.lastDate).toBe('2026-10-01');
  });

  it("bir kunda takroriy faollik streak ni o'zgartirmaydi", () => {
    const first = applyStreakActivity(fresh, at('2026-10-01T05:00:00Z'), TZ);
    const again = applyStreakActivity(first, at('2026-10-01T15:00:00Z'), TZ);
    expect(again.alreadyCounted).toBe(true);
    expect(again.streak).toBe(1);
    expect(again.extended).toBe(false);
  });

  it('ketma-ket kun streak ni oshiradi', () => {
    const d1 = applyStreakActivity(fresh, at('2026-10-01T12:00:00Z'), TZ);
    const d2 = applyStreakActivity(d1, at('2026-10-02T12:00:00Z'), TZ);
    expect(d2.streak).toBe(2);
    expect(d2.longest).toBe(2);
  });

  it("o'tkazib yuborilgan kun (freeze'siz) streak ni uzadi", () => {
    const s: StreakState = { streak: 5, lastDate: '2026-10-01', freezes: 0, longest: 5 };
    const r = applyStreakActivity(s, at('2026-10-03T12:00:00Z'), TZ);
    expect(r.streak).toBe(1);
    expect(r.broke).toBe(true);
    expect(r.longest).toBe(5);
  });

  it("freeze bitta o'tkazib yuborilgan kunni yopadi", () => {
    const s: StreakState = { streak: 5, lastDate: '2026-10-01', freezes: 1, longest: 5 };
    const r = applyStreakActivity(s, at('2026-10-03T12:00:00Z'), TZ);
    expect(r.streak).toBe(6);
    expect(r.freezes).toBe(0);
    expect(r.usedFreezes).toBe(1);
    expect(r.broke).toBe(false);
  });

  it("freeze yetmasa streak uziladi va freeze saqlanadi", () => {
    const s: StreakState = { streak: 9, lastDate: '2026-10-01', freezes: 1, longest: 9 };
    const r = applyStreakActivity(s, at('2026-10-05T12:00:00Z'), TZ);
    expect(r.streak).toBe(1);
    expect(r.broke).toBe(true);
    expect(r.freezes).toBe(1);
  });

  it("7 kunlik streak da yangi freeze topiladi (maksimum 2)", () => {
    const s: StreakState = { streak: 6, lastDate: '2026-10-01', freezes: 0, longest: 6 };
    const r = applyStreakActivity(s, at('2026-10-02T12:00:00Z'), TZ);
    expect(r.streak).toBe(7);
    expect(r.earnedFreeze).toBe(true);
    expect(r.freezes).toBe(1);
    expect(r.milestone).toBe(7);

    const full: StreakState = { streak: 6, lastDate: '2026-10-01', freezes: 2, longest: 6 };
    expect(applyStreakActivity(full, at('2026-10-02T12:00:00Z'), TZ).freezes).toBe(2);
  });

  it("timezone va 04:00 chegarasini hisobga oladi: 03:30 (Toshkent) hali kechagi kun", () => {
    // 2026-10-02 03:30 Toshkent = 2026-10-01 22:30 UTC -> hali 2026-10-01 hisoblanadi
    const s: StreakState = { streak: 3, lastDate: '2026-10-01', freezes: 0, longest: 3 };
    const r = applyStreakActivity(s, at('2026-10-01T22:30:00Z'), TZ);
    expect(r.alreadyCounted).toBe(true);
    expect(r.streak).toBe(3);
    // 05:00 Toshkent — yangi kun
    const next = applyStreakActivity(s, at('2026-10-02T00:00:00Z'), TZ);
    expect(next.streak).toBe(4);
  });

  it("soat orqaga surilsa (gap <= 0) streak buzilmaydi", () => {
    const s: StreakState = { streak: 4, lastDate: '2026-10-05', freezes: 0, longest: 4 };
    const r = applyStreakActivity(s, at('2026-10-03T12:00:00Z'), TZ);
    expect(r.streak).toBe(4);
    expect(r.alreadyCounted).toBe(true);
  });
});

describe('effectiveStreak — jazolamaydigan ko\'rinish (TZ §65)', () => {
  const s: StreakState = { streak: 12, lastDate: '2026-10-01', freezes: 0, longest: 12 };
  it('bugun faol — xavf yo\'q', () => {
    expect(effectiveStreak(s, at('2026-10-01T12:00:00Z'), TZ)).toEqual({ streak: 12, atRisk: false, brokenPreview: false });
  });
  it('kecha faol — xavf ostida, lekin hali uzilmagan', () => {
    expect(effectiveStreak(s, at('2026-10-02T12:00:00Z'), TZ)).toEqual({ streak: 12, atRisk: true, brokenPreview: false });
  });
  it("2+ kun o'tgan va freeze yo'q — 0", () => {
    const r = effectiveStreak(s, at('2026-10-05T12:00:00Z'), TZ);
    expect(r.streak).toBe(0);
    expect(r.brokenPreview).toBe(true);
  });
  it('freeze bo\'lsa xavf ostida', () => {
    const r = effectiveStreak({ ...s, freezes: 1 }, at('2026-10-03T12:00:00Z'), TZ);
    expect(r.streak).toBe(12);
    expect(r.atRisk).toBe(true);
  });
});
