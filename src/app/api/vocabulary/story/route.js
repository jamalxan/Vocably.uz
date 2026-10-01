import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { generateStoryForUser } from '@/lib/vocab/server/aiService';

// POST /api/vocabulary/story — { wordIds?: string[] } — o'rganilgan so'zlardan AI mini hikoya (TZ §27.3).
// Premium; rate limit + kunlik kvota; natija AI_GENERATED va production kontentga avtomatik tushmaydi (TZ §28).
export async function POST(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const body = (await readJson(req)) || {};
    const wordIds = Array.isArray(body.wordIds) ? body.wordIds.filter((x) => typeof x === 'string').slice(0, 12) : undefined;
    return NextResponse.json(await generateStoryForUser(user, { wordIds }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/story');
  }
}
