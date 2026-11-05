// "Haftalik hisobot" — weekly report (TZ 2.0 §6.2.4, §6.10.2, §10). Pure; tested in weeklyReport.test.js.
// The server side (src/lib/weeklyReportServer.js) gathers the week's activity; this module decides
// which week is reported, what the numbers mean and what next week's focus is.
//
// Rules:
//   - A week is the ISO week, Monday 00:00 → Sunday 24:00 in the user's timezone.
//   - The report goes out on Sunday evening (WEEKLY_REPORT_CONFIG.hour, local); if the hourly sweep
//     missed the evening, it catches up until Monday noon. On Sunday the "current" week is reported;
//     on any other day the last finished week.
//   - Everyone gets the core report (TZ §6.2.4): words learned, XP, streak, active days, band
//     change and next week's focus skill. Premium also gets the personal part (TZ §10): day by
//     day activity, accuracy, skill practice, comparison with the week before and next week's
//     concrete targets.
import { pickWeakest, newWordTarget, SKILLS } from './todayPlan';

export const WEEKLY_REPORT_CONFIG = { hour: 19, lastHour: 22, catchUpUntilHour: 12, maxWeeksBack: 12 };
const DAY_MS = 86400000;
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const SKILL_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const WEEK_RE = /^(\d{4})-W(\d{2})$/;

const utcDay = (date) => Date.parse(`${date}T00:00:00Z`);
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (date, n) => isoDate(utcDay(date) + n * DAY_MS);

/** A valid IANA zone or the default — an invalid zone must never reach Mongo's $dateToString. */
export function safeTimeZone(tz) {
  if (typeof tz === 'string' && tz) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return tz;
    } catch {
      /* fall through */
    }
  }
  return 'Asia/Tashkent';
}

/** Local calendar date, weekday (1 = Mon … 7 = Sun) and hour of `now` in `tz`. */
export function localParts(now, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTimeZone(tz), year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  return { date, weekday: new Date(utcDay(date)).getUTCDay() || 7, hour: Number(get('hour')) % 24 };
}

/** Monday of the ISO week containing `date`. */
export function mondayOf(date) {
  const wd = new Date(utcDay(date)).getUTCDay() || 7;
  return addDays(date, 1 - wd);
}

/** '2026-W45' for any date in that ISO week. */
export function weekKey(date) {
  const thursday = addDays(mondayOf(date), 3);
  const year = Number(thursday.slice(0, 4));
  const week = Math.floor((utcDay(thursday) - utcDay(`${year}-01-01`)) / (7 * DAY_MS)) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Monday of an ISO week key, or null when the key is malformed. */
export function weekStartOf(key) {
  const m = WEEK_RE.exec(key || '');
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  const monday = addDays(mondayOf(`${year}-01-04`), (week - 1) * 7); // Jan 4 is always in week 1
  return weekKey(monday) === key ? monday : null; // rejects W53 in 52-week years
}

/** The 7 local dates of a week. */
export function weekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Week shown by default: this week on Sunday (the report day), otherwise the last finished week. */
export function defaultReportWeek(now, tz) {
  const { date, weekday } = localParts(now, tz);
  return weekKey(weekday === 7 ? date : addDays(date, -7));
}

/**
 * Validates a requested week: well-formed, not in the future, not older than maxWeeksBack.
 * @returns {string|null}
 */
export function resolveReportWeek(requested, now, tz) {
  const fallback = defaultReportWeek(now, tz);
  if (!requested) return fallback;
  const monday = weekStartOf(requested);
  if (!monday) return null;
  const thisMonday = mondayOf(localParts(now, tz).date);
  const weeksBack = (utcDay(thisMonday) - utcDay(monday)) / (7 * DAY_MS);
  if (weeksBack < 0 || weeksBack > WEEKLY_REPORT_CONFIG.maxWeeksBack) return null;
  return requested;
}

/**
 * Which week should be delivered right now, or null: Sunday from the report hour, plus a catch-up
 * window until Monday noon in case the hourly sweep missed the evening (cron jitter, outage).
 */
export function weeklyReportTarget(now, tz) {
  const { date, weekday, hour } = localParts(now, tz);
  if (weekday === 7 && hour >= WEEKLY_REPORT_CONFIG.hour) return weekKey(date);
  if (weekday === 1 && hour < WEEKLY_REPORT_CONFIG.catchUpUntilHour) return weekKey(addDays(date, -7));
  return null;
}
export const isWeeklyReportTime = (now, tz) => weeklyReportTarget(now, tz) !== null;

/** "2–8 noyabr" / "27 oktabr – 2 noyabr". */
export function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const [, m1, d1] = monday.split('-').map(Number);
  const [, m2, d2] = sunday.split('-').map(Number);
  return m1 === m2 ? `${d1}–${d2} ${UZ_MONTHS[m2 - 1]}` : `${d1} ${UZ_MONTHS[m1 - 1]} – ${d2} ${UZ_MONTHS[m2 - 1]}`;
}

