import { FunnelHit, User, PaymentRequest } from '@/lib/models';
import { computeSalesFunnel, FUNNEL_RANGES } from '@/lib/salesFunnel';

const DAY = 86_400_000;

/** Admin sales funnel for the last `days` days (7/30/90). */
export async function salesFunnelReport({ days = 30, now = new Date() } = {}) {
  const range = FUNNEL_RANGES.includes(days) ? days : 30;
  const since = new Date(now.getTime() - range * DAY);

  const [stageRows, landingRows, signups, payerRows, refundRows] = await Promise.all([
    FunnelHit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { stage: '$stage', vid: '$vid' } } },
      { $group: { _id: '$_id.stage', n: { $sum: 1 } } },
    ]),
    FunnelHit.aggregate([
      { $match: { createdAt: { $gte: since }, stage: 'landing' } },
      { $group: { _id: { path: '$path', vid: '$vid' } } },
      { $group: { _id: '$_id.path', n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 8 },
    ]),
    User.countDocuments({ createdAt: { $gte: since } }),
    // Payers = accounts whose FIRST confirmed payment falls in the window (renewals are not new conversions).
    PaymentRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$userId', first: { $min: '$reviewedAt' }, revenue: { $sum: { $cond: [{ $gte: ['$reviewedAt', since] }, '$amount', 0] } } } },
      { $group: { _id: null, payers: { $sum: { $cond: [{ $gte: ['$first', since] }, 1, 0] } }, revenue: { $sum: '$revenue' } } },
    ]),
    PaymentRequest.aggregate([
      { $match: { 'refund.status': 'approved', 'refund.decidedAt': { $gte: since } } },
      { $group: { _id: null, n: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
  ]);
  const st = Object.fromEntries(stageRows.map((r) => [r._id, r.n]));
  const pay = payerRows[0] || { payers: 0, revenue: 0 };
  const ref = refundRows[0] || { n: 0, amount: 0 };
  return {
    range,
    steps: computeSalesFunnel({ landing: st.landing || 0, onboardingStart: st.onboarding_start || 0, onboardingDone: st.onboarding_done || 0, signups, payers: pay.payers }),
    landings: landingRows.map((r) => ({ path: r._id || '(?)', visitors: r.n })),
    revenue: pay.revenue,
    refunds: { count: ref.n, amount: ref.amount },
  };
}
