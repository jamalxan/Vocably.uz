import { NextResponse } from 'next/server';
import { User } from '@/lib/models';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { REMINDER_CONFIG, REMINDER_FREQUENCIES, normalizePrefs } from '@/lib/vocab/reminders';

const view = (u) => {
  const { enabled, frequency, telegram, sendHour } = normalizePrefs(u?.vocabReminders);
  const telegramLinked = !!u?.telegramChatId;
  // Bot ulanmagan bo'lsa Telegram kanali "yoqilgan" ko'rinmaydi (xabar baribir yuborilmaydi).
  return { enabled, frequency, telegram: telegram && telegramLinked, telegramLinked, sendHour, timezone: u?.timezone || 'Asia/Tashkent' };
};

// GET/PATCH /api/vocabulary/reminders — { enabled, frequency, telegram, telegramLinked } (TZ §55)
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role vocabReminders telegramChatId timezone' });
    if (error) return error;
    return NextResponse.json(view(user));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/reminders GET');
  }
}

export async function PATCH(req) {
  try {
    const { userId, user, error } = await requireVocabUser(req, { select: 'role telegramChatId' });
    if (error) return error;
    const body = await readJson(req);
    const set = {};
    if (typeof body?.enabled === 'boolean') set['vocabReminders.enabled'] = body.enabled;
    if (REMINDER_FREQUENCIES.includes(body?.frequency)) set['vocabReminders.frequency'] = body.frequency;
    if (body?.sendHour !== undefined) {
      const h = Number(body.sendHour);
      if (!Number.isInteger(h) || h < REMINDER_CONFIG.minHour || h > REMINDER_CONFIG.maxHour) {
        return NextResponse.json({ error: `Soat ${REMINDER_CONFIG.minHour}–${REMINDER_CONFIG.maxHour} oralig'ida bo'lishi kerak` }, { status: 400 });
      }
      set['vocabReminders.sendHour'] = h;
    }
    if (typeof body?.telegram === 'boolean') {
      if (body.telegram && !user?.telegramChatId) {
        return NextResponse.json({ error: "Avval Telegram botni ulang (ro'yxatdan o'tishda ishlatilgan bot)", code: 'telegram_not_linked' }, { status: 409 });
      }
      set['vocabReminders.telegram'] = body.telegram;
    }
    if (!Object.keys(set).length) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const u = await User.findByIdAndUpdate(userId, { $set: set }, { new: true, projection: { vocabReminders: 1, telegramChatId: 1, timezone: 1 } }).lean();
    return NextResponse.json(view(u));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/reminders PATCH');
  }
}