const roundBand = (b) => (b == null || !Number.isFinite(Number(b)) ? null : Math.round(Number(b) * 2) / 2);
const delta = (cur, prev) => (prev == null ? null : cur - prev);

/**
 * @param {object} p
 * @param {string} p.week                 ISO week key
 * @param {Record<string, number>} p.xpByDay        local date → XP
 * @param {Record<string, number>} p.reviewsByDay   local date → answered reviews
 * @param {Record<string, number>} p.sessionsByDay  local date → finished exam / section tests
 * @param {number} p.newWords             distinct words seen for the first time this week
 * @param {number} p.correct              correct answers this week
 * @param {{ xp: number, newWords: number, activeDays: number } | null} p.previous   the week before
 * @param {{ date: string, done: number, total: number }[]} p.plans   daily plans of the week
 * @param {Record<string, number>} p.skillSessions  skill → finished practice sections this week
 * @param {{ estimate: number|null, bands: Record<string, number|null> }} p.bandStart  before Monday
 * @param {{ estimate: number|null, bands: Record<string, number|null> }} p.bandEnd    end of week
 * @param {string|null} p.declaredWeakest onboarding answer
 * @param {number|null} p.targetBand
 * @param {number} p.dailyMinutes
 * @param {number} p.streak               current streak (days)
 * @param {number} p.longestStreak
 */
export function buildWeeklyReport(p) {
  const monday = weekStartOf(p.week);
  const dates = weekDates(monday);
  const plansByDate = new Map((p.plans || []).map((x) => [x.date, x]));
  const days = dates.map((date) => {
    const plan = plansByDate.get(date);
    const xp = Math.max(0, Math.round(p.xpByDay?.[date] || 0));
    const reviews = Math.max(0, p.reviewsByDay?.[date] || 0);
    const sessions = Math.max(0, p.sessionsByDay?.[date] || 0);
    return { date, xp, reviews, sessions, tasksDone: plan?.done || 0, tasksTotal: plan?.total || 0, active: xp > 0 || reviews > 0 || sessions > 0 || (plan?.done || 0) > 0 };
  });

  const xp = days.reduce((s, d) => s + d.xp, 0);
  const reviews = days.reduce((s, d) => s + d.reviews, 0);
  const activeDays = days.filter((d) => d.active).length;
  const tasksDone = days.reduce((s, d) => s + d.tasksDone, 0);
  const tasksTotal = days.reduce((s, d) => s + d.tasksTotal, 0);
  const newWords = Math.max(0, p.newWords || 0);
  const wordGoal = newWordTarget(p.dailyMinutes || 20) * 7;

  const start = roundBand(p.bandStart?.estimate);
  const end = roundBand(p.bandEnd?.estimate);
  const bands = p.bandEnd?.bands || {};
  const focusSkill = pickWeakest(bands, p.declaredWeakest || null);
  const focusBand = bands[focusSkill] ?? null;

  const core = {
    week: p.week,
    start: monday,
    end: dates[6],
    range: formatWeekRange(monday),
    empty: activeDays === 0,
    words: { learned: newWords, goal: wordGoal },
    xp,
    activeDays,
    streak: { days: Math.max(0, p.streak || 0), longest: Math.max(0, p.longestStreak || 0) },
    band: { start, end, change: start != null && end != null ? end - start : null, target: p.targetBand ?? null },
    focus: { skill: focusSkill, band: focusBand, reason: focusBand == null ? 'untested' : 'weakest' },
  };

  const skills = Object.fromEntries(SKILLS.map((s) => [s, { sessions: Math.max(0, p.skillSessions?.[s] || 0), band: bands[s] ?? null }]));
  const prev = p.previous || null;
  const personal = {
    days,
    reviews,
    accuracy: reviews ? Math.round((Math.max(0, p.correct || 0) / reviews) * 100) : null,
    tasks: { done: tasksDone, total: tasksTotal, pct: tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : null },
    skills,
    compare: { xp: delta(xp, prev?.xp ?? null), words: delta(newWords, prev?.newWords ?? null), activeDays: delta(activeDays, prev?.activeDays ?? null) },
    next: nextWeekTargets({ activeDays, newWords, wordGoal, focusSkill, focusBand, focusSessions: skills[focusSkill].sessions }),
  };
  return { ...core, personal };
}

