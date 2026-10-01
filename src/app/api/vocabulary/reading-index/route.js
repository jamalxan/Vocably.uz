import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { flattenUserWords } from '@/lib/vocab/server/words';
import { statusForScore } from '@/lib/vocab/mastery';
import { isDue } from '@/lib/vocab/selection';

const MAX_WORDS = 3000;

// GET /api/vocabulary/reading-index — matnni belgilash va popup uchun foydalanuvchi lug'atining yengil nusxasi (TZ §22).
// Bitta so'rov: popup ochilganda alohida so'rov kerak emas, belgilash esa brauzerda (CSS Custom Highlight) bajariladi.
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const now = new Date();
    const words = flattenUserWords(user, { now })
      .slice(0, MAX_WORDS)
      .map((w) => ({
        wordId: w.wordId,
        categoryId: w.categoryId,
        word: w.word,
        translations: w.translations.slice(0, 4),
        definitionEn: w.definitionEn,
        example: w.examples?.[0]?.en || '',
        pos: w.pos,
        cefr: w.cefr,
        status: statusForScore(w.mastery || 0),
        mastery: Math.round(w.mastery || 0),
        weak: (w.weakness || 0) >= 40 || !!w.isLeech,
        due: isDue(w, now),
      }));
    const res = NextResponse.json({ words });
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (err) {
    return handleRouteError(err, 'vocabulary/reading-index');
  }
}
