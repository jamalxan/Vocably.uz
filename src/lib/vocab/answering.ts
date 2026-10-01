// Javobni SERVERDA tekshirish, ball hisoblash va adaptiv qiyinlik (TZ §10, §11, §39).
// Klient hech qachon "isCorrect" yoki XP yubormaydi — faqat xom javob + vaqt; natija shu yerda hisoblanadi.
import { levenshtein } from '../levenshtein';
import { normalizeForCompare } from '../textCompare';
import { DIFFICULTIES, type Difficulty } from './config';
import type { GameQuestion } from './games';

export interface Verdict {
  isCorrect: boolean;
  /** Yozma javob: 1 harf xato (qisman yaqin) — to'g'ri hisoblanmaydi, lekin ogohlantiriladi. */
  near?: boolean;
  /** match: chap id -> to'g'rimi */
  partResults?: Record<string, boolean>;
  correctParts?: number;
  totalParts?: number;
}

function normSentence(s: string): string {
  return normalizeForCompare(String(s || ''))
    .replace(/[.,!?;:"“”()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bitta savolga berilgan XOM javobni tekshiradi. */
export function validateAnswer(q: GameQuestion, raw: unknown): Verdict {
  switch (q.inputType) {
    case 'choice': {
      const id = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
      return { isCorrect: id !== '' && id === q.answer };
    }
    case 'typed': {
      const typed = normalizeForCompare(typeof raw === 'string' ? raw : '');
      if (!typed) return { isCorrect: false };
      const accepted = q.accepted || [];
      if (accepted.includes(typed)) return { isCorrect: true };
      const near = accepted.some((a) => a.length >= 5 && levenshtein(typed, a) === 1);
      return { isCorrect: false, near };
    }
    case 'arrange': {
      const parts = Array.isArray(raw) ? (raw as unknown[]).map((t) => String(t)) : typeof raw === 'string' ? raw.trim().split(/\s+/) : [];
      const expected = normSentence((q.answerTokens || []).join(' '));
      return { isCorrect: parts.length > 0 && normSentence(parts.join(' ')) === expected };
    }
    case 'match': {
      const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, string>) : {};
      const expected = q.answerMap || {};
      const partResults: Record<string, boolean> = {};
      let correctParts = 0;
      const ids = Object.keys(expected);
      for (const leftId of ids) {
        const ok = map[leftId] === expected[leftId];
        partResults[leftId] = ok;
        if (ok) correctParts += 1;
      }
      return { isCorrect: ids.length > 0 && correctParts === ids.length, partResults, correctParts, totalParts: ids.length };
    }
    default:
      return { isCorrect: false };
  }
}

/** Savol necha "birlik" (javob) hisoblanadi: juftlik savoli — har juftlik alohida. */
export function questionUnits(q: Pick<GameQuestion, 'inputType' | 'answerMap' | 'lefts'>): number {
  if (q.inputType === 'match') return Object.keys(q.answerMap || {}).length || q.lefts?.length || 1;
  return 1;
}

// ---------------------------------------------------------------------------
// Ball
// ---------------------------------------------------------------------------
export interface ScoredAnswer {
  isCorrect: boolean;
  responseMs: number;
  timeLimitSec?: number | null;
  /** match: to'g'ri/jami juftliklar */
  correctParts?: number;
  totalParts?: number;
}

export interface SessionScore {
  score: number;
  maxCombo: number;
  correctUnits: number;
  wrongUnits: number;
  accuracy: number; // 0..1
  avgResponseMs: number;
}

const BASE_POINTS = 100;
const SPEED_BONUS_MAX = 50;
const COMBO_STEP = 5;
const COMBO_CAP = 10;

export function scoreSession(answers: ScoredAnswer[]): SessionScore {
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let correctUnits = 0;
  let wrongUnits = 0;
  let msSum = 0;
  let msCount = 0;

  for (const a of answers) {
    const total = a.totalParts ?? 1;
    const correct = a.totalParts != null ? a.correctParts || 0 : a.isCorrect ? 1 : 0;
    const wrong = total - correct;
    correctUnits += correct;
    wrongUnits += wrong;

    if (a.responseMs > 0 && isFinite(a.responseMs)) {
      msSum += a.responseMs;
      msCount += 1;
    }

    const limitMs = a.timeLimitSec ? a.timeLimitSec * 1000 : 10000;
    const fraction = Math.max(0, 1 - Math.min(a.responseMs, limitMs) / limitMs);
    const speedBonus = Math.round(SPEED_BONUS_MAX * fraction);

    if (a.totalParts != null) {
      // Juftlik savoli: har to'g'ri juftlik uchun alohida ball; to'liq to'g'ri bo'lsa tezlik + combo.
      score += correct * 60;
      if (a.isCorrect) {
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        score += speedBonus + Math.min(combo, COMBO_CAP) * COMBO_STEP;
      } else {
        combo = 0;
      }
    } else if (a.isCorrect) {
      combo += 1;
      maxCombo = Math.max(maxCombo, combo);
      score += BASE_POINTS + speedBonus + Math.min(combo, COMBO_CAP) * COMBO_STEP;
    } else {
      combo = 0;
    }
  }

  const units = correctUnits + wrongUnits;
  return {
    score,
    maxCombo,
    correctUnits,
    wrongUnits,
    accuracy: units > 0 ? correctUnits / units : 0,
    avgResponseMs: msCount ? Math.round(msSum / msCount) : 0,
  };
}

// ---------------------------------------------------------------------------
// Adaptiv qiyinlik (TZ §10)
// ---------------------------------------------------------------------------
export interface DifficultyHistoryEntry {
  difficulty: Difficulty;
  accuracy: number; // 0..1
  avgResponseMs: number;
}

export interface SuggestInput {
  /** Shu o'yin bo'yicha eng so'nggi sessiyalar (yangisi birinchi). */
  history: DifficultyHistoryEntry[];
  /** So'zlarning o'rtacha mastery balli (0..100). */
  avgMastery?: number | null;
  /** Hozirgi qulay tezlik (ms) — shundan tez va aniq bo'lsa qiyinlashadi. */
  fastMs?: number;
}

function shift(d: Difficulty, by: number): Difficulty {
  const i = Math.max(0, Math.min(DIFFICULTIES.length - 1, DIFFICULTIES.indexOf(d) + by));
  return DIFFICULTIES[i];
}

/** Keyingi sessiya uchun tavsiya etilgan qiyinlik. */
export function suggestDifficulty({ history, avgMastery, fastMs = 4500 }: SuggestInput): Difficulty {
  if (!history.length) {
    if (avgMastery == null) return 'medium';
    if (avgMastery < 25) return 'easy';
    if (avgMastery < 55) return 'medium';
    if (avgMastery < 80) return 'hard';
    return 'expert';
  }
  const last = history[0];
  const recent = history.slice(0, 3);
  const avgAcc = recent.reduce((s, h) => s + h.accuracy, 0) / recent.length;

  if (last.accuracy < 0.55 || (recent.length >= 2 && avgAcc < 0.6)) return shift(last.difficulty, -1);
  const fast = last.avgResponseMs > 0 && last.avgResponseMs <= fastMs;
  if (last.accuracy >= 0.9 && fast && (recent.length < 2 || avgAcc >= 0.85)) return shift(last.difficulty, +1);
  if (last.accuracy >= 0.85 && recent.length >= 2 && avgAcc >= 0.85) return shift(last.difficulty, +1);
  return last.difficulty;
}
