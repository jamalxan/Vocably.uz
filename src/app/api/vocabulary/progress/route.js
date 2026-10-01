import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { userProgress } from '@/lib/vocab/server/analyticsService';

// GET /api/vocabulary/progress?days=7|30|90 — foydalanuvchi analytics (TZ §33).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role timezone' });
    if (error) return error;
    const days = Number(new URL(req.url).searchParams.get('days')) || 30;
    return NextResponse.json(await userProgress({ user, days }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/progress');
  }
}
