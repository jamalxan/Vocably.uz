import { NextResponse } from 'next/server';
import { GameSession } from '@/lib/models';
import { localDateWithCutoff } from '@/lib/srs';
import { GAME_CATALOG, availabilityFor, tierAllows } from '@/lib/vocab/games';
import { TIER_VOCAB_LIMITS } from '@/lib/vocab/config';
import { buildSkillProfile, gameWeights } from '@/lib/vocab/weakness';
import { flattenUserWords, statsToInput } from '@/lib/vocab/server/words';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { tierOf } from '@/lib/vocab/server/sessionService';

// GET /api/games — o'yinlar katalogi: har biri uchun mavjudlik (so'zlar yetarlimi), tarif ruxsati va
// foydalanuvchi ko'nikma profiliga qarab tavsiya (TZ §9, §21, §48).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;

    const now = new Date();
    const tz = user.timezone || 'Asia/Tashkent';
    const tier = tierOf(user);
    const words = flattenUserWords(user, { now });

    const recent = await GameSession.find({ userId: user._id, startedAt: { $gte: new Date(now.getTime() - 36 * 3600 * 1000) } }, { startedAt: 1 }).lean();
    const today = localDateWithCutoff(now, tz);
    const sessionsToday = recent.filter((s) => localDateWithCutoff(new Date(s.startedAt), tz) === today).length;
    const limit = TIER_VOCAB_LIMITS[tier].dailySessions;

    const profile = buildSkillProfile(
      (user.categories || []).flatMap((c) => (c.words || []).map((w) => statsToInput(w.stats || {})))
    );
    const availableKeys = GAME_CATALOG.filter((g) => availabilityFor(g, words).available).map((g) => g.key);
    const weights = gameWeights(profile, availableKeys);

    const games = GAME_CATALOG.map((g) => {
      const avail = availabilityFor(g, words);
      const unlocked = tierAllows(tier, g.minTier);
      return {
        key: g.key,
        title: g.title,
        description: g.description,
        priority: g.priority,
        icon: g.icon,
        skill: g.skill,
        minTier: g.minTier,
        unlocked,
        lockedReason: unlocked ? null : `${g.minTier === 'premium' ? 'Premium' : 'Standard'} rejada ochiladi`,
        available: avail.available,
        unavailableReason: avail.reason,
        recommended: avail.available && unlocked && (weights[g.key] || 1) > 1,
        questionCount: g.questionCount,
        needsAudio: g.needsAudio,
        instantFeedback: g.instantFeedback,
      };
    });

    return NextResponse.json({
      games,
      tier,
      totalWords: words.length,
      sessionsToday,
      dailyLimit: limit,
      profile,
    });
  } catch (err) {
    return handleRouteError(err, 'games');
  }
}
