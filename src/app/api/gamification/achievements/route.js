import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { BADGE_DEFS } from '@/lib/gamification';

// GET /api/gamification/achievements — barcha yutuqlar (olingan/olinmagan) (TZ §17).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role badges' });
    if (error) return error;
    const earned = new Map((user.badges || []).map((b) => [b.key, b.earnedAt]));
    const achievements = BADGE_DEFS.map((d) => ({
      key: d.key,
      label: d.label,
      icon: d.icon,
      description: d.description || '',
      earned: earned.has(d.key),
      earnedAt: earned.get(d.key) || null,
    }));
    return NextResponse.json({ achievements, earned: achievements.filter((a) => a.earned).length, total: achievements.length });
  } catch (err) {
    return handleRouteError(err, 'gamification/achievements');
  }
}
