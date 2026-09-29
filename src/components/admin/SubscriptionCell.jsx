'use client';
import { useState } from 'react';
import { SUBSCRIPTION_TIERS, TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';

// Admin tier control with the subscription lifecycle (src/lib/subscription.js):
// pick tier + term → features open at once for that term; "Uzaytirish"
// renews the same tier (continues from the current expiry, grace days are not
// free). No payment integration yet — this is the manual activation path a
// payment webhook will later call the same way.
const TERMS = [1, 3, 6, 12];

function fmt(date) {
  return formatUzDate(date, { year: true });
}

function StatusLine({ sub }) {
  if (!sub || sub.status === 'free') return null;
  if (!sub.expiresAt) return <p className="mt-1 text-[11px] text-muted">Muddatsiz (eski tayinlov)</p>;
  if (sub.status === 'active') {
    return (
      <p className={`mt-1 text-[11px] ${sub.daysLeft <= 3 ? 'text-warning' : 'text-muted'}`}>
        {fmt(sub.expiresAt)} gacha · {sub.daysLeft} kun
      </p>
    );
  }
  if (sub.status === 'grace') {
    return <p className="mt-1 text-[11px] font-medium text-warning">Muddati tugagan · {sub.graceDaysLeft} kun imtiyoz qoldi</p>;
  }
  return <p className="mt-1 text-[11px] font-medium text-danger">Yopilgan ({fmt(sub.graceEndsAt)}) · amalda Bepul</p>;
}

export default function SubscriptionCell({ user, saving, onPatch }) {
  const [months, setMonths] = useState(1);
  const sub = user.subscription;
  const tier = user.subscriptionTier || 'free';
  const name = user.name || user.phoneDisplay;

  const apply = (nextTier) => {
    const label = TIER_CONFIG[nextTier]?.label || nextTier;
    const msg =
      nextTier === 'free'
        ? `${name} uchun tarifni Bepul rejaga o'tkazasizmi? Pullik imkoniyatlar darhol yopiladi.`
        : `${name} uchun "${label}" tarifini ${months} oyga faollashtirasizmi?`;
    if (!confirm(msg)) return false;
    onPatch({ subscriptionTier: nextTier, subscriptionMonths: months });
    return true;
  };

  return (
    <div className="min-w-[180px]">
      <div className="flex items-center gap-1.5">
        <select
          value={tier}
          disabled={saving}
          onChange={(e) => {
            if (!apply(e.target.value)) e.target.value = tier;
          }}
          aria-label={`${name} tarifi`}
          className="px-2.5 py-1.5 bg-bg border border-border rounded-lg text-base md:text-xs text-ink outline-none focus:border-accent transition-colors"
        >
          {SUBSCRIPTION_TIERS.map((t) => (
            <option key={t} value={t}>
              {TIER_CONFIG[t].label}
            </option>
          ))}
        </select>
        <select
          value={months}
          disabled={saving}
          onChange={(e) => setMonths(Number(e.target.value))}
          aria-label="Muddat (oy)"
          className="px-2 py-1.5 bg-bg border border-border rounded-lg text-base md:text-xs text-ink outline-none focus:border-accent"
        >
          {TERMS.map((m) => (
            <option key={m} value={m}>
              {m} oy
            </option>
          ))}
        </select>
      </div>
      <StatusLine sub={sub} />
      {tier !== 'free' && sub?.expiresAt && (
        <button
          type="button"
          disabled={saving}
          onClick={() => apply(tier)}
          className="mt-1 text-[11px] font-semibold text-accent hover:underline disabled:opacity-50"
        >
          +{months} oy uzaytirish
        </button>
      )}
    </div>
  );
}
