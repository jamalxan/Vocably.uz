// /api/games, /api/gamification, /api/vocabulary route'lari uchun umumiy: autentifikatsiya,
// feature flag (TZ §61), foydalanuvchini yuklash va xatolarni JSON'ga aylantirish.
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { vocabEngineFlag } from '@/lib/vocab/access';
import { ServiceError } from './sessionService';

const DEFAULT_SELECT = 'role subscriptionTier timezone categories xp badges reviewStreak longestReviewStreak lastReviewDate streakFreezes gameStats dailyStudyMinutes targetBand vocabOnboarding name username';

/**
 * @returns {Promise<{user?: object, userId?: string, error?: NextResponse}>}
 * `select` — qaysi maydonlar kerak (categories katta bo'lishi mumkin, keraksiz bo'lsa so'ramang).
 */
export async function requireVocabUser(req, { select = DEFAULT_SELECT, ignoreFlag = false } = {}) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return { error: NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 }) };
  await connectToDatabase();
  const user = await User.findById(userId).select(select).lean();
  if (!user) return { error: NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 }) };
  if (!ignoreFlag) {
    const flag = vocabEngineFlag(String(user._id), user.role, process.env);
    if (!flag.enabled) {
      return { error: NextResponse.json({ error: "Bu funksiya hozircha sizga ochiq emas", code: 'feature_disabled' }, { status: 403 }) };
    }
  }
  return { user, userId: String(user._id) };
}

/** ServiceError -> JSON (status/code bilan), boshqa xatolar -> umumiy 500. */
export function handleRouteError(err, context) {
  if (err instanceof ServiceError) {
    return NextResponse.json({ error: err.message, code: err.code, ...(err.extra || {}) }, { status: err.status });
  }
  return serverError(err, context);
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
