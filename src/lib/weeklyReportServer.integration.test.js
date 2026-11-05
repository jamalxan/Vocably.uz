// Weekly report server flow against in-memory MongoDB (TZ 2.0 §6.2.4, §6.10.2, §10).
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, W, R;

// Sunday 2026-11-08, 19:30 in Tashkent (UTC+5) — report time for ISO week 2026-W45 (Nov 2–8).
const SUNDAY_EVENING = new Date('2026-11-08T14:30:00Z');
const at = (iso) => new Date(iso);

describeDb('weekly report (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.XpEvent.init();
    await M.DailyPlan.init();
    W = await import('./weeklyReportServer');
    R = await import('./vocab/server/reminderService');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all(
      [M.User, M.XpEvent, M.ReviewEvent, M.DailyPlan, M.ExamAttempt, M.Notification].map((m) => m.deleteMany({}))
    );
  });

  let phoneN = 0;
  async function makeUser(over = {}) {
    phoneN += 1;
    return M.User.create({
      phone: `+99890100${String(phoneN).padStart(4, '0')}`, password: 'x', name: 'Weekly',
      timezone: 'Asia/Tashkent', dailyStudyMinutes: 20, weakestSkill: 'speaking', targetBand: 7,
      reviewStreak: 5, longestReviewStreak: 11, lastReviewDate: '2026-11-08',
      categories: [{ name: 'Mine', words: [{ word: 'a', translation: 'x' }, { word: 'b', translation: 'y' }, { word: 'c', translation: 'z' }] }],
      ...over,
    });
  }

  async function seedWeek(u) {
    const cat = u.categories[0];
    const [w1, w2, w3] = cat.words;
    await M.XpEvent.insertMany([
      { userId: u._id, amount: 50, reason: 'review', createdAt: at('2026-11-01T20:00:00Z') }, // Mon 01:00 local → this week
      { userId: u._id, amount: 70, reason: 'game', createdAt: at('2026-11-05T10:00:00Z') },
      { userId: u._id, amount: 999, reason: 'game', createdAt: at('2026-11-08T19:30:00Z') }, // Mon 00:30 next week → out
      { userId: u._id, amount: 40, reason: 'review', createdAt: at('2026-10-28T10:00:00Z') }, // previous week
    ]);
    const ev = (wordId, reviewedAt, prevState, isCorrect = true) => ({
      userId: u._id, categoryId: cat._id, wordId, rating: isCorrect ? 3 : 1, isCorrect, prevState, newState: 'learning', reviewedAt: at(reviewedAt),
    });
    await M.ReviewEvent.insertMany([
      ev(w1._id, '2026-11-02T06:00:00Z', 'new'),
      ev(w1._id, '2026-11-03T06:00:00Z', 'learning', false),
      ev(w2._id, '2026-11-03T07:00:00Z', 'new'),
      ev(w3._id, '2026-10-27T07:00:00Z', 'new'), // previous week
    ]);
    await M.DailyPlan.create({ userId: u._id, date: '2026-11-02', tasks: [
      { key: 'review', type: 'review', title: 'r', status: 'done' },
      { key: 'skill', type: 'skill', skill: 'reading', title: 's', status: 'todo' },
    ] });
    const testId = new mongoose.Types.ObjectId();
    await M.ExamAttempt.create([
      { userId: u._id, testId, mode: 'section', sections: ['reading'], currentSection: 'reading', status: 'graded', endsAt: at('2026-11-30T00:00:00Z'),
        submittedAt: at('2026-10-20T10:00:00Z'), result: { reading: { band: 5.5 }, listening: { band: 5.5 } } },
      { userId: u._id, testId, mode: 'section', sections: ['reading'], currentSection: 'reading', status: 'graded', endsAt: at('2026-11-30T00:00:00Z'),
        submittedAt: at('2026-11-04T10:00:00Z'), result: { reading: { band: 6.5 } } },
    ]);
  }

  it('builds the week in the user timezone; Premium gets the personal part', async () => {
    const u = await makeUser({ subscriptionTier: 'premium', subscriptionExpiresAt: at('2026-12-01T00:00:00Z') });
    await seedWeek(u);
    const r = await W.getWeeklyReport(u._id, { now: SUNDAY_EVENING });
    expect(r).toMatchObject({ week: '2026-W45', range: '2–8 noyabr', tier: 'premium', locked: false, thisWeek: '2026-W45', xp: 120, activeDays: 4 }); // Mon XP, Tue review, Wed section test, Thu XP
    expect(r.words.learned).toBe(2);
    expect(r.streak).toEqual({ days: 5, longest: 11 });
    expect(r.band).toMatchObject({ start: 5.5, end: 6, change: 0.5, target: 7 }); // (6.5 + 5.5) / 2
    expect(r.focus.skill).toBe('speaking'); // declared weakest, not yet tested
    expect(r.personal.accuracy).toBe(67);
    expect(r.personal.tasks).toEqual({ done: 1, total: 2, pct: 50 });
    expect(r.personal.skills.reading.sessions).toBe(1);
    expect(r.personal.compare).toEqual({ xp: 80, words: 1, activeDays: 2 }); // 4 days vs 2
  });

  it('an idle previous week compares as zero, not "no data"; a brand-new account has no comparison', async () => {
    const u = await makeUser();
    await M.XpEvent.create({ userId: u._id, amount: 50, reason: 'game', createdAt: at('2026-11-05T10:00:00Z') });
    await M.User.updateOne({ _id: u._id }, { $set: { createdAt: at('2026-10-01T00:00:00Z') } });
    const r = await W.getWeeklyReport(u._id, { now: SUNDAY_EVENING });
    expect(r.locked).toBe(true); // free — comparison is Premium
    const full = await W.getWeeklyReport((await makeUser({ subscriptionTier: 'premium', subscriptionExpiresAt: at('2026-12-01T00:00:00Z'), createdAt: at('2026-10-01T00:00:00Z') }))._id, { now: SUNDAY_EVENING });
    expect(full.personal.compare).toEqual({ xp: 0, words: 0, activeDays: 0 }); // idle last week, idle this week
    const fresh = await makeUser({ subscriptionTier: 'premium', subscriptionExpiresAt: at('2026-12-01T00:00:00Z'), createdAt: at('2026-11-04T00:00:00Z') });
    expect((await W.getWeeklyReport(fresh._id, { now: SUNDAY_EVENING })).personal.compare).toEqual({ xp: null, words: null, activeDays: null });
  });

  it('a week with only section tests is not empty and gets sent', async () => {
    const u = await makeUser();
    await M.ExamAttempt.create({ userId: u._id, testId: new mongoose.Types.ObjectId(), mode: 'section', sections: ['reading'], currentSection: 'reading', status: 'graded', endsAt: at('2026-11-30T00:00:00Z'),
      submittedAt: at('2026-11-04T10:00:00Z'), result: { reading: { band: 6 } } });
    const r = await W.getWeeklyReport(u._id, { now: SUNDAY_EVENING });
    expect(r).toMatchObject({ empty: false, activeDays: 1 });
    expect(await W.processWeeklyReport(u, SUNDAY_EVENING, { sendTelegram: async () => {} })).toMatchObject({ sent: true });
  });

  it('free users get the core report only', async () => {
    const u = await makeUser();
    await seedWeek(u);
    const r = await W.getWeeklyReport(u._id, { now: SUNDAY_EVENING });
    expect(r).toMatchObject({ tier: 'free', locked: true, personal: null, xp: 120 });
  });

  it('an expired Premium falls back to the core report', async () => {
    const u = await makeUser({ subscriptionTier: 'premium', subscriptionExpiresAt: at('2026-10-01T00:00:00Z') });
    expect((await W.getWeeklyReport(u._id, { now: SUNDAY_EVENING })).locked).toBe(true);
  });

  it('Sunday delivery: once per week, Telegram only with opt-in, counted in the daily cap', async () => {
    const u = await makeUser({ telegramChatId: 5551, vocabReminders: { telegram: true } });
    await seedWeek(u);
    const sent = [];
    const sendTelegram = async (chatId, text, opts) => sent.push({ chatId, text, opts });

    const [a, b] = await Promise.all([
      W.processWeeklyReport(u, SUNDAY_EVENING, { sendTelegram }),
      W.processWeeklyReport(u, SUNDAY_EVENING, { sendTelegram }),
    ]);
    expect([a.sent, b.sent].sort()).toEqual([false, true]);
    expect(sent).toHaveLength(1);
    expect(sent[0].text).toContain('Haftalik hisobot');
    expect(sent[0].opts.reply_markup.inline_keyboard[0][0]).toEqual({ text: 'Hisobotni ochish', url: 'https://vocably.uz/app/report?week=2026-W45' });
    const notes = await M.Notification.find({ userId: u._id }).lean();
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ type: 'weekly_report', link: '/app/report?week=2026-W45' });
    const fresh = await M.User.findById(u._id).lean();
    expect(fresh.vocabReminders.weeklyReportWeek).toBe('2026-W45');
    expect(fresh.tgNudge).toMatchObject({ day: '2026-11-08', count: 1 });
    expect(W.weeklyReportOpen(fresh, SUNDAY_EVENING)).toBe(false);
  });

  it('not on Saturday, not for an empty week; reminders off → in-app only (no push, no Telegram)', async () => {
    const quiet = await makeUser();
    expect(await W.processWeeklyReport(quiet, at('2026-11-07T14:30:00Z'))).toEqual({ sent: false, reason: 'not_time' });
    expect(await W.processWeeklyReport(quiet, SUNDAY_EVENING)).toEqual({ sent: false, reason: 'empty' });
    expect(await M.Notification.countDocuments({})).toBe(0);
    const off = await makeUser({ vocabReminders: { enabled: false, telegram: true }, telegramChatId: 777 });
    await seedWeek(off);
    const sent = [];
    expect(await W.processWeeklyReport(off, SUNDAY_EVENING, { sendTelegram: async (...a) => sent.push(a) })).toEqual({ sent: true, telegram: false });
    expect(await M.Notification.countDocuments({ userId: off._id, type: 'weekly_report' })).toBe(1);
    expect(sent).toHaveLength(0);
  });

  it('Monday-morning catch-up delivers last week once; Monday noon is too late', async () => {
    const u = await makeUser();
    await seedWeek(u);
    const monday9 = at('2026-11-09T04:00:00Z');
    expect(await W.processWeeklyReport(u, monday9, { sendTelegram: async () => {} })).toMatchObject({ sent: true });
    const fresh = await M.User.findById(u._id).lean();
    expect(fresh.vocabReminders.weeklyReportWeek).toBe('2026-W45');
    expect(await W.processWeeklyReport(fresh, at('2026-11-09T05:00:00Z'))).toEqual({ sent: false, reason: 'already' });
    const late = await makeUser();
    await seedWeek(late);
    expect(await W.processWeeklyReport(late, at('2026-11-09T07:00:00Z'))).toEqual({ sent: false, reason: 'not_time' });
  });

  it('a failure after the claim hands the week back, so the next hour retries', async () => {
    const u = await makeUser();
    await seedWeek(u);
    const spy = vi.spyOn(M.Notification, 'create').mockRejectedValueOnce(new Error('atlas hiccup'));
    await expect(W.processWeeklyReport(u, SUNDAY_EVENING, { sendTelegram: async () => {} })).rejects.toThrow('atlas hiccup');
    expect((await M.User.findById(u._id).lean()).vocabReminders.weeklyReportWeek ?? null).toBeNull();
    spy.mockRestore();
    expect(await W.processWeeklyReport(await M.User.findById(u._id).lean(), new Date(SUNDAY_EVENING.getTime() + 3600_000), { sendTelegram: async () => {} })).toMatchObject({ sent: true });
    expect(await M.Notification.countDocuments({ userId: u._id })).toBe(1);
  });

  it('runs inside the hourly reminder sweep', async () => {
    const u = await makeUser();
    await seedWeek(u);
    const stats = await R.runReminderSweep({ now: SUNDAY_EVENING, flagEnv: {}, sendTelegram: async () => {} });
    expect(stats.weekly).toBe(1);
    expect(await M.Notification.countDocuments({ type: 'weekly_report' })).toBe(1);
    const again = await R.runReminderSweep({ now: new Date(SUNDAY_EVENING.getTime() + 3600000), flagEnv: {}, sendTelegram: async () => {} });
    expect(again.weekly).toBe(0);
  });
});
