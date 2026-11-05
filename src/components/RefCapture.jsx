'use client';
import { useEffect } from 'react';
import { REF_COOKIE, REFERRAL, normalizeReferralCode } from '@/lib/referral';

// A friend's invite link carries `?ref=CODE` (any page). Remember it in a plain cookie for 30 days so
// the sign-up that follows — today or next week, by phone or Telegram — can credit both sides. The
// server validates the code; nothing here is trusted (src/lib/refCookie.js, src/lib/referralServer.js).
export default function RefCapture() {
  useEffect(() => {
    try {
      const code = normalizeReferralCode(new URLSearchParams(window.location.search).get('ref'));
      if (!code) return;
      document.cookie = `${REF_COOKIE}=${code}; Path=/; Max-Age=${REFERRAL.cookieDays * 86400}; SameSite=Lax`;
    } catch {
      // cookies blocked — the referral simply won't apply
    }
  }, []);
  return null;
}
