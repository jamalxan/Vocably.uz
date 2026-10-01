// Streak (TZ §15): server-side, timezone + kunlik reset vaqti (04:00), o'tkazib yuborilgan
// kun, streak freeze va takroriy faollikni hisobga oladi. Mavjud src/lib/srs.ts
// `localDateWithCutoff` dan foydalanadi — ikkala joyda ham "bugun" bir xil aniqlanadi.
import { localDateWithCutoff } from '../srs';

export const STREAK_MILESTONES = [1, 7, 30, 100, 365];
export const STREAK_FREEZE_CONFIG = { maxFreezes: 2, earnEveryDays: 7 };

export interface StreakState {
  streak: number;
  lastDate: string | null;
  freezes: number;
  longest: number;
}

export interface StreakResult extends StreakState {
  /** Shu chaqiruv streak'ni oshirdimi (yangi kunning birinchi faolligi). */
  extended: boolean;
  /** Takroriy faollik (bir xil "bugun") — hech narsa o'zgarmadi. */
  alreadyCounted: boolean;
  /** Streak uzildi va 1 dan boshlandi. */
  broke: boolean;
  /** Ishlatilgan freeze soni. */
  usedFreezes: number;
  /** Shu chaqiruvda yangi freeze topildi. */
  earnedFreeze: boolean;
  /** Yetilgan milestone (1/7/30/100/365) yoki null. */
  milestone: number | null;
}

/** 'YYYY-MM-DD' ikki sana orasidagi kunlar farqi (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(ms / 86400000);
}

export function applyStreakActivity(
  state: StreakState,
  now: Date,
  timeZone: string,
  config = STREAK_FREEZE_CONFIG
): StreakResult {
  const today = localDateWithCutoff(now, timeZone);
  const base: StreakResult = {
    ...state,
    extended: false,
    alreadyCounted: false,
    broke: false,
    usedFreezes: 0,
    earnedFreeze: false,
    milestone: null,
  };

  if (state.lastDate === today) {
    return { ...base, alreadyCounted: true };
  }

  let streak = state.streak;
  let freezes = state.freezes;
  let broke = false;
  let usedFreezes = 0;

  if (!state.lastDate) {
    streak = 1;
  } else {
    const gap = daysBetween(state.lastDate, today);
    if (gap <= 0) {
      // Soat/zona o'zgarishi tufayli "bugun" orqaga ketdi — streak o'zgarmasin.
      return { ...base, alreadyCounted: true };
    }
    if (gap === 1) {
      streak += 1;
    } else {
      const missed = gap - 1;
      if (freezes >= missed) {
        freezes -= missed;
        usedFreezes = missed;
        streak += 1;
      } else {
        streak = 1;
        broke = state.streak > 0;
      }
    }
  }

  let earnedFreeze = false;
  if (streak > 0 && streak % config.earnEveryDays === 0 && freezes < config.maxFreezes && !broke) {
    freezes += 1;
    earnedFreeze = true;
  }

  return {
    streak,
    lastDate: today,
    freezes,
    longest: Math.max(state.longest, streak),
    extended: true,
    alreadyCounted: false,
    broke,
    usedFreezes,
    earnedFreeze,
    milestone: STREAK_MILESTONES.includes(streak) ? streak : null,
  };
}

/**
 * Foydalanuvchiga ko'rsatiladigan "joriy" streak: oxirgi faollik kechadan eski bo'lsa
 * (va freeze yetmasa) streak allaqachon uzilgan — 0 ko'rsatiladi. Yumshoq (jazolamaydigan) holat:
 * bugun hali faollik bo'lmasa ham kechagi streak "xavf ostida" deb belgilanadi.
 */
export function effectiveStreak(
  state: StreakState,
  now: Date,
  timeZone: string
): { streak: number; atRisk: boolean; brokenPreview: boolean } {
  if (!state.lastDate || state.streak <= 0) return { streak: 0, atRisk: false, brokenPreview: false };
  const today = localDateWithCutoff(now, timeZone);
  const gap = daysBetween(state.lastDate, today);
  if (gap <= 0) return { streak: state.streak, atRisk: false, brokenPreview: false };
  if (gap === 1) return { streak: state.streak, atRisk: true, brokenPreview: false };
  const missed = gap - 1;
  if (state.freezes >= missed) return { streak: state.streak, atRisk: true, brokenPreview: false };
  return { streak: 0, atRisk: false, brokenPreview: true };
}
