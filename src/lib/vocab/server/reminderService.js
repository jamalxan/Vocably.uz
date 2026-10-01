// Lug'at eslatmalari — cron tomonidan chaqiriladi (TZ §55). Qaror mantiqi: src/lib/vocab/reminders.ts.
import { Notification, User } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { localDateWithCutoff } from '@/lib/srs';
import { decideReminder } from '@/lib/vocab/reminders';
import { isDue } from '@/lib/vocab/selection';
import { vocabEngineFlag } from '@/lib/vocab/access';
import { flattenUserWords } from './words';
import { trackVocabEvents } from './ledger';

const BATCH = 100;

/** Bitta foydalanuvchi uchun: qaror -> ilova ichidagi bildirishnoma + push. @returns {Promise<'sent'|'skipped'>} */
export async function processUserReminder(user, now = new Date()) {
  const tz = user.timezone || 'Asia/Tashkent';
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
  await trackVocabEvents(user._id, [{ name: 'reminder_sent', payload: { kind: reminder.kind, due: dueCount } }]).catch(() => {});
  return 'sent';
}

/**
 * Hali bugun ko'rib chiqilmagan foydalanuvchilarni batch-batch ishlaydi, vaqt byudjeti tugaguncha.
 * @returns {Promise<{scanned:number, sent:number, skipped:number, done:boolean}>}
 */
export async function runReminderSweep({ now = new Date(), budgetMs = 240_000, flagEnv = process.env } = {}) {
  const started = Date.now();
  const stats = { scanned: 0, sent: 0, skipped: 0, done: false };
  // Filtr UTC sanasi bo'yicha (taxminiy); aniq "bugun" processUserReminder ichida foydalanuvchi vaqt mintaqasida.
  const todayUtc = localDateWithCutoff(now, 'UTC');
  for (;;) {
    if (Date.now() - started > budgetMs) return stats;
    const users = await User.find({
      'vocabReminders.enabled': { $ne: false },
      'vocabReminders.lastCheckedOn': { $ne: todayUtc },
      chatBanned: { $ne: true },
      lastReviewDate: { $ne: null },
    })
      .select('categories reviewStreak lastReviewDate longestReviewStreak streakFreezes timezone vocabReminders role')
      .limit(BATCH);
    if (!users.length) {
      stats.done = true;
      return stats;
    }
    for (const u of users) {
      stats.scanned++;
      try {
        if (!vocabEngineFlag(String(u._id), u.role, flagEnv).enabled) {
          await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': todayUtc } });
          stats.skipped++;
          continue;
        }
        if ((await processUserReminder(u, now)) === 'sent') stats.sent++;
        else stats.skipped++;
      } catch (err) {
        stats.skipped++;
        console.error('[vocab reminder]', u._id, err?.message);
        // Xato bo'lgan foydalanuvchi keyingi iteratsiyada qayta tanlanib, siklga tushmasligi uchun belgilab qo'yamiz.
        await User.updateOne({ _id: u._id }, { $set: { 'vocabReminders.lastCheckedOn': todayUtc } }).catch(() => {});
      }
    }
  }
}
