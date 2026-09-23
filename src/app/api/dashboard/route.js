import { connectToDatabase } from '@/lib/db';
import { User, ReviewEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { cardFromStats, localDateWithCutoff, LEECH_THRESHOLD } from '@/lib/srs';
import { getAttemptHistory } from '@/lib/exam/attemptServer';
import { NextResponse } from 'next/server';

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_WINDOW_DAYS = 30;
// ReviewEvent'lar UTC bo'yicha vaqt tamg'asiga ega, lekin "kun" chegarasi foydalanuvchi
// timezone'i + 04:00 kesimiga bog'liq (src/lib/srs.ts). Aniq DST-hisobli UTC oralig'ini
// hisoblashning o'rniga, Mongo'dan biroz kengroq oyna (bufer bilan) olib, aniq guruhlashni
// JS'da localDateWithCutoff orqali qilamiz — kichik foydalanuvchi hajmida bu yetarlicha tez.
async function fetchRecentEvents(userId, now) {
  const windowStart = new Date(now.getTime() - (ACTIVITY_WINDOW_DAYS + 2) * DAY_MS);
  return ReviewEvent.find({ userId, reviewedAt: { $gte: windowStart } })
    .select('reviewedAt isCorrect')
    .lean();
}

function lastNLocalDates(now, timeZone, n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(localDateWithCutoff(new Date(now.getTime() - i * DAY_MS), timeZone));
  }
  return dates;
}

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    // Faqat o'qish uchun (bu route hech qachon userni saqlamaydi) — .lean() hydratsiya
    // xarajatini o'tkazib yuboradi, katta `categories` massivi uchun sezilarli farq qiladi.
    const user = await User.findById(userId)
      .select(
        'categories reviewStreak longestReviewStreak lastReviewDate timezone dailyGoal ' +
          'targetBand examType examDate currentLevel dailyStudyMinutes'
      )
      .lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const now = new Date();
    const tz = user.timezone || 'Asia/Tashkent';
    const today = localDateWithCutoff(now, tz);

    // --- So'zlar bo'yicha hisob-kitob (mastery, due, new, leeches, forecast, byCategory) ---
    let totalWords = 0;
    let mastered = 0;
    let newCount = 0;
    let learningCount = 0;
    let youngCount = 0;
    let dueCount = 0;
    const leeches = [];
    const forecastBuckets = new Map(); // 'YYYY-MM-DD' -> count
    const byCategory = [];

    for (const cat of user.categories) {
      const words = cat.words || [];
      let catMastered = 0;
      let catDue = 0;

      for (const w of words) {
        const stats = w.stats || {};
        const card = cardFromStats(stats);
        totalWords++;

        if (card.state === 'new') {
          newCount++;
        } else {
          const dueAt = stats.nextReview ? new Date(stats.nextReview).getTime() : 0;
          const isDue = dueAt <= now.getTime();
          if (isDue) {
            dueCount++;
            catDue++;
          } else {
            const dueLocalDate = localDateWithCutoff(new Date(dueAt), tz);
            const daysAhead = Math.round((new Date(dueLocalDate).getTime() - new Date(today).getTime()) / DAY_MS);
            if (daysAhead >= 0 && daysAhead <= 6) {
              forecastBuckets.set(dueLocalDate, (forecastBuckets.get(dueLocalDate) || 0) + 1);
            }
          }

          if (card.state === 'learning' || card.state === 'relearning') learningCount++;
          else if (card.intervalDays >= 21) {
            mastered++;
            catMastered++;
          } else {
            youngCount++;
          }
        }

        if (card.lapses >= LEECH_THRESHOLD) {
          leeches.push({
            categoryId: cat._id,
            wordId: w._id,
            word: w.word,
            translation: (w.syns || [])[0] || '',
            lapses: card.lapses,
          });
        }
      }

      byCategory.push({
        categoryId: cat._id,
        name: cat.name,
        total: words.length,
        mastered: catMastered,
        due: catDue,
        masteryPct: words.length ? Math.round((catMastered / words.length) * 100) : 0,
      });
    }

    leeches.sort((a, b) => b.lapses - a.lapses);

    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const date = localDateWithCutoff(new Date(now.getTime() + i * DAY_MS), tz);
      forecast.push({ date, dueCount: forecastBuckets.get(date) || 0 });
    }

    // --- ReviewEvent bo'yicha hisob-kitob (bugun/hafta/faollik) ---
    const events = await fetchRecentEvents(userId, now);
    const byDate = new Map(); // date -> { reviews, correct }
    for (const e of events) {
      const d = localDateWithCutoff(e.reviewedAt, tz);
      const bucket = byDate.get(d) || { reviews: 0, correct: 0 };
      bucket.reviews++;
      if (e.isCorrect) bucket.correct++;
      byDate.set(d, bucket);
    }

    const todayBucket = byDate.get(today) || { reviews: 0, correct: 0 };
    const yesterday = localDateWithCutoff(new Date(now.getTime() - DAY_MS), tz);
    const yesterdayBucket = byDate.get(yesterday) || { reviews: 0, correct: 0 };

    const last7 = lastNLocalDates(now, tz, 7);
    const prev7 = lastNLocalDates(new Date(now.getTime() - 7 * DAY_MS), tz, 7);
    const sumReviews = (dates) => dates.reduce((sum, d) => sum + (byDate.get(d)?.reviews || 0), 0);
    const thisWeekReviews = sumReviews(last7);
    const lastWeekReviews = sumReviews(prev7);

    const pctDelta = (curr, prev) => (prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null);

    const activity7 = last7.map((d) => ({ date: d, ...(byDate.get(d) || { reviews: 0, correct: 0 }) }));
    const activity30 = lastNLocalDates(now, tz, ACTIVITY_WINDOW_DAYS).map((d) => ({
      date: d,
      ...(byDate.get(d) || { reviews: 0, correct: 0 }),
    }));

    const totalReviewsAllTime = await ReviewEvent.countDocuments({ userId });

    // EDU-01b (VOCABLY_TZ_FINAL...2026-09-20.md §11 "Dashboard": "Target Band: 7.0 /
    // Current Estimate: 6.0 / Days Left: 43"). Dashboard bitta so'rov bilan ochilishi
    // kerak (spec §5.4, shu faylning boshidagi izoh) — shuning uchun yangi alohida
    // endpoint o'rniga shu bitta chaqiruvda qo'shiladi. "Current estimate" — eng oddiy
    // oqilona proksi (task ta'rifi bo'yicha): foydalanuvchining ENG SO'NGGI baholangan
    // (graded) urinishining overall band'i — to'liq adaptiv bashorat emas.
    const [latestGraded] = await getAttemptHistory(userId, 1);
    const currentEstimate = latestGraded?.overall ?? null;
    const daysLeft = user.examDate ? Math.ceil((new Date(user.examDate).getTime() - now.getTime()) / DAY_MS) : null;

    return NextResponse.json({
      examPrep: {
        targetBand: user.targetBand ?? null,
        examType: user.examType ?? null,
        examDate: user.examDate ? new Date(user.examDate).toISOString() : null,
        currentLevel: user.currentLevel ?? null,
        dailyStudyMinutes: user.dailyStudyMinutes ?? null,
        currentEstimate,
        daysLeft,
      },
      streak: {
        current: user.reviewStreak || 0,
        longest: Math.max(user.longestReviewStreak || 0, user.reviewStreak || 0),
        last7Days: last7.map((d) => (byDate.get(d)?.reviews || 0) > 0),
      },
      today: {
        reviews: todayBucket.reviews,
        correct: todayBucket.correct,
        accuracyPct: todayBucket.reviews ? Math.round((todayBucket.correct / todayBucket.reviews) * 100) : 0,
        goal: user.dailyGoal || 20,
        goalPct: user.dailyGoal ? Math.min(100, Math.round((todayBucket.reviews / user.dailyGoal) * 100)) : 0,
        due: dueCount,
        newAvailable: newCount,
      },
      totals: {
        reviews: totalReviewsAllTime,
        words: totalWords,
        mastered,
        categories: user.categories.length,
        thisWeekReviews,
      },
      deltas: {
        reviewsVsYesterdayPct: pctDelta(todayBucket.reviews, yesterdayBucket.reviews),
        weekVsLastWeekPct: pctDelta(thisWeekReviews, lastWeekReviews),
      },
      activity7,
      activity30,
      mastery: { new: newCount, learning: learningCount, young: youngCount, mastered },
      leeches: leeches.slice(0, 10),
      forecast,
      byCategory,
    });
  } catch (err) {
    return serverError(err, 'dashboard');
  }
}
