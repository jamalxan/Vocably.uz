'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, X, Lock } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatDateLocale } from '@/lib/uzDate';
import { useT } from '@/context/LocaleContext';

// In-app counterpart of the reminder sweep: shown on every app page from 3
// days before expiry, on each of the grace days, and for a week after the
// plan locks. Dismissable, but only for the rest of the day — during grace
// the user is warned again the next day (product rule: "har kuni ogohlantirish").
const DAY_MS = 24 * 60 * 60 * 1000;

function dismissKey(sub) {
  return `vocably_sub_banner_${sub.status}_${new Date().toISOString().slice(0, 10)}`;
}

export default function SubscriptionBanner() {
  const { t, locale } = useT();
  const fmt = (date) => formatDateLocale(locale, date);
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

  const tierLabel = TIER_CONFIG[sub.tier]?.label || sub.tier;
  const label = sub.tier === 'free' ? t('tier.free') : tierLabel;
  let tone = null;
  let Icon = Clock;
  let text = '';
  if (sub.status === 'active' && sub.daysLeft <= 3) {
    tone = 'info';
    text = t('sub.expiring', { tier: label, date: fmt(sub.expiresAt), n: sub.daysLeft });
  } else if (sub.status === 'grace') {
    tone = 'warning';
    Icon = AlertTriangle;
    text = t('sub.grace', { tier: label, n: sub.graceDaysLeft, date: fmt(sub.graceEndsAt) });
  } else if (sub.status === 'expired' && Date.now() - new Date(sub.graceEndsAt).getTime() < 7 * DAY_MS) {
    tone = 'danger';
    Icon = Lock;
    text = t('sub.expired', { tier: label });
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
        {sub.status === 'expired' ? t('sub.reactivate') : t('sub.extend')}
      </Link>
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(dismissKey(sub), '1');
          } catch {}
        }}
        aria-label={t('sub.dismiss')}
        className="flex-shrink-0 grid place-items-center w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-surface/60"
      >
        <X size={15} />
      </button>
    </div>
  );
}
