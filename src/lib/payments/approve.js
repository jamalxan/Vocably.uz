import { PaymentRequest, User, Notification } from '@/lib/models';
import { activationUpdate } from '@/lib/subscription';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { sendPushToUser } from '@/lib/webPush';

// The single place a payment turns into an active plan — used by the admin
// "Tasdiqlash" button today and by the Payme/Click callbacks later. The
// status flip is atomic (pending → approved), so a double click or a
// provider retry can never extend the plan twice.
export async function approvePayment(requestId, { by = null, method } = {}) {
  const req = await PaymentRequest.findOneAndUpdate(
    { _id: requestId, status: 'pending' },
    { $set: { status: 'approved', reviewedBy: by, reviewedAt: new Date(), ...(method ? { method } : {}) } },
    { new: true }
  );
  if (!req) return { ok: false, reason: 'not_pending' };

  const user = await User.findById(req.userId).select('subscriptionTier subscriptionExpiresAt subscriptionStartedAt telegramChatId');
  if (!user) return { ok: false, reason: 'no_user' };
  const update = activationUpdate(user, req.tier, { months: req.months, by });
  await User.updateOne({ _id: user._id }, { $set: update });

  const label = TIER_CONFIG[req.tier]?.label || req.tier;
  const until = formatUzDate(update.subscriptionExpiresAt, { year: true });
  const title = `${label} tarifi faollashtirildi`;
  const body = `To'lovingiz tasdiqlandi. ${label} imkoniyatlari ${until} gacha ochiq.`;
  await Promise.allSettled([
    Notification.create({ userId: user._id, type: 'payment', title, body, link: '/narxlar' }),
    sendPushToUser(user._id, { title, body, url: '/app' }),
    user.telegramChatId ? sendTelegramMessage(user.telegramChatId, `✅ ${title}\n${body}`) : null,
  ]);
  return { ok: true, request: req, expiresAt: update.subscriptionExpiresAt };
}

export async function rejectPayment(requestId, { by = null, reason = '' } = {}) {
  const req = await PaymentRequest.findOneAndUpdate(
    { _id: requestId, status: 'pending' },
    { $set: { status: 'rejected', reviewedBy: by, reviewedAt: new Date(), rejectReason: String(reason).slice(0, 300) } },
    { new: true }
  );
  if (!req) return { ok: false, reason: 'not_pending' };
  const user = await User.findById(req.userId).select('telegramChatId');
  const title = "To'lov tasdiqlanmadi";
  const body = reason ? `Sabab: ${reason}. Iltimos, chekni qayta yuboring.` : "Chek tasdiqlanmadi. Iltimos, qayta yuboring yoki admin bilan bog'laning.";
  await Promise.allSettled([
    Notification.create({ userId: req.userId, type: 'payment', title, body, link: '/app/tolov' }),
    user?.telegramChatId ? sendTelegramMessage(user.telegramChatId, `⚠️ ${title}\n${body}`) : null,
  ]);
  return { ok: true, request: req };
}
