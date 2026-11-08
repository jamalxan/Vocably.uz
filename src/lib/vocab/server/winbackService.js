// "Qaytarish" xabari (win-back) — kunlik cron (src/app/api/internal/vocab/winback). Qaror: src/lib/vocab/winback.ts.
// Kanallar: ilova ichidagi bildirishnoma + push hammaga, Telegram — botga ulangan va bot xabarlarini o'chirmaganlarga.
import { Notification, User } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { sendMessage } from '@/lib/telegram';
import { localDateWithCutoff } from '@/lib/srs';
import { claimTelegramSlot, releaseTelegramSlot } from '@/lib/telegramCap';
import { isTelegramBlockedError } from '@/lib/vocab/reminders';
import { decideWinback, formatWinback, winbackMarkup, WINBACK_CONFIG } from '@/lib/vocab/winback';
import { isDue } from '@/lib/vocab/selection';
import { vocabEngineFlag } from '@/lib/vocab/access';
import { flattenUserWords } from './words';
import { trackVocabEvents } from './ledger';

const BATCH = 100;
const appUrl = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

/** 'YYYY-MM-DD' dan `days` kun oldingi sana. */
function shiftDate(day, days) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - days)).toISOString().slice(0, 10);
}

/**
 * Bitta foydalanuvchi. @returns {Promise<'sent'|'skipped'|'capped'>}
 *   capped — Telegram'ning kunlik 2 ta limiti to'lgan: hech narsa belgilanmaydi, ertaga qayta uriniladi.
 */
export async function processUserWinback(user, now = new Date(), { sendTelegram = sendMessage } = {}) {
  const tz = user.timezone || 'Asia/Tashkent';
  const today = localDateWithCutoff(now, tz);
  const dueCount = flattenUserWords(user, { now }).filter((w) => isDue(w, now)).length;
  const decision = decideWinback({ lastReviewDate: user.lastReviewDate, today, dueCount, prefs: user.vocabReminders });
  if (!decision) return 'skipped';

  const wantsTelegram = !!user.telegramChatId && user.tgDailyPractice !== false;
  if (wantsTelegram && !(await claimTelegramSlot(user._id, today))) return 'capped';

  // Shu nofaollik davri uchun atomik "band qilish" — parallel/takroriy cron ikki marta yubormaydi.
  const claimed = await User.updateOne(
    { _id: user._id, 'vocabReminders.winbackFor': { $ne: user.lastReviewDate } },
    { $set: { 'vocabReminders.winbackFor': user.lastReviewDate } }
  );
  if (!claimed.modifiedCount) {
    if (wantsTelegram) await releaseTelegramSlot(user._id, today);
    return 'skipped';
  }

  const msg = formatWinback({ name: user.name, days: decision.days, due: dueCount, baseUrl: appUrl() });
  await Notification.create({ userId: user._id, type: 'vocab_reminder', title: msg.title, body: msg.body, link: msg.url });
  await sendPushToUser(user._id, { title: msg.title, body: msg.body.split('\n')[0], url: msg.url }).catch(() => {});

  let telegram = false;
  if (wantsTelegram) {
    try {
      await sendTelegram(user.telegramChatId, msg.html, { reply_markup: winbackMarkup(appUrl()), disable_web_page_preview: true });
      telegram = true;
    } catch (err) {
      await releaseTelegramSlot(user._id, today);
      if (isTelegramBlockedError(err?.message)) {
        await User.updateOne({ _id: user._id }, { $set: { tgDailyPractice: false, 'vocabReminders.telegram': false } }).catch(() => {});
      } else {
        console.error('[winback telegram]', user._id, err?.message);
      }
    }
  }
  await trackVocabEvents(user._id, [{ name: 'reminder_sent', payload: { kind: 'winback', due: dueCount, days: decision.days, telegram } }]).catch(() => {});
  return 'sent';
}

/** @returns {Promise<{scanned:number, sent:number, skipped:number, capped:number, failed:number, done:boolean}>} */
export async function runWinbackSweep({ now = new Date(), budgetMs = 240_000, flagEnv = process.env, sendTelegram = sendMessage } = {}) {
  const started = Date.now();
  const stats = { scanned: 0, sent: 0, skipped: 0, capped: 0, failed: 0, done: false };
  // Oldindan saralash (Toshkent sanasi bo'yicha, vaqt mintaqalari uchun 1 kun zaxira); aniq hisob — har foydalanuvchida.
  const latest = shiftDate(localDateWithCutoff(now, 'Asia/Tashkent'), WINBACK_CONFIG.minInactiveDays - 1);
  let after = null;
  for (;;) {
    if (Date.now() - started > budgetMs) return stats;
    const users = await User.find({
      ...(after ? { _id: { $gt: after } } : {}),
      lastReviewDate: { $ne: null, $lte: latest },
      'vocabReminders.enabled': { $ne: false },
      chatBanned: { $ne: true },
    })
      .sort({ _id: 1 })
      .select('name categories lastReviewDate timezone vocabReminders role telegramChatId tgDailyPractice')
      .limit(BATCH);
    if (!users.length) {
      stats.done = true;
      return stats;
    }
    after = users[users.length - 1]._id;
    for (const u of users) {
      stats.scanned++;
      if (u.vocabReminders?.winbackFor === u.lastReviewDate) {
        stats.skipped++; // shu davr uchun allaqachon yuborilgan (og'ir hisobsiz)
        continue;
      }
      if (!vocabEngineFlag(String(u._id), u.role, flagEnv).enabled) {
        stats.skipped++;
        continue;
      }
      try {
        stats[await processUserWinback(u, now, { sendTelegram })]++;
        if (u.telegramChatId) await new Promise((r) => setTimeout(r, 40)); // Telegram'ning 30 msg/s limitidan ancha past
      } catch (err) {
        stats.failed++;
        console.error('[winback]', u._id, err?.message);
      }
    }
  }
}
