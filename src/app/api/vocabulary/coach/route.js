import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { coachForUser } from '@/lib/vocab/server/aiService';

// GET /api/vocabulary/coach — shaxsiy murabbiy xabari (TZ §27.4): haqiqiy o'quv ma'lumotiga asoslangan
// (takrorlash navbati, yaqindagi xatolar, seriya, vazifalar). LLM chaqirilmaydi — bepul va tezkor.
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    return NextResponse.json({ ...(await coachForUser(user)), ai: false });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/coach');
  }
}
