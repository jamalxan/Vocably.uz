// Lug'at eslatmalari — cron tomonidan soatiga chaqiriladi (TZ §55, TZ 2.0 §6.10). Qaror mantiqi: src/lib/vocab/reminders.ts.
import { Notification, User } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { localDateWithCutoff } from '@/lib/srs';
import { sendMessage } from '@/lib/telegram';
import { decideReminder, decideRiskNudge, formatTelegramReminder, isReminderHour, isRiskHour, isTelegramBlockedError, normalizePrefs, telegramReminderMarkup } from '@/lib/vocab/reminders';
import { claimTelegramSlot, releaseTelegramSlot } from '@/lib/telegramCap';
import { isDue } from '@/lib/vocab/selection';
import { vocabEngineFlag } from '@/lib/vocab/access';
import { flattenUserWords } from './words';
import { processWeeklyReport, weeklyReportOpen } from '@/lib/weeklyReportServer';
import { trackVocabEvents } from './ledger';

const BATCH = 100;

const appUrl = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

/**
 * Telegram nusxasi (opt-in). Kunlik 2 ta limit (telegramCap) birinchi tekshiriladi. Xato eslatmaning o'zini buzmaydi;
 * bot bloklangan bo'lsa kanal o'chiriladi.
 */
async function sendTelegramCopy(user, reminder, today, sendTelegram) {
  if (!user.telegramChatId || !normalizePrefs(user.vocabReminders).telegram) return false;
  if (!(await claimTelegramSlot(user._id, today))) return false;
  try {
    await sendTelegram(user.telegramChatId, formatTelegramReminder(reminder, appUrl()), { reply_markup: telegramReminderMarkup(reminder, appUrl()) });
    return true;
  } catch (err) {
    await releaseTelegramSlot(user._id, today);
    if (isTelegramBlockedError(err?.message)) await User.updateOne({ _id: user._id }, { $set: { 'vocabReminders.telegram': false } }).catch(() => {});
    console.error('[vocab reminder telegram]', user._id, err?.message);
    return false;
  }
}

async function deliver(user, reminder, today, dueCount, sendTelegram) {
  await Notification.create({ userId: user._id, type: 'vocab_reminder', title: reminder.title, body: reminder.body, link: reminder.url });
  await sendPushToUser(user._id, { title: reminder.title, body: reminder.body, url: reminder.url });
  const telegram = await sendTelegramCopy(user, reminder, today, sendTelegram);
  await trackVocabEvents(user._id, [{ name: 'reminder_sent', payload: { kind: reminder.kind, due: dueCount, telegram } }]).catch(() => {});
}

const streakOf = (user) => ({ streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0, freezeWeek: user.freezeWeek || null });

/**
 * Bitta foydalanuvchi uchun ikki slot (TZ 2.0 §6.10): (1) tanlangan soatda kunlik reja eslatmasi, (2) 21:00 da seriya
 * turtkisi. Har slot kuniga bir marta atomik "band qilinadi" — parallel/takroriy cron ikki marta yubormaydi; demak
 * kuniga ko'pi bilan 2 ta. @returns {Promise<{sent:number, deferred:boolean}>}
 *   deferred — hech bir slot vaqti hali kelmagan (belgilanmaydi, keyingi cron qayta ko'radi).
 */
export async function processUserReminder(user, now = new Date(), { sendTelegram = sendMessage } = {}) {
  const tz = user.timezone || 'Asia/Tashkent';
  const today = localDateWithCutoff(now, tz);
  const prefs = user.vocabReminders || {};
  const planDue = prefs.lastCheckedOn !== today && isReminderHour(prefs, now, tz);
  const riskDue = prefs.riskCheckedOn !== today && isRiskHour(now, tz);
  if (!planDue && !riskDue) return { sent: 0, deferred: true };

  const dueCount = flattenUserWords(user, { now }).filter((w) => isDue(w, now)).length;
  const streak = streakOf(user);
  let sent = 0;

  if (planDue) {
    const reminder = decideReminder({ dueCount, streak, timeZone: tz, prefs, now });
    // Qaror qanday bo'lsa ham bugun ko'rib chiqilgan deb belgilanadi (navbat keyingi foydalanuvchilarga o'tadi).
    const set = { 'vocabReminders.lastCheckedOn': today };
    if (reminder) Object.assign(set, { 'vocabReminders.lastSentOn': today, 'vocabReminders.lastKind': reminder.kind });
    // Reja eslatmasi 21:00 dan keyin seriya haqida ketsa — bu kechki turtkining o'zi: ikkinchi slotni ham yopamiz.
    const coversRisk = reminder?.kind === 'streak' && isRiskHour(now, tz);
    if (coversRisk) set['vocabReminders.riskCheckedOn'] = today;
    const claimed = await User.updateOne({ _id: user._id, 'vocabReminders.lastCheckedOn': { $ne: today } }, { $set: set });
    if (claimed.modifiedCount && reminder) {
      await deliver(user, reminder, today, dueCount, sendTelegram);
      sent++;
      if (coversRisk) return { sent, deferred: false };
    }
  }

  if (riskDue) {
    const nudge = decideRiskNudge({ dueCount, streak, timeZone: tz, prefs, now });
    const set = { 'vocabReminders.riskCheckedOn': today };
    if (nudge) set['vocabReminders.riskSentOn'] = today;
    const claimed = await User.updateOne({ _id: user._id, 'vocabReminders.riskCheckedOn': { $ne: today } }, { $set: set });
    if (claimed.modifiedCount && nudge) {
      await deliver(user, nudge, today, dueCount, sendTelegram);
      sent++;
    }
  }
  return { sent, deferred: false };
}

