'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { getBotUsername } from '@/lib/telegram';

// BILL-01/02 — haqiqiy (placeholder emas) pricing sahifasi. Narx/feature
// ro'yxati src/lib/entitlements.js'dan keladi (TZ §46.2: hardcode qilinmaydi).
//
// MUHIM: bu yerda haqiqiy to'lov/checkout YO'Q — Stripe/Payme/Click kabi
// gateway ulanmagan (bu FAZA uchun qasddan chetlab o'tilgan, chunki haqiqiy
// merchant hisob ma'lumotlari kerak). STANDARD/PREMIUM uchun CTA "Sotib
// olish" emas — "Bog'lanish" (Telegram orqali qiziqish bildirish), tarifni
// admin panel orqali qo'lda tayinlaydi (src/components/admin/UsersTable.jsx).

const ORDER = ['free', 'standard', 'premium'];

function formatSom(n) {
  if (!n) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function PricingTable() {
  const [period, setPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'in' | 'out'
  const [currentTier, setCurrentTier] = useState(null);
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
        if (data) setCurrentTier(data.subscriptionTier || 'free');
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

  return (
    <div>
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

              {isCurrent ? (
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
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registerInterest(tier)}
                  className="inline-flex items-center justify-center gap-2 bg-bg border border-border hover:border-accent/50 text-ink font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  <MessageCircle size={15} /> Bog'lanish
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-subtle max-w-lg mx-auto mt-8">
        STANDARD va PREMIUM rejalar hozircha qo'lda ulanadi — "Bog'lanish" tugmasi Telegram orqali
        bizga yozadi, so'ng rejangizni faollashtiramiz. Narxlar dastlabki launch taklifi va
        keyinchalik o'zgarishi mumkin.
      </p>
    </div>
  );
}
