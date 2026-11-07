// Billing terms and the 14-day refund rule (TZ 2.0 §10). Pure — tested in billingTerms.test.js.
//   Terms: 1, 3 and 12 months (3 months ≈ 15% off the monthly price).
//   Refund: "14 kun ichida to'liq qaytarish" — the full amount of a paid plan, requested in the app
//   within 14 days of the payment being confirmed. One refund per account, so buy→refund can't loop.
import { addMonths } from '@/lib/subscription';
import { pluralForm } from '@/lib/i18n';

export const BILLING_MONTHS = [1, 3, 12];
export const REFUND_WINDOW_DAYS = 14;
const DAY_MS = 86_400_000;

/** "1 oy" / "3 oy" / "1 yil" / "7 kun" — also for trial terms given in days. */
const TERM_WORDS = {
  en: { day: ['day', 'days'], year: ['year', 'years'], month: ['month', 'months'] },
  ru: { day: ['день', 'дня', 'дней'], year: ['год', 'года', 'лет'], month: ['месяц', 'месяца', 'месяцев'] },
  uz: { day: ['kun'], year: ['yil'], month: ['oy'] },
};

export function termLabel({ months = null, days = null } = {}, locale = 'uz') {
  const l = TERM_WORDS[locale] ? locale : 'uz';
  const say = (n, unit) => `${n} ${pluralForm(l, n, TERM_WORDS[l][unit])}`;
  if (days) return say(days, 'day');
  const m = Number(months) || 1;
  if (m % 12 === 0) return say(m / 12, 'year');
  return say(m, 'month');
}

/** Savings of a multi-month price against paying monthly, in whole percent (0 when none). */
export function savingsPercent(monthly, months, price) {
  if (!monthly || !months || !price) return 0;
  const full = monthly * months;
  return full > price ? Math.round(((full - price) / full) * 100) : 0;
}

/**
 * Can this payment still be refunded?
 * @param payment PaymentRequest (status, reviewedAt = when it was confirmed, refund)
 * @param opts.hadRefund the account already got a refund before
 * @returns {{ ok: true, deadline: Date } | { ok: false, reason: 'not_paid'|'already'|'expired'|'used', deadline?: Date }}
 */
export function refundEligibility(payment, { now = new Date(), hadRefund = false } = {}) {
  if (!payment || payment.status !== 'approved' || !payment.reviewedAt) return { ok: false, reason: 'not_paid' };
  const deadline = new Date(new Date(payment.reviewedAt).getTime() + REFUND_WINDOW_DAYS * DAY_MS);
  const st = payment.refund?.status;
  if (st && st !== 'none' && st !== 'declined') return { ok: false, reason: 'already', deadline };
  if (now > deadline) return { ok: false, reason: 'expired', deadline };
  if (hadRefund) return { ok: false, reason: 'used', deadline };
  return { ok: true, deadline };
}

/**
 * Subscription fields after a refund is approved: the refunded term is taken back from the expiry date.
 * If nothing paid is left (or the plan already ran out), the account goes back to Free now.
 */
export function refundSubscriptionUpdate(user, payment, { now = new Date(), by = null } = {}) {
  const free = { subscriptionTier: 'free', subscriptionExpiresAt: null, subscriptionStartedAt: null, subscriptionSetAt: now, subscriptionSetBy: by };
  if (!user?.subscriptionExpiresAt || user.subscriptionTier !== payment.tier) return user?.subscriptionTier === payment.tier ? free : null;
  const back = addMonths(new Date(user.subscriptionExpiresAt), -payment.months);
  if (back <= now) return free;
  return { subscriptionExpiresAt: back, subscriptionSetAt: now, subscriptionSetBy: by };
}
