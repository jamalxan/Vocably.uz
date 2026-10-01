// Weak Words Engine (TZ §20) va rule-based Personalized Learning (TZ §21).
// Zaiflik faqat umumiy ball emas: past recall, ko'p xato, sekin javob, yomon listening /
// spelling / context bo'yicha ham aniqlanadi.
import { SPEED_SLOW_MS, SKILL_KEYS, type SkillKey } from './config';
import { effectiveSkills, speedScore, type MasteryInput } from './mastery';

export type WeakReason =
  | 'low_recall'
  | 'high_failure'
  | 'slow_response'
  | 'poor_listening'
  | 'poor_spelling'
  | 'poor_context';

export const WEAK_REASON_LABELS: Record<WeakReason, string> = {
  low_recall: 'Ma\'noni eslay olmayapsiz',
  high_failure: "Ko'p xato qilingan",
  slow_response: 'Javob sekin',
  poor_listening: 'Eshitib tanish zaif',
  poor_spelling: 'Imlo zaif',
  poor_context: 'Kontekstda ishlatish zaif',
};

export interface WeakInput extends MasteryInput {
  isLeech?: boolean;
  lastWrongAt?: Date | string | null;
}

export interface WeaknessResult {
  /** 0..100 — qanchalik zaif (yuqori = zaifroq). Saralash uchun. */
  score: number;
  /** 0..100 — umumiy aniqlik foizi (ko'rsatish uchun); urinish bo'lmasa null. */
  accuracy: number | null;
  reasons: WeakReason[];
  isWeak: boolean;
  primarySkill: SkillKey | null;
  attempts: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function acc(c?: { correct: number; wrong: number }): { value: number | null; attempts: number } {
  if (!c) return { value: null, attempts: 0 };
  const attempts = (c.correct || 0) + (c.wrong || 0);
  if (!attempts) return { value: null, attempts: 0 };
  return { value: ((c.correct || 0) + 0.5) / (attempts + 1), attempts };
}

export function analyzeWeakness(input: WeakInput, now: Date = new Date()): WeaknessResult {
  const skills = effectiveSkills(input);

  let correct = 0;
  let wrong = 0;
  for (const k of SKILL_KEYS) {
    correct += skills[k]?.correct || 0;
    wrong += skills[k]?.wrong || 0;
  }
  const attempts = correct + wrong;
  const overall = attempts > 0 ? (correct + 0.5) / (attempts + 1) : null;

  const reasons: WeakReason[] = [];
  let score = 0;

  if (overall != null) score += (1 - overall) * 50;

  const recall = acc(skills.recall);
  if (recall.value != null && recall.attempts >= 2 && recall.value < 0.6) reasons.push('low_recall');
  const listening = acc(skills.listening);
  if (listening.value != null && listening.attempts >= 2 && listening.value < 0.6) reasons.push('poor_listening');
  const spelling = acc(skills.spelling);
  if (spelling.value != null && spelling.attempts >= 2 && spelling.value < 0.6) reasons.push('poor_spelling');
  const context = acc(skills.context);
  if (context.value != null && context.attempts >= 2 && context.value < 0.6) reasons.push('poor_context');
  score += Math.min(20, [recall, listening, spelling, context].filter((d) => d.value != null && d.attempts >= 2 && d.value < 0.6).length * 8);

  const lapses = input.lapses || 0;
  if (lapses >= 2 || wrong >= 4) reasons.push('high_failure');
  score += Math.min(1, lapses / 4) * 20;

  const sp = speedScore(input.avgResponseMs);
  if (input.avgResponseMs && input.avgResponseMs >= SPEED_SLOW_MS * 0.6 && attempts >= 3) reasons.push('slow_response');
  if (sp != null) score += (1 - sp) * 8;

  if (input.lastWrongAt) {
    const ageMs = now.getTime() - new Date(input.lastWrongAt).getTime();
    if (ageMs >= 0 && ageMs <= 3 * DAY_MS) score += 10 * (1 - ageMs / (3 * DAY_MS));
  }
  if (input.isLeech) score += 12;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const isWeak = !!input.isLeech || (attempts >= 3 && score >= 40);

  // Eng zaif ko'nikma
  let primarySkill: SkillKey | null = null;
  let worst = 2;
  for (const k of SKILL_KEYS) {
    const a = acc(skills[k]);
    if (a.value != null && a.attempts >= 2 && a.value < worst) {
      worst = a.value;
      primarySkill = k;
    }
  }

  return {
    score,
    accuracy: overall == null ? null : Math.round(overall * 100),
    reasons,
    isWeak,
    primarySkill,
    attempts,
  };
}

// ---------------------------------------------------------------------------
// Personalization (TZ §21) — qoidaga asoslangan MVP.
// ---------------------------------------------------------------------------
export type SkillLevel = 'weak' | 'medium' | 'strong' | 'unknown';

export interface SkillProfileEntry {
  accuracy: number | null; // 0..100
  attempts: number;
  level: SkillLevel;
}

export type SkillProfile = Record<'recall' | 'listening' | 'spelling' | 'context', SkillProfileEntry>;

const PROFILE_KEYS: Array<keyof SkillProfile> = ['recall', 'listening', 'spelling', 'context'];
const MIN_PROFILE_ATTEMPTS = 5;

/** Foydalanuvchining barcha so'zlari bo'yicha ko'nikma profilini (weak/medium/strong) hisoblaydi. */
export function buildSkillProfile(words: WeakInput[]): SkillProfile {
  const sums: Record<string, { c: number; w: number }> = {};
  for (const k of PROFILE_KEYS) sums[k] = { c: 0, w: 0 };
  for (const word of words) {
    const s = effectiveSkills(word);
    for (const k of PROFILE_KEYS) {
      sums[k].c += s[k]?.correct || 0;
      sums[k].w += s[k]?.wrong || 0;
    }
  }
  const profile = {} as SkillProfile;
  for (const k of PROFILE_KEYS) {
    const attempts = sums[k].c + sums[k].w;
    if (attempts < MIN_PROFILE_ATTEMPTS) {
      profile[k] = { accuracy: attempts ? Math.round((sums[k].c / attempts) * 100) : null, attempts, level: 'unknown' };
      continue;
    }
    const accuracy = sums[k].c / attempts;
    profile[k] = {
      accuracy: Math.round(accuracy * 100),
      attempts,
      level: accuracy < 0.6 ? 'weak' : accuracy < 0.8 ? 'medium' : 'strong',
    };
  }
  return profile;
}

/** O'yin kalit -> ko'nikma xaritasi (personalization uchun). */
export const GAME_SKILL: Record<string, keyof SkillProfile> = {
  word_match: 'recall',
  memory: 'recall',
  multiple_choice: 'recall',
  definition_challenge: 'recall',
  synonym_antonym: 'recall',
  speed_challenge: 'recall',
  listen_choose: 'listening',
  listen_type: 'spelling',
  word_drop: 'spelling',
  fill_gap: 'context',
  sentence_builder: 'context',
  image_to_word: 'recall',
  word_to_image: 'recall',
  vocabulary_boss: 'recall',
};

/**
 * Keyingi sessiya uchun o'yin vaznlari: zaif ko'nikma ↑, kuchli ↓, o'rta →.
 * Masalan listening weak, spelling strong -> listen_* ×1.6, spelling o'yinlari ×0.6.
 */
export function gameWeights(profile: SkillProfile, gameKeys: string[]): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const key of gameKeys) {
    const skill = GAME_SKILL[key];
    const level = skill ? profile[skill]?.level : 'unknown';
    weights[key] = level === 'weak' ? 1.6 : level === 'strong' ? 0.6 : 1;
  }
  return weights;
}
