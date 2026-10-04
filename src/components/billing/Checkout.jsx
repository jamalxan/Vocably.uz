'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Copy, CreditCard, FileImage, Loader2, Upload, Clock, XCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatDateLocale } from '@/lib/uzDate';
import { useT } from '@/context/LocaleContext';

// Paid plan checkout. Today: pay by card transfer and upload the receipt —
// the admin approves and the plan opens (the user gets an in-app, push and
// Telegram notice). Payme/Click buttons appear by themselves once those
// providers are configured on the server (/api/billing/options).

const TIERS = ['standard', 'premium'];
const STATUS = {
  pending: { label: 'co.st.pending', icon: Clock, className: 'text-warning bg-warning-soft' },
  approved: { label: 'co.st.approved', icon: CheckCircle2, className: 'text-success bg-success-soft' },
  rejected: { label: 'co.st.rejected', icon: XCircle, className: 'text-danger bg-danger-soft' },
  cancelled: { label: 'co.st.cancelled', icon: XCircle, className: 'text-muted bg-bg' },
};

const fmtNum = (n) => String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function CopyButton({ text }) {
  const { t } = useT();
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
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? t('co.cp') : t('co.copy')}
    </button>
  );
}

export default function Checkout() {
  const { t, ts, locale } = useT();
  const som = (n) => t('pr.som', { n: fmtNum(n) });
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
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type)) return setError(t('co.badFile'));
    if (f.size > 5 * 1024 * 1024) return setError(t('co.bigFile'));
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const submitManual = async () => {
    if (!file) return setError(t('co.needFile'));
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
      if (!res.ok) throw new Error(ts(data.error) || t('co.notSent'));
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
      if (!res.ok || !data.checkoutUrl) throw new Error(ts(data.error) || t('co.noPage'));
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
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">{t('co.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('co.sub')}</p>
      </div>

      {/* 1. Plan */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-plan">
        <h2 id="step-plan" className="text-sm font-semibold text-ink">{t('co.s1')}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TIERS.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => setTier(tr)}
              aria-pressed={tier === tr}
              className={`p-4 rounded-xl border text-left transition-colors ${tier === tr ? 'border-accent bg-accent-soft' : 'border-border bg-bg hover:border-accent/40'}`}
            >
              <span className="block font-display font-bold text-ink">{ts(TIER_CONFIG[tr].label)}</span>
              <span className="block text-xs text-muted mt-0.5">{t('co.perMonth', { price: som(TIER_CONFIG[tr].priceMonthly) })}</span>
            </button>
          ))}
        </div>
        <div className="inline-flex gap-1 p-1 rounded-xl bg-bg border border-border">
          {[
            [1, t('co.1m')],
            [12, t('co.1y')],
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
          {t('co.amount')} <strong className="font-display text-lg">{som(amount)}</strong>
        </p>
      </section>

      {/* 2. Pay */}
      {(options?.payme || options?.click) && (
        <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-3" aria-labelledby="step-online">
          <h2 id="step-online" className="text-sm font-semibold text-ink">{t('co.online')}</h2>
          <div className="flex flex-wrap gap-2.5">
            {options.payme && (
              <button type="button" disabled={busy} onClick={() => payOnline('payme')} className="min-h-11 px-5 rounded-xl bg-[#00CCCC] text-white font-semibold text-sm disabled:opacity-60">
                {t('co.payme')}
              </button>
            )}
            {options.click && (
              <button type="button" disabled={busy} onClick={() => payOnline('click')} className="min-h-11 px-5 rounded-xl bg-[#0098FF] text-white font-semibold text-sm disabled:opacity-60">
                {t('co.click')}
              </button>
            )}
          </div>
          <p className="text-xs text-muted">{t('co.orCard')}</p>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-pay">
        <h2 id="step-pay" className="text-sm font-semibold text-ink">{t('co.s2')}</h2>
        {manual ? (
          <div className="rounded-2xl bg-primary text-on-primary p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-primary/70">
              <CreditCard size={14} aria-hidden="true" /> {manual.bank || t('co.cardNo')}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xl sm:text-2xl tracking-wider tabular-nums">{manual.card}</span>
              <CopyButton text={manual.card} />
            </div>
            {manual.holder && <p className="text-sm text-on-primary/80">{manual.holder}</p>}
            <p className="text-xs text-on-primary/60">{t('co.exact', { amount: som(amount) })}</p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {t('co.cardInfo')}{' '}
            <a href="https://t.me/howtolearnvocabbot" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold inline-flex items-center gap-1">
              <MessageCircle size={14} /> Telegram
            </a>
          </p>
        )}
      </section>

      {/* 3. Receipt */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="step-receipt">
        <h2 id="step-receipt" className="text-sm font-semibold text-ink">{t('co.s3')}</h2>
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
            <img src={preview} alt={t('co.receipt')} className="max-h-56 rounded-lg object-contain" />
          ) : file ? (
            <FileImage size={28} className="text-accent" aria-hidden="true" />
          ) : (
            <Upload size={28} className="text-muted" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-ink">{file ? file.name : t('co.pickFile')}</span>
          <span className="text-xs text-muted">{t('co.fileHint')}</span>
        </button>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t('co.note')}
          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-sm text-ink outline-none focus:border-accent"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {sent && (
          <p className="text-sm text-success font-medium" role="status">
            {t('co.sent')}
          </p>
        )}
        <button
          type="button"
          onClick={submitManual}
          disabled={busy || !file}
          className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-on-accent font-semibold text-sm shadow-glow disabled:opacity-50"
        >
          {busy && <Loader2 size={16} className="animate-spin" />} {t('co.submit')}
        </button>
      </section>

      {requests && requests.length > 0 && (
        <section aria-labelledby="history" className="space-y-2.5">
          <h2 id="history" className="text-sm font-semibold text-ink">
            {t('co.mine')}
          </h2>
          {requests.map((r) => {
            const st = STATUS[r.status] || STATUS.pending;
            return (
              <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${st.className}`}>
                  <st.icon size={13} aria-hidden="true" /> {t(st.label)}
                </span>
                <span className="min-w-0 flex-1 text-sm text-ink">
                  {ts(TIER_CONFIG[r.tier]?.label)} · {r.months === 12 ? t('co.1yShort') : t('co.1m')} · {som(r.amount)}
                  {r.status === 'rejected' && r.rejectReason && <span className="block text-xs text-danger mt-0.5">{r.rejectReason}</span>}
                </span>
                <span className="text-xs text-muted flex-shrink-0">{formatDateLocale(locale, r.createdAt)}</span>
              </div>
            );
          })}
        </section>
      )}

      <p className="text-xs text-muted text-center">
        {t('co.helpPre')}{' '}
        <Link href="/narxlar" className="text-accent hover:underline">
          {t('co.helpLink')}
        </Link>{' '}
        {t('co.helpPost')}
      </p>
    </div>
  );
}
