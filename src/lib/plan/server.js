// Server side of "Bugungi reja" (TZ 2.0 §6.2). Pure rules live in src/lib/todayPlan.js.
//
// Lifecycle: the first read of a local day builds and stores the plan (DailyPlan, unique per
// user+date — concurrent first reads converge on one document via upsert). Every read then
// re-derives progress from today's activity (reviews, new words, finished games, finished
// exam sections), marks tasks done and pays each task's XP exactly once (XpEvent
// idempotencyKey). Changing exam date / minutes / weakest skill rebuilds today's tasks,
// keeping the ones already done.
import mongoose from 'mongoose';
import { User, DailyPlan, ReviewEvent, GameSession, ExamAttempt, XpEvent } from '@/lib/models';
import { cardFromStats, localDateWithCutoff } from '@/lib/srs';
import { getSkillBandEstimate } from '@/lib/exam/attemptServer';
import { buildTodayPlan, applySignals, planInputsKey, mergeRebuilt, planProgress } from '@/lib/todayPlan';
import { applyStreakActivity, effectiveStreak, STREAK_FREEZE_CONFIG } from '@/lib/vocab/streak';
import { trackVocabEvents } from '@/lib/vocab/server/ledger';

const DAY_MS = 86400000;
/** TZ: the plan day starts at 00:00 local time (not the 04:00 SRS cutoff). */
const PLAN_CUTOFF_HOUR = 0;
const MANUAL_TYPES = new Set(['skill', 'mock']);

const USER_FIELDS = 'timezone dailyStudyMinutes examDate targetBand weakestSkill reviewStreak lastReviewDate streakFreezes freezeWeek categories.words.stats';

export function planDate(now, tz) {
  return localDateWithCutoff(now, tz || 'Asia/Tashkent', PLAN_CUTOFF_HOUR);
}

function countWords(user, now) {
  let due = 0;
  let fresh = 0;
  const t = now.getTime();
  for (const cat of user.categories || []) {
    for (const w of cat.words || []) {
      const stats = w.stats || {};
      if (cardFromStats(stats).state === 'new') fresh += 1;
      else if (!stats.nextReview || new Date(stats.nextReview).getTime() <= t) due += 1;
    }
  }
  return { due, newAvailable: fresh };
}

/** Today's activity, in the user's local day. Windows are 26h wide and filtered in JS (DST-safe). */
export async function todaySignals(userId, date, tz, now = new Date()) {
  const since = new Date(now.getTime() - 26 * 60 * 60 * 1000);
  const isToday = (d) => d && planDate(new Date(d), tz) === date;
  const [events, games, attempts] = await Promise.all([
    ReviewEvent.find({ userId, reviewedAt: { $gte: since } }).select('reviewedAt prevState wordId').lean(),
    GameSession.find({ userId, status: 'completed', completedAt: { $gte: since } }).select('completedAt').lean(),
    ExamAttempt.find({ userId, status: { $in: ['submitted', 'graded'] }, submittedAt: { $gte: since } })
      .select('mode sections submittedAt')
      .lean(),
  ]);
  const todayEvents = events.filter((e) => isToday(e.reviewedAt));
  const newWords = new Set(todayEvents.filter((e) => e.prevState === 'new').map((e) => String(e.wordId))).size;
  const sections = [
    ...new Set(
      attempts
        .filter((a) => isToday(a.submittedAt))
        .flatMap((a) => (a.mode === 'mock' ? ['mock', ...(a.sections || [])] : a.sections || []))
    ),
  ];
  return { reviews: todayEvents.length, newWords, games: games.filter((g) => isToday(g.completedAt)).length, sections };
}

async function buildFor(user, date, now) {
  const tz = user.timezone || 'Asia/Tashkent';
  const yesterday = planDate(new Date(now.getTime() - DAY_MS), tz);
  const [counts, bands, prev] = await Promise.all([
    Promise.resolve(countWords(user, now)),
    getSkillBandEstimate(String(user._id)).catch(() => ({ bands: {} })),
    DailyPlan.findOne({ userId: user._id, date: yesterday }).select('tasks').lean(),
  ]);
  const daysLeft = user.examDate ? Math.ceil((new Date(user.examDate).getTime() - now.getTime()) / DAY_MS) : null;
  return buildTodayPlan({
    date,
    minutes: user.dailyStudyMinutes,
    due: counts.due,
    newAvailable: counts.newAvailable,
    skillBands: bands.bands || {},
    weakestSkill: user.weakestSkill,
    daysLeft,
    previousTasks: prev?.tasks || [],
  });
}

