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

async function callTelegramApi(method, payload, { timeoutMs = 8000 } = {}) {
  const token = getBotToken();
  const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // A hung Telegram call must not hold up the request that triggered it
    // (e.g. sending a chat message).
    signal: AbortSignal.timeout(timeoutMs),
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

// ---------------------------------------------------------------------------
// Media (reklama/e'lonlar — src/lib/broadcast.js)

/** Telegram method + payload field for each media kind. */
export const MEDIA_METHODS = {
  photo: ['sendPhoto', 'photo'],
  video: ['sendVideo', 'video'],
  animation: ['sendAnimation', 'animation'],
  audio: ['sendAudio', 'audio'],
  voice: ['sendVoice', 'voice'],
  video_note: ['sendVideoNote', 'video_note'],
  document: ['sendDocument', 'document'],
};

/**
 * Sends one media message. `media` is a Telegram file_id (string) or an
 * upload `{ buffer, filename, contentType }` (multipart, up to Telegram's
 * 50 MB). Returns the sent message (its file_id can be reused for the rest
 * of a broadcast so the file is uploaded once).
 */
export async function sendMedia(chatId, kind, media, { caption, reply_markup, parse_mode = 'HTML' } = {}) {
  const spec = MEDIA_METHODS[kind];
  if (!spec) throw new Error(`Noma'lum media turi: ${kind}`);
  const [method, field] = spec;
  const withCaption = kind !== 'video_note'; // video notes have no caption
  if (typeof media === 'string') {
    return callTelegramApi(method, {
      chat_id: chatId,
      [field]: media,
      ...(withCaption && caption ? { caption, parse_mode } : {}),
      ...(reply_markup ? { reply_markup } : {}),
    });
  }
  const form = new FormData();
  form.set('chat_id', String(chatId));
  form.set(field, new Blob([media.buffer], { type: media.contentType || 'application/octet-stream' }), media.filename || 'file');
  if (withCaption && caption) {
    form.set('caption', caption);
    form.set('parse_mode', parse_mode);
  }
  if (reply_markup) form.set('reply_markup', JSON.stringify(reply_markup));
  const res = await fetch(`${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || `Telegram API xatoligi: ${method}`);
  return data.result;
}

/** Copies a message (media, caption and formatting intact) to another chat. */
export async function copyMessage(chatId, fromChatId, messageId, extra = {}) {
  return callTelegramApi('copyMessage', { chat_id: chatId, from_chat_id: fromChatId, message_id: messageId, ...extra });
}

export async function editMessageReplyMarkup(chatId, messageId, reply_markup) {
  return callTelegramApi('editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: reply_markup || { inline_keyboard: [] } });
}

/** Direct download URL for a file the bot has seen (files up to 20 MB). */
export async function getFileUrl(fileId) {
  const file = await callTelegramApi('getFile', { file_id: fileId });
  if (!file?.file_path) throw new Error('Telegram fayl yo‘li topilmadi');
  return `${TELEGRAM_API_BASE}/file/bot${getBotToken()}/${file.file_path}`;
}

/** The file_id of the media in a sent/received Telegram message, by kind. */
export function messageFileId(message, kind) {
  if (!message) return null;
  if (kind === 'photo') return message.photo?.[message.photo.length - 1]?.file_id || null;
  return message[kind]?.file_id || null;
}
