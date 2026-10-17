import { PaymentRequest, User, Notification } from '@/lib/models';
import { activationUpdate } from '@/lib/subscription';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { notifySubscriptionActivated } from '@/lib/subscriptionNotify';

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

  const user = await User.findById(req.userId).select('name subscriptionTier subscriptionExpiresAt subscriptionStartedAt telegramChatId');
  if (!user) return { ok: false, reason: 'no_user' };
  const update = activationUpdate(user, req.tier, { months: req.months, by });
  await User.updateOne({ _id: user._id }, { $set: update });

  await notifySubscriptionActivated(user, {
    kind: 'purchase',
    tier: req.tier,
    months: req.months,
    expiresAt: update.subscriptionExpiresAt,
  });
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
    Notification.create({ userId: req.userId, type: 'payment', title, body, link: '/app/billing' }),
    user?.telegramChatId ? sendTelegramMessage(user.telegramChatId, `⚠️ ${title}\n${body}`) : null,
  ]);
  return { ok: true, request: req };
}
