import { describe, it, expect } from 'vitest';
import {
  weekKey, weekStartOf, mondayOf, weekDates, defaultReportWeek, resolveReportWeek, isWeeklyReportTime, formatWeekRange,
  localParts, safeTimeZone, buildWeeklyReport, nextWeekTargets, reportForTier, weeklyReportNotice, formatWeeklyTelegram,
  shouldSendWeeklyReport,
} from './weeklyReport';
import { isoWeek } from './vocab/streak';

const TZ = 'Asia/Tashkent';
// 2026-11-08 is a Sunday; Tashkent = UTC+5.
const at = (iso) => new Date(iso);

describe('ISO weeks', () => {
  it('weekKey agrees with the streak module across year edges', () => {
    for (const d of ['2026-11-02', '2026-11-08', '2026-01-01', '2025-12-29', '2027-01-03', '2026-12-31', '2020-12-31', '2021-01-03']) {
      expect(weekKey(d)).toBe(isoWeek(d));
    }
  });
  it('weekStartOf round-trips and rejects bad keys', () => {
    expect(weekStartOf('2026-W45')).toBe('2026-11-02');
    expect(weekStartOf('2026-W01')).toBe('2025-12-29');
    expect(weekStartOf('2020-W53')).toBe('2020-12-28');
    expect(weekStartOf('2026-W53')).toBe('2026-12-28'); // 2026 starts on Thursday → 53 weeks
    expect(weekStartOf('2025-W53')).toBeNull(); // 2025 has 52
    for (const bad of ['', null, '2026-45', '2026-W00', '2026-W60', '2026-W4', 'x']) expect(weekStartOf(bad)).toBeNull();
  });
  it('mondayOf / weekDates', () => {
    expect(mondayOf('2026-11-08')).toBe('2026-11-02');
    expect(mondayOf('2026-11-02')).toBe('2026-11-02');
    expect(weekDates('2026-11-02')).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']);
  });
  it('formatWeekRange in Uzbek, across months', () => {
    expect(formatWeekRange('2026-11-02')).toBe('2–8 noyabr');
    expect(formatWeekRange('2026-10-26')).toBe('26 oktabr – 1 noyabr');
  });
});

describe('which week, and when', () => {
  it('local parts follow the timezone; a bad zone falls back to Tashkent', () => {
    expect(localParts(at('2026-11-07T19:30:00Z'), TZ)).toEqual({ date: '2026-11-08', weekday: 7, hour: 0 });
    expect(safeTimeZone('Not/AZone')).toBe(TZ);
    expect(safeTimeZone('Europe/London')).toBe('Europe/London');
  });
  it('Sunday reports the current week, any other day the last finished one', () => {
    expect(defaultReportWeek(at('2026-11-08T14:00:00Z'), TZ)).toBe('2026-W45'); // Sun 19:00
    expect(defaultReportWeek(at('2026-11-09T04:00:00Z'), TZ)).toBe('2026-W45'); // Mon 09:00
    expect(defaultReportWeek(at('2026-11-07T04:00:00Z'), TZ)).toBe('2026-W44'); // Sat
  });
  it('resolveReportWeek: no future weeks, no ancient weeks, no junk', () => {
    const now = at('2026-11-05T07:00:00Z');
    expect(resolveReportWeek(undefined, now, TZ)).toBe('2026-W44');
    expect(resolveReportWeek('2026-W45', now, TZ)).toBe('2026-W45'); // this week, partial — allowed
    expect(resolveReportWeek('2026-W46', now, TZ)).toBeNull();
    expect(resolveReportWeek('2026-W33', now, TZ)).toBe('2026-W33'); // 12 weeks back
    expect(resolveReportWeek('2026-W32', now, TZ)).toBeNull();
    expect(resolveReportWeek('2026-W45; drop', now, TZ)).toBeNull();
  });
  it('report time = Sunday 19:00–22:59 local', () => {
    expect(isWeeklyReportTime(at('2026-11-08T13:59:00Z'), TZ)).toBe(false); // 18:59
    expect(isWeeklyReportTime(at('2026-11-08T14:00:00Z'), TZ)).toBe(true); // 19:00
    expect(isWeeklyReportTime(at('2026-11-08T17:59:00Z'), TZ)).toBe(true); // 22:59
    expect(isWeeklyReportTime(at('2026-11-08T18:00:00Z'), TZ)).toBe(false); // 23:00
    expect(isWeeklyReportTime(at('2026-11-07T14:00:00Z'), TZ)).toBe(false); // Saturday
    expect(isWeeklyReportTime(at('2026-11-08T14:00:00Z'), 'America/New_York')).toBe(false); // 09:00 there
  });
});

const base = {
  week: '2026-W45',
  xpByDay: { '2026-11-02': 120, '2026-11-03': 40, '2026-11-05': 200, '2026-10-30': 999 },
  reviewsByDay: { '2026-11-02': 20, '2026-11-04': 5, '2026-11-05': 15 },
  newWords: 30,
  correct: 32,
  previous: { xp: 300, newWords: 40, activeDays: 2 },
  plans: [{ date: '2026-11-02', done: 3, total: 4 }, { date: '2026-11-06', done: 0, total: 4 }],
  skillSessions: { reading: 2, listening: 1 },
  bandStart: { estimate: 5.5, bands: {} },
  bandEnd: { estimate: 6.0, bands: { reading: 6.5, listening: 6.0, writing: 5.5, speaking: 6.0 } },
  declaredWeakest: 'speaking',
  targetBand: 7,
  dailyMinutes: 20,
  streak: 4,
  longestStreak: 9,
};

