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

/**
 * Bot for "Telegram orqali kirish", or null when it is not configured on this server.
 * `id` is the numeric bot id — the public part of the token before ":" (Telegram shows it to every user of
 * the login popup); the secret part never leaves the server.
 */
export function loginWidgetBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const id = Number(token.split(':')[0]);
  if (!token || !Number.isSafeInteger(id) || id <= 0 || process.env.TELEGRAM_LOGIN_WIDGET === 'off') return null;
  return { id, username: getBotUsername() };
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

// Update types the bot needs. callback_query = every inline-button press (daily mini-test answers,
// "turn reminders off", reklama confirmation).
export const WEBHOOK_UPDATES = ['message', 'callback_query'];

export async function setWebhook(url, secretToken) {
  return callTelegramApi('setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: WEBHOOK_UPDATES,
  });
}

/**
 * Telegram delivers only the update types the webhook was registered with, and keeps that list until the next
 * setWebhook. A webhook registered with an older list (prod, Nov 2026: ['message']) still receives messages,
 * so the bot looks alive, while every inline button it sends is dead. This re-registers the SAME url with the
 * full list when a type is missing.
 * Returns 'ok' | 'repaired' | 'unset' (no webhook, e.g. local dev) | 'no-secret'.
 */
export async function ensureWebhookUpdates() {
  const info = await callTelegramApi('getWebhookInfo', {}, { timeoutMs: 4000 });
  if (!info?.url) return 'unset';
  // No list = Telegram's default set, which includes both types.
  const allowed = info.allowed_updates;
  if (!Array.isArray(allowed) || WEBHOOK_UPDATES.every((u) => allowed.includes(u))) return 'ok';
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  // Re-registering without the secret would make Telegram stop sending it, and the webhook rejects such requests.
  if (!secret) return 'no-secret';
  await setWebhook(info.url, secret);
  return 'repaired';
}

const WEBHOOK_CHECK_EVERY_MS = 60 * 60 * 1000;
let webhookCheckedAt = 0;

/**
 * `ensureWebhookUpdates` at most once an hour per server instance (`force` skips the throttle). Never throws:
 * the callers are the webhook itself and the daily cron, and neither may fail because of this check.
 */
export async function healWebhook({ force = false, now = Date.now() } = {}) {
  if (!force && now - webhookCheckedAt < WEBHOOK_CHECK_EVERY_MS) return 'skipped';
  webhookCheckedAt = now;
  try {
    const state = await ensureWebhookUpdates();
    if (state === 'repaired') console.warn('[telegram] webhook re-registered: button presses (callback_query) were not being delivered');
    if (state === 'no-secret') console.error('[telegram] webhook does not deliver button presses and TELEGRAM_WEBHOOK_SECRET is not set, so it was not re-registered');
    return state;
  } catch (err) {
    webhookCheckedAt = 0; // check again on the next update
    console.error('[telegram] webhook check failed:', err?.message);
    return 'error';
  }
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
