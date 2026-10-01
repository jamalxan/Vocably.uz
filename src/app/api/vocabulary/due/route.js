import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { flattenUserWords } from '@/lib/vocab/server/words';
import { isDue, overdueDays, priorityScore } from '@/lib/vocab/selection';

// GET /api/vocabulary/due?limit=50 — SRS bo'yicha hozir takrorlanishi kerak so'zlar, ustuvorlik tartibida (TZ §7.5).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const now = new Date();
    const limit = Math.max(1, Math.min(200, Number(new URL(req.url).searchParams.get('limit')) || 50));
    const due = flattenUserWords(user, { now }).filter((w) => isDue(w, now));
    due.sort((a, b) => priorityScore(b, now) - priorityScore(a, now));
    return NextResponse.json({
      total: due.length,
      overdue: due.filter((w) => overdueDays(w, now) >= 1).length,
      words: due.slice(0, limit).map((w) => ({
        wordId: w.wordId,
        categoryId: w.categoryId,
        word: w.word,
        translations: w.translations,
        mastery: w.mastery,
        weakness: w.weakness,
        overdueDays: Math.round(overdueDays(w, now) * 10) / 10,
        srsState: w.srsState,
      })),
    });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/due');
  }
}
