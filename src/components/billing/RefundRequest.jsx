'use client';
import { useState } from 'react';
import { Loader2, Undo2 } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { formatDateLocale } from '@/lib/uzDate';
import { useT } from '@/context/LocaleContext';

// 14-day full refund (TZ 2.0 §10) under a paid request in the checkout history.

const COPY = {
  uz: {
    ask: 'Pulni qaytarish',
    until: '{date} gacha',
    reason: 'Sabab (ixtiyoriy)',
    placeholder: "Nima yoqmadi? Bu bizga yaxshilashga yordam beradi.",
    send: "So'rov yuborish",
    cancel: 'Bekor qilish',
    warn: "Pul to'liq qaytariladi, tarif shu to'lov muddatiga qisqaradi. Har bir hisob uchun bir marta.",
    requested: "Qaytarish so'rovi yuborildi — 3 ish kunida ko'rib chiqamiz",
    approved: 'Pul qaytarildi',
    declined: "Qaytarish rad etildi",
    failed: "So'rovni yuborib bo'lmadi",
  },
  en: {
    ask: 'Request a refund',
    until: 'until {date}',
    reason: 'Reason (optional)',
    placeholder: 'What did not work for you? It helps us improve.',
    send: 'Send request',
    cancel: 'Cancel',
    warn: 'You get the full amount back and the plan is shortened by this payment’s term. Once per account.',
    requested: 'Refund requested — we reply within 3 working days',
    approved: 'Refunded',
    declined: 'Refund declined',
    failed: 'Could not send the request',
  },
};

export default function RefundRequest({ request, onChange }) {
  const c = useCopy(COPY);
  const { locale } = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const st = request.refund?.status;
  if (st === 'requested' || st === 'approved' || st === 'declined') {
    const cls = st === 'approved' ? 'text-success' : st === 'declined' ? 'text-danger' : 'text-muted';
    return (
      <p className={`text-xs mt-1 ${cls}`} data-testid="refund-status">
        {c[st]}
        {st === 'declined' && request.refund.note ? ` — ${request.refund.note}` : ''}
      </p>
    );
  }
  if (!request.refundableUntil) return null;

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/billing/refunds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: request.id, reason }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || c.failed);
      onChange?.({ ...request, refund: data.refund, refundableUntil: null });
      setOpen(false);
    } catch (e) {
      setError(e.message || c.failed);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1 inline-flex items-center gap-1 min-h-8 text-xs font-semibold text-accent hover:text-accent-hover">
        <Undo2 size={13} aria-hidden="true" /> {c.ask}
        <span className="font-normal text-muted">· {c.until.replace('{date}', formatDateLocale(locale, request.refundableUntil))}</span>
      </button>
    );
  }
  return (
    <div className="mt-2 space-y-2">
      <label className="block text-xs text-muted">
        {c.reason}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={c.placeholder}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </label>
      <p className="text-[11px] text-muted">{c.warn}</p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={send} disabled={busy} className="min-h-9 px-3 rounded-lg bg-accent text-on-accent text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent-hover disabled:opacity-50">
          {busy && <Loader2 size={13} className="animate-spin" aria-hidden="true" />} {c.send}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-9 px-3 rounded-lg border border-border text-xs font-semibold text-ink">
          {c.cancel}
        </button>
      </div>
    </div>
  );
}
