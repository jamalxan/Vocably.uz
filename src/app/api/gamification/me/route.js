import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { levelForXp, BADGE_DEFS } from '@/lib/gamification';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(userId).select('xp badges').lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const level = levelForXp(user.xp || 0);
    const earnedKeys = new Set((user.badges || []).map((b) => b.key));
    const badges = BADGE_DEFS.map((def) => ({
      key: def.key,
      label: def.label,
      icon: def.icon,
      earned: earnedKeys.has(def.key),
      earnedAt: user.badges?.find((b) => b.key === def.key)?.earnedAt || null,
    }));

    return NextResponse.json({ xp: user.xp || 0, level, badges });
  } catch (err) {
    return serverError(err, 'gamification/me');
  }
}
