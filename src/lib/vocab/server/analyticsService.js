// Foydalanuvchi va admin analytics (TZ §33, §34). Admin ko'rinishi faqat yig'ma (aggregated) —
// shaxsiy ma'lumotsiz (TZ §36).
import { AiCall, GameSession, ReviewEvent, User, UserQuest, VocabEvent, XpEvent } from '@/lib/models';
import { localDateWithCutoff } from '@/lib/srs';
import { flattenUserWords } from './words';
import { vocabOverview } from './profileService';

const DAY = 24 * 3600 * 1000;

function dateKeys(days, now, tz) {
  const keys = [];
  for (let i = days - 1; i >= 0; i--) keys.push(localDateWithCutoff(new Date(now.getTime() - i * DAY), tz));
  return keys;
}

/** Foydalanuvchi progressi: 7/30/90 kunlik trend (XP, o'yinlar, aniqlik, takrorlash, retention). */
export async function userProgress({ user, days = 30, now = new Date() }) {
  const range = [7, 30, 90].includes(days) ? days : 30;
  const tz = user.timezone || 'Asia/Tashkent';
  const since = new Date(now.getTime() - (range + 1) * DAY);
  const keys = dateKeys(range, now, tz);
  const series = Object.fromEntries(keys.map((k) => [k, { date: k, xp: 0, games: 0, correct: 0, wrong: 0, reviews: 0, reviewCorrect: 0, responseMsSum: 0, responseN: 0 }]));

  const [sessions, xpRows, reviews] = await Promise.all([
    GameSession.find({ userId: user._id, status: 'completed', suspicious: false, completedAt: { $gte: since } }, { completedAt: 1, correctCount: 1, wrongCount: 1, avgResponseMs: 1, xpEarned: 1, gameKey: 1 }).lean(),
    XpEvent.find({ userId: user._id, createdAt: { $gte: since } }, { amount: 1, createdAt: 1 }).lean(),
    ReviewEvent.find({ userId: user._id, reviewedAt: { $gte: since } }, { reviewedAt: 1, isCorrect: 1, prevState: 1 }).lean(),
  ]);

  const byGame = {};
  for (const s of sessions) {
    const k = localDateWithCutoff(new Date(s.completedAt), tz);
    const d = series[k];
    if (!d) continue;
    d.games += 1;
    d.correct += s.correctCount || 0;
    d.wrong += s.wrongCount || 0;
    if (s.avgResponseMs) {
      d.responseMsSum += s.avgResponseMs;
      d.responseN += 1;
    }
    const g = (byGame[s.gameKey] = byGame[s.gameKey] || { played: 0, correct: 0, wrong: 0 });
    g.played += 1;
    g.correct += s.correctCount || 0;
    g.wrong += s.wrongCount || 0;
  }
  for (const x of xpRows) {
    const d = series[localDateWithCutoff(new Date(x.createdAt), tz)];
    if (d) d.xp += x.amount;
  }
  let retainedChecks = 0;
  let retainedOk = 0;
  for (const r of reviews) {
    const d = series[localDateWithCutoff(new Date(r.reviewedAt), tz)];
    if (!d) continue;
    d.reviews += 1;
    if (r.isCorrect) d.reviewCorrect += 1;
    // Retention: oldin "review" (uzoq muddatli) holatda bo'lgan so'zni yana eslay oldimi.
    if (r.prevState === 'review') {
      retainedChecks += 1;
      if (r.isCorrect) retainedOk += 1;
    }
  }

  const rows = keys.map((k) => {
    const d = series[k];
    const units = d.correct + d.wrong;
    return {
      date: k,
      xp: d.xp,
      games: d.games,
      gameAccuracy: units ? Math.round((d.correct / units) * 100) : null,
      reviews: d.reviews,
      reviewAccuracy: d.reviews ? Math.round((d.reviewCorrect / d.reviews) * 100) : null,
      avgResponseMs: d.responseN ? Math.round(d.responseMsSum / d.responseN) : null,
    };
  });

  const totalCorrect = rows.reduce((s, r, i) => s + (series[r.date].correct || 0), 0);
  const totalWrong = rows.reduce((s, r) => s + (series[r.date].wrong || 0), 0);
  const respN = rows.reduce((s, r) => s + (series[r.date].responseN || 0), 0);
  const respSum = rows.reduce((s, r) => s + (series[r.date].responseMsSum || 0), 0);

  const full = await User.findById(user._id).select('categories').lean();
  const words = flattenUserWords(full, { now });
  const overview = vocabOverview(words, now);
  const ielts = words.filter((w) => w.ieltsRelevance);

  return {
    range,
    series: rows,
    totals: {
      xp: rows.reduce((s, r) => s + r.xp, 0),
      games: rows.reduce((s, r) => s + r.games, 0),
      reviews: rows.reduce((s, r) => s + r.reviews, 0),
      gameAccuracy: totalCorrect + totalWrong ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : null,
      avgResponseMs: respN ? Math.round(respSum / respN) : null,
      retention: retainedChecks >= 5 ? Math.round((retainedOk / retainedChecks) * 100) : null,
    },
    byGame: Object.entries(byGame).map(([key, g]) => ({
      key,
      played: g.played,
      accuracy: g.correct + g.wrong ? Math.round((g.correct / (g.correct + g.wrong)) * 100) : null,
    })),
    vocabulary: {
      ...overview,
      ieltsTotal: ielts.length,
      ieltsMastered: ielts.filter((w) => (w.mastery || 0) >= 81).length,
    },
  };
}

