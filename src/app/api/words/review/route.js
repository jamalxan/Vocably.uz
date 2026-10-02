import { connectToDatabase } from '@/lib/db';
import { User, XpEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ratingFromOutcome } from '@/lib/srs';
import { applyWordReview, logReviewEvent } from '@/lib/wordReview';
import { awardXp, xpForReview, checkAndAwardBadges, countMasteredWords } from '@/lib/gamification';
import { applySkillResult, computeMastery } from '@/lib/vocab/mastery';
import { applyStreakActivity } from '@/lib/vocab/streak';
import { statsToInput } from '@/lib/vocab/server/words';
import { recordQuestEvents } from '@/lib/vocab/server/questService';
import { awardXpOnce, trackVocabEvents } from '@/lib/vocab/server/ledger';
import { XP_TABLE } from '@/lib/vocab/config';
import { idempotencyKeys } from '@/lib/vocab/xp';
import { NextResponse } from 'next/server';

// XP suiiste'moliga qarshi (mijoz correct ni o'zi aytadi — server javobni tekshira olmaydi): so'rovlar tezligi, bir so'zga takroriy XP va
// kunlik takrorlash-XP chegarasi. SRS/seriya hisobi o'zgarmaydi — faqat XP (reyting) cheklanadi.
const REVIEW_XP_COOLDOWN_MS = 20_000;
const REVIEW_XP_DAILY_CAP = 400;

