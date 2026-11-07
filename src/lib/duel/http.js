import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/chatAuth';
import { requestTranslationLang } from '@/lib/vocab/translationLang';
import { localizeDuelPayload } from './rules';

// Shared plumbing for /api/duels/* routes (TZ 2.0 §6.8.4).
const MESSAGES = {
  bad_mode: "Duel turi noto'g'ri",
  bad_username: "Foydalanuvchi nomi noto'g'ri",
  user_not_found: 'Bunday foydalanuvchi topilmadi',
  self: "O'zingizni duelga chaqira olmaysiz",
  too_many_open: "Javobsiz duellar juda ko'p — avval ular tugashini kuting",
  no_words: "Duel uchun so'zlar yetarli emas",
  not_found: 'Duel topilmadi',
  not_invited: 'Bu duel boshqa foydalanuvchi uchun',
  already_invited: "Bu do'stga chaqiruv allaqachon yuborilgan — javobini kuting",
  invite_limit: "Bu do'st bugun chaqiruvlarni rad etdi — ertaga qayta urinib ko'ring",
  closed: 'Bu duelga endi qo‘shilib bo‘lmaydi',
  not_player: 'Siz bu duel ishtirokchisi emassiz',
  finished: 'Siz bu duelni allaqachon tugatgansiz',
  stale: 'Bu savol allaqachon javoblangan',
  busy: 'Qayta urinib ko‘ring',
  not_finished: 'Avval duelni tugating',
  word_limit: "Lug'at limiti to'lgan",
  rate_limited: "Juda ko'p so'rov — biroz kuting",
};

/**
 * Runs `fn(userId, now)` for a signed-in user, with an optional per-minute rate limit. `now` is taken before
 * auth / DB round trips so an answer's time is measured from when the request arrived, not when it was graded.
 */
export async function duelRoute(req, label, fn, { limit } = {}) {
  const now = new Date();
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    if (limit && !(await checkRateLimit(String(userId), `duel:${label}`, limit))) {
      return NextResponse.json({ error: MESSAGES.rate_limited, code: 'rate_limited' }, { status: 429 });
    }
    const out = await fn(String(userId), now);
    if (out?.error) {
      const { error, status, ...rest } = out;
      return NextResponse.json({ error: MESSAGES[error] || error, code: error, ...rest }, { status: status || 400 });
    }
    // Questions/review in the player's translation language (UI ru -> Russian meanings).
    return NextResponse.json(localizeDuelPayload(out, requestTranslationLang(req)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, `duels/${label}`);
  }
}

export async function readJson(req) {
  try {
    const body = await req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}
