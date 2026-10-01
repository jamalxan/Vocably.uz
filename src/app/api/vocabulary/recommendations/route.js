import { NextResponse } from 'next/server';
import { ExamAttempt } from '@/lib/models';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { weakWordsForUser } from '@/lib/vocab/server/profileService';
import { recommendFromMock } from '@/lib/vocab/recommendations';

// GET /api/vocabulary/recommendations — so'nggi Mock natijasidan lug'at zaifliklari va shaxsiy tavsiya (TZ §26):
// "15 Academic Words, 2 Listening Games, 1 Reading exercise, 1 Writing challenge, 1 Speaking challenge".
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;

    const attempt = await ExamAttempt.findOne({ userId: user._id, mode: 'mock', status: { $in: ['graded', 'submitted'] } })
      .sort({ submittedAt: -1 })
      .select('result submittedAt')
      .lean();
    const r = attempt?.result || {};
    const bands = {
      listening: r.listening?.band ?? null,
      reading: r.reading?.band ?? null,
      writing: r.writing?.band ?? null,
      speaking: r.speaking?.band ?? null,
    };
    const recommendation = recommendFromMock(bands, user.targetBand);
    const weak = weakWordsForUser(user, { limit: recommendation.academicWords });

    return NextResponse.json({
      hasMock: !!attempt,
      mockDate: attempt?.submittedAt || null,
      bands,
      targetBand: user.targetBand || null,
      recommendation,
      reviewQueue: weak.words.map((w) => ({ wordId: w.wordId, categoryId: w.categoryId, word: w.word, weakness: w.weakness })),
    });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/recommendations');
  }
}
