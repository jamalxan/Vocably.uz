import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { coachForUser } from '@/lib/vocab/server/aiService';
import { LANG_COOKIE, normalizeLocale } from '@/lib/i18n';

// GET /api/vocabulary/coach — shaxsiy murabbiy xabari (TZ §27.4): haqiqiy o'quv ma'lumotiga asoslangan
// (takrorlash navbati, yaqindagi xatolar, seriya, vazifalar). LLM chaqirilmaydi — bepul va tezkor.
// Til: cookie `vocably_lang` (uz/ru) — xabar serverda shu tilda tuziladi.
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const locale = normalizeLocale(req.cookies?.get?.(LANG_COOKIE)?.value);
    return NextResponse.json({ ...(await coachForUser(user, new Date(), locale)), ai: false });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/coach');
  }
}
