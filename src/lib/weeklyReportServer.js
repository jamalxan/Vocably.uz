// Server side of the weekly report (TZ 2.0 §6.2.4, §6.10.2, §10). Rules: src/lib/weeklyReport.js.
//
// Reading: getWeeklyReport() gathers one ISO week (plus the week before, for the comparison) in the
// user's timezone. Local dates come from Mongo's $dateToString with the user's zone, so a week is
// exactly Monday 00:00 → Sunday 24:00 local, DST included.
// Sending: processWeeklyReport() runs inside the hourly reminder sweep on Sunday evening — in-app
// notification + web push for everyone with activity that week, plus a Telegram copy for users who
// opted in (counted against the 2-a-day cap). `vocabReminders.weeklyReportWeek` is claimed
// atomically, so a week is reported at most once however often the sweep runs.
import mongoose from 'mongoose';
import { User, XpEvent, ReviewEvent, DailyPlan, ExamAttempt, Notification } from '@/lib/models';
import { estimateFromHistory } from '@/lib/exam/attemptServer';
import { effectiveTier } from '@/lib/subscription';
import { sendPushToUser } from '@/lib/webPush';
import { sendMessage } from '@/lib/telegram';
import { claimTelegramSlot, releaseTelegramSlot } from '@/lib/telegramCap';
import { isTelegramBlockedError, normalizePrefs, telegramReminderMarkup } from '@/lib/vocab/reminders';
import {
  addDays, buildWeeklyReport, defaultReportWeek, formatWeeklyTelegram, isWeeklyReportTime, localParts, reportForTier,
  safeTimeZone, shouldSendWeeklyReport, weekKey, weekStartOf, weeklyReportNotice,
} from '@/lib/weeklyReport';

const HOUR_MS = 3600000;
const DAY_MS = 86400000;
const USER_FIELDS = 'timezone dailyStudyMinutes targetBand weakestSkill reviewStreak longestReviewStreak subscriptionTier subscriptionExpiresAt';
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
    ExamAttempt.find({ userId: uid, status: { $in: ['submitted', 'graded'] }, submittedAt: utcWindow(monday, sunday) })
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

  const skillSessions = {};
  for (const a of sessions) {
    if (!inWeek(localParts(new Date(a.submittedAt), tz).date)) continue;
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

  const hadPrev = prevXp > 0 || prevActive.size > 0 || words.prev.size > 0;
  return buildWeeklyReport({
    week,
    xpByDay,
    reviewsByDay,
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
  const tz = safeTimeZone(user.timezone);
  if (!isWeeklyReportTime(now, tz)) return false;
  return (user.vocabReminders?.weeklyReportWeek || null) !== weekKey(localParts(now, tz).date);
}

/**
 * Sunday-evening delivery for one user. Claims the week first (atomic), so concurrent or repeated
 * sweeps never send twice; an empty week is claimed but not sent.
 * @returns {Promise<{ sent: boolean, telegram?: boolean, reason?: string }>}
 */
export async function processWeeklyReport(user, now = new Date(), { sendTelegram = sendMessage } = {}) {
  const tz = safeTimeZone(user.timezone);
  if (!isWeeklyReportTime(now, tz)) return { sent: false, reason: 'not_time' };
  if (normalizePrefs(user.vocabReminders).enabled === false) return { sent: false, reason: 'disabled' };
  const today = localParts(now, tz).date;
  const week = weekKey(today);
  const claimed = await User.updateOne({ _id: user._id, 'vocabReminders.weeklyReportWeek': { $ne: week } }, { $set: { 'vocabReminders.weeklyReportWeek': week } });
  if (!claimed.modifiedCount) return { sent: false, reason: 'already' };

  const full = await User.findById(user._id).select(USER_FIELDS).lean();
  if (!full) return { sent: false, reason: 'gone' };
  const report = await gather(user._id, full, week, tz);
  if (!shouldSendWeeklyReport(report)) return { sent: false, reason: 'empty' };

  const notice = weeklyReportNotice(report);
  await Notification.create({ userId: user._id, type: 'weekly_report', title: notice.title, body: notice.body, link: notice.url });
  await sendPushToUser(user._id, { title: notice.title, body: notice.body, url: notice.url }).catch(() => {});
  const telegram = await sendTelegramCopy(user, report, today, sendTelegram);
  return { sent: true, telegram };
}