/** Admin: yig'ma (anonim) o'yin/lug'at ko'rsatkichlari. */
export async function adminVocabAnalytics({ days = 30, now = new Date() } = {}) {
  const range = [7, 30, 90].includes(days) ? days : 30;
  const since = new Date(now.getTime() - range * DAY);
  const dayAgo = new Date(now.getTime() - DAY);
  const weekAgo = new Date(now.getTime() - 7 * DAY);

  const [
    byGameStatus,
    quality,
    failedWords,
    dauGames,
    wauGames,
    dauReviews,
    wauReviews,
    questTotals,
    streakDist,
    aiCalls,
    flagged,
    eventCounts,
    xpAtCap,
  ] = await Promise.all([
    GameSession.aggregate([
      { $match: { startedAt: { $gte: since } } },
      { $group: { _id: { game: '$gameKey', status: '$status' }, n: { $sum: 1 } } },
    ]),
    GameSession.aggregate([
      { $match: { status: 'completed', suspicious: false, completedAt: { $gte: since } } },
      { $group: { _id: null, sessions: { $sum: 1 }, correct: { $sum: '$correctCount' }, wrong: { $sum: '$wrongCount' }, avgMs: { $avg: '$avgResponseMs' } } },
    ]),
    GameSession.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: since } } },
      { $unwind: '$answers' },
      { $match: { 'answers.counted': { $ne: false } } },
      { $addFields: { q: { $first: { $filter: { input: '$questions', as: 'q', cond: { $eq: ['$$q.qid', '$answers.qid'] } } } } } },
      { $match: { 'q.inputType': { $ne: 'match' }, 'q.word': { $type: 'string' } } },
      { $group: { _id: { $toLower: '$q.word' }, attempts: { $sum: 1 }, wrong: { $sum: { $cond: ['$answers.isCorrect', 0, 1] } }, avgMs: { $avg: '$answers.responseMs' } } },
      { $match: { attempts: { $gte: 5 } } },
      { $addFields: { failRate: { $divide: ['$wrong', '$attempts'] } } },
      { $sort: { failRate: -1, attempts: -1 } },
      { $limit: 10 },
    ]),
    GameSession.distinct('userId', { startedAt: { $gte: dayAgo } }),
    GameSession.distinct('userId', { startedAt: { $gte: weekAgo } }),
    ReviewEvent.distinct('userId', { reviewedAt: { $gte: dayAgo } }),
    ReviewEvent.distinct('userId', { reviewedAt: { $gte: weekAgo } }),
    UserQuest.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$period', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } } } },
    ]),
    User.aggregate([
      { $match: { lastReviewDate: { $ne: null }, lastActiveAt: { $gte: weekAgo } } },
      { $group: { _id: null, active: { $sum: 1 }, ge3: { $sum: { $cond: [{ $gte: ['$reviewStreak', 3] }, 1, 0] } }, ge7: { $sum: { $cond: [{ $gte: ['$reviewStreak', 7] }, 1, 0] } }, ge30: { $sum: { $cond: [{ $gte: ['$reviewStreak', 30] }, 1, 0] } } } },
    ]),
    AiCall.countDocuments({ createdAt: { $gte: since } }).catch(() => null),
    GameSession.countDocuments({ suspicious: true, startedAt: { $gte: since } }),
    VocabEvent.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: '$name', n: { $sum: 1 } } }]),
    XpEvent.aggregate([
      { $match: { sourceType: 'game', createdAt: { $gte: dayAgo } } },
      { $group: { _id: '$userId', xp: { $sum: '$amount' } } },
      { $match: { xp: { $gte: 3500 } } },
      { $count: 'n' },
    ]),
  ]);

  // O'yin bo'yicha holatlar -> tugatish/tark etish ulushi
  const games = {};
  for (const r of byGameStatus) {
    const g = (games[r._id.game] = games[r._id.game] || { started: 0, completed: 0, abandoned: 0, active: 0 });
    g.started += r.n;
    if (r._id.status === 'completed') g.completed += r.n;
    else if (r._id.status === 'abandoned') g.abandoned += r.n;
    else g.active += r.n;
  }
  const gameRows = Object.entries(games).map(([key, g]) => ({
    key,
    ...g,
    completionRate: g.started ? Math.round((g.completed / g.started) * 100) : null,
    abandonRate: g.started ? Math.round(((g.abandoned + g.active) / g.started) * 100) : null,
  }));
  const totalStarted = gameRows.reduce((s, g) => s + g.started, 0);
  const totalCompleted = gameRows.reduce((s, g) => s + g.completed, 0);

  const q = quality[0] || { sessions: 0, correct: 0, wrong: 0, avgMs: null };
  const dau = new Set([...dauGames, ...dauReviews].map(String)).size;
  const wau = new Set([...wauGames, ...wauReviews].map(String)).size;
  const quest = Object.fromEntries(questTotals.map((r) => [r._id, { total: r.total, completed: r.completed, rate: r.total ? Math.round((r.completed / r.total) * 100) : null }]));
  const sd = streakDist[0] || { active: 0, ge3: 0, ge7: 0, ge30: 0 };

  return {
    range,
    users: { dau, wau },
    games: {
      started: totalStarted,
      completed: totalCompleted,
      completionRate: totalStarted ? Math.round((totalCompleted / totalStarted) * 100) : null,
      avgAccuracy: q.correct + q.wrong ? Math.round((q.correct / (q.correct + q.wrong)) * 100) : null,
      avgResponseMs: q.avgMs ? Math.round(q.avgMs) : null,
      mostSuccessful: [...gameRows].filter((g) => g.started >= 5).sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0)).slice(0, 3),
      mostAbandoned: [...gameRows].filter((g) => g.started >= 5).sort((a, b) => (b.abandonRate || 0) - (a.abandonRate || 0)).slice(0, 3),
      byGame: gameRows.sort((a, b) => b.started - a.started),
    },
    words: {
      mostFailed: failedWords.map((w) => ({ word: w._id, attempts: w.attempts, failRate: Math.round(w.failRate * 100), avgResponseMs: Math.round(w.avgMs || 0) })),
    },
    quests: { daily: quest.daily || null, weekly: quest.weekly || null },
    streakRetention: { active: sd.active, ge3: sd.ge3, ge7: sd.ge7, ge30: sd.ge30 },
    ai: { calls: aiCalls },
    integrity: { flaggedSessions: flagged, usersNearDailyXpCap: xpAtCap[0]?.n || 0 },
    events: Object.fromEntries(eventCounts.map((e) => [e._id, e.n])),
  };
}
