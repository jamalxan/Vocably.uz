// Server side of the weekly report (TZ 2.0 §6.2.4, §6.10.2, §10). Rules: src/lib/weeklyReport.js.
//
// Reading: getWeeklyReport() gathers one ISO week (plus the week before, for the comparison) in the
// user's timezone. Local dates come from Mongo's $dateToString with the user's zone, so a week is
// exactly Monday 00:00 → Sunday 24:00 local, DST included.
// Sending: runWeeklyReportSweep() runs from the hourly reminder endpoint on Sunday evening (with a
// catch-up window until Monday noon): an in-app notification for everyone with activity that week,
// web push unless reminders are off, and a Telegram copy for users who opted in (within the 2-a-day
// cap). The report is computed first and `vocabReminders.weeklyReportWeek` is claimed atomically
// right before sending, so a week goes out at most once however often the sweep runs — and a send
// that fails after the claim hands the claim back for the next hour.
import mongoose from 'mongoose';
import { User, XpEvent, ReviewEvent, DailyPlan, ExamAttempt, Notification } from '@/lib/models';
import { estimateFromHistory } from '@/lib/exam/attemptServer';
import { effectiveTier } from '@/lib/subscription';
import { sendPushToUser } from '@/lib/webPush';
import { sendMessage } from '@/lib/telegram';
import { claimTelegramSlot, releaseTelegramSlot } from '@/lib/telegramCap';
import { isTelegramBlockedError, normalizePrefs, telegramReminderMarkup } from '@/lib/vocab/reminders';
import {
  addDays, buildWeeklyReport, defaultReportWeek, formatWeeklyTelegram, localParts, reportForTier, safeTimeZone,
  shouldSendWeeklyReport, weekKey, weekStartOf, weeklyReportNotice, weeklyReportTarget,
} from '@/lib/weeklyReport';

const HOUR_MS = 3600000;
const DAY_MS = 86400000;
const USER_FIELDS = 'timezone dailyStudyMinutes targetBand weakestSkill reviewStreak longestReviewStreak subscriptionTier subscriptionExpiresAt createdAt';
const appUrl = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

/** UTC window that surely covers the local dates [from, to] in any timezone (UTC−12 … UTC+14). */
function utcWindow(from, to) {
  return { $gte: new Date(Date.parse(`${from}T00:00:00Z`) - 14 * HOUR_MS), $lt: new Date(Date.parse(`${to}T00:00:00Z`) + DAY_MS + 12 * HOUR_MS) };
}
const localDay = (field, tz) => ({ $dateToString: { format: '%Y-%m-%d', date: field, timezone: tz } });

