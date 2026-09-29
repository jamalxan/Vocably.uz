import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { ratingFromOutcome } from '@/lib/srs';
import { applyWordReview, logReviewEvent } from '@/lib/wordReview';
import { awardXp, xpForReview, checkAndAwardBadges, countMasteredWords } from '@/lib/gamification';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { categoryId, wordId, correct, rating: ratingInput, mode, responseMs } = await req.json();
    if (!categoryId || !wordId || typeof correct !== 'boolean') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const category = user.categories.id(categoryId);
    if (!category) return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });

    const word = category.words.id(wordId);
    if (!word) return NextResponse.json({ error: "So'z topilmadi" }, { status: 404 });

    const now = new Date();

    // Rating (1-4) hozircha faqat ba'zi rejimlardan keladi — qolganlari hali eski
    // to'g'ri/xato tugmalarini ishlatadi (FAZA 5'da 4 tugmali baholashga o'tiladi).
    const rating = [1, 2, 3, 4].includes(ratingInput) ? ratingInput : ratingFromOutcome(correct, responseMs);
    const { prevCard, result } = applyWordReview(user, word, { correct, rating, now });

    // FAZA 5 — gamifikatsiya (VOCABLY-TZ.md §13). Yutuqlar so'z holatini yangilagandan
    // KEYIN tekshiriladi — "mastered so'zlar soni" aynan shu javobdan keyingi holatni aks ettirsin.
    await awardXp(user, xpForReview(correct), 'review');
    const newBadges = checkAndAwardBadges(user, {
      masteredWords: countMasteredWords(user),
      longestStreak: user.longestReviewStreak,
    });

    await user.save();

    // Javobdan oldin kutiladi (serverless funksiya javobdan keyin to'xtatilishi
    // mumkin); xato bo'lsa faqat log qilinadi — asosiy holat allaqachon saqlangan.
    await logReviewEvent({ userId: user._id, categoryId, wordId, mode: mode || 'spaced', rating, correct, prevCard, result, now });

    return NextResponse.json({
      success: true,
      stats: word.stats,
      reviewStreak: user.reviewStreak,
      xp: user.xp,
      newBadges,
    });
  } catch (err) {
    return serverError(err, 'words/review');
  }
}
