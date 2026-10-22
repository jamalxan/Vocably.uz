import { Notification } from '@/lib/models';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { sendPushToUser } from '@/lib/webPush';

// "Obuna faollashdi" xabarlari — ikki holat uchun:
//   purchase — foydalanuvchi to'lov qilgan (approvePayment),
//   gift     — admin tarifni sovg'a qilgan (admin/chat/users/[id] PATCH),
//   trial    — yangi ro'yxatdan o'tganga avtomatik bepul boshlang'ich tarif (welcomeTrial).
// Bildirishnoma (ilova ichida), brauzer push va Telegram bot — uchalasi bir joydan.

const TIER_EMOJI = { standard: '⭐', premium: '💎' };

export function formatTerm(months) {
  const m = Number(months) || 1;
  return m % 12 === 0 ? `${m / 12} yil` : `${m} oy`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Pure: builds the three message shapes. Exported for unit tests. */
export function buildActivationMessages({ kind, tier, months, expiresAt, name }) {
  const label = TIER_CONFIG[tier]?.label || tier;
  const emoji = TIER_EMOJI[tier] || '✨';
  const term = formatTerm(months);
  const until = formatUzDate(expiresAt, { year: true });
  const first = String(name || '').trim().split(/\s+/)[0];
  const hello = first ? `${first}, ` : '';

  if (kind === 'trial') {
    const title = `🎉 Xush kelibsiz! ${term} ${label} — bepul`;
    const body = [
      `${hello}Vocably'ga xush kelibsiz! Boshlash uchun ${label} tarifi ${term}ga bepul ochildi.`,
      `📅 ${until} gacha barcha ${label} imkoniyatlari sizniki.`,
    ].join('\n');
    const telegram = [
      '🎉 <b>Xush kelibsiz!</b>',
      '━━━━━━━━━━━━━━',
      `${first ? `Salom, <b>${escapeHtml(first)}</b>! ` : ''}Boshlash uchun <b>${escapeHtml(label)}</b> tarifi sizga bepul ochildi:`,
      '',
      `${emoji} Tarif: <b>${escapeHtml(label)}</b>`,
      `⏳ Muddat: <b>${term}</b>`,
      `📅 Amal qiladi: <b>${until}</b> gacha`,
      '━━━━━━━━━━━━━━',
      "Barcha imkoniyatlarni sinab ko'ring — yaxshi o'qishlar! 🚀",
    ].join('\n');
    return { type: 'gift', title, body, telegram };
  }

  if (kind === 'gift') {
    const title = `🎁 Sizga sovg'a: ${label} tarifi!`;
    const body = [
      `${hello}Vocably jamoasi sizga ${label} tarifini ${term}ga sovg'a qildi.`,
      `📅 ${until} gacha barcha ${label} imkoniyatlari ochiq.`,
      'Yaxshi o\'qishlar! 🚀',
    ].join('\n');
    const telegram = [
      "🎁 <b>Sizga sovg'a!</b>",
      '━━━━━━━━━━━━━━',
      `${first ? `Salom, <b>${escapeHtml(first)}</b>! ` : ''}Vocably jamoasi sizga <b>${escapeHtml(label)}</b> tarifini sovg'a qildi:`,
      '',
      `${emoji} Tarif: <b>${escapeHtml(label)}</b>`,
      `⏳ Muddat: <b>${term}</b>`,
      `📅 Amal qiladi: <b>${until}</b> gacha`,
      '━━━━━━━━━━━━━━',
      "Barcha imkoniyatlar allaqachon ochiq — yaxshi o'qishlar! 🚀",
    ].join('\n');
    return { type: 'gift', title, body, telegram };
  }

  const title = `✅ ${label} tarifi faollashtirildi`;
  const body = [
    `${hello}to'lovingiz tasdiqlandi — rahmat!`,
    `📅 ${label} imkoniyatlari ${until} gacha ochiq (${term}).`,
  ].join('\n');
  const telegram = [
    '✅ <b>Obuna muvaffaqiyatli faollashtirildi!</b>',
    '━━━━━━━━━━━━━━',
    `${emoji} Tarif: <b>${escapeHtml(label)}</b>`,
    `⏳ Muddat: <b>${term}</b>`,
    `📅 Amal qiladi: <b>${until}</b> gacha`,
    '━━━━━━━━━━━━━━',
    'Xaridingiz uchun rahmat! 🙌',
  ].join('\n');
  return { type: 'payment', title, body, telegram };
}

/**
 * Sends the in-app notification + web push + Telegram message. Never throws:
 * a blocked bot or dead push endpoint must not fail the payment/grant itself.
 * `user` needs `_id`, `name`, `telegramChatId`.
 */
export async function notifySubscriptionActivated(user, { kind, tier, months, expiresAt }) {
  const msg = buildActivationMessages({ kind, tier, months, expiresAt, name: user.name });
  const link = kind === 'purchase' ? '/pricing' : '/app';
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  const extra = /^https:\/\//.test(appUrl)
    ? { reply_markup: { inline_keyboard: [[{ text: '🚀 Ilovani ochish', url: `${appUrl}/app` }]] } }
    : {};
  await Promise.allSettled([
    Notification.create({ userId: user._id, type: msg.type, title: msg.title, body: msg.body, link }),
    sendPushToUser(user._id, { title: msg.title, body: msg.body.split('\n')[0], url: '/app' }),
    user.telegramChatId ? sendTelegramMessage(user.telegramChatId, msg.telegram, extra) : null,
  ]);
  return msg;
}
