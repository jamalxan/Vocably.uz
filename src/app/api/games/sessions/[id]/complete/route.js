import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { completeSession } from '@/lib/vocab/server/sessionService';

// POST /api/games/sessions/:id/complete — idempotent: qayta chaqirilsa XP qayta berilmaydi (TZ §51).
export async function POST(req, props) {
  const params = await props.params;
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const result = await completeSession({ userId, sessionId: params.id });
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, 'games/complete');
  }
}