/** Award each newly-done task's XP once. Returns XP actually paid. */
async function payXp(userId, date, tasks, keys) {
  let paid = 0;
  for (const key of keys) {
    const t = tasks.find((x) => x.key === key);
    if (!t?.xp) continue;
    try {
      await XpEvent.create({
        userId, amount: t.xp, reason: 'plan_task', sourceType: 'plan', sourceId: `${date}:${key}`,
        idempotencyKey: `plan:${userId}:${date}:${key}`,
      });
      paid += t.xp;
    } catch (err) {
      if (err?.code !== 11000) throw err; // already paid by a concurrent request
    }
  }
  if (paid) await User.updateOne({ _id: userId }, { $inc: { xp: paid } });
  return paid;
}

function serialize(plan, user, now) {
  const daysLeft = user.examDate ? Math.ceil((new Date(user.examDate).getTime() - now.getTime()) / DAY_MS) : null;
  return {
    date: plan.date,
    minutes: plan.minutes,
    weakest: plan.weakest,
    tasks: plan.tasks.map((t) => ({
      key: t.key, type: t.type, skill: t.skill, title: t.title, minutes: t.minutes, href: t.href, xp: t.xp,
      target: t.target, progress: t.progress || 0, status: t.status, carried: !!t.carried, focus: !!t.focus,
      needsWords: !!t.needsWords, manualAllowed: MANUAL_TYPES.has(t.type),
    })),
    progress: planProgress(plan.tasks),
    daysLeft,
    targetBand: user.targetBand ?? null,
  };
}

const STREAK_FIELDS = 'timezone reviewStreak lastReviewDate longestReviewStreak streakFreezes freezeWeek';

/**
 * TZ 2.0 §6.8.2: the day counts for the streak once ≥1 plan task is done. Runs at most once a
 * day per user: the update is conditional on the previous lastReviewDate, so concurrent requests
 * can't count a day twice. Returns streak info, or null when nothing changed.
 */
async function settleStreak(userId, date, now, tasks) {
  if (!tasks.some((t) => t.status === 'done')) return null;
  const u = await User.findById(userId).select(STREAK_FIELDS).lean();
  if (!u || u.lastReviewDate === date) return null;
  const r = applyStreakActivity(
    { streak: u.reviewStreak || 0, lastDate: u.lastReviewDate || null, freezes: u.streakFreezes || 0, longest: u.longestReviewStreak || 0, freezeWeek: u.freezeWeek || null },
    now,
    u.timezone || 'Asia/Tashkent',
    STREAK_FREEZE_CONFIG
  );
  if (r.alreadyCounted) return null;
  const res = await User.updateOne(
    { _id: userId, lastReviewDate: u.lastReviewDate ?? null },
    { $set: { reviewStreak: r.streak, lastReviewDate: r.lastDate, longestReviewStreak: r.longest, streakFreezes: r.freezes, freezeWeek: r.freezeWeek } }
  );
  if (!res.modifiedCount) return null; // a concurrent request settled it
  await trackVocabEvents(userId, [{ name: 'streak_extended', payload: { streak: r.streak, usedFreezes: r.usedFreezes } }]).catch(() => {});
  return { streak: r.streak, extended: true, milestone: r.milestone, usedFreezes: r.usedFreezes, earnedFreeze: r.earnedFreeze, broke: r.broke, freezes: r.freezes };
}

/**
 * After learning activity (review, game, Telegram quiz): re-evaluate today's plan so the streak
 * and task XP update right away — but only until today is settled, so it costs nothing after
 * the first finished task of the day. Never throws (activity is already saved).
 */
export async function touchPlan(userId, now = new Date(), knownLastDate) {
  try {
    if (knownLastDate !== undefined) {
      const u = await User.findById(userId).select('timezone').lean();
      if (knownLastDate === planDate(now, u?.timezone)) return null;
    }
    const plan = await getTodayPlan(userId, now);
    return plan?.streak || null;
  } catch (err) {
    console.error('[plan] touchPlan failed', err);
    return null;
  }
}