/** Gathers the raw numbers of `week` (and the week before) for one user. */
async function gather(userId, user, week, tz) {
  const monday = weekStartOf(week);
  const sunday = addDays(monday, 6);
  const prevMonday = addDays(monday, -7);
  const uid = new mongoose.Types.ObjectId(String(userId));
  const span = utcWindow(prevMonday, sunday);

  const [xpRows, reviewRows, newWordRows, plans, sessions, graded] = await Promise.all([
    XpEvent.aggregate([
      { $match: { userId: uid, createdAt: span } },
      { $group: { _id: localDay('$createdAt', tz), xp: { $sum: '$amount' } } },
    ]),
    ReviewEvent.aggregate([
      { $match: { userId: uid, reviewedAt: span } },
      { $group: { _id: localDay('$reviewedAt', tz), n: { $sum: 1 }, correct: { $sum: { $cond: ['$isCorrect', 1, 0] } } } },
    ]),
    // First-time answers: distinct words per local day (a word learned on Mon and Tue counts once).
    ReviewEvent.aggregate([
      { $match: { userId: uid, reviewedAt: span, prevState: 'new' } },
      { $group: { _id: { word: '$wordId', day: localDay('$reviewedAt', tz) } } },
    ]),
    DailyPlan.find({ userId: uid, date: { $gte: prevMonday, $lte: sunday } }).select('date tasks.status tasks.type tasks.skill').lean(),
    ExamAttempt.find({ userId: uid, status: { $in: ['submitted', 'graded'] }, submittedAt: span })
      .select('mode sections submittedAt')
      .lean(),
    ExamAttempt.find({ userId: uid, status: 'graded', mode: { $ne: 'practice' }, submittedAt: { $ne: null, $lt: utcWindow(monday, sunday).$lt } })
      .sort({ submittedAt: -1 })
      .limit(60)
      .select('submittedAt result')
      .lean(),
  ]);

  const inWeek = (d) => d >= monday && d <= sunday;
  const inPrev = (d) => d >= prevMonday && d < monday;
  const xpByDay = {};
  let prevXp = 0;
  for (const r of xpRows) {
    if (inWeek(r._id)) xpByDay[r._id] = r.xp;
    else if (inPrev(r._id)) prevXp += r.xp;
  }
  const reviewsByDay = {};
  const prevActive = new Set();
  let correct = 0;
  for (const r of reviewRows) {
    if (inWeek(r._id)) {
      reviewsByDay[r._id] = r.n;
      correct += r.correct;
    } else if (inPrev(r._id) && r.n > 0) prevActive.add(r._id);
  }
  const words = { cur: new Set(), prev: new Set() };
  for (const r of newWordRows) {
    if (inWeek(r._id.day)) words.cur.add(String(r._id.word));
    else if (inPrev(r._id.day)) words.prev.add(String(r._id.word));
  }
  const planRows = plans.map((p) => ({ date: p.date, done: p.tasks.filter((t) => t.status === 'done').length, total: p.tasks.length }));
  for (const r of xpRows) if (inPrev(r._id) && r.xp > 0) prevActive.add(r._id);
  for (const p of planRows) if (inPrev(p.date) && p.done > 0) prevActive.add(p.date);

  // Exam / section tests count as activity too (they award no XP and no review events).
  const skillSessions = {};
  const sessionsByDay = {};
  for (const a of sessions) {
    const day = localParts(new Date(a.submittedAt), tz).date;
    if (inPrev(day)) prevActive.add(day);
    if (!inWeek(day)) continue;
    sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    for (const s of a.sections || []) skillSessions[s] = (skillSessions[s] || 0) + 1;
  }

  const toRow = (a) => ({
    listening: a.result?.listening?.band ?? null,
    reading: a.result?.reading?.band ?? null,
    writing: a.result?.writing?.band ?? null,
    speaking: a.result?.speaking?.band ?? null,
  });
  const gradedDated = graded.map((a) => ({ a, date: localParts(new Date(a.submittedAt), tz).date })).filter((x) => x.date <= sunday);
  const bandEnd = estimateFromHistory(gradedDated.map((x) => toRow(x.a)));
  const bandStart = estimateFromHistory(gradedDated.filter((x) => x.date < monday).map((x) => toRow(x.a)));

  // The comparison exists whenever the account already existed last week — an idle week is "0", not "no data".
  const existedLastWeek = !!user.createdAt && new Date(user.createdAt) < new Date(`${prevMonday}T00:00:00Z`);
  const hadPrev = existedLastWeek || prevXp > 0 || prevActive.size > 0 || words.prev.size > 0;
  return buildWeeklyReport({
    week,
    xpByDay,
    reviewsByDay,
    sessionsByDay,
    newWords: words.cur.size,
    correct,
    previous: hadPrev ? { xp: prevXp, newWords: words.prev.size, activeDays: prevActive.size } : null,
    plans: planRows.filter((p) => inWeek(p.date)),
    skillSessions,
    bandStart,
    bandEnd,
    declaredWeakest: user.weakestSkill || null,
    targetBand: user.targetBand ?? null,
    dailyMinutes: user.dailyStudyMinutes || 20,
    streak: user.reviewStreak || 0,
    longestStreak: user.longestReviewStreak || 0,
  });
}

/**
 * GET /api/reports/weekly — the report the user is entitled to (core for all, personal part for Premium).
 * @param {string} [week] ISO week key; already validated by the route (resolveReportWeek).
 */
export async function getWeeklyReport(userId, { week, now = new Date() } = {}) {
  const user = await User.findById(userId).select(USER_FIELDS).lean();
  if (!user) return null;
  const tz = safeTimeZone(user.timezone);
  const key = week || defaultReportWeek(now, tz);
  const report = await gather(userId, user, key, tz);
  const tier = effectiveTier(user, now);
  return { ...reportForTier(report, tier), tier, thisWeek: weekKey(localParts(now, tz).date) };
}

async function sendTelegramCopy(user, report, today, sendTelegram) {
  if (!user.telegramChatId || !normalizePrefs(user.vocabReminders).telegram) return false;
  if (!(await claimTelegramSlot(user._id, today))) return false;
  const notice = weeklyReportNotice(report);
  try {
    const markup = telegramReminderMarkup({ url: notice.url }, appUrl());
    markup.inline_keyboard[0][0].text = 'Hisobotni ochish';
    await sendTelegram(user.telegramChatId, formatWeeklyTelegram(report), { reply_markup: markup });
    return true;
  } catch (err) {
    await releaseTelegramSlot(user._id, today);
    if (isTelegramBlockedError(err?.message)) await User.updateOne({ _id: user._id }, { $set: { 'vocabReminders.telegram': false } }).catch(() => {});
    console.error('[weekly report telegram]', user._id, err?.message);
    return false;
  }
}

