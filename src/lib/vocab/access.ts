// Feature flag (TZ §61) va tarif cheklovlari (TZ §48). Frontend emas — BACKEND'da majburlanadi.
import { TIER_VOCAB_LIMITS, type Tier } from './config';
import { getGame, tierAllows } from './games';
import { hashSeed } from './rng';

export interface FlagEnv {
  VOCAB_ENGINE_ENABLED?: string;
  VOCAB_ENGINE_ROLLOUT_PERCENT?: string;
  VOCAB_ENGINE_ALLOWLIST?: string;
}

/** Foydalanuvchini 0..99 "chelak"ka deterministik joylaydi — rollout foizi oshganda avvalgi userlar chiqib ketmaydi. */
export function rolloutBucket(userId: string): number {
  return hashSeed(`vocab-engine:${userId}`) % 100;
}

export interface FlagResult {
  enabled: boolean;
  reason: 'disabled' | 'admin' | 'allowlist' | 'rollout' | 'outside_rollout';
  percent: number;
}

export function vocabEngineFlag(userId: string, role: string | undefined, env: FlagEnv): FlagResult {
  const rawPercent = Number(env.VOCAB_ENGINE_ROLLOUT_PERCENT ?? '100');
  const percent = isFinite(rawPercent) ? Math.max(0, Math.min(100, rawPercent)) : 100;
  if ((env.VOCAB_ENGINE_ENABLED || 'true').toLowerCase() === 'false') return { enabled: false, reason: 'disabled', percent };
  if (role === 'admin') return { enabled: true, reason: 'admin', percent };
  const allow = (env.VOCAB_ENGINE_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.includes(String(userId))) return { enabled: true, reason: 'allowlist', percent };
  if (rolloutBucket(String(userId)) < percent) return { enabled: true, reason: 'rollout', percent };
  return { enabled: false, reason: 'outside_rollout', percent };
}

export interface GameAccess {
  allowed: boolean;
  code: 'ok' | 'unknown_game' | 'tier' | 'daily_limit';
  message: string | null;
}

/** O'yinni boshlash ruxsati: tarif darajasi + kunlik sessiya limiti. */
export function checkGameAccess(tier: Tier, gameKey: string, sessionsStartedToday: number): GameAccess {
  const def = getGame(gameKey);
  if (!def) return { allowed: false, code: 'unknown_game', message: "Noma'lum o'yin" };
  if (!tierAllows(tier, def.minTier)) {
    const need = def.minTier === 'premium' ? 'Premium' : 'Standard';
    return { allowed: false, code: 'tier', message: `Bu o'yin ${need} rejada ochiladi. /narxlar sahifasidan tarifni yangilang.` };
  }
  const limit = TIER_VOCAB_LIMITS[tier].dailySessions;
  if (limit != null && sessionsStartedToday >= limit) {
    return { allowed: false, code: 'daily_limit', message: `Bugungi o'yin limiti (${limit} ta) tugadi. Ertaga davom eting yoki tarifni yangilang.` };
  }
  return { allowed: true, code: 'ok', message: null };
}