export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    if (!(await checkRateLimit(userId, 'word-review', 90))) {
      return NextResponse.json({ error: 'Juda tez takrorlayapsiz. Biroz kuting.' }, { status: 429 });
    }

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
    const lastReviewedMs = word.stats?.lastReviewed ? new Date(word.stats.lastReviewed).getTime() : 0; // applyWordReview o'zgartirishidan OLDIN
    // Gamified Vocabulary Engine: javobdan OLDINGI holat (eski umumiy hisoblagichlar recall'ga
    // yo'qolmasdan ko'chishi va "yangi so'z o'rganildi" hodisasi uchun).
    const engineBefore = statsToInput(word.stats);
    const wasNewWord = (word.stats.srsState || 'new') === 'new' && !(word.stats.reps || 0);

    // Rating (1-4) hozircha faqat ba'zi rejimlardan keladi — qolganlari hali eski
    // to'g'ri/xato tugmalarini ishlatadi (FAZA 5'da 4 tugmali baholashga o'tiladi).
    const rating = [1, 2, 3, 4].includes(ratingInput) ? ratingInput : ratingFromOutcome(correct, responseMs);
    // Streak holati SRS qo'llanishidan OLDIN olinadi: pastda freeze'ni hisobga oluvchi yagona hisob (streak.ts)
    // applyWordReview ichidagi oddiy hisobni bosib yozadi — o'yinlar bilan bir xil streak.
    const streakBefore = {
      streak: user.reviewStreak || 0,
      lastDate: user.lastReviewDate || null,
      freezes: user.streakFreezes || 0,
      longest: user.longestReviewStreak || 0,
    };
    const { prevCard, result } = applyWordReview(user, word, { correct, rating, now });

    // Mastery (TZ §6): takrorlash "recall" ko'nikmasi signali — SRS hisobiga tegmaydi.
    const engineState = applySkillResult(engineBefore, 'recall', correct, responseMs, now);
    const mastery = computeMastery({
      skills: engineState.skills,
      avgResponseMs: engineState.avgResponseMs,
      streakCount: engineState.streakCount,
      correct: word.stats.correct,
      wrong: word.stats.wrong,
      intervalDays: result.intervalDays,
      lapses: result.lapses,
      reps: result.reps,
    });
    word.stats.skills = engineState.skills;
    word.stats.avgResponseMs = engineState.avgResponseMs ?? null;
    word.stats.streakCount = engineState.streakCount || 0;
    word.stats.lastFormat = 'recall';
    word.stats.lastSeenAt = now;
    if (!correct) word.stats.lastWrongAt = now;
    word.stats.mastery = mastery.score;
    word.stats.masteryVersion = mastery.version;
    const newlyMastered = mastery.status === 'mastered' && !word.stats.masteredAt;
    if (newlyMastered) word.stats.masteredAt = now;

    const streakResult = applyStreakActivity(streakBefore, now, user.timezone || 'Asia/Tashkent');
    const streak = streakResult.streak;
    user.reviewStreak = streak;
    user.lastReviewDate = streakResult.lastDate;
    user.longestReviewStreak = Math.max(streakBefore.longest, streak);
    user.streakFreezes = streakResult.freezes;

    // FAZA 5 — gamifikatsiya (VOCABLY-TZ.md §13). Yutuqlar so'z holatini yangilagandan
    // KEYIN tekshiriladi — "mastered so'zlar soni" aynan shu javobdan keyingi holatni aks ettirsin.
    // XP faqat: shu so'z yaqinda takrorlanmagan va oxirgi 24 soatda takrorlash-XP chegarasi to'lmagan bo'lsa.
    const xpCooledDown = now.getTime() - lastReviewedMs >= REVIEW_XP_COOLDOWN_MS;
    const xpUnderCap = xpCooledDown && (await XpEvent.countDocuments({ userId: user._id, reason: 'review', createdAt: { $gte: new Date(now.getTime() - 24 * 3600 * 1000) } })) < REVIEW_XP_DAILY_CAP;
    if (xpUnderCap) await awardXp(user, xpForReview(correct), 'review');
    const newBadges = checkAndAwardBadges(user, {
      masteredWords: countMasteredWords(user),
      longestStreak: user.longestReviewStreak,
    });

    await user.save();

    // Javobdan oldin kutiladi (serverless funksiya javobdan keyin to'xtatilishi
    // mumkin); xato bo'lsa faqat log qilinadi — asosiy holat allaqachon saqlangan.
    await logReviewEvent({ userId: user._id, categoryId, wordId, mode: mode || 'spaced', rating, correct, prevCard, result, now });

    // Gamified Vocabulary Engine — kvest progressi, "mastered" XP va analytics. Bularning hech biri
    // asosiy takrorlash javobini bloklamasligi kerak (yuqorida allaqachon saqlangan) — alohida try/catch.
    let questsCompleted = [];
    try {
      const sourceId = `review:${wordId}:${now.getTime()}`;
      const events = [{ metric: 'reviews', amount: 1 }];
      if (wasNewWord && correct) events.push({ metric: 'new_words', amount: 1 });
      if (newlyMastered) events.push({ metric: 'mastered_words', amount: 1 });
      questsCompleted = await recordQuestEvents({ userId: user._id, timeZone: user.timezone || 'Asia/Tashkent', events, sourceId, now });
      if (newlyMastered) {
        await awardXpOnce(user._id, XP_TABLE.wordMastered, {
          reason: 'mastered',
          sourceType: 'mastered',
          sourceId: String(wordId),
          idempotencyKey: idempotencyKeys.wordMastered(String(wordId), mastery.version),
        });
      }
      await trackVocabEvents(user._id, [
        { name: 'review_answered', payload: { correct, rating, mode: mode || 'spaced', ms: Math.round(responseMs || 0) } },
        ...(newlyMastered ? [{ name: 'vocabulary_mastered', payload: { word: word.word } }] : []),
        ...(streakResult.extended ? [{ name: 'streak_extended', payload: { streak } }] : []),
      ]);
    } catch (err) {
      console.error('[vocab] takrorlash signalini yozishda xatolik', err);
    }

    return NextResponse.json({
      success: true,
      stats: word.stats,
      reviewStreak: user.reviewStreak,
      xp: user.xp,
      newBadges,
      questsCompleted: questsCompleted.map((q) => ({ key: q.def.key, title: q.def.title, rewardXp: q.xp })),
    });
  } catch (err) {
    return serverError(err, 'words/review');
  }
}
