import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { SIGNAL_SOURCES, applySkillSignals } from '@/lib/vocab/server/signalService';

// POST /api/vocabulary/signal — { source: 'reading'|'listening'|'writing'|'speaking'|'mock',
//   items: [{ wordId?, word?, correct: boolean, added?: boolean }] }
// Ko'nikma modullaridan lug'atga signal: so'z ishlatilishi natijasi mastery'ga yoziladi (TZ §22-§26).
export async function POST(req) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const body = await readJson(req);
    if (!body || !SIGNAL_SOURCES.includes(body.source) || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    const items = body.items.map((i) => ({
      wordId: typeof i?.wordId === 'string' ? i.wordId : undefined,
      word: typeof i?.word === 'string' ? i.word.slice(0, 80) : undefined,
      correct: typeof i?.correct === 'boolean' ? i.correct : undefined,
      added: !!i?.added,
    }));
    return NextResponse.json(await applySkillSignals({ userId, source: body.source, items }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/signal');
  }
}
