// Referral rules (TZ 2.0 §10 "O'sish kanallari" 3): whoever invites and whoever joins both get 7 days of
// Premium. Pure helpers here; the Mongo side is in ./referralServer.js. Tested in referral.test.js.

export const REFERRAL = {
  days: 7,
  /** An inviter is rewarded for at most this many sign-ups per calendar month (fake-account farming). */
  maxRewardsPerMonth: 20,
  codeLength: 8,
  /** The `?ref=` cookie lives this long — the friend may sign up days after opening the link. */
  cookieDays: 30,
};

export const REF_COOKIE = 'vocably_ref';
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L look-alikes
const CODE_RE = /^[A-Z0-9]{6,12}$/;

export function generateReferralCode(rand = Math.random, length = REFERRAL.codeLength) {
  return Array.from({ length }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join('');
}

/** Uppercases and validates a code from a URL / cookie / form; null when it can't be one. */
export function normalizeReferralCode(raw) {
  const s = String(raw ?? '').trim().toUpperCase();
  return CODE_RE.test(s) ? s : null;
}

export function referralLink(code, base = 'https://vocably.uz') {
  return `${base.replace(/\/$/, '')}/start?ref=${encodeURIComponent(code)}`;
}

/** Telegram share URL for an invite. */
export function referralShareUrl(code, base, text) {
  return `https://t.me/share/url?url=${encodeURIComponent(referralLink(code, base))}&text=${encodeURIComponent(text)}`;
}

/**
 * Whether the inviter still gets a reward: `rewardsThisMonth` counts rewards already granted in the
 * invitee's sign-up month (UTC).
 */
export function inviterRewardStatus(rewardsThisMonth) {
  return rewardsThisMonth < REFERRAL.maxRewardsPerMonth ? 'granted' : 'capped';
}

/** Start of the calendar month (UTC) that `now` is in. */
export function monthStart(now) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
