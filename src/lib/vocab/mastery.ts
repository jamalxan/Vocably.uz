// Mastery hisoblash — TZ §6. Faqat quiz ballariga emas, recall / listening / spelling /
// context / tezlik / takroriy muvaffaqiyat / SRS retention / writing / speaking
// signallariga tayanadi. Algoritm versiyalangan (MASTERY_ALGORITHM_VERSION) — o'zgarsa
// eski natijalar yo'qolmasin, versiya maydoni bilan solishtirish mumkin bo'lsin.
import {
  MASTERY_ALGORITHM_VERSION,
  MASTERY_BANDS,
  MASTERY_FORMAT_CAPS,
  MASTERY_WEIGHTS,
  SKILL_KEYS,
  SPEED_IDEAL_MS,
  SPEED_SLOW_MS,
  type MasteryStatus,
  type SkillKey,
} from './config';

export interface SkillCounter {
  correct: number;
  wrong: number;
}

export type SkillMap = Partial<Record<SkillKey, SkillCounter>>;

/** So'z statistikasidan mastery hisoblash uchun kerakli (hammasi ixtiyoriy) maydonlar. */
export interface MasteryInput {
  skills?: SkillMap;
  avgResponseMs?: number | null;
  /** Ketma-ket to'g'ri javoblar. */
  streakCount?: number;
  /** Eski (skills'dan oldingi) umumiy hisoblagichlar — recall sifatida talqin qilinadi. */
  correct?: number;
  wrong?: number;
  intervalDays?: number;
  lapses?: number;
  reps?: number;
}

