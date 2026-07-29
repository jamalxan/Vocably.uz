import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// SM-2'ning soddalashtirilgan varianti: level (0-5) bo'yicha keyingi ko'rib chiqish oralig'i.
const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;
const WRONG_RETRY_MS = 10 * 60 * 1000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId, wordId, correct } = await req.json();
    if (!categoryId || !wordId || typeof correct !== 'boolean') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const category = user.categories.id(categoryId);
    if (!category) return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });

    const word = category.words.id(wordId);
    if (!word) return NextResponse.json({ error: "So'z topilmadi" }, { status: 404 });

    if (!word.stats) word.stats = {};
    const now = new Date();

    if (correct) {
      word.stats.level = Math.min(5, (word.stats.level || 0) + 1);
      word.stats.correct = (word.stats.correct || 0) + 1;
      word.stats.nextReview = new Date(now.getTime() + REVIEW_INTERVAL_DAYS[word.stats.level] * DAY_MS);
    } else {
      word.stats.level = 0;
      word.stats.wrong = (word.stats.wrong || 0) + 1;
      word.stats.nextReview = new Date(now.getTime() + WRONG_RETRY_MS);
    }
    word.stats.lastReviewed = now;

    const today = todayStr();
    if (user.lastReviewDate !== today) {
      const yesterday = new Date(now.getTime() - DAY_MS).toISOString().slice(0, 10);
      user.reviewStreak = user.lastReviewDate === yesterday ? (user.reviewStreak || 0) + 1 : 1;
      user.lastReviewDate = today;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      stats: word.stats,
      reviewStreak: user.reviewStreak,
    });
  } catch (err) {
    return serverError(err, 'words/review');
  }
}