describe('buildWeeklyReport', () => {
  const r = buildWeeklyReport(base);
  it('core numbers only count the 7 days of the week', () => {
    expect(r).toMatchObject({ week: '2026-W45', start: '2026-11-02', end: '2026-11-08', range: '2–8 noyabr', empty: false, xp: 360, activeDays: 4 });
    expect(r.words).toEqual({ learned: 30, goal: 56 }); // 8/day at 20 min
    expect(r.streak).toEqual({ days: 4, longest: 9 });
  });
  it('band change and focus = weakest measured skill', () => {
    expect(r.band).toEqual({ start: 5.5, end: 6, change: 0.5, target: 7 });
    expect(r.focus).toEqual({ skill: 'writing', band: 5.5, reason: 'weakest' });
  });
  it('untested skill becomes the focus, marked untested', () => {
    const x = buildWeeklyReport({ ...base, bandEnd: { estimate: 6, bands: { reading: 6, listening: 6 } } });
    expect(x.focus).toEqual({ skill: 'speaking', band: null, reason: 'untested' });
    expect(x.personal.next.tips).toContain('testFocus');
  });
  it('no band data → no change, never NaN', () => {
    const x = buildWeeklyReport({ ...base, bandStart: { estimate: null }, bandEnd: { estimate: null, bands: {} } });
    expect(x.band).toEqual({ start: null, end: null, change: null, target: 7 });
  });
  it('personal: days, accuracy, tasks, skills, comparison', () => {
    const p = r.personal;
    expect(p.days).toHaveLength(7);
    expect(p.days[0]).toEqual({ date: '2026-11-02', xp: 120, reviews: 20, tasksDone: 3, tasksTotal: 4, active: true });
    expect(p.days[2]).toMatchObject({ date: '2026-11-04', xp: 0, reviews: 5, active: true });
    expect(p.days[4]).toMatchObject({ date: '2026-11-06', active: false });
    expect(p.reviews).toBe(40);
    expect(p.accuracy).toBe(80);
    expect(p.tasks).toEqual({ done: 3, total: 8, pct: 38 });
    expect(p.skills.reading).toEqual({ sessions: 2, band: 6.5 });
    expect(p.skills.writing).toEqual({ sessions: 0, band: 5.5 });
    expect(p.compare).toEqual({ xp: 60, words: -10, activeDays: 2 });
  });
  it('first week ever: no comparison, empty flag', () => {
    const x = buildWeeklyReport({ ...base, xpByDay: {}, reviewsByDay: {}, plans: [], newWords: 0, previous: null });
    expect(x.empty).toBe(true);
    expect(x.personal.compare).toEqual({ xp: null, words: null, activeDays: null });
    expect(x.personal.accuracy).toBeNull();
    expect(shouldSendWeeklyReport(x)).toBe(false);
    expect(shouldSendWeeklyReport(r)).toBe(true);
  });
});

describe('next week targets', () => {
  it('one step up, capped', () => {
    expect(nextWeekTargets({ activeDays: 2, newWords: 10, wordGoal: 56, focusSkill: 'writing', focusBand: 5.5, focusSessions: 0 }))
      .toEqual({ days: 5, words: 34, focusSkill: 'writing', focusSessions: 2, tips: ['consistency', 'words', 'focusMissed'] });
    expect(nextWeekTargets({ activeDays: 7, newWords: 80, wordGoal: 56, focusSkill: 'reading', focusBand: null, focusSessions: 3 }))
      .toEqual({ days: 7, words: 56, focusSkill: 'reading', focusSessions: 2, tips: ['testFocus'] });
    expect(nextWeekTargets({ activeDays: 6, newWords: 50, wordGoal: 56, focusSkill: 'reading', focusBand: 6, focusSessions: 1 }).words).toBe(56);
  });
});

describe('tier gating and texts', () => {
  const r = buildWeeklyReport(base);
  it('Premium gets the personal part; free and standard get the core only', () => {
    expect(reportForTier(r, 'premium')).toMatchObject({ locked: false, personal: expect.any(Object) });
    for (const t of ['free', 'standard', undefined]) expect(reportForTier(r, t)).toMatchObject({ locked: true, personal: null, xp: 360 });
  });
  it('notification text', () => {
    expect(weeklyReportNotice(r)).toEqual({
      title: '📊 Haftalik hisobot: 2–8 noyabr',
      body: '30 ta yangi so‘z · 360 XP · 4/7 faol kun · band +0.5. Keyingi hafta fokus: Writing.',
      url: '/app/report?week=2026-W45',
    });
  });
  it('Telegram text shows band movement and target', () => {
    const t = formatWeeklyTelegram(r);
    expect(t).toContain('5.5 → <b>6.0</b> (maqsad 7.0)');
    expect(t).toContain('Yangi so‘zlar: <b>30</b> / 56');
    expect(t).toContain('fokus: <b>Writing</b>');
    const none = formatWeeklyTelegram(buildWeeklyReport({ ...base, bandStart: { estimate: null }, bandEnd: { estimate: null, bands: {} } }));
    expect(none).toContain('hali baho yo‘q');
  });
});
