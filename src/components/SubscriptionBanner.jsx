'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, X, Lock } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';

// In-app counterpart of the reminder sweep: shown on every app page from 3
// days before expiry, on each of the grace days, and for a week after the
// plan locks. Dismissable, but only for the rest of the day — during grace
// the user is warned again the next day (product rule: "har kuni ogohlantirish").
const DAY_MS = 24 * 60 * 60 * 1000;

function dismissKey(sub) {
  return `vocably_sub_banner_${sub.status}_${new Date().toISOString().slice(0, 10)}`;
}

function fmt(date) {
  return formatUzDate(date);
}

export default function SubscriptionBanner() {
  const [sub, setSub] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.subscription) return;
        setSub(data.subscription);
        try {
          setHidden(localStorage.getItem(dismissKey(data.subscription)) === '1');
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!sub || hidden || !sub.expiresAt) return null;

  const label = TIER_CONFIG[sub.tier]?.label || sub.tier;
  let tone = null;
  let Icon = Clock;
  let text = '';
  if (sub.status === 'active' && sub.daysLeft <= 3) {
    tone = 'info';
    text = `${label} obunangiz ${fmt(sub.expiresAt)} kuni tugaydi (${sub.daysLeft} kun qoldi).`;
  } else if (sub.status === 'grace') {
    tone = 'warning';
    Icon = AlertTriangle;
    text = `${label} obunangiz muddati tugadi. Imkoniyatlar yana ${sub.graceDaysLeft} kun ochiq — ${fmt(sub.graceEndsAt)} kuni yopiladi.`;
  } else if (sub.status === 'expired' && Date.now() - new Date(sub.graceEndsAt).getTime() < 7 * DAY_MS) {
    tone = 'danger';
    Icon = Lock;
    text = `${label} obunangiz yopildi — hozir Bepul rejadasiz.`;
  }
  if (!tone) return null;

  const toneClass = {
    info: 'bg-info-soft text-ink border-info/25',
    warning: 'bg-warning-soft text-ink border-warning/30',
    danger: 'bg-danger-soft text-ink border-danger/30',
  }[tone];
  const iconClass = { info: 'text-info', warning: 'text-warning', danger: 'text-danger' }[tone];

  return (
    <div role="status" className={`mx-3 sm:mx-6 mt-3 flex items-start sm:items-center gap-3 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <Icon size={17} className={`flex-shrink-0 mt-0.5 sm:mt-0 ${iconClass}`} aria-hidden="true" />
      <p className="flex-1 leading-snug">{text}</p>
      <Link
        href={`/app/tolov?tier=${sub.tier}`}
        className="flex-shrink-0 inline-flex items-center min-h-9 px-3 rounded-lg bg-accent text-on-accent text-xs font-semibold hover:bg-accent-hover"
      >
        {sub.status === 'expired' ? 'Qayta faollashtirish' : 'Uzaytirish'}
      </Link>
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(dismissKey(sub), '1');
          } catch {}
        }}
        aria-label="Bugun uchun yopish"
        className="flex-shrink-0 grid place-items-center w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-surface/60"
      >
        <X size={15} />
      </button>
    </div>
  );
}
