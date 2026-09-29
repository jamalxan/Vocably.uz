import { formatUzDate } from './uzDate';
// Subscription lifecycle (pure — no DB, fully unit-tested in subscription.test.js).
//
// Business rules (product owner, 2026-09-29):
//   1. Activating a paid tier (admin today, a payment webhook later) opens that
//      tier's features immediately and runs for exactly one calendar month.
//   2. When the month ends the user is notified, but access is NOT closed yet:
//      for GRACE_DAYS more days the tier stays active and a warning is sent
//      every day.
//   3. After the grace days the paid features close automatically (effective
//      tier falls back to 'free') and a final notice is sent.
//
// Locking is computed on read (`subscriptionState`), never by a job flipping a
// flag — so access closes on time even if the reminder sweep runs late or not
// at all. The sweep (/api/internal/subscriptions/sweep) only sends notices.
//
// Users who got a paid tier before expiry dates existed have no
// `subscriptionExpiresAt`; they stay active (legacy manual grants) until an
// admin re-activates them with a term.

export const GRACE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar-month add in UTC, clamping to the last day of the target month
 * (Jan 31 + 1 month = Feb 28/29, not Mar 3). */
export function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/**
 * @returns {{
 *   tier: string, effectiveTier: string,
 *   status: 'free' | 'active' | 'grace' | 'expired',
 *   expiresAt?: Date | null, graceEndsAt?: Date,
 *   daysLeft?: number, graceDay?: number, graceDaysLeft?: number
 * }}
 */
export function subscriptionState(user, now = new Date()) {
  const tier = user?.subscriptionTier || 'free';
  if (tier === 'free') return { tier, effectiveTier: 'free', status: 'free' };

  const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  if (!expiresAt) return { tier, effectiveTier: tier, status: 'active', expiresAt: null };

  const graceEndsAt = new Date(expiresAt.getTime() + GRACE_DAYS * DAY_MS);
  if (now < expiresAt) {
    return { tier, effectiveTier: tier, status: 'active', expiresAt, graceEndsAt, daysLeft: Math.ceil((expiresAt - now) / DAY_MS) };
  }
  if (now < graceEndsAt) {
    return {
      tier,
      effectiveTier: tier,
      status: 'grace',
      expiresAt,
      graceEndsAt,
      // 1 on the day it expired, GRACE_DAYS on the last day of access.
      graceDay: Math.floor((now - expiresAt) / DAY_MS) + 1,
      graceDaysLeft: Math.ceil((graceEndsAt - now) / DAY_MS),
    };
  }
  return { tier, effectiveTier: 'free', status: 'expired', expiresAt, graceEndsAt };
}

export function effectiveTier(user, now = new Date()) {
  return subscriptionState(user, now).effectiveTier;
}

/** Fields to $set when a paid tier is (re)activated for `months`.
 * Renewing the same tier before it has locked (active or grace) continues
 * from the current expiry date — remaining paid days are kept, and grace
 * days are not free days. Otherwise the new term starts now. */
export function activationUpdate(user, tier, { months = 1, now = new Date(), by = null } = {}) {
  if (tier === 'free') {
    return {
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      subscriptionStartedAt: null,
      subscriptionSetAt: now,
      subscriptionSetBy: by,
    };
  }
  const state = subscriptionState(user, now);
  const continuing = state.tier === tier && state.expiresAt && (state.status === 'active' || state.status === 'grace');
  const base = continuing ? state.expiresAt : now;
  return {
    subscriptionTier: tier,
    subscriptionStartedAt: continuing ? user.subscriptionStartedAt || now : now,
    subscriptionExpiresAt: addMonths(base, months),
    subscriptionSetAt: now,
    subscriptionSetBy: by,
  };
}

function uzDate(d) {
  return formatUzDate(d);
}

/** The single notice that should go out right now, or null. `key` is unique
 * per billing period (prefixed with the expiry timestamp), so a renewal
 * starts a fresh set and a re-run of the sweep never double-sends. */
export function dueNotice(user, now = new Date(), { tierLabel = (t) => t } = {}) {
  const state = subscriptionState(user, now);
  if (!state.expiresAt || state.status === 'free') return null;
  const period = state.expiresAt.toISOString();
  const sent = new Set(user.subscriptionNotices || []);
  const label = tierLabel(state.tier);
  const until = uzDate(state.graceEndsAt);

  let notice = null;
  if (state.status === 'active' && state.daysLeft <= 1) {
    notice = {
      key: `${period}:pre-1`,
      title: `${label} obunangiz ertaga tugaydi`,
      body: `Obuna ${uzDate(state.expiresAt)} kuni tugaydi. Uzluksiz foydalanish uchun oldindan uzaytiring.`,
    };
  } else if (state.status === 'grace') {
    notice =
      state.graceDay === 1
        ? {
            key: `${period}:grace-1`,
            title: `${label} obunangiz muddati tugadi`,
            body: `Yana ${state.graceDaysLeft} kun barcha imkoniyatlar ochiq. ${until} gacha uzaytirmasangiz, tarif Bepul rejaga o'tadi.`,
          }
        : {
            key: `${period}:grace-${state.graceDay}`,
            title: `Obuna yopilishiga ${state.graceDaysLeft} kun qoldi`,
            body: `${label} imkoniyatlari ${until} kuni yopiladi. Hozir uzaytirib, natijalaringizni to'xtatmang.`,
          };
  } else if (state.status === 'expired' && now - state.graceEndsAt < 7 * DAY_MS) {
    // Only shortly after locking — a sweep outage must not surface a stale
    // "closed" notice weeks later.
    notice = {
      key: `${period}:locked`,
      title: `${label} obunangiz yopildi`,
      body: "Tarifingiz Bepul rejaga o'tdi. Istalgan vaqtda qayta faollashtirib, barcha imkoniyatlarni qaytarishingiz mumkin.",
    };
  }
  if (!notice || sent.has(notice.key)) return null;
  return { ...notice, status: state.status, link: '/narxlar' };
}
