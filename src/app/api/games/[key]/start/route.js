import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { startGameSession } from '@/lib/vocab/server/sessionService';

// POST /api/games/:key/start — { difficulty?: 'auto'|'easy'|..., categoryId?, mode? }
// Barcha savollar BIR so'rovda qaytadi (javobsiz); to'g'ri javoblar serverda saqlanadi (TZ §37, §39).
export async function POST(req, { params }) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const body = (await readJson(req)) || {};
    const session = await startGameSession({
      user,
      gameKey: params.key,
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'auto',
      categoryId: typeof body.categoryId === 'string' ? body.categoryId : '',
      mode: typeof body.mode === 'string' ? body.mode : 'mixed',
    });
    return NextResponse.json(session);
  } catch (err) {
    return handleRouteError(err, 'games/start');
  }
}
