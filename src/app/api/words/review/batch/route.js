import { connectToDatabase } from '@/lib/db';
import { User, OfflineReviewReceipt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ratingFromOutcome } from '@/lib/srs';
import { applyWordReview, logReviewEvent } from '@/lib/wordReview';
import { applySkillResult, computeMastery } from '@/lib/vocab/mastery';
import { applyStreakActivity } from '@/lib/vocab/streak';
import { statsToInput } from '@/lib/vocab/server/words';
import { normalizeOfflineBatch } from '@/lib/vocab/offlineBatch';
import { NextResponse } from 'next/server';

// Offline takrorlash paketi (src/lib/offlineReview.js): internet yo'qligida yig'ilgan javoblar ulanganda shu yerga keladi.
// Xavfsizlik qarorlari:
//  - XP BERILMAYDI (mijoz `correct` ni o'zi aytadi, offline'da hech narsa tekshirilmaydi) — reyting/XP suiiste'moli yuzasi yo'q;
//  - har javob (userId, clientSeq) bo'yicha atomik "talab qilinadi" — qayta yuborish ikki marta qo'llanmaydi;
//  - `clientTs` cheklangan (kelajak/48 soatdan eski rad etiladi) va serverda allaqachon yangiroq takrorlangan so'zga eski javob qo'llanmaydi.
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    if (!(await checkRateLimit(userId, 'word-review-batch', 20))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const parsed = normalizeOfflineBatch(body?.reviews, now);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { items, rejected } = parsed;
    if (!items.length) return NextResponse.json({ applied: 0, duplicates: 0, stale: 0, rejected });

    // 1) Idempotentlik: har javob atomik "talab qilinadi"; faqat yangi yozilganlari qo'llanadi.
    const res = await OfflineReviewReceipt.bulkWrite(
      items.map((it) => ({ updateOne: { filter: { userId, key: it.clientSeq }, update: { $setOnInsert: { userId, key: it.clientSeq, createdAt: now } }, upsert: true } })),
      { ordered: false }
    );
    const fresh = items.filter((_, i) => res.upsertedIds && Object.prototype.hasOwnProperty.call(res.upsertedIds, i));
    const duplicates = items.length - fresh.length;
    if (!fresh.length) return NextResponse.json({ applied: 0, duplicates, stale: 0, rejected });

    try {
      const user = await User.findById(userId);
      if (!user) throw Object.assign(new Error('user'), { notFound: true });

      let applied = 0;
      let stale = 0;
      const logs = [];
      for (const it of fresh) {
        const word = user.categories.id(it.categoryId)?.words.id(it.wordId);
        if (!word) {
          rejected.push({ clientSeq: it.clientSeq, reason: 'word_not_found' });
          continue;
        }
        const lastMs = word.stats?.lastReviewed ? new Date(word.stats.lastReviewed).getTime() : 0;
        if (lastMs >= it.at.getTime()) {
          stale++; // serverda bundan yangiroq takrorlash bor
          continue;
        }
        const engineBefore = statsToInput(word.stats);
        const rating = it.rating || ratingFromOutcome(it.correct, it.responseMs);
        const streakBefore = { streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0 };
        const { prevCard, result } = applyWordReview(user, word, { correct: it.correct, rating, now: it.at });

        const engineState = applySkillResult(engineBefore, 'recall', it.correct, it.responseMs, it.at);
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
        word.stats.lastSeenAt = it.at;
        if (!it.correct) word.stats.lastWrongAt = it.at;
        word.stats.mastery = mastery.score;
        word.stats.masteryVersion = mastery.version;
        if (mastery.status === 'mastered' && !word.stats.masteredAt) word.stats.masteredAt = it.at;

        const sr = applyStreakActivity(streakBefore, it.at, user.timezone || 'Asia/Tashkent');
        user.reviewStreak = sr.streak;
        user.lastReviewDate = sr.lastDate;
        user.longestReviewStreak = Math.max(streakBefore.longest, sr.streak);
        user.streakFreezes = sr.freezes;

        logs.push({ userId: user._id, categoryId: it.categoryId, wordId: it.wordId, mode: 'offline', rating, correct: it.correct, prevCard, result, now: it.at });
        applied++;
      }

      if (applied) await user.save();
      for (const l of logs) await logReviewEvent(l);

      return NextResponse.json({ applied, duplicates, stale, rejected, reviewStreak: user.reviewStreak, xp: user.xp });
    } catch (err) {
      // Saqlanmadi — "talab qilingan" izlar o'chiriladi, mijoz qayta yuborganda yo'qolib qolmasin.
      await OfflineReviewReceipt.deleteMany({ userId, key: { $in: fresh.map((f) => f.clientSeq) } }).catch(() => {});
      throw err;
    }
  } catch (err) {
    if (err?.notFound) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    return serverError(err, 'words/review/batch');
  }
}
