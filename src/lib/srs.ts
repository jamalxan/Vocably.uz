// SRS (spaced repetition) engine — SM-2 asosida, sozlangan variant.
// docs/VOCABLY_REDESIGN_SPEC.md §6.2 ga asoslangan, lekin joriy ma'lumotlar modeliga moslashtirilgan:
// so'zlar alohida jadvalda emas, User hujjati ichida embedded, shuning uchun bu yerda faqat
// sof, holatsiz funksiyalar bor — chaqiruvchi (API route) joriy holatni o'qib, natijani saqlaydi.

export type SrsState = 'new' | 'learning' | 'review' | 'relearning';

// 1=again(bilmadim) 2=hard(qiyin) 3=good(bildim) 4=easy(oson)
export type SrsRating = 1 | 2 | 3 | 4;

export interface SrsCard {
  state: SrsState;
  ease: number; // 1.3–3.0
  intervalDays: number; // fractional kun
  learningStep: number; // LEARNING_STEPS_MIN indeksi
  lapses: number;
  reps: number;
}

export interface SrsResult extends SrsCard {
  dueAt: Date;
  isLeech: boolean;
}

export const LEARNING_STEPS_MIN = [1, 10, 24 * 60]; // 1 daq, 10 daq, 1 kun
export const GRADUATING_INTERVAL_DAYS = 1;
export const EASY_INTERVAL_DAYS = 4;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const LEECH_THRESHOLD = 8;
export const MAX_INTERVAL_DAYS = 365;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export function newCard(): SrsCard {
  return { state: 'new', ease: 2.5, intervalDays: 0, learningStep: 0, lapses: 0, reps: 0 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Foydalanuvchi bitta so'zga rating bergandan keyin keyingi holatni hisoblaydi.
 * `rand` — 0..1 oralig'idagi tasodifiy son generatori; testlarda determinizm uchun almashtiriladi
 * (interval fuzz'ini bir kunga hamma so'z to'planib qolmasligi uchun ishlatamiz).
 */
export function nextReviewState(
  card: SrsCard,
  rating: SrsRating,
  now: Date = new Date(),
  rand: () => number = Math.random
): SrsResult {
  const reps = card.reps + 1;

  if (card.state === 'new' || card.state === 'learning' || card.state === 'relearning') {
    let { ease, learningStep, lapses } = card;
    let state: SrsState = 'learning';
    let intervalDays = card.intervalDays;

    if (rating === 1) {
      learningStep = 0;
      state = card.state === 'relearning' ? 'relearning' : 'learning';
    } else if (rating === 2) {
      // bosqich o'zgarmaydi, faqat qayta ko'rsatiladi
      state = card.state === 'relearning' ? 'relearning' : 'learning';
    } else if (rating === 3) {
      learningStep += 1;
      if (learningStep >= LEARNING_STEPS_MIN.length) {
        const dueAt = new Date(now.getTime() + GRADUATING_INTERVAL_DAYS * DAY_MS);
        return {
          state: 'review',
          ease,
          intervalDays: GRADUATING_INTERVAL_DAYS,
          learningStep: 0,
          lapses,
          reps,
          dueAt,
          isLeech: lapses >= LEECH_THRESHOLD,
        };
      }
      state = card.state === 'relearning' ? 'relearning' : 'learning';
    } else {
      // rating === 4 (oson) — darrov review holatiga o'tadi
      const dueAt = new Date(now.getTime() + EASY_INTERVAL_DAYS * DAY_MS);
      return {
        state: 'review',
        ease,
        intervalDays: EASY_INTERVAL_DAYS,
        learningStep: 0,
        lapses,
        reps,
        dueAt,
        isLeech: lapses >= LEECH_THRESHOLD,
      };
    }

    const dueAt = new Date(now.getTime() + LEARNING_STEPS_MIN[learningStep] * MINUTE_MS);
    return { state, ease, intervalDays, learningStep, lapses, reps, dueAt, isLeech: lapses >= LEECH_THRESHOLD };
  }

  // state === 'review'
  let { ease, lapses } = card;
  let intervalDays = card.intervalDays;

  if (rating === 1) {
    lapses += 1;
    ease = clamp(ease - 0.2, MIN_EASE, MAX_EASE);
    intervalDays = Math.max(1, intervalDays * 0.5);
    const dueAt = new Date(now.getTime() + LEARNING_STEPS_MIN[0] * MINUTE_MS);
    return {
      state: 'relearning',
      ease,
      intervalDays,
      learningStep: 0,
      lapses,
      reps,
      dueAt,
      isLeech: lapses >= LEECH_THRESHOLD,
    };
  }

  if (rating === 2) {
    ease = clamp(ease - 0.15, MIN_EASE, MAX_EASE);
    intervalDays = intervalDays * 1.2;
  } else if (rating === 3) {
    intervalDays = intervalDays * ease;
  } else {
    ease = clamp(ease + 0.15, MIN_EASE, MAX_EASE);
    intervalDays = intervalDays * ease * 1.3;
  }

  intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);
  const fuzz = 0.95 + rand() * 0.1; // 0.95..1.05
  intervalDays = intervalDays * fuzz;

  const dueAt = new Date(now.getTime() + intervalDays * DAY_MS);
  return {
    state: 'review',
    ease,
    intervalDays,
    learningStep: 0,
    lapses,
    reps,
    dueAt,
    isLeech: lapses >= LEECH_THRESHOLD,
  };
}

/**
 * Avtomatik baholanadigan rejimlar (typing/quiz/matching) uchun: to'g'ri/tez -> 3,
 * to'g'ri/sekin -> 2, xato -> 1. Spec §6.2.
 */
export function ratingFromOutcome(isCorrect: boolean, responseMs?: number): SrsRating {
  if (!isCorrect) return 1;
  if (typeof responseMs === 'number' && responseMs > 8000) return 2;
  return 3;
}

/**
 * Eski (SM-2 dan oldingi) flat-lookup ma'lumotidan bir martalik ko'chirish: `ease`/`state`
 * kabi yangi maydonlar hali yo'q so'zlar birinchi marta shu enjin orqali ko'rib chiqilganda
 * chaqiriladi, shunda ular butunlay "new" holatidan boshlanib, oldingi progressini yo'qotmaydi.
 */
const LEGACY_LEVEL_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

export function migrateLegacyCard(legacy: { level?: number; correct?: number; wrong?: number }): SrsCard {
  const level = clamp(legacy.level ?? 0, 0, 5);
  if (level <= 0) {
    return { ...newCard(), reps: legacy.wrong ?? 0 };
  }
  return {
    state: 'review',
    ease: 2.5,
    intervalDays: LEGACY_LEVEL_INTERVAL_DAYS[level],
    learningStep: 0,
    lapses: legacy.wrong ?? 0,
    reps: legacy.correct ?? level,
  };
}

export interface LegacyStats {
  level?: number;
  correct?: number;
  wrong?: number;
  srsState?: SrsState;
  ease?: number;
  intervalDays?: number;
  learningStep?: number;
  lapses?: number;
  reps?: number;
}

/**
 * So'z hali yangi SRS enjini orqali o'tmaganini aniqlaydi: yangi maydonlar (reps/intervalDays/
 * srsState) hali "tegilmagan" (default holatda) bo'lsa-yu, eski flat-lookup maydonlarida
 * (level/correct/wrong) haqiqiy progress ko'rinsa — bu FAZA 2'dan oldingi so'z, bir martalik
 * ko'chirish kerak. Ikkalasi ham bo'sh bo'lsa — haqiqatan ham yangi so'z, "new" holatida qoladi.
 */
export function needsLegacyMigration(stats: LegacyStats): boolean {
  const untouchedByEngine =
    (stats.reps || 0) === 0 && (stats.intervalDays || 0) === 0 && (stats.srsState || 'new') === 'new';
  const hasLegacyActivity = (stats.level || 0) > 0 || (stats.correct || 0) > 0 || (stats.wrong || 0) > 0;
  return untouchedByEngine && hasLegacyActivity;
}

/** Saqlangan `WordStats`dan joriy `SrsCard`ni tiklaydi — kerak bo'lsa eski ma'lumotni ko'chiradi. */
export function cardFromStats(stats: LegacyStats): SrsCard {
  if (needsLegacyMigration(stats)) return migrateLegacyCard(stats);
  if (!stats.srsState) return newCard();
  return {
    state: stats.srsState,
    ease: stats.ease ?? 2.5,
    intervalDays: stats.intervalDays ?? 0,
    learningStep: stats.learningStep ?? 0,
    lapses: stats.lapses ?? 0,
    reps: stats.reps ?? 0,
  };
}

/** Dashboard/UI'dagi eski 0-5 "level" ko'rsatkichi bilan moslik uchun — spec §5.2 mastery bosqichlariga mos. */
export function levelFromIntervalDays(intervalDays: number): number {
  if (intervalDays >= 21) return 5;
  if (intervalDays >= 14) return 4;
  if (intervalDays >= 7) return 3;
  if (intervalDays >= 3) return 2;
  if (intervalDays >= 1) return 1;
  return 0;
}

/**
 * `date`ni `timeZone`dagi mahalliy sanaga aylantiradi, lekin 04:00'gacha bo'lgan vaqtni
 * hali "kechagi kun" deb hisoblaydi (spec §5.4 — kechasi o'qigan foydalanuvchi uchun streak
 * adolatliligi). Natija 'YYYY-MM-DD'.
 */
export function localDateWithCutoff(date: Date, timeZone: string, cutoffHour = 4): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  let year = Number(map.year);
  let month = Number(map.month); // 1-12
  let day = Number(map.day);
  const hour = Number(map.hour) % 24; // Intl ba'zan 24:00'ni "24" deb qaytaradi

  if (hour < cutoffHour) {
    const shifted = new Date(Date.UTC(year, month - 1, day));
    shifted.setUTCDate(shifted.getUTCDate() - 1);
    year = shifted.getUTCFullYear();
    month = shifted.getUTCMonth() + 1;
    day = shifted.getUTCDate();
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Berilgan kategoriyadagi so'zlardan hozir due bo'lganlarini ajratadi — RangeSetupForm'ning
 * "Bugungi so'zlar bilan boshlash" tezkor tugmasi (U1) barcha rejimlarda shu bitta funksiyadan
 * foydalanadi, har birida alohida-alohida filter yozilmasin deb.
 */
export function dueWordsInCategory(words: Array<{ stats?: { nextReview?: string | Date } }>, now: Date = new Date()) {
  const nowMs = now.getTime();
  return words.filter((w) => {
    const next = w.stats?.nextReview ? new Date(w.stats.nextReview).getTime() : 0;
    return next <= nowMs;
  });
}

export interface StreakUpdate {
  streak: number;
  lastReviewDate: string;
}

/**
 * Bugungi (cutoff hisobga olingan) sana bilan foydalanuvchining oxirgi takrorlagan sanasini
 * solishtirib, streak'ni yangilaydi. Bir kunda bir nechta marta chaqirilsa (bir xil "bugun"),
 * streak o'zgarmaydi — faqat birinchi takrorlashda oshadi.
 */
export function computeStreakUpdate(
  now: Date,
  timeZone: string,
  currentStreak: number,
  lastReviewDate: string | null
): StreakUpdate {
  const today = localDateWithCutoff(now, timeZone);
  if (lastReviewDate === today) {
    return { streak: currentStreak, lastReviewDate: today };
  }
  const yesterday = localDateWithCutoff(new Date(now.getTime() - DAY_MS), timeZone);
  const streak = lastReviewDate === yesterday ? currentStreak + 1 : 1;
  return { streak, lastReviewDate: today };
}
