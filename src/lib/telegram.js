// Telegram Bot API bilan ishlash uchun yordamchi funksiyalar.
// Bot polling qilmaydi — Telegram har bir xabarni bizning /api/telegram/webhook
// manzilimizga POST qilib yuboradi (bu Vercel'ning serverless funksiyalariga mos keladi).

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan.');
  }
  return token;
}

export function getBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || '';
}

// parse_mode: 'HTML' bilan yuborilayotgan xabarga foydalanuvchi kiritgan erkin matn
// (ism, xabar matni va h.k.) qo'shilganda majburiy — aks holda matnda "<"/">" kabi
// belgilar bo'lsa Telegram API xabarni butunlay rad etadi.
export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getTelegramDeepLink(sessionToken) {
  const username = getBotUsername();
  return `https://t.me/${username}?start=${sessionToken}`;
}

async function callTelegramApi(method, payload) {
  const token = getBotToken();
  const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API xatoligi: ${method}`);
  }
  return data.result;
}

export async function sendMessage(chatId, text, extra = {}) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

// Foydalanuvchidan "Raqamni ulashish" tugmasi orqali kontakt so'raydigan klaviatura
export function requestContactKeyboard() {
  return {
    reply_markup: {
      keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Klaviaturani yashirish
export function removeKeyboard() {
  return { reply_markup: { remove_keyboard: true } };
}

export async function setWebhook(url, secretToken) {
  return callTelegramApi('setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: ['message'],
  });
}

export async function deleteWebhook() {
  return callTelegramApi('deleteWebhook', {});
}
