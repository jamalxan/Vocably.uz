import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { generateExercisesForUser } from '@/lib/vocab/server/aiService';

// POST /api/vocabulary/exercises — { wordIds?: string[] } — AI mashqlar (MC / fill-gap / synonym / ...) (TZ §27.2).
// Premium; har mashq qat'iy tekshiriladi, yaroqsizlari tashlanadi; natija AI_GENERATED.
export async function POST(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const body = (await readJson(req)) || {};
    const wordIds = Array.isArray(body.wordIds) ? body.wordIds.filter((x) => typeof x === 'string').slice(0, 12) : undefined;
    return NextResponse.json(await generateExercisesForUser(user, { wordIds }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/exercises');
  }
}
