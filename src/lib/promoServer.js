// Promo / creator codes — Mongo side (rules in ./promo.js). Tested in promoServer.integration.test.js.
import { PromoCode, PaymentRequest, User } from '@/lib/models';
import { commissionFor, normalizePromoCode, priceWithPromo, promoRejection } from './promo';

/** Approved + pending requests carrying a code — pending ones reserve a slot of `maxUses`. */
export async function promoUses(code) {
  return PaymentRequest.countDocuments({ 'promo.code': code, status: { $in: ['pending', 'approved'] } });
}

/**
 * Looks a code up for `userId` and prices `listPrice` with it.
 * @returns {Promise<{ promo, quote } | { error: string }>}
 */
export async function resolvePromo(rawCode, { userId, listPrice, now = new Date() } = {}) {
  const code = normalizePromoCode(rawCode);
  if (!code) return { error: 'not_found' };
  const promo = await PromoCode.findOne({ code }).lean();
  const uses = promo?.maxUses != null ? await promoUses(code) : 0;
  const reason = promoRejection(promo, { now, uses, userId });
  if (reason) return { error: reason };
  return { promo, quote: priceWithPromo(listPrice, promo.percentOff) };
}

/** The `promo` sub-document stored on a PaymentRequest. */
export function promoSnapshot(promo, quote) {
  return {
    code: promo.code,
    kind: promo.kind,
    percentOff: quote.percentOff,
    listPrice: quote.listPrice,
    discount: quote.discount,
    creatorId: promo.kind === 'creator' ? promo.ownerId || undefined : undefined,
    creatorShare: promo.kind === 'creator' ? promo.creatorShare || 0 : undefined,
  };
}

/**
 * Called once per approved payment (approvePayment claims the status flip, so this can't double count):
 * bumps the code's usage, revenue and the creator's commission, and stores the commission on the request.
 */
export async function recordPromoUse(request) {
  const p = request?.promo;
  if (!p?.code) return null;
  const commission = p.kind === 'creator' ? commissionFor(request.amount, p.creatorShare) : 0;
  await PromoCode.updateOne({ code: p.code }, { $inc: { usedCount: 1, revenue: request.amount, commission } });
  await PaymentRequest.updateOne({ _id: request._id }, { $set: { 'promo.commission': commission } });
  return commission;
}

/** Admin list: every code with its numbers and the creator's name. */
export async function listPromoCodes() {
  const codes = await PromoCode.find({}).sort({ createdAt: -1 }).limit(200).lean();
  const owners = await User.find({ _id: { $in: codes.map((c) => c.ownerId).filter(Boolean) } }).select('name username').lean();
  const ownerOf = (id) => owners.find((o) => String(o._id) === String(id));
  const pending = await PaymentRequest.aggregate([
    { $match: { 'promo.code': { $in: codes.map((c) => c.code) }, status: 'pending' } },
    { $group: { _id: '$promo.code', n: { $sum: 1 } } },
  ]);
  const pendingOf = (code) => pending.find((p) => p._id === code)?.n || 0;
  return codes.map((c) => {
    const o = ownerOf(c.ownerId);
    return {
      id: String(c._id),
      code: c.code,
      kind: c.kind,
      percentOff: c.percentOff,
      creatorShare: c.creatorShare || 0,
      owner: o ? { name: o.name || '', username: o.username || '' } : null,
      maxUses: c.maxUses,
      usedCount: c.usedCount || 0,
      pending: pendingOf(c.code),
      revenue: c.revenue || 0,
      commission: c.commission || 0,
      expiresAt: c.expiresAt,
      active: !!c.active,
      note: c.note || '',
      createdAt: c.createdAt,
    };
  });
}
