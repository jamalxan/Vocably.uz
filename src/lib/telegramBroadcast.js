import { BroadcastDraft, User, AdminAuditLog } from '@/lib/models';
import { sendMessage, editMessageReplyMarkup, answerCallbackQuery } from '@/lib/telegram';
import { describeTelegramMessage, parseButtonLine, splitTitleBody, broadcastAnnouncement, MEDIA_LABELS } from '@/lib/broadcast';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { getWelcomeTrial, setWelcomeTrial, normalizeWelcomeTrial } from '@/lib/settings';
import { TIER_CONFIG } from '@/lib/entitlements';

// Bot side of reklama/e'lon (admin chat only — TELEGRAM_ADMIN_CHAT_ID):
//   1. the admin sends ANY message to the bot — text, photo, video, voice,
//      video note, document, GIF, audio;
//   2. the bot answers with a preview + inline buttons:
//      📣 Barchaga yuborish · 🔘 Tugma qo'shish · ❌ Bekor;
//   3. "Tugma qo'shish" → the next line "Matn | https://…" becomes a URL button;
//   4. "Barchaga yuborish" → the message is copied as-is (media and formatting
//      intact) to every user linked to the bot, and the same announcement
//      appears in the app (notification + push) for everyone else.
// Only one draft per admin chat; a new message replaces the old draft.
// Also here: `/admin trial …` — the welcome-trial setting from the bot.

const MAX_BUTTONS = 4;

export function isAdminChat(chatId) {
  const admin = process.env.TELEGRAM_ADMIN_CHAT_ID;
  return !!admin && String(chatId) === String(admin);
}

const KEYBOARD = {
  inline_keyboard: [
    [{ text: '📣 Barchaga yuborish', callback_data: 'bc:send' }],
    [
      { text: "🔘 Tugma qo'shish", callback_data: 'bc:btn' },
      { text: '❌ Bekor', callback_data: 'bc:cancel' },
    ],
  ],
};

async function recipientCounts() {
  const [total, telegram] = await Promise.all([User.countDocuments({}), User.countDocuments({ telegramChatId: { $ne: null } })]);
  return { total, telegram };
}

async function previewText(draft) {
  const { total, telegram } = await recipientCounts();
  const kind = draft.kind ? MEDIA_LABELS[draft.kind] || draft.kind : 'Matn';
  const lines = [
    '📣 <b>Reklama tayyor</b>',
    `Tur: <b>${kind}</b>${draft.text ? ` + matn (${draft.text.length} belgi)` : ''}`,
    draft.buttons.length ? `Tugmalar: ${draft.buttons.map((b) => `[${escapeTelegramHtml(b.text)}]`).join(' ')}` : "Tugmalar: yo'q",
    '',
    `Qabul qiluvchilar: Telegram <b>${telegram}</b> · ilova ichida <b>${total}</b>`,
    '',
    "Yuborishni tasdiqlaysizmi? Boshqa xabar yuborsangiz, bu bekor bo'lib yangisi tayyorlanadi.",
  ];
  return lines.join('\n');
}

async function sendPreview(draft) {
  const msg = await sendMessage(draft.chatId, await previewText(draft), { reply_markup: KEYBOARD });
  draft.previewMessageId = msg?.message_id || null;
  await draft.save();
}

/** Admin chat message that is not a known command. Returns true when handled. */
export async function handleAdminBroadcastMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const draft = await BroadcastDraft.findOne({ chatId });

  if (draft?.step === 'awaiting_button' && text) {
    const btn = parseButtonLine(text);
    if (!btn) {
      await sendMessage(chatId, "❌ Format: <code>Tugma matni | https://havola</code>\nMasalan: <code>Saytga o'tish | https://vocably.uz/pricing</code>");
      return true;
    }
    draft.buttons.push(btn);
    draft.step = 'ready';
    await sendPreview(draft);
    return true;
  }

  if (text.startsWith('/')) {
    await sendMessage(chatId, "Noma'lum buyruq. Buyruqlar: /admin · Reklama uchun matn, rasm, video, ovozli/video xabar yoki fayl yuboring.");
    return true;
  }

  const desc = describeTelegramMessage(message);
  if (!desc) {
    await sendMessage(chatId, '📣 Reklama uchun matn, rasm, video, GIF, audio, ovozli xabar, video xabar yoki fayl yuboring — men tasdiqlash tugmasini ko‘rsataman.');
    return true;
  }

  await BroadcastDraft.deleteOne({ chatId });
  const created = await BroadcastDraft.create({
    chatId,
    messageId: message.message_id,
    kind: desc.kind,
    telegramFileId: desc.telegramFileId,
    mime: desc.mime,
    fileName: desc.fileName,
    text: desc.text,
    buttons: [],
    step: 'ready',
  });
  await sendPreview(created);
  return true;
}

async function adminUserFor(chatId) {
  return (await User.findOne({ telegramChatId: Number(chatId), role: 'admin' }).select('_id')) || (await User.findOne({ role: 'admin' }).select('_id'));
}

