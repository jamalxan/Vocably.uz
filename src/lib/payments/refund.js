import mongoose from 'mongoose';
import { PaymentRequest, User, Notification } from '@/lib/models';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { TIER_CONFIG } from '@/lib/entitlements';
import { refundEligibility, refundSubscriptionUpdate, termLabel } from '@/lib/billingTerms';

// 14-day refund (TZ 2.0 §10). The user asks in the app; an admin returns the money by hand (card transfer /
// Payme or Click merchant cabinet — neither has a merchant-initiated refund API we can call) and then
// approves here, which takes the refunded term back from the subscription. Every status flip is a
// conditional update, so double clicks can't decide twice.

const REASONS = {
  not_paid: "Bu to'lov hali tasdiqlanmagan",
  already: "Bu to'lov bo'yicha so'rov allaqachon yuborilgan",
  expired: "To'lovdan keyin 14 kun o'tgan — qaytarish muddati tugagan",
  used: "Pulni qaytarish har bir hisob uchun bir marta mumkin",
};

export async function hadApprovedRefund(userId, exceptId = null) {
  return !!(await PaymentRequest.exists({ userId, 'refund.status': 'approved', ...(exceptId ? { _id: { $ne: exceptId } } : {}) }));
}

/** @returns {Promise<{ok:true, refund:object} | {ok:false, status:number, error:string}>} */
export async function requestRefund(userId, paymentId, reason = '', now = new Date()) {
  if (!mongoose.isValidObjectId(paymentId)) return { ok: false, status: 400, error: "Noto'g'ri so'rov" };
  const payment = await PaymentRequest.findOne({ _id: paymentId, userId }).lean();
  if (!payment) return { ok: false, status: 404, error: "To'lov topilmadi" };
  const elig = refundEligibility(payment, { now, hadRefund: await hadApprovedRefund(userId, payment._id) });
  if (!elig.ok) return { ok: false, status: 400, error: REASONS[elig.reason] };

  const refund = { status: 'requested', reason: String(reason || '').trim().slice(0, 500), requestedAt: now, decidedAt: null, decidedBy: null, note: '' };
  const updated = await PaymentRequest.findOneAndUpdate(
    { _id: payment._id, userId, status: 'approved', 'refund.status': { $nin: ['requested', 'approved'] } },
    { $set: { refund } },
    { new: true }
  ).lean();
  if (!updated) return { ok: false, status: 409, error: REASONS.already };

  const amount = payment.amount.toLocaleString('ru-RU');
  await Promise.allSettled([
    Notification.create({
      userId,
      type: 'payment',
      title: "Pulni qaytarish so'rovi qabul qilindi",
      body: `${amount} so'm — 3 ish kunida ko'rib chiqamiz.`,
      link: '/app/billing',
    }),
    (async () => {
      const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (!adminChat) return;
      const user = await User.findById(userId).select('name username phone').lean();
      const who = escapeTelegramHtml(user?.username ? `@${user.username}` : user?.name || user?.phone || 'Foydalanuvchi');
      await sendTelegramMessage(
        adminChat,
        `↩️ <b>Pulni qaytarish so'rovi</b>: ${who}\n${TIER_CONFIG[payment.tier]?.label} · ${termLabel({ months: payment.months })} · ${amount} so'm · ${payment.method}` +
          (refund.reason ? `\nSabab: ${escapeTelegramHtml(refund.reason)}` : '') +
          '\nAdmin panel → To\'lovlar → Qaytarish'
      );
    })(),
  ]);
  return { ok: true, refund: updated.refund };
}

/**
 * Admin decision. approve=true only after the money was actually sent back.
 * @returns {Promise<{ok:true, request:object, subscription:object|null} | {ok:false}>}
 */
export async function decideRefund(paymentId, { approve, by = null, note = '', now = new Date() } = {}) {
  if (!mongoose.isValidObjectId(paymentId)) return { ok: false };
  const req = await PaymentRequest.findOneAndUpdate(
    { _id: paymentId, 'refund.status': 'requested' },
    { $set: { 'refund.status': approve ? 'approved' : 'declined', 'refund.decidedAt': now, 'refund.decidedBy': by, 'refund.note': String(note || '').slice(0, 300) } },
    { new: true }
  ).lean();
  if (!req) return { ok: false };

  let subscription = null;
  if (approve) {
    const user = await User.findById(req.userId).select('subscriptionTier subscriptionExpiresAt').lean();
    subscription = refundSubscriptionUpdate(user, req, { now, by });
    if (subscription) await User.updateOne({ _id: req.userId }, { $set: subscription });
  }

  const user = await User.findById(req.userId).select('telegramChatId').lean();
  const amount = req.amount.toLocaleString('ru-RU');
  const title = approve ? "Pul qaytarildi" : "Pulni qaytarish so'rovi rad etildi";
  const body = approve
    ? `${amount} so'm qaytarildi. ${TIER_CONFIG[req.tier]?.label} tarifi shu to'lov muddatiga qisqardi.`
    : note
      ? `Sabab: ${note}`
      : "Savollar bo'lsa, admin bilan bog'laning.";
  await Promise.allSettled([
    Notification.create({ userId: req.userId, type: 'payment', title, body, link: '/app/billing' }),
    user?.telegramChatId ? sendTelegramMessage(user.telegramChatId, `${approve ? '↩️' : '⚠️'} ${title}\n${escapeTelegramHtml(body)}`) : null,
  ]);
  return { ok: true, request: req, subscription };
}
