// Shared by every sign-up path (phone + bot OTP in auth/verify-code, Telegram Login Widget in auth/telegram).
import { sendMessage } from '@/lib/telegram';
import { formatPhoneDisplay } from '@/lib/phone';
import { escapeTelegramHtml } from '@/lib/telegramHtml';

/** Five starter words so a new account never opens on an empty vocabulary. */
export function starterCategories() {
  return [
    {
      name: 'Words 1',
      words: [
        { word: 'arise', syns: ["paydo bo'lmoq", "tug'ilmoq"] },
        { word: 'benefactor', syns: ["muruvvat ko'rsatuvchi"] },
        { word: 'blacksmith', syns: ['temirchi'] },
        { word: 'charitable', syns: ['marhamatli'] },
        { word: 'chimney', syns: ["mo'ri"] },
      ],
    },
  ];
}

// Yangi ro'yxatdan o'tgan foydalanuvchi haqida admin'ga Telegram orqali xabar.
// Xato bo'lsa faqat log qilinadi — bildirishnoma ro'yxatdan o'tishni bloklamasligi kerak.
export async function notifyAdminNewUser(user, { via = 'phone', username = '' } = {}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return;
  const contact =
    via === 'telegram'
      ? `✈️ Telegram: <b>${username ? '@' + escapeTelegramHtml(username) : escapeTelegramHtml(String(user.telegramChatId))}</b>`
      : `📱 Telefon: <b>${formatPhoneDisplay(user.phone)}</b>`;
  try {
    await sendMessage(adminChatId, `🆕 <b>Yangi foydalanuvchi qo'shildi</b>\n\n👤 Ism: <b>${escapeTelegramHtml(user.name) || '(ismsiz)'}</b>\n${contact}`);
  } catch (err) {
    console.error('[telegram] yangi user bildirishnomasi yuborilmadi', err?.message || err);
  }
}
