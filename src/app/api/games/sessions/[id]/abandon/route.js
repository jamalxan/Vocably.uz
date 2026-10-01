import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { abandonSession } from '@/lib/vocab/server/sessionService';

// POST /api/games/sessions/:id/abandon — foydalanuvchi o'yinni tark etdi (XP berilmaydi).
export async function POST(req, { params }) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const out = await abandonSession({ userId, sessionId: params.id });
    return NextResponse.json(out);
  } catch (err) {
    return handleRouteError(err, 'games/abandon');
  }
}
