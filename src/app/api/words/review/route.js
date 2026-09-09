import { connectToDatabase } from '@/lib/db';
import { User, ReviewEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { nextReviewState, ratingFromOutcome, cardFromStats, levelFromIntervalDays, computeStreakUpdate } from '@/lib/srs';
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

    if (!word.stats) word.stats = {};
    const now = new Date();

    // Rating (1-4) hozircha faqat ba'zi rejimlardan keladi — qolganlari hali eski
    // to'g'ri/xato tugmalarini ishlatadi (FAZA 5'da 4 tugmali baholashga o'tiladi).
    const rating = [1, 2, 3, 4].includes(ratingInput) ? ratingInput : ratingFromOutcome(correct, responseMs);

    const prevCard = cardFromStats(word.stats);
    const result = nextReviewState(prevCard, rating, now);

    word.stats.srsState = result.state;
    word.stats.ease = result.ease;
    word.stats.intervalDays = result.intervalDays;
    word.stats.learningStep = result.learningStep;
    word.stats.lapses = result.lapses;
    word.stats.reps = result.reps;
    word.stats.isLeech = result.isLeech;
    word.stats.nextReview = result.dueAt;
    word.stats.level = levelFromIntervalDays(result.intervalDays);
    word.stats.correct = (word.stats.correct || 0) + (correct ? 1 : 0);
    word.stats.wrong = (word.stats.wrong || 0) + (correct ? 0 : 1);
    word.stats.lastReviewed = now;

    const { streak, lastReviewDate } = computeStreakUpdate(
      now,
      user.timezone || 'Asia/Tashkent',
      user.reviewStreak || 0,
      user.lastReviewDate
    );
    user.reviewStreak = streak;
    user.lastReviewDate = lastReviewDate;
    user.longestReviewStreak = Math.max(user.longestReviewStreak || 0, streak);

    // FAZA 5 — gamifikatsiya (VOCABLY-TZ.md §13). Yutuqlar so'z holatini yangilagandan
    // KEYIN tekshiriladi — "mastered so'zlar soni" aynan shu javobdan keyingi holatni aks ettirsin.
    await awardXp(user, xpForReview(correct), 'review');
    const newBadges = checkAndAwardBadges(user, {
      masteredWords: countMasteredWords(user),
      longestStreak: user.longestReviewStreak,
    });

    await user.save();

    try {
      // Serverless funksiya javob qaytargandan keyin to'xtatilishi mumkin, shuning uchun
      // bu yozuv ham javobdan oldin kutiladi — lekin xato bo'lsa faqat log qilinadi, chunki
      // asosiy so'z holati (yuqorida) allaqachon saqlangan va foydalanuvchi javobini
      // bloklamasligi kerak.
      await ReviewEvent.create({
        userId: user._id,
        categoryId,
        wordId,
        mode: mode || 'spaced',
        rating,
        isCorrect: correct,
        prevState: prevCard.state,
        newState: result.state,
        prevIntervalDays: prevCard.intervalDays,
        newIntervalDays: result.intervalDays,
        prevEase: prevCard.ease,
        newEase: result.ease,
        reviewedAt: now,
      });
    } catch (err) {
      console.error('ReviewEvent yozishda xatolik', err);
    }

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
