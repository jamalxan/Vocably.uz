// XP hisoblash, daraja formulasi va idempotency kalitlari (TZ §12-§14, §51).
// MUHIM: frontend hech qachon XP miqdorini yubormaydi — XP FAQAT serverda, tasdiqlangan
// sessiya natijasidan hisoblanadi.
import {
  DAILY_GAME_XP_CAP,
  DIFFICULTY_XP_MULTIPLIER,
  LEVEL_CONFIG,
  LEVEL_NAMES,
  XP_TABLE,
  type Difficulty,
} from './config';

// ---------------------------------------------------------------------------
// Daraja
// ---------------------------------------------------------------------------

/** Daraja N ga yetish uchun kerakli jami XP (1-daraja = 0). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const raw = LEVEL_CONFIG.base * Math.pow(level - 1, LEVEL_CONFIG.exponent);
  return Math.round(raw / 10) * 10;
}

export interface XpLevelInfo {
  level: number;
  name: string;
  xp: number;
  /** Joriy darajaning boshlanish XP'si. */
  currentLevelXp: number;
  /** Keyingi daraja uchun kerakli jami XP (oxirgi darajada null). */
  nextLevelXp: number | null;
  nextName: string | null;
  /** 0..1 */
  progress: number;
  xpToNext: number;
}

export function levelInfo(totalXp: number): XpLevelInfo {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  let level = 1;
  for (let l = 2; l <= LEVEL_CONFIG.maxLevel; l++) {
    if (xp >= xpForLevel(l)) level = l;
    else break;
  }
  const currentLevelXp = xpForLevel(level);
  const isMax = level >= LEVEL_CONFIG.maxLevel;
  const nextLevelXp = isMax ? null : xpForLevel(level + 1);
  const progress = nextLevelXp == null ? 1 : Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp));
  return {
    level,
    name: LEVEL_NAMES[level - 1],
    xp,
    currentLevelXp,
    nextLevelXp,
    nextName: isMax ? null : LEVEL_NAMES[level],
    progress,
    xpToNext: nextLevelXp == null ? 0 : nextLevelXp - xp,
  };
}

// ---------------------------------------------------------------------------
// Sessiya XP'si
// ---------------------------------------------------------------------------
export interface SessionXpInput {
  difficulty: Difficulty;
  correctCount: number;
  wrongCount: number;
  questionCount: number;
  /** Sessiya to'liq yakunlanganmi (barcha savollarga javob). */
  completed: boolean;
  /** Shubhali deb belgilangan sessiya XP bermaydi. */
  suspicious?: boolean;
  /** Bugun o'yinlardan allaqachon olingan XP (kunlik chegara uchun). */
  earnedTodayFromGames?: number;
  /** Yangi (birinchi marta to'g'ri topilgan) so'zlar soni. */
  newWordsLearned?: number;
  /** Ushbu sessiya natijasida "mastered" holatiga yetgan so'zlar soni. */
  wordsMastered?: number;
}

export interface SessionXpBreakdown {
  total: number;
  correct: number;
  completion: number;
  perfectBonus: number;
  newWords: number;
  mastered: number;
  multiplier: number;
  capped: boolean;
  reason: string | null;
}

export function computeSessionXp(input: SessionXpInput): SessionXpBreakdown {
  const zero: SessionXpBreakdown = {
    total: 0,
    correct: 0,
    completion: 0,
    perfectBonus: 0,
    newWords: 0,
    mastered: 0,
    multiplier: 1,
    capped: false,
    reason: null,
  };
  if (input.suspicious) return { ...zero, reason: 'suspicious' };
  if (input.correctCount + input.wrongCount <= 0) return { ...zero, reason: 'no_answers' };

  const multiplier = DIFFICULTY_XP_MULTIPLIER[input.difficulty] ?? 1;
  const correct = Math.round(input.correctCount * XP_TABLE.correctAnswer * multiplier);
  const completion = input.completed ? Math.round(XP_TABLE.gameComplete * multiplier) : 0;
  const isPerfect = input.completed && input.wrongCount === 0 && input.questionCount >= 5;
  const perfectBonus = isPerfect ? XP_TABLE.perfectSessionBonus : 0;
  const newWords = (input.newWordsLearned || 0) * XP_TABLE.newWord;
  const mastered = (input.wordsMastered || 0) * XP_TABLE.wordMastered;

  let total = correct + completion + perfectBonus + newWords + mastered;

  const remaining = Math.max(0, DAILY_GAME_XP_CAP - (input.earnedTodayFromGames || 0));
  let capped = false;
  if (total > remaining) {
    total = remaining;
    capped = true;
  }
  return {
    total,
    correct,
    completion,
    perfectBonus,
    newWords,
    mastered,
    multiplier,
    capped,
    reason: capped ? 'daily_cap' : null,
  };
}

// ---------------------------------------------------------------------------
// Idempotency kalitlari (TZ §13, §51) — bir hodisa ikki marta XP bermasin.
// ---------------------------------------------------------------------------
export const idempotencyKeys = {
  gameComplete: (sessionId: string) => `game:${sessionId}:complete`,
  quest: (questKey: string, periodKey: string) => `quest:${questKey}:${periodKey}`,
  achievement: (badgeKey: string) => `achievement:${badgeKey}`,
  wordMastered: (wordId: string, version: string) => `mastered:${wordId}:${version}`,
  review: (reviewId: string) => `review:${reviewId}`,
};