/**
 * Foydalanuvchilarni `_id` kursori bilan batch-batch ishlaydi (soatiga ishlaydigan cron: har bir foydalanuvchi o'z
 * mahalliy soatida, kuniga bir marta). "Bugun"/"soat" foydalanuvchi vaqt mintaqasida — UTC sanasiga tayanilmaydi
 * (UTC+10…+14 da mahalliy sana UTC'dan oldinda bo'ladi).
 * Yakshanba kechqurun shu aylanishda haftalik hisobot ham yuboriladi (alohida slot, haftasiga 1 marta).
 * @returns {Promise<{scanned:number, sent:number, weekly:number, skipped:number, deferred:number, done:boolean}>}
 */
export async function runReminderSweep({ now = new Date(), budgetMs = 240_000, flagEnv = process.env, sendTelegram = sendMessage } = {}) {
  const started = Date.now();
  const stats = { scanned: 0, sent: 0, weekly: 0, skipped: 0, deferred: 0, done: false };
  let after = null;
  for (;;) {
    if (Date.now() - started > budgetMs) return stats;
    const users = await User.find({
      ...(after ? { _id: { $gt: after } } : {}),
      'vocabReminders.enabled': { $ne: false },
      chatBanned: { $ne: true },
      lastReviewDate: { $ne: null },
    })
      .sort({ _id: 1 })
      .select('categories reviewStreak lastReviewDate longestReviewStreak streakFreezes freezeWeek timezone vocabReminders role telegramChatId')
      .limit(BATCH);
    if (!users.length) {
      stats.done = true;
      return stats;
    }
    after = users[users.length - 1]._id;
    for (const u of users) {
      stats.scanned++;
      const today = localDateWithCutoff(now, u.timezone || 'Asia/Tashkent');
      // Haftalik hisobot (TZ 2.0 §6.10.2) — kunlik slotlardan mustaqil; xatosi kunlik eslatmani to'xtatmaydi.
      if (weeklyReportOpen(u, now)) {
        try {
          if ((await processWeeklyReport(u, now, { sendTelegram })).sent) stats.weekly++;
        } catch (err) {
          console.error('[weekly report]', u._id, err?.message);
        }
      }
      try {
        const tz = u.timezone || 'Asia/Tashkent';
        const prefs = u.vocabReminders || {};
        const planOpen = prefs.lastCheckedOn !== today;
        const riskOpen = prefs.riskCheckedOn !== today;
        if (!planOpen && !riskOpen) {
          stats.skipped++; // bugun ikkala slot ham ko'rib chiqilgan (og'ir hisob-kitobsiz)
          continue;
        }
        if (!(planOpen && isReminderHour(prefs, now, tz)) && !(riskOpen && isRiskHour(now, tz))) {
          stats.deferred++; // hali o'z soati emas — belgilanmaydi, keyingi cron qayta ko'radi
          continue;
        }
        if (!vocabEngineFlag(String(u._id), u.role, flagEnv).enabled) {
          await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': today, 'vocabReminders.riskCheckedOn': today } });
          stats.skipped++;
          continue;
        }
        const res = await processUserReminder(u, now, { sendTelegram });
        if (res.sent) stats.sent += res.sent;
        else if (res.deferred) stats.deferred++;
        else stats.skipped++;
      } catch (err) {
        stats.skipped++;
        console.error('[vocab reminder]', u._id, err?.message);
        // Xato bo'lgan foydalanuvchi shu kunda qayta urinilib, har soat xato bermasligi uchun belgilab qo'yamiz.
        await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': today, 'vocabReminders.riskCheckedOn': today } }).catch(() => {});
      }
    }
  }
}
