import { User, Announcement, Notification } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { sendMessage, sendMedia, copyMessage, messageFileId } from '@/lib/telegram';
import { escapeTelegramHtml } from '@/lib/telegramHtml';

// Reklama / e'lon broadcast — the one place a message goes out to everyone:
// in-app Notification for every user, browser push, and Telegram for users
// whose account is linked to the bot. Two entry points share it:
//   - admin panel (src/app/api/admin/announcements): text + optional uploaded
//     media (GridFS) + optional URL buttons;
//   - the bot (src/app/api/telegram/webhook): the admin sends any message
//     (photo, video, voice, video note, document, text…), confirms, and it is
//     copied as-is (copyMessage) to each linked user.

export const MEDIA_KINDS = ['photo', 'video', 'animation', 'audio', 'voice', 'video_note', 'document'];
export const MEDIA_LABELS = {
  photo: 'Rasm',
  video: 'Video',
  animation: 'GIF',
  audio: 'Audio',
  voice: 'Ovozli xabar',
  video_note: 'Video xabar',
  document: 'Fayl',
};
const MAX_BUTTONS = 4;
const TELEGRAM_CONCURRENCY = 20;

/** Pure: what a Telegram message carries — kind, file_id, text/caption. */
export function describeTelegramMessage(message) {
  if (!message) return null;
  for (const kind of MEDIA_KINDS) {
    const fileId = messageFileId(message, kind);
    if (fileId) {
      const meta = kind === 'photo' ? message.photo[message.photo.length - 1] : message[kind];
      return {
        kind,
        telegramFileId: fileId,
        mime: meta?.mime_type || (kind === 'photo' ? 'image/jpeg' : null),
        fileName: meta?.file_name || null,
        text: (message.caption || '').trim(),
      };
    }
  }
  const text = (message.text || '').trim();
  if (!text) return null;
  return { kind: null, telegramFileId: null, mime: null, fileName: null, text };
}

/** Pure: "Matn | https://..." → { text, url } or null. Only http(s) links. */
export function parseButtonLine(line) {
  const m = String(line || '').match(/^(.{1,64}?)\s*\|\s*(\S+)$/);
  if (!m) return null;
  const text = m[1].trim();
  let url;
  try {
    url = new URL(m[2]);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !text) return null;
  return { text, url: url.toString() };
}

/** Pure: validates buttons from the admin panel ([{text,url}]); bad ones are dropped. */
export function normalizeButtons(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((b) => parseButtonLine(`${String(b?.text || '').trim()} | ${String(b?.url || '').trim()}`))
    .filter(Boolean)
    .slice(0, MAX_BUTTONS);
}

export function inlineKeyboard(buttons) {
  if (!buttons?.length) return undefined;
  return { inline_keyboard: buttons.map((b) => [{ text: b.text, url: b.url }]) };
}

/** Pure: in-app title/body from a free-text message (first line is the title). */
export function splitTitleBody(text, fallbackTitle = 'Yangi e’lon') {
  const clean = String(text || '').trim();
  if (!clean) return { title: fallbackTitle, body: '' };
  const [first, ...rest] = clean.split('\n');
  const title = first.trim().slice(0, 120) || fallbackTitle;
  const body = first.trim().length > 120 ? clean : rest.join('\n').trim();
  return { title, body };
}

function telegramText(title, body) {
  return body ? `<b>${escapeTelegramHtml(title)}</b>\n\n${escapeTelegramHtml(body)}` : `<b>${escapeTelegramHtml(title)}</b>`;
}

async function inChunks(items, size, fn) {
  let ok = 0;
  for (let i = 0; i < items.length; i += size) {
    const results = await Promise.allSettled(items.slice(i, i + size).map(fn));
    ok += results.filter((r) => r.status === 'fulfilled').length;
    results.filter((r) => r.status === 'rejected').slice(0, 2).forEach((r) => console.error('[broadcast] telegram', r.reason?.message || r.reason));
  }
  return ok;
}

/**
 * Sends an announcement to everyone.
 * @param {object} p
 * @param {string} p.adminId
 * @param {string} p.title
 * @param {string} [p.body]
 * @param {{kind, fileId?, telegramFileId?, mime?, fileName?, upload?: {buffer, filename, contentType}}|null} [p.media]
 * @param {{text,url}[]} [p.buttons]
 * @param {'web'|'bot'} [p.source]
 * @param {boolean} [p.telegram=true] also send to linked Telegram accounts
 * @param {{fromChatId:number, messageId:number}} [p.copyFrom] bot flow: copy the admin's message as-is
 */
export async function broadcastAnnouncement({ adminId, title, body = '', media = null, buttons = [], source = 'web', telegram = true, copyFrom = null }) {
  const users = await User.find({}).select('_id telegramChatId').lean();
  const announcement = await Announcement.create({
    title,
    body,
    authorId: adminId,
    recipientCount: users.length,
    media: media ? { kind: media.kind, fileId: media.fileId || null, telegramFileId: media.telegramFileId || null, mime: media.mime || null, fileName: media.fileName || null } : {},
    buttons,
    source,
  });
  const link = `/app/announcements/${announcement._id}`;

  if (users.length) {
    await Notification.insertMany(users.map((u) => ({ userId: u._id, type: 'announcement', title, body, link })));
  }
  await Promise.allSettled(users.map((u) => sendPushToUser(u._id, { title, body: body.split('\n')[0], url: link })));

  let telegramCount = 0;
  const tgUsers = telegram ? users.filter((u) => u.telegramChatId) : [];
  if (tgUsers.length) {
    const reply_markup = inlineKeyboard(buttons);
    if (copyFrom) {
      telegramCount = await inChunks(tgUsers, TELEGRAM_CONCURRENCY, (u) =>
        copyMessage(u.telegramChatId, copyFrom.fromChatId, copyFrom.messageId, reply_markup ? { reply_markup } : {})
      );
    } else if (media?.kind) {
      const caption = telegramText(title, body);
      let fileId = media.telegramFileId || null;
      let rest = tgUsers;
      if (!fileId && media.upload) {
        // Upload once (to the first recipient, or the admin chat), then reuse the file_id.
        const first = process.env.TELEGRAM_ADMIN_CHAT_ID || tgUsers[0].telegramChatId;
        const sent = await sendMedia(first, media.kind, media.upload, { caption, reply_markup }).catch((err) => {
          console.error('[broadcast] media yuklanmadi', err?.message || err);
          return null;
        });
        fileId = messageFileId(sent, media.kind);
        if (fileId) await Announcement.updateOne({ _id: announcement._id }, { $set: { 'media.telegramFileId': fileId } });
        if (String(first) !== String(process.env.TELEGRAM_ADMIN_CHAT_ID)) {
          rest = tgUsers.slice(1);
          telegramCount += sent ? 1 : 0;
        }
      }
      if (fileId) {
        telegramCount += await inChunks(rest, TELEGRAM_CONCURRENCY, (u) => sendMedia(u.telegramChatId, media.kind, fileId, { caption, reply_markup }));
      }
    } else {
      const text = telegramText(title, body);
      telegramCount = await inChunks(tgUsers, TELEGRAM_CONCURRENCY, (u) => sendMessage(u.telegramChatId, text, reply_markup ? { reply_markup } : {}));
    }
    await Announcement.updateOne({ _id: announcement._id }, { $set: { telegramCount } });
  }

  return { announcement, recipientCount: users.length, telegramCount, telegramLinked: tgUsers.length };
}
