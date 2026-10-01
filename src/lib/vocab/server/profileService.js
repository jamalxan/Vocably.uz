// Gamification profili, lug'at umumiy ko'rinishi va kunlik reja (TZ §19, §33, §44, §69).
import { GameSession, ReviewEvent } from '@/lib/models';
import { BADGE_DEFS, levelForXp } from '@/lib/gamification';
import { localDateWithCutoff } from '@/lib/srs';
import { TIER_VOCAB_LIMITS } from '@/lib/vocab/config';
import { GAME_CATALOG, availabilityFor, tierAllows } from '@/lib/vocab/games';
import { computeMastery, statusForScore } from '@/lib/vocab/mastery';
import { effectiveStreak } from '@/lib/vocab/streak';
import { buildDailyPlan, normalizeMinutes } from '@/lib/vocab/dailyPlan';
import { WEAK_REASON_LABELS, analyzeWeakness, buildSkillProfile } from '@/lib/vocab/weakness';
import { levelInfo } from '@/lib/vocab/xp';
import { isDue, isNewWord, overdueDays } from '@/lib/vocab/selection';
import { estimateVocabularyCefr } from '@/lib/vocab/recommendations';
import { flattenUserWords, statsToInput } from './words';
import { getQuestViews } from './questService';
import { tierOf } from './sessionService';

/** Lug'at bo'yicha umumiy sonlar (TZ §44/§69): jami, o'zlashtirilgan, o'rganilayotgan, zaif, due, yangi. */
export function vocabOverview(words, now = new Date()) {
  const byStatus = { new: 0, learning: 0, familiar: 0, strong: 0, advanced: 0, mastered: 0 };
  let due = 0;
  let overdue = 0;
  let weak = 0;
  let fresh = 0;
  let ieltsWords = 0;
  for (const w of words) {
    byStatus[statusForScore(w.mastery || 0)] += 1;
    if (isDue(w, now)) {
      due += 1;
      if (overdueDays(w, now) >= 1) overdue += 1;
    }
    if ((w.weakness || 0) >= 40 || w.isLeech) weak += 1;
    if (isNewWord(w)) fresh += 1;
    if (w.ieltsRelevance) ieltsWords += 1;
  }
  return {
    total: words.length,
    mastered: byStatus.mastered,
    advanced: byStatus.advanced,
    learning: byStatus.learning + byStatus.familiar + byStatus.strong,
    byStatus,
    due,
    overdue,
    weak,
    newWords: fresh,
    ieltsWords,
  };
}

async function reviewsToday(userId, tz, now) {
  const since = new Date(now.getTime() - 36 * 3600 * 1000);
  const today = localDateWithCutoff(now, tz);
  const rows = await ReviewEvent.find({ userId, reviewedAt: { $gte: since } }, { reviewedAt: 1 }).lean();
  return rows.filter((r) => localDateWithCutoff(new Date(r.reviewedAt), tz) === today).length;
}

async function gamesToday(userId, tz, now) {
  const since = new Date(now.getTime() - 36 * 3600 * 1000);
  const today = localDateWithCutoff(now, tz);
  const rows = await GameSession.find({ userId, status: 'completed', completedAt: { $gte: since } }, { completedAt: 1 }).lean();
  return rows.filter((r) => localDateWithCutoff(new Date(r.completedAt), tz) === today).length;
}

export async function buildDailyPlanForUser(user, { minutes, now = new Date() } = {}) {
  const tz = user.timezone || 'Asia/Tashkent';
  const tier = tierOf(user);
  const words = flattenUserWords(user, { now });
  const overview = vocabOverview(words, now);
  const profile = buildSkillProfile((user.categories || []).flatMap((c) => (c.words || []).map((w) => statsToInput(w.stats || {}))));
  const availableGames = GAME_CATALOG.filter((g) => g.priority !== 'P2' && tierAllows(tier, g.minTier) && availabilityFor(g, words).available).map((g) => g.key);
  const [rv, gm] = await Promise.all([reviewsToday(user._id, tz, now), gamesToday(user._id, tz, now)]);
  const limit = TIER_VOCAB_LIMITS[tier].dailyNewWords;
  const plan = buildDailyPlan({
    minutes: normalizeMinutes(minutes ?? user.dailyStudyMinutes),
    dueCount: overview.due,
    overdueCount: overview.overdue,
    weakCount: overview.weak,
    newAvailable: overview.newWords,
    newWordsRemaining: limit,
    profile,
    availableGames,
    done: { reviews: rv, games: gm },
  });
  return { plan, overview, profile, done: { reviews: rv, games: gm } };
}

export async function buildGamificationProfile(user, { now = new Date() } = {}) {
  const tz = user.timezone || 'Asia/Tashkent';
  const xp = user.xp || 0;
  const earned = new Map((user.badges || []).map((b) => [b.key, b.earnedAt]));
  const badges = BADGE_DEFS.map((d) => ({
    key: d.key,
    label: d.label,
    icon: d.icon,
    description: d.description || '',
    earned: earned.has(d.key),
    earnedAt: earned.get(d.key) || null,
  }));

  const streak = effectiveStreak(
    { streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0 },
    now,
    tz
  );

  const { plan, overview, profile } = await buildDailyPlanForUser(user, { now });
  const quests = await getQuestViews({ userId: user._id, timeZone: tz, now });
  const words = flattenUserWords(user, { now });

  return {
    xp,
    level: levelInfo(xp),
    cefrLevel: levelForXp(xp).current,
    streak: { ...streak, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0 },
    badges,
    earnedBadgeCount: badges.filter((b) => b.earned).length,
    quests,
    overview,
    skillProfile: profile,
    plan,
    vocabularyCefr: estimateVocabularyCefr(words.map((w) => ({ cefr: w.cefr, mastery: w.mastery }))),
    targetBand: user.targetBand || null,
    gameStats: {
      gamesCompleted: user.gameStats?.gamesCompleted || 0,
      bossCompleted: user.gameStats?.bossCompleted || 0,
      perfectSessions: user.gameStats?.perfectSessions || 0,
    },
  };
}

/** Zaif so'zlar ro'yxati (TZ §20): ball, aniqlik, sabablar; eng zaiflari birinchi. */
export function weakWordsForUser(user, { limit = 100, now = new Date() } = {}) {
  const rows = [];
  for (const cat of user.categories || []) {
    for (const w of cat.words || []) {
      const input = statsToInput(w.stats || {});
      const a = analyzeWeakness(input, now);
      if (!a.isWeak) continue;
      rows.push({
        wordId: String(w._id),
        categoryId: String(cat._id),
        categoryName: cat.name,
        word: w.word,
        translations: (w.syns || []).filter(Boolean),
        accuracy: a.accuracy,
        weakness: a.score,
        reasons: a.reasons,
        reasonLabels: a.reasons.map((r) => WEAK_REASON_LABELS[r]),
        primarySkill: a.primarySkill,
        attempts: a.attempts,
        lapses: input.lapses,
        isLeech: input.isLeech,
        lastWrongAt: input.lastWrongAt,
        mastery: computeMastery(input).score,
      });
    }
  }
  rows.sort((x, y) => y.weakness - x.weakness);
  return { total: rows.length, words: rows.slice(0, limit) };
}
