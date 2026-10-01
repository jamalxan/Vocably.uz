import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { weakWordsForUser } from '@/lib/vocab/server/profileService';

// GET /api/vocabulary/weak?limit=100 — zaif so'zlar: aniqlik %, sabablar (past recall, ko'p xato, sekin javob,
// yomon listening/spelling/context) (TZ §20).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const limit = Math.max(1, Math.min(300, Number(new URL(req.url).searchParams.get('limit')) || 100));
    return NextResponse.json(weakWordsForUser(user, { limit }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/weak');
  }
}
