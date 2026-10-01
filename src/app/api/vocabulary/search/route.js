import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { flattenUserWords } from '@/lib/vocab/server/words';
import { searchWords } from '@/lib/vocab/search';
import { statusForScore } from '@/lib/vocab/mastery';

// GET /api/vocabulary/search?q=&cefr=&pos=&status=&weak=1&categoryId=&limit=
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const sp = new URL(req.url).searchParams;
    const q = (sp.get('q') || '').slice(0, 80);
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50', 10) || 50));
    const words = flattenUserWords(user);
    const hits = searchWords(
      words,
      q,
      {
        cefr: sp.get('cefr') || '',
        pos: sp.get('pos') || '',
        status: sp.get('status') || '',
        weakOnly: sp.get('weak') === '1',
        categoryId: sp.get('categoryId') || '',
      },
      limit
    );
    return NextResponse.json({
      total: hits.length,
      results: hits.map((h) => ({
        wordId: h.word.wordId,
        categoryId: h.word.categoryId,
        word: h.word.word,
        translations: h.word.translations,
        definitionEn: h.word.definitionEn || '',
        cefr: h.word.cefr || '',
        pos: h.word.pos || '',
        mastery: Math.round(h.word.mastery ?? 0),
        status: statusForScore(h.word.mastery ?? 0),
        matchedIn: h.matchedIn,
      })),
    });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/search');
  }
}
