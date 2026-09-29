// Telegram Bot API bilan ishlash uchun yordamchi funksiyalar.
// Bot polling qilmaydi — Telegram har bir xabarni bizning /api/telegram/webhook
// manzilimizga POST qilib yuboradi (bu Vercel'ning serverless funksiyalariga mos keladi).

// Overridable for local testing against a stub server.
const TELEGRAM_API_BASE = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan.');
  }
  return token;
}

// Ro'yxatdan o'tish va parolni tiklashda ishlatiladigan bot. Sozlama (env) berilsa
// o'sha ustun turadi, aks holda asosiy bot.
export const DEFAULT_BOT_USERNAME = 'howtolearnvocabbot';

export function getBotUsername() {
  return (process.env.TELEGRAM_BOT_USERNAME || DEFAULT_BOT_USERNAME).replace(/^@/, '');
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
    // A hung Telegram call must not hold up the request that triggered it
    // (e.g. sending a chat message).
    signal: AbortSignal.timeout(8000),
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

export async function editMessageText(chatId, messageId, text, extra = {}) {
  return callTelegramApi('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', ...extra });
}

export async function answerCallbackQuery(callbackQueryId, text) {
  return callTelegramApi('answerCallbackQuery', { callback_query_id: callbackQueryId, ...(text ? { text } : {}) });
}

export async function setWebhook(url, secretToken) {
  return callTelegramApi('setWebhook', {
    url,
    secret_token: secretToken,
    // callback_query — inline-button answers of the daily mini-test.
    allowed_updates: ['message', 'callback_query'],
  });
}

export async function deleteWebhook() {
  return callTelegramApi('deleteWebhook', {});
}
