'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Copy, CreditCard, FileImage, Loader2, Upload, Clock, XCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';

// Paid plan checkout. Today: pay by card transfer and upload the receipt —
// the admin approves and the plan opens (the user gets an in-app, push and
// Telegram notice). Payme/Click buttons appear by themselves once those
// providers are configured on the server (/api/billing/options).

const TIERS = ['standard', 'premium'];
const STATUS = {
  pending: { label: 'Tekshirilmoqda', icon: Clock, className: 'text-warning bg-warning-soft' },
  approved: { label: 'Tasdiqlandi', icon: CheckCircle2, className: 'text-success bg-success-soft' },
  rejected: { label: 'Rad etildi', icon: XCircle, className: 'text-danger bg-danger-soft' },
  cancelled: { label: 'Bekor qilindi', icon: XCircle, className: 'text-muted bg-bg' },
};

const som = (n) => `${String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text.replace(/\s/g, '')).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg bg-on-primary/10 hover:bg-on-primary/20 text-xs font-semibold"
    >
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? 'Nusxalandi' : 'Nusxalash'}
    </button>
  );
}

export default function Checkout() {
  const params = useSearchParams();
  const [tier, setTier] = useState(TIERS.includes(params.get('tier')) ? params.get('tier') : 'standard');
  const [months, setMonths] = useState(params.get('months') === '12' ? 12 : 1);
  const [options, setOptions] = useState(null);
  const [requests, setRequests] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const inputRef = useRef(null);

  const loadRequests = () =>
    fetch('/api/billing/requests')
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setRequests(d.requests || []))
      .catch(() => setRequests([]));

  useEffect(() => {
    fetch('/api/billing/options')
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => setOptions({ manual: null, payme: false, click: false, prices: {} }));
    loadRequests();
  }, []);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const amount = options?.prices?.[tier]?.[months] ?? (months === 12 ? TIER_CONFIG[tier].priceYearly : TIER_CONFIG[tier].priceMonthly);

  const pick = (f) => {
    setError('');
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type)) return setError('Faqat rasm (JPG, PNG, WEBP) yoki PDF');
    if (f.size > 5 * 1024 * 1024) return setError('Fayl 5 MB dan katta');
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const submitManual = async () => {
    if (!file) return setError('Avval chek rasmini yuklang');
    setBusy(true);
    setError('');
    const fd = new FormData();
    fd.append('tier', tier);
    fd.append('months', String(months));
    fd.append('method', 'manual');
    fd.append('note', note);
    fd.append('receipt', file);
    try {
      const res = await fetch('/api/billing/requests', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yuborilmadi');
      setSent(true);
      setFile(null);
      setPreview(null);
      setNote('');
      loadRequests();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const payOnline = async (method) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/billing/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, months, method }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "To'lov sahifasi ochilmadi");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const manual = options?.manual;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Tarifni faollashtirish</h1>
        <p className="text-sm text-muted mt-1">To‘lovni amalga oshiring va chekni yuklang — tasdiqlangach tarif darhol ochiladi.</p>
      </div>

      {/* 1. Plan */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-plan">
        <h2 id="step-plan" className="text-sm font-semibold text-ink">1. Tarif va muddat</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              aria-pressed={tier === t}
              className={`p-4 rounded-xl border text-left transition-colors ${tier === t ? 'border-accent bg-accent-soft' : 'border-border bg-bg hover:border-accent/40'}`}
            >
              <span className="block font-display font-bold text-ink">{TIER_CONFIG[t].label}</span>
              <span className="block text-xs text-muted mt-0.5">{som(TIER_CONFIG[t].priceMonthly)} / oy</span>
            </button>
          ))}
        </div>
        <div className="inline-flex gap-1 p-1 rounded-xl bg-bg border border-border">
          {[
            [1, '1 oy'],
            [12, '1 yil (tejamkor)'],
          ].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              aria-pressed={months === m}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${months === m ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink">
          To‘lov summasi: <strong className="font-display text-lg">{som(amount)}</strong>
        </p>
      </section>

      {/* 2. Pay */}
      {(options?.payme || options?.click) && (
        <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-3" aria-labelledby="step-online">
          <h2 id="step-online" className="text-sm font-semibold text-ink">Onlayn to‘lov — tarif avtomatik ochiladi</h2>
          <div className="flex flex-wrap gap-2.5">
            {options.payme && (
              <button type="button" disabled={busy} onClick={() => payOnline('payme')} className="min-h-11 px-5 rounded-xl bg-[#00CCCC] text-white font-semibold text-sm disabled:opacity-60">
                Payme orqali to‘lash
              </button>
            )}
            {options.click && (
              <button type="button" disabled={busy} onClick={() => payOnline('click')} className="min-h-11 px-5 rounded-xl bg-[#0098FF] text-white font-semibold text-sm disabled:opacity-60">
                Click orqali to‘lash
              </button>
            )}
          </div>
          <p className="text-xs text-muted">Yoki quyida karta orqali o‘tkazib, chek yuboring.</p>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-pay">
        <h2 id="step-pay" className="text-sm font-semibold text-ink">2. Karta orqali to‘lov</h2>
        {manual ? (
          <div className="rounded-2xl bg-primary text-on-primary p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-primary/70">
              <CreditCard size={14} aria-hidden="true" /> {manual.bank || 'Karta raqami'}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xl sm:text-2xl tracking-wider tabular-nums">{manual.card}</span>
              <CopyButton text={manual.card} />
            </div>
            {manual.holder && <p className="text-sm text-on-primary/80">{manual.holder}</p>}
            <p className="text-xs text-on-primary/60">Aynan {som(amount)} o‘tkazing. Izohga telefon raqamingizni yozishingiz mumkin.</p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Karta ma’lumotlari uchun admin bilan bog‘laning:{' '}
            <a href="https://t.me/howtolearnvocabbot" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold inline-flex items-center gap-1">
              <MessageCircle size={14} /> Telegram
            </a>
          </p>
        )}
      </section>

      {/* 3. Receipt */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-receipt">
        <h2 id="step-receipt" className="text-sm font-semibold text-ink">3. Chekni yuklang</h2>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0]);
          }}
          className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border hover:border-accent/50 bg-bg text-center"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Chek" className="max-h-56 rounded-lg object-contain" />
          ) : file ? (
            <FileImage size={28} className="text-accent" aria-hidden="true" />
          ) : (
            <Upload size={28} className="text-muted" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-ink">{file ? file.name : 'Chek skrinshotini tanlang yoki shu yerga tashlang'}</span>
          <span className="text-xs text-muted">JPG, PNG, WEBP yoki PDF · 5 MB gacha</span>
        </button>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Izoh (ixtiyoriy)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-sm text-ink outline-none focus:border-accent"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {sent && (
          <p className="text-sm text-success font-medium" role="status">
            Chek yuborildi. Admin tekshirgach tarif ochiladi — sizga xabar keladi.
          </p>
        )}
        <button
          type="button"
          onClick={submitManual}
          disabled={busy || !file}
          className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-on-accent font-semibold text-sm shadow-glow disabled:opacity-50"
        >
          {busy && <Loader2 size={16} className="animate-spin" />} Chekni yuborish
        </button>
      </section>

      {requests && requests.length > 0 && (
        <section aria-labelledby="history" className="space-y-2.5">
          <h2 id="history" className="text-sm font-semibold text-ink">
            So‘rovlarim
          </h2>
          {requests.map((r) => {
            const st = STATUS[r.status] || STATUS.pending;
            return (
              <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${st.className}`}>
                  <st.icon size={13} aria-hidden="true" /> {st.label}
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink">
                  {TIER_CONFIG[r.tier]?.label} · {r.months === 12 ? '1 yil' : '1 oy'} · {som(r.amount)}
                  {r.status === 'rejected' && r.rejectReason && <span className="block text-xs text-danger mt-0.5">{r.rejectReason}</span>}
                </span>
                <span className="text-xs text-muted flex-shrink-0">{formatUzDate(r.createdAt)}</span>
              </div>
            );
          })}
        </section>
      )}

      <p className="text-xs text-muted text-center">
        Savol bo‘lsa —{' '}
        <Link href="/narxlar" className="text-accent hover:underline">
          tariflar
        </Link>{' '}
        yoki Telegram orqali yozing.
      </p>
    </div>
  );
}
