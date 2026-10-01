// Lug'at eslatmalari — cron tomonidan chaqiriladi (TZ §55). Qaror mantiqi: src/lib/vocab/reminders.ts.
import { Notification, User } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { localDateWithCutoff } from '@/lib/srs';
import { sendMessage } from '@/lib/telegram';
import { decideReminder, formatTelegramReminder, isReminderHour, isTelegramBlockedError, normalizePrefs } from '@/lib/vocab/reminders';
import { isDue } from '@/lib/vocab/selection';
import { vocabEngineFlag } from '@/lib/vocab/access';
import { flattenUserWords } from './words';
import { trackVocabEvents } from './ledger';

const BATCH = 100;

const appUrl = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

/** Telegram nusxasi (opt-in). Xato eslatmaning o'zini buzmaydi; bot bloklangan bo'lsa kanal o'chiriladi. */
async function sendTelegramCopy(user, reminder, sendTelegram) {
  if (!user.telegramChatId || !normalizePrefs(user.vocabReminders).telegram) return false;
  try {
    await sendTelegram(user.telegramChatId, formatTelegramReminder(reminder, appUrl()));
    return true;
  } catch (err) {
    if (isTelegramBlockedError(err?.message)) await User.updateOne({ _id: user._id }, { $set: { 'vocabReminders.telegram': false } }).catch(() => {});
    console.error('[vocab reminder telegram]', user._id, err?.message);
    return false;
  }
}

/** Bitta foydalanuvchi uchun: qaror -> ilova ichidagi bildirishnoma + push (+ ixtiyoriy Telegram). @returns {Promise<'sent'|'skipped'|'deferred'>} 'deferred' — hali foydalanuvchining soati emas (belgilanmaydi, keyingi cron qayta ko'radi) */
export async function processUserReminder(user, now = new Date(), { sendTelegram = sendMessage } = {}) {
  const tz = user.timezone || 'Asia/Tashkent';
  if (!isReminderHour(user.vocabReminders, now, tz)) return 'deferred';
  const today = localDateWithCutoff(now, tz);
  const dueCount = flattenUserWords(user, { now }).filter((w) => isDue(w, now)).length;
  const reminder = decideReminder({
    dueCount,
    streak: { streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0 },
    timeZone: tz,
    prefs: user.vocabReminders,
    now,
  });
  // Qaror qanday bo'lsa ham bugun ko'rib chiqilgan deb belgilanadi (navbat keyingi foydalanuvchilarga o'tadi).
  const set = { 'vocabReminders.lastCheckedOn': today };
  if (reminder) set['vocabReminders.lastSentOn'] = today;
  // Atomik "band qilish": parallel/takroriy cron ishga tushsa ham ikkinchisi yubormaydi.
  const claimed = await User.updateOne({ _id: user._id, 'vocabReminders.lastCheckedOn': { $ne: today } }, { $set: set });
  if (!claimed.modifiedCount || !reminder) return 'skipped';
  await Notification.create({ userId: user._id, type: 'vocab_reminder', title: reminder.title, body: reminder.body, link: reminder.url });
  await sendPushToUser(user._id, { title: reminder.title, body: reminder.body, url: reminder.url });
  const telegram = await sendTelegramCopy(user, reminder, sendTelegram);
  await trackVocabEvents(user._id, [{ name: 'reminder_sent', payload: { kind: reminder.kind, due: dueCount, telegram } }]).catch(() => {});
  return 'sent';
}

/**
 * Foydalanuvchilarni `_id` kursori bilan batch-batch ishlaydi (soatiga ishlaydigan cron: har bir foydalanuvchi o'z
 * mahalliy soatida, kuniga bir marta). "Bugun"/"soat" foydalanuvchi vaqt mintaqasida — UTC sanasiga tayanilmaydi
 * (UTC+10…+14 da mahalliy sana UTC'dan oldinda bo'ladi).
 * @returns {Promise<{scanned:number, sent:number, skipped:number, deferred:number, done:boolean}>}
 */
export async function runReminderSweep({ now = new Date(), budgetMs = 240_000, flagEnv = process.env, sendTelegram = sendMessage } = {}) {
  const started = Date.now();
  const stats = { scanned: 0, sent: 0, skipped: 0, deferred: 0, done: false };
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
      .select('categories reviewStreak lastReviewDate longestReviewStreak streakFreezes timezone vocabReminders role telegramChatId')
      .limit(BATCH);
    if (!users.length) {
      stats.done = true;
      return stats;
    }
    after = users[users.length - 1]._id;
    for (const u of users) {
      stats.scanned++;
      const today = localDateWithCutoff(now, u.timezone || 'Asia/Tashkent');
      try {
        if (u.vocabReminders?.lastCheckedOn === today) {
          stats.skipped++; // bugun allaqachon ko'rib chiqilgan (og'ir hisob-kitobsiz)
          continue;
        }
        if (!isReminderHour(u.vocabReminders, now, u.timezone || 'Asia/Tashkent')) {
          stats.deferred++; // hali o'z soati emas — belgilanmaydi, keyingi cron qayta ko'radi
          continue;
        }
        if (!vocabEngineFlag(String(u._id), u.role, flagEnv).enabled) {
          await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': today } });
          stats.skipped++;
          continue;
        }
        const res = await processUserReminder(u, now, { sendTelegram });
        if (res === 'sent') stats.sent++;
        else stats.skipped++;
      } catch (err) {
        stats.skipped++;
        console.error('[vocab reminder]', u._id, err?.message);
        // Xato bo'lgan foydalanuvchi shu kunda qayta urinilib, har soat xato bermasligi uchun belgilab qo'yamiz.
        await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': today } }).catch(() => {});
      }
    }
  }
}