/** Next week's concrete targets: one step up from this week, never a cliff (3 days at the least). */
export function nextWeekTargets({ activeDays, newWords, wordGoal, focusSkill, focusBand, focusSessions }) {
  const days = Math.min(7, Math.max(3, activeDays + 1));
  const words = newWords >= wordGoal ? wordGoal : Math.min(wordGoal, Math.max(newWords + 10, Math.ceil(wordGoal * 0.6)));
  const tips = [];
  if (activeDays < 5) tips.push('consistency');
  if (newWords < wordGoal) tips.push('words');
  if (focusBand == null) tips.push('testFocus');
  else tips.push(focusSessions === 0 ? 'focusMissed' : 'practiceFocus');
  return { days, words, focusSkill, focusSessions: 2, tips };
}

/** The report a user is entitled to: everyone gets the core, Premium the personal part too. */
export function reportForTier(report, tier) {
  if (tier === 'premium') return { ...report, locked: false };
  return { ...report, personal: null, locked: true };
}

const signed = (n) => (n > 0 ? `+${n}` : String(n));

/** Short text for the in-app notification / web push. */
export function weeklyReportNotice(report) {
  const parts = [`${report.words.learned} ta yangi so‘z`, `${report.xp} XP`, `${report.activeDays}/7 faol kun`];
  if (report.band.change) parts.push(`band ${signed(report.band.change)}`);
  return {
    title: `📊 Haftalik hisobot: ${report.range}`,
    body: `${parts.join(' · ')}. Keyingi hafta fokus: ${SKILL_LABEL[report.focus.skill]}.`,
    url: `/app/report?week=${report.week}`,
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Telegram HTML version (sent only to users who opted in to Telegram reminders). */
export function formatWeeklyTelegram(report) {
  const b = report.band;
  const bandLine = b.end == null
    ? '🎯 Band: hali baho yo‘q — bitta bo‘lim testini ishlang'
    : `🎯 Band: ${b.start != null && b.start !== b.end ? `${b.start.toFixed(1)} → ` : ''}<b>${b.end.toFixed(1)}</b>${b.target ? ` (maqsad ${Number(b.target).toFixed(1)})` : ''}`;
  return [
    `📊 <b>Haftalik hisobot</b> · ${esc(report.range)}`,
    '',
    `📚 Yangi so‘zlar: <b>${report.words.learned}</b> / ${report.words.goal}`,
    `⭐ XP: <b>${report.xp}</b>`,
    `🔥 Seriya: <b>${report.streak.days}</b> kun · faol kunlar ${report.activeDays}/7`,
    bandLine,
    '',
    `➡️ Keyingi hafta fokus: <b>${SKILL_LABEL[report.focus.skill]}</b>`,
  ].join('\n');
}

/** Only weeks with some activity get a report — an empty one reads as a reproach, not help. */
export function shouldSendWeeklyReport(report) {
  return !report.empty;
}