export interface MasteryResult {
  score: number;
  status: MasteryStatus;
  version: string;
  /** Har bir o'lchov uchun 0..1 (sinalmagan bo'lsa null). */
  dimensions: Record<string, number | null>;
  /** Kamida 2 urinish bo'lgan va ≥70% aniqlikdagi "format guruhlari" soni (0-4). */
  formatsProven: number;
  totalAttempts: number;
  /** 0..1 — ballga qancha ishonch bor (urinishlar soni bo'yicha). */
  confidence: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Laplace-silliqlangan aniqlik: bitta urinish 100% bermaydi. */
function smoothedAccuracy(c: SkillCounter | undefined): number | null {
  if (!c) return null;
  const attempts = (c.correct || 0) + (c.wrong || 0);
  if (attempts <= 0) return null;
  return ((c.correct || 0) + 0.5) / (attempts + 1);
}

export function speedScore(avgResponseMs: number | null | undefined): number | null {
  if (!avgResponseMs || avgResponseMs <= 0) return null;
  return clamp((SPEED_SLOW_MS - avgResponseMs) / (SPEED_SLOW_MS - SPEED_IDEAL_MS), 0, 1);
}

/** SRS oralig'i + lapse'lar bo'yicha "saqlanish" ko'rsatkichi 0..1. */
export function retentionScore(intervalDays = 0, lapses = 0, reps = 0): number | null {
  if (reps <= 0 && intervalDays <= 0) return null;
  const base = Math.log(1 + Math.max(0, intervalDays)) / Math.log(1 + 60);
  return clamp(base, 0, 1) * (1 - Math.min(0.6, lapses * 0.08));
}

export function statusForScore(score: number): MasteryStatus {
  const s = clamp(Math.round(score), 0, 100);
  for (const band of MASTERY_BANDS) {
    if (s >= band.min && s <= band.max) return band.status;
  }
  return 'new';
}

export function bandLabel(status: MasteryStatus): string {
  return MASTERY_BANDS.find((b) => b.status === status)?.label || status;
}

/** Eski umumiy hisoblagichlar bo'lsa, ularni `recall` sifatida qo'shib, skills xaritasini tayyorlaydi. */
export function effectiveSkills(input: MasteryInput): SkillMap {
  const skills: SkillMap = { ...(input.skills || {}) };
  const legacyTotal = (input.correct || 0) + (input.wrong || 0);
  if (!skills.recall && legacyTotal > 0) {
    skills.recall = { correct: input.correct || 0, wrong: input.wrong || 0 };
  }
  return skills;
}

/** Mastery ballini (0-100) va holatini hisoblaydi. */
export function computeMastery(input: MasteryInput): MasteryResult {
  const skills = effectiveSkills(input);
  const W = MASTERY_WEIGHTS;

  const dimensions: Record<string, number | null> = {};
  let weighted = 0;
  let weightSum = 0;
  let totalAttempts = 0;

  for (const key of SKILL_KEYS) {
    const acc = smoothedAccuracy(skills[key]);
    dimensions[key] = acc;
    totalAttempts += (skills[key]?.correct || 0) + (skills[key]?.wrong || 0);
    if (acc != null) {
      weighted += W[key] * acc;
      weightSum += W[key];
    }
  }

  const speed = speedScore(input.avgResponseMs);
  dimensions.speed = speed;
  if (speed != null) {
    weighted += W.speed * speed;
    weightSum += W.speed;
  }

  const streak = input.streakCount != null && totalAttempts > 0 ? clamp(input.streakCount / 6, 0, 1) : null;
  dimensions.repeatedSuccess = streak;
  if (streak != null) {
    weighted += W.repeatedSuccess * streak;
    weightSum += W.repeatedSuccess;
  }

  const retention = retentionScore(input.intervalDays, input.lapses, input.reps);
  dimensions.srsRetention = retention;
  if (retention != null) {
    weighted += W.srsRetention * retention;
    weightSum += W.srsRetention;
  }

  // Hech qanday dalil yo'q — yangi so'z.
  if (weightSum === 0 || (totalAttempts === 0 && (input.reps || 0) === 0)) {
    return {
      score: 0,
      status: 'new',
      version: MASTERY_ALGORITHM_VERSION,
      dimensions,
      formatsProven: 0,
      totalAttempts,
      confidence: 0,
    };
  }

  const raw = weighted / weightSum; // 0..1
  const evidenceBase = Math.max(totalAttempts, input.reps || 0);
  const confidence = clamp(evidenceBase / 10, 0, 1);
  // Bitta-ikkita urinishdan keyin yuqori ball chiqmasligi uchun dalil omili.
  const evidenceFactor = 0.25 + 0.75 * confidence;

  // Format guruhlari: bitta formatni ko'p takrorlash sun'iy mastery bermaydi (TZ §7.3).
  const groups: Array<SkillKey[]> = [['recall', 'synonym'], ['listening'], ['spelling'], ['context'], ['writing', 'speaking']];
  let formatsProven = 0;
  for (const g of groups) {
    let c = 0;
    let w = 0;
    for (const k of g) {
      c += skills[k]?.correct || 0;
      w += skills[k]?.wrong || 0;
    }
    if (c + w >= 2 && c / (c + w) >= 0.7) formatsProven += 1;
  }
  formatsProven = Math.min(4, formatsProven);

  // Eski (faqat recall) uzoq muddatli SRS tarixi bor so'zlar: format shifti biroz yumshoq.
  let cap = MASTERY_FORMAT_CAPS[formatsProven] ?? 100;
  if (formatsProven <= 1 && (input.intervalDays || 0) >= 21 && (input.lapses || 0) <= 2) {
    cap = Math.max(cap, 78);
  }

  const score = clamp(Math.round(Math.min(raw * evidenceFactor * 100, cap)), 0, 100);
  return {
    score,
    status: statusForScore(score),
    version: MASTERY_ALGORITHM_VERSION,
    dimensions,
    formatsProven,
    totalAttempts,
    confidence,
  };
}

export interface SkillStatsState extends MasteryInput {
  lastFormat?: SkillKey | null;
  lastWrongAt?: Date | string | null;
  lastSeenAt?: Date | string | null;
}

/**
 * Bitta javob natijasini so'z ko'nikma statistikasiga qo'shadi (sof funksiya: yangi obyekt qaytaradi).
 * `avgResponseMs` — eksponensial o'rtacha (yangi javobga 30% vazn); `streakCount` — ketma-ket to'g'ri javoblar.
 */
export function applySkillResult(
  state: SkillStatsState,
  skill: SkillKey,
  isCorrect: boolean,
  responseMs: number | null | undefined,
  now: Date = new Date()
): SkillStatsState {
  // Eski (skills'dan oldingi) umumiy hisoblagichlar bor bo'lsa, birinchi recall yozuvi ularni yo'qotmasin.
  const legacyTotal = (state.correct || 0) + (state.wrong || 0);
  const prev =
    state.skills?.[skill] ||
    (skill === 'recall' && legacyTotal > 0 ? { correct: state.correct || 0, wrong: state.wrong || 0 } : { correct: 0, wrong: 0 });
  const skills: SkillMap = {
    ...(state.skills || {}),
    [skill]: {
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    },
  };

  let avg = state.avgResponseMs ?? null;
  if (typeof responseMs === 'number' && responseMs > 0 && isFinite(responseMs)) {
    const clamped = Math.min(responseMs, 60000);
    avg = avg == null ? clamped : Math.round(avg * 0.7 + clamped * 0.3);
  }

  return {
    ...state,
    skills,
    avgResponseMs: avg,
    streakCount: isCorrect ? (state.streakCount || 0) + 1 : 0,
    lastFormat: skill,
    lastSeenAt: now,
    lastWrongAt: isCorrect ? state.lastWrongAt ?? null : now,
  };
}
