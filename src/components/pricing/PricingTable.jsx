'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { getBotUsername } from '@/lib/telegram';
import { formatUzDate } from '@/lib/uzDate';

// BILL-01/02 — haqiqiy (placeholder emas) pricing sahifasi. Narx/feature
// ro'yxati src/lib/entitlements.js'dan keladi (TZ §46.2: hardcode qilinmaydi).
//
// STANDARD/PREMIUM CTA → /app/tolov (karta orqali to'lov + chek, admin
// tasdiqlaydi; Payme/Click sozlansa o'sha sahifada o'zi paydo bo'ladi).

const ORDER = ['free', 'standard', 'premium'];

function formatSom(n) {
  if (!n) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function PricingTable() {
  const [period, setPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'in' | 'out'
  const [currentTier, setCurrentTier] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [interestSent, setInterestSent] = useState({});

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/profile', { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) {
          setAuthState('out');
          return null;
        }
        setAuthState('in');
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCurrentTier(data.subscriptionTier || 'free');
          setSubscription(data.subscription || null);
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setAuthState('out');
      });
    return () => ctrl.abort();
  }, []);

  const registerInterest = (tier) => {
    if (interestSent[tier]) return;
    setInterestSent((prev) => ({ ...prev, [tier]: true }));
    try {
      fetch('/api/billing/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* jim o'tkazib yuboriladi — Telegram havolasi baribir ochiladi */
    }
  };

  const telegramHref = `https://t.me/${getBotUsername()}`;

  const fmtDate = (d) => formatUzDate(d, { year: true });

  return (
    <div>
      {subscription?.expiresAt && subscription.status !== 'free' && (
        <div
          role="status"
          className={`mx-auto mb-8 max-w-xl rounded-2xl border px-5 py-4 text-center text-sm ${
            subscription.status === 'active' ? 'border-border bg-surface text-ink' : 'border-warning/30 bg-warning-soft text-ink'
          }`}
        >
          {subscription.status === 'active' && (
            <>
              Joriy tarif: <strong>{TIER_CONFIG[subscription.tier]?.label}</strong> — {fmtDate(subscription.expiresAt)} gacha ({subscription.daysLeft} kun).
            </>
          )}
          {subscription.status === 'grace' && (
            <>
              <strong>{TIER_CONFIG[subscription.tier]?.label}</strong> muddati tugadi. Imkoniyatlar {fmtDate(subscription.graceEndsAt)} gacha ochiq ({subscription.graceDaysLeft} kun) — uzaytirish uchun quyidagi tarifni tanlang.
            </>
          )}
          {subscription.status === 'expired' && (
            <>
              <strong>{TIER_CONFIG[subscription.tier]?.label}</strong> obunangiz {fmtDate(subscription.graceEndsAt)} kuni yopilgan. Qayta faollashtirish uchun tarifni tanlang.
            </>
          )}
        </div>
      )}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1 bg-surface border border-border rounded-xl">
          {[
            { key: 'monthly', label: 'Oylik' },
            { key: 'yearly', label: 'Yillik' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === opt.key ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:text-ink'
              }`}
            >
              {opt.label}
              {opt.key === 'yearly' && (
                <span className="ml-1.5 text-[10px] font-semibold text-emerald-500">tejamkor</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {ORDER.map((tier) => {
          const config = TIER_CONFIG[tier];
          const price = period === 'monthly' ? config.priceMonthly : config.priceYearly;
          const isCurrent = authState === 'in' && currentTier === tier;
          const isPopular = tier === 'standard';

          return (
            <div
              key={tier}
              className={`relative flex flex-col rounded-2xl border bg-surface p-6 shadow-card ${
                isPopular ? 'border-accent shadow-premium md:-translate-y-2' : 'border-border'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-accent text-on-accent text-[11px] font-semibold px-3 py-1 rounded-full shadow-glow">
                  <Sparkles size={11} /> Eng ko'p tanlanadi
                </span>
              )}

              <h2 className="font-luxury text-xl font-bold text-ink mb-1">{config.label}</h2>

              <div className="mb-1">
                <span className="font-luxury text-3xl font-bold text-ink">
                  {price === 0 ? 'Bepul' : `${formatSom(price)} so'm`}
                </span>
                {price > 0 && (
                  <span className="text-sm text-muted"> / {period === 'monthly' ? 'oy' : 'yil'}</span>
                )}
              </div>
              <p className="text-xs text-ink-subtle mb-5 min-h-[1rem]">
                {tier === 'free' && "Har doim bepul"}
                {tier !== 'free' && period === 'yearly' && "2 oyga yaqin tejaysiz"}
                {tier !== 'free' && period === 'monthly' && "Istalgan payt bekor qilinadi"}
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {config.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink">
                    <Check size={15} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent && tier !== 'free' ? (
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center justify-center gap-2 border border-accent/40 bg-accent-soft text-accent font-semibold px-5 py-2.5 rounded-xl text-sm">
                    Joriy rejangiz
                  </span>
                  <Link
                    href={`/app/tolov?tier=${tier}&months=${period === 'yearly' ? 12 : 1}`}
                    className="inline-flex items-center justify-center text-sm font-semibold text-accent hover:underline py-1"
                  >
                    Muddatni uzaytirish →
                  </Link>
                </div>
              ) : isCurrent ? (
                <span className="inline-flex items-center justify-center gap-2 border border-accent/40 bg-accent-soft text-accent font-semibold px-5 py-3 rounded-xl text-sm">
                  Joriy rejangiz
                </span>
              ) : tier === 'free' ? (
                <Link
                  href={authState === 'in' ? '/app' : '/royxat'}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-5 py-3 rounded-xl text-sm transition-colors shadow-glow"
                >
                  {authState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : 'Hozir boshlash'}
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Checkout: card transfer + receipt today, Payme/Click once connected (/app/tolov). */}
                  <Link
                    href={
                      authState === 'in'
                        ? `/app/tolov?tier=${tier}&months=${period === 'yearly' ? 12 : 1}`
                        : `/royxat?next=${encodeURIComponent(`/app/tolov?tier=${tier}&months=${period === 'yearly' ? 12 : 1}`)}`
                    }
                    onClick={() => registerInterest(tier)}
                    className={`inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-colors ${
                      isPopular ? 'bg-accent hover:bg-accent-hover text-on-accent shadow-glow' : 'bg-ink text-bg hover:opacity-90'
                    }`}
                  >
                    {subscription?.tier === tier && subscription.status !== 'free' ? 'Uzaytirish' : 'Sotib olish'}
                  </Link>
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-accent py-1"
                  >
                    <MessageCircle size={13} /> Savol bormi? Telegram
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-subtle max-w-lg mx-auto mt-8">
        To'lov karta orqali: summani o'tkazib, chekni yuklaysiz — tasdiqlangach tarif darhol ochiladi
        va 1 oy (yoki 1 yil) amal qiladi. Muddat tugagach yana 3 kun ochiq turadi.
      </p>
    </div>
  );
}
