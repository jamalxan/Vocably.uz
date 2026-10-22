import { PaymentRequest } from '@/lib/models';

// Open (pending) payment requests of one user.
//
// A Payme/Click request is created the moment the user presses the pay button,
// before they even reach the provider page. Closing that page leaves a pending
// request with no provider transaction — nobody will ever perform it. Those
// are cancelled when the user starts a new online payment, so abandoned clicks
// don't pile up in the admin queue or hit the per-user cap. A request the
// provider has already registered (provider.txId set, state 1) is kept: the
// provider may still perform it, or will cancel it itself on timeout.

export const ONLINE_METHODS = ['payme', 'click'];

/** Cancels this user's pending online requests that never reached the provider. */
export async function cancelAbandonedOnlineRequests(userId) {
  const res = await PaymentRequest.updateMany(
    { userId, status: 'pending', method: { $in: ONLINE_METHODS }, $or: [{ 'provider.txId': null }, { provider: { $exists: false } }] },
    { $set: { status: 'cancelled', reviewedAt: new Date() } }
  );
  return res.modifiedCount || 0;
}

/** Manual receipts waiting for the admin — the only requests that need a human. */
export function countAwaitingReview(userId) {
  return PaymentRequest.countDocuments({ userId, status: 'pending', method: 'manual' });
}