/** GET /api/plan/today */
export async function getTodayPlan(userId, now = new Date()) {
  const user = await User.findById(userId).select(USER_FIELDS).lean();
  if (!user) return null;
  const tz = user.timezone || 'Asia/Tashkent';
  const date = planDate(now, tz);
  const inputsKey = planInputsKey(user);

  let plan = await DailyPlan.findOne({ userId, date }).lean();
  if (!plan) {
    const built = await buildFor(user, date, now);
    // Upsert so two concurrent first reads end up with the same single document.
    await DailyPlan.updateOne(
      { userId, date },
      { $setOnInsert: { userId, date, minutes: built.minutes, weakest: built.weakest, inputsKey, tasks: built.tasks, createdAt: now, updatedAt: now } },
      { upsert: true }
    ).catch((err) => {
      if (err?.code !== 11000) throw err;
    });
    plan = await DailyPlan.findOne({ userId, date }).lean();
  } else if (plan.inputsKey !== inputsKey) {
    const built = await buildFor(user, date, now);
    const tasks = mergeRebuilt(plan.tasks, built.tasks);
    await DailyPlan.updateOne({ _id: plan._id }, { $set: { tasks, minutes: built.minutes, weakest: built.weakest, inputsKey, updatedAt: now } });
    plan = { ...plan, tasks, minutes: built.minutes, weakest: built.weakest, inputsKey };
  }

  const signals = await todaySignals(userId, date, tz, now);
  const tasks = plan.tasks.map((t) => ({ ...t }));
  const before = JSON.stringify(tasks.map((t) => [t.status, t.progress]));
  const newlyDone = applySignals(tasks, signals);
  for (const k of newlyDone) tasks.find((t) => t.key === k).doneAt = now;
  if (JSON.stringify(tasks.map((t) => [t.status, t.progress])) !== before) {
    const allDone = tasks.every((t) => t.status === 'done');
    await DailyPlan.updateOne(
      { _id: plan._id },
      { $set: { tasks, updatedAt: now, ...(allDone && !plan.completedAt ? { completedAt: now } : {}) } }
    );
  }
  const xpPaid = newlyDone.length ? await payXp(new mongoose.Types.ObjectId(String(userId)), date, tasks, newlyDone) : 0;
  const streak = await settleStreak(userId, date, now, tasks);
  // What the card shows: current streak, freezes, and whether today already counts.
  const eff = effectiveStreak(
    { streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: 0, freezeWeek: user.freezeWeek || null },
    now,
    tz
  );
  const streakNow = streak
    ? { days: streak.streak, freezes: streak.freezes, todayDone: true }
    : { days: eff.streak, freezes: user.streakFreezes || 0, todayDone: user.lastReviewDate === date };
  return { ...serialize({ ...plan, tasks }, user, now), xpPaid, newlyDone, streak, streakNow };
}

/** POST /api/plan/tasks/:key/complete — manual tick for tasks we can't detect (skill/mock). */
export async function completeTask(userId, key, now = new Date()) {
  const user = await User.findById(userId).select('timezone').lean();
  if (!user) return { error: 'not_found', status: 404 };
  const date = planDate(now, user.timezone);
  const plan = await DailyPlan.findOne({ userId, date }).select('tasks').lean();
  const task = plan?.tasks.find((t) => t.key === key);
  if (!task) return { error: 'task_not_found', status: 404 };
  if (!MANUAL_TYPES.has(task.type)) return { error: 'auto_task', status: 400 };
  if (task.status === 'done') return { ok: true, xpPaid: 0, alreadyDone: true };

  // Conditional update: only the request that flips todo→done proceeds to pay XP.
  const res = await DailyPlan.updateOne(
    { _id: plan._id, tasks: { $elemMatch: { key, status: 'todo' } } },
    { $set: { 'tasks.$.status': 'done', 'tasks.$.progress': task.target || 1, 'tasks.$.doneAt': now, 'tasks.$.manual': true, updatedAt: now } }
  );
  if (!res.modifiedCount) return { ok: true, xpPaid: 0, alreadyDone: true };
  if (plan.tasks.every((t) => t.key === key || t.status === 'done')) {
    await DailyPlan.updateOne({ _id: plan._id, completedAt: null }, { $set: { completedAt: now } });
  }
  const xpPaid = await payXp(new mongoose.Types.ObjectId(String(userId)), date, plan.tasks, [key]);
  const streak = await settleStreak(userId, date, now, [{ status: 'done' }]);
  return { ok: true, xpPaid, streak };
}
