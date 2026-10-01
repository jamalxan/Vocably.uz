// Kvest progressi (TZ §16): hodisalardan idempotent yig'iladi, yakunlanganda XP mukofoti
// (idempotency key: quest:<key>:<periodKey>) beriladi.
import mongoose from 'mongoose';
import { GameSession, UserQuest } from '@/lib/models';
import { localDateWithCutoff } from '@/lib/srs';
import { QUEST_DEFS, MIN_GAMES_FOR_ACCURACY_QUEST, periodKey, periodStartDate, questView, weeklyAccuracyProgress } from '@/lib/vocab/quests';
import { idempotencyKeys } from '@/lib/vocab/xp';
import { awardXpOnce } from './ledger';

const MAX_APPLIED_SOURCES = 200;

/** Davr boshlanishining taxminiy UTC vaqti (mahalliy sananing 04:00 chegarasi bo'yicha) — so'rov filtri uchun. */
export function periodStartUtc(period, now, timeZone) {
  const startDate = periodStartDate(period, now, timeZone); // 'YYYY-MM-DD'
  // Eng xavfsiz: sanadan 36 soat oldinga qaytamiz (har qanday timezone + 04:00 chegara) va
  // keyin aniq sana bo'yicha filtrlaymiz (quyida localDate bilan).
  const [y, m, d] = startDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) - 36 * 3600 * 1000);
}

async function completeIfDone(userId, doc, def) {
  if (doc.completedAt || doc.progress < def.target) return { completed: false, xp: 0 };
  const now = new Date();
  const res = await UserQuest.updateOne({ _id: doc._id, completedAt: null }, { $set: { completedAt: now } });
  if (!res.modifiedCount) return { completed: false, xp: 0 }; // boshqa so'rov allaqachon yakunladi
  const award = await awardXpOnce(userId, def.rewardXp, {
    reason: 'quest',
    sourceType: 'quest',
    sourceId: `${def.key}:${doc.periodKey}`,
    idempotencyKey: idempotencyKeys.quest(def.key, doc.periodKey),
    metadata: { questKey: def.key, period: def.period },
  });
  if (award.awarded || award.duplicate) {
    await UserQuest.updateOne({ _id: doc._id }, { $set: { rewardClaimedAt: now } });
  }
  return { completed: true, xp: award.amount, def };
}

/**
 * Hodisalarni (yangi so'z, takrorlash, o'yin, ...) barcha mos kvestlarga qo'shadi.
 * `sourceId` — har bir hodisa manbasi uchun noyob (masalan sessiya id): bir manba ikki marta hisoblanmaydi.
 * @returns {Promise<Array>} yangi yakunlangan kvestlar [{def, xp}]
 */
export async function recordQuestEvents({ userId, timeZone, events, sourceId, now = new Date() }) {
  const completed = [];
  const uid = new mongoose.Types.ObjectId(String(userId));
  for (const def of QUEST_DEFS) {
    if (def.derived) continue;
    const amount = events.filter((e) => e.metric === def.metric && e.amount > 0).reduce((s, e) => s + e.amount, 0);
    if (!amount) continue;
    const pKey = periodKey(def.period, now, timeZone);
    let doc;
    try {
      doc = await UserQuest.findOneAndUpdate(
        { userId: uid, questKey: def.key, periodKey: pKey, appliedSources: { $ne: String(sourceId) } },
        {
          $inc: { progress: amount },
          $push: { appliedSources: { $each: [String(sourceId)], $slice: -MAX_APPLIED_SOURCES } },
          $setOnInsert: { period: def.period, target: def.target, createdAt: now },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      if (err && err.code === 11000) continue; // bu manba allaqachon hisoblangan
      throw err;
    }
    if (doc.progress > def.target) {
      await UserQuest.updateOne({ _id: doc._id }, { $set: { progress: def.target } });
      doc.progress = def.target;
    }
    const r = await completeIfDone(uid, doc, def);
    if (r.completed) completed.push({ def, xp: r.xp });
  }
  return completed;
}

/** Haftalik "o'rtacha aniqlik" kvesti — sessiyalardan hisoblanadigan (derived) vazifa. */
export async function refreshWeeklyAccuracyQuest({ userId, timeZone, now = new Date() }) {
  const def = QUEST_DEFS.find((d) => d.key === 'weekly_accuracy_90');
  if (!def) return null;
  const uid = new mongoose.Types.ObjectId(String(userId));
  const weekStart = periodStartDate('weekly', now, timeZone);
  const since = periodStartUtc('weekly', now, timeZone);
  const sessions = await GameSession.find(
    { userId: uid, status: 'completed', suspicious: false, completedAt: { $gte: since } },
    { correctCount: 1, wrongCount: 1, completedAt: 1 }
  ).lean();
  const inWeek = sessions.filter((s) => localDateWithCutoff(new Date(s.completedAt), timeZone) >= weekStart);
  const progress = weeklyAccuracyProgress(inWeek);
  const pKey = periodKey('weekly', now, timeZone);
  const doc = await UserQuest.findOneAndUpdate(
    { userId: uid, questKey: def.key, periodKey: pKey },
    { $set: { progress }, $setOnInsert: { period: 'weekly', target: def.target, createdAt: now } },
    { upsert: true, new: true }
  );
  const r = await completeIfDone(uid, doc, def);
  return r.completed ? { def, xp: r.xp } : null;
}

/** Joriy kunlik/haftalik kvestlar ko'rinishi (progress 0 bo'lsa ham hamma kvest ko'rsatiladi). */
export async function getQuestViews({ userId, timeZone, now = new Date() }) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const dailyKey = periodKey('daily', now, timeZone);
  const weeklyKey = periodKey('weekly', now, timeZone);
  const docs = await UserQuest.find({ userId: uid, periodKey: { $in: [dailyKey, weeklyKey] } }).lean();
  const byKey = new Map(docs.map((d) => [`${d.questKey}:${d.periodKey}`, d]));
  const view = { daily: [], weekly: [] };
  for (const def of QUEST_DEFS) {
    const pKey = def.period === 'daily' ? dailyKey : weeklyKey;
    const doc = byKey.get(`${def.key}:${pKey}`);
    view[def.period].push(questView(def, doc?.progress || 0, !!doc?.rewardClaimedAt));
  }
  return { ...view, dailyKey, weeklyKey, minGamesForAccuracy: MIN_GAMES_FOR_ACCURACY_QUEST };
}
