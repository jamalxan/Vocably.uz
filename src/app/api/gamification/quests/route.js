import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { getQuestViews } from '@/lib/vocab/server/questService';

// GET /api/gamification/quests — joriy kunlik va haftalik vazifalar (TZ §16).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role timezone' });
    if (error) return error;
    const quests = await getQuestViews({ userId: user._id, timeZone: user.timezone || 'Asia/Tashkent' });
    return NextResponse.json(quests);
  } catch (err) {
    return handleRouteError(err, 'gamification/quests');
  }
}