/** Whether the sweep should look at this user now (cheap check, no queries). */
export function weeklyReportOpen(user, now) {
  const target = weeklyReportTarget(now, safeTimeZone(user.timezone));
  return !!target && (user.vocabReminders?.weeklyReportWeek || null) !== target;
}

/**
 * Delivery for one user (Sunday evening, or the Monday-morning catch-up). The report is computed
 * first; the week is then claimed atomically right before sending, so concurrent or repeated sweeps
 * never send twice, and a failure after the claim hands it back so the next hour retries. An empty
 * week is claimed but not sent. The in-app notification does not depend on the daily-reminder
 * toggle (Premium pays for this report); push and Telegram follow the user's reminder settings.
 * @returns {Promise<{ sent: boolean, telegram?: boolean, reason?: string }>}
 */
export async function processWeeklyReport(user, now = new Date(), { sendTelegram = sendMessage } = {}) {
  const tz = safeTimeZone(user.timezone);
  const week = weeklyReportTarget(now, tz);
  if (!week) return { sent: false, reason: 'not_time' };
  const previous = user.vocabReminders?.weeklyReportWeek || null;
  if (previous === week) return { sent: false, reason: 'already' };

  const full = await User.findById(user._id).select(USER_FIELDS).lean();
  if (!full) return { sent: false, reason: 'gone' };
  const report = await gather(user._id, full, week, tz);

  const claim = () => User.updateOne({ _id: user._id, 'vocabReminders.weeklyReportWeek': { $ne: week } }, { $set: { 'vocabReminders.weeklyReportWeek': week } });
  if (!shouldSendWeeklyReport(report)) {
    await claim();
    return { sent: false, reason: 'empty' };
  }
  if (!(await claim()).modifiedCount) return { sent: false, reason: 'already' };
  try {
    const notice = weeklyReportNotice(report);
    await Notification.create({ userId: user._id, type: 'weekly_report', title: notice.title, body: notice.body, link: notice.url });
    const prefs = normalizePrefs(user.vocabReminders);
    if (prefs.enabled !== false) await sendPushToUser(user._id, { title: notice.title, body: notice.body, url: notice.url }).catch(() => {});
    const telegram = prefs.enabled !== false ? await sendTelegramCopy(user, report, localParts(now, tz).date, sendTelegram) : false;
    return { sent: true, telegram };
  } catch (err) {
    // Hand the claim back (only if it is still ours) so the next hourly run retries.
    await User.updateOne({ _id: user._id, 'vocabReminders.weeklyReportWeek': week }, { $set: { 'vocabReminders.weeklyReportWeek': previous } }).catch(() => {});
    throw err;
  }
}

const BATCH = 200;
const CONCURRENCY = 8;
const SWEEP_FIELDS = '_id timezone vocabReminders telegramChatId';

/**
 * Hourly weekly-report pass (called from the reminders endpoint before the daily sweep). Skips the
 * query entirely outside the delivery window; otherwise walks users by `_id`, excluding the ones who
 * already got this week's report, and processes them a few at a time so a Sunday evening with
 * thousands of users fits the budget. Per-user errors are logged, never fatal.
 * @returns {Promise<{ scanned: number, sent: number, skipped: number, done: boolean }>}
 */
export async function runWeeklyReportSweep({ now = new Date(), budgetMs = 120_000, sendTelegram = sendMessage } = {}) {
  const stats = { scanned: 0, sent: 0, skipped: 0, done: false };
  // The product's home timezone decides whether the window is open at all; each user is still checked in their own.
  const target = weeklyReportTarget(now, 'Asia/Tashkent');
  if (!target) return { ...stats, done: true };
  const started = Date.now();
  let after = null;
  for (;;) {
    if (Date.now() - started > budgetMs) return stats;
    const users = await User.find({
      ...(after ? { _id: { $gt: after } } : {}),
      lastReviewDate: { $ne: null },
      chatBanned: { $ne: true },
      'vocabReminders.weeklyReportWeek': { $ne: target },
    })
      .sort({ _id: 1 })
      .select(SWEEP_FIELDS)
      .limit(BATCH)
      .lean();
    if (!users.length) {
      stats.done = true;
      return stats;
    }
    after = users[users.length - 1]._id;
    for (let i = 0; i < users.length; i += CONCURRENCY) {
      await Promise.all(
        users.slice(i, i + CONCURRENCY).map(async (u) => {
          stats.scanned++;
          if (!weeklyReportOpen(u, now)) return void stats.skipped++;
          try {
            if ((await processWeeklyReport(u, now, { sendTelegram })).sent) stats.sent++;
            else stats.skipped++;
          } catch (err) {
            stats.skipped++;
            console.error('[weekly report]', u._id, err?.message);
          }
        })
      );
    }
  }
}
