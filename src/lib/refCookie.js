import { REF_COOKIE, normalizeReferralCode } from '@/lib/referral';

// The friend's referral code travels from the landing (`?ref=`) to sign-up in a plain cookie — nothing
// secret, just a hint the server validates against real codes (src/lib/referralServer.js).
export function readRefCookie(req) {
  return normalizeReferralCode(req.cookies?.get?.(REF_COOKIE)?.value);
}

/** Once the account exists the hint has done its job. */
export function clearRefCookie(res) {
  res.cookies.set(REF_COOKIE, '', { path: '/', maxAge: 0, sameSite: 'lax' });
  return res;
}