/** Inline-button answers (callback_data "bc:…") from the admin chat. */
export async function handleBroadcastCallback(cb) {
  const chatId = cb.message.chat.id;
  const draft = await BroadcastDraft.findOne({ chatId });
  const clearButtons = () => editMessageReplyMarkup(chatId, cb.message.message_id, null).catch(() => {});

  if (!draft) {
    await answerCallbackQuery(cb.id, 'Bu reklama endi mavjud emas — xabarni qayta yuboring').catch(() => {});
    await clearButtons();
    return;
  }

  if (cb.data === 'bc:cancel') {
    await BroadcastDraft.deleteOne({ _id: draft._id });
    await answerCallbackQuery(cb.id, 'Bekor qilindi').catch(() => {});
    await clearButtons();
    await sendMessage(chatId, '❌ Reklama bekor qilindi.');
    return;
  }

  if (cb.data === 'bc:btn') {
    if (draft.buttons.length >= MAX_BUTTONS) {
      await answerCallbackQuery(cb.id, `Ko'pi bilan ${MAX_BUTTONS} ta tugma`).catch(() => {});
      return;
    }
    draft.step = 'awaiting_button';
    await draft.save();
    await answerCallbackQuery(cb.id).catch(() => {});
    await sendMessage(chatId, "🔘 Tugma matni va havolasini bir qatorda yuboring:\n<code>Saytga o'tish | https://vocably.uz/pricing</code>");
    return;
  }

  if (cb.data === 'bc:send') {
    // Claim by deleting — a double tap can't send twice.
    const claimed = await BroadcastDraft.findOneAndDelete({ _id: draft._id });
    if (!claimed) {
      await answerCallbackQuery(cb.id, 'Allaqachon yuborilmoqda').catch(() => {});
      return;
    }
    await answerCallbackQuery(cb.id, 'Yuborilmoqda…').catch(() => {});
    await clearButtons();
    const admin = await adminUserFor(chatId);
    if (!admin) {
      await sendMessage(chatId, "❌ Admin foydalanuvchi topilmadi — saytda admin hisob bo'lishi kerak.");
      return;
    }
    const fallbackTitle = claimed.kind ? `${MEDIA_LABELS[claimed.kind] || "E'lon"}` : 'Yangi e’lon';
    const { title, body } = splitTitleBody(claimed.text, fallbackTitle);
    const media = claimed.kind ? { kind: claimed.kind, telegramFileId: claimed.telegramFileId, mime: claimed.mime, fileName: claimed.fileName } : null;
    const result = await broadcastAnnouncement({
      adminId: admin._id,
      title,
      body,
      media,
      buttons: claimed.buttons.map((b) => ({ text: b.text, url: b.url })),
      source: 'bot',
      copyFrom: { fromChatId: chatId, messageId: claimed.messageId },
    });
    await AdminAuditLog.create({
      actorId: admin._id,
      action: 'announcement.create',
      targetType: 'Announcement',
      targetId: String(result.announcement._id),
      diff: { title, recipientCount: result.recipientCount, telegramCount: result.telegramCount, media: media?.kind || null, source: 'bot' },
      ip: null,
      userAgent: 'telegram-bot',
    }).catch(() => {});
    await sendMessage(
      chatId,
      `✅ <b>Yuborildi</b>\nTelegram: <b>${result.telegramCount}</b>/${result.telegramLinked} · ilova ichida: <b>${result.recipientCount}</b> foydalanuvchi.`
    );
  }
}

/** `/admin trial` · `/admin trial on|off` · `/admin trial <tier> <months>` → reply text. */
export async function handleTrialCommand(chatId, args) {
  const current = await getWelcomeTrial();
  const show = (t) => `🎁 Yangi foydalanuvchiga bepul tarif: <b>${t.enabled ? 'yoqilgan' : "o'chirilgan"}</b> — ${TIER_CONFIG[t.tier]?.label || t.tier}, ${t.months} oy`;
  const [a, b] = args;
  if (!a) {
    return `${show(current)}\n\n<code>/admin trial off</code> — o'chirish\n<code>/admin trial on</code> — yoqish\n<code>/admin trial premium 1</code> — tarif va muddat (standard/premium; 1, 3, 6, 12 oy)`;
  }
  let next;
  if (a === 'on' || a === 'off') next = normalizeWelcomeTrial({ enabled: a === 'on' }, current);
  else next = normalizeWelcomeTrial({ tier: a, months: b ?? current.months, enabled: true }, current);
  if (!next) return "❌ Noto'g'ri qiymat. Tarif: standard yoki premium; muddat: 1, 3, 6 yoki 12 oy.\nMasalan: <code>/admin trial premium 1</code>";
  const admin = await adminUserFor(chatId);
  await setWelcomeTrial(next, admin?._id || null);
  if (admin) {
    await AdminAuditLog.create({
      actorId: admin._id,
      action: 'settings.update',
      targetType: 'AppSetting',
      targetId: 'welcomeTrial',
      diff: { from: current, to: next },
      ip: null,
      userAgent: 'telegram-bot',
    }).catch(() => {});
  }
  return `✅ Saqlandi.\n${show(next)}`;
}
