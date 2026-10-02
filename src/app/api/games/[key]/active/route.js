import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { getActiveSession } from '@/lib/vocab/server/sessionService';

// GET /api/games/:key/active — sahifa yangilanganda/ulanish tiklanganda faol sessiyani qaytaradi (TZ §38).
export async function GET(req, props) {
  const params = await props.params;
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const session = await getActiveSession({ userId, gameKey: params.key });
    return NextResponse.json({ session });
  } catch (err) {
    return handleRouteError(err, 'games/active');
  }
}
