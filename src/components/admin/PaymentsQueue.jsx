'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';
import { formatUzDate } from '@/lib/uzDate';

// Manual payments: the user transferred money and uploaded a receipt. Look at
// the receipt, check the amount arrived, press "Tasdiqlash" — the plan opens
// for the paid term and the user is notified (src/lib/payments/approve.js).
const FILTERS = [
  ['pending', 'Kutilmoqda'],
  ['approved', 'Tasdiqlangan'],
  ['rejected', 'Rad etilgan'],
  ['all', 'Hammasi'],
];
const som = (n) => `${String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;

function Receipt({ id, mime }) {
  const src = `/api/billing/receipt/${id}`;
  if (mime === 'application/pdf') {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full sm:w-40 h-40 rounded-xl border border-border bg-bg text-sm text-accent">
        <FileText size={18} /> PDF chek
      </a>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="relative block w-full sm:w-40 h-52 sm:h-40 rounded-xl overflow-hidden border border-border bg-bg group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="To'lov cheki" loading="lazy" className="w-full h-full object-contain" />
      <span className="absolute right-1.5 bottom-1.5 p-1 rounded-md bg-black/50 text-white opacity-80 group-hover:opacity-100">
        <ExternalLink size={13} />
      </span>
    </a>
  );
}

export default function PaymentsQueue() {
  const [status, setStatus] = useState('pending');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/payments?status=${status}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e) {
      setError(e.message || 'Yuklanmadi');
    }
  }, [status]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const act = async (r, action) => {
    let reason = '';
    if (action === 'reject') {
      reason = prompt('Rad etish sababi (foydalanuvchiga ko‘rsatiladi):', 'Summa tushmadi');
      if (reason === null) return;
    } else if (!confirm(`${r.user?.name || r.user?.phone}: ${TIER_CONFIG[r.tier].label} (${r.months === 12 ? '1 yil' : '1 oy'}) faollashtirilsinmi?`)) {
      return;
    }
    setBusy(r.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/payments/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await load();
    } catch (e) {
      setError(e.message || 'Bajarilmadi');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 p-1 bg-bg border border-border rounded-xl w-fit">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setStatus(k)}
            aria-pressed={status === k}
            className={`px-3.5 py-1.5 min-h-10 md:min-h-0 rounded-lg text-xs font-semibold ${status === k ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}
          >
            {label}
            {k === 'pending' && data?.pendingCount ? ` (${data.pendingCount})` : ''}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!data && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      )}
      {data && data.requests.length === 0 && <p className="text-sm text-muted py-10 text-center">So‘rov yo‘q.</p>}
      {data?.requests.map((r) => (
        <div key={r.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border bg-surface shadow-card">
          {r.hasReceipt ? <Receipt id={r.id} mime={r.receiptMime} /> : <div className="w-full sm:w-40 h-20 sm:h-40 rounded-xl bg-bg border border-border grid place-items-center text-xs text-muted">{r.method}</div>}
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-semibold text-ink">
              {r.user?.name || '—'} {r.user?.username && <span className="text-muted font-normal">@{r.user.username}</span>}
            </p>
            <p className="text-xs text-muted">{r.user?.phone}</p>
            <p className="text-sm text-ink">
              <strong>{TIER_CONFIG[r.tier]?.label}</strong> · {r.months === 12 ? '1 yil' : '1 oy'} · <strong>{som(r.amount)}</strong>
            </p>
            <p className="text-xs text-muted">
              {formatUzDate(r.createdAt, { year: true })} · {r.method === 'manual' ? 'karta + chek' : r.method}
              {r.user?.tier && r.user.tier !== 'free' && r.user.expiresAt ? ` · hozir ${TIER_CONFIG[r.user.tier]?.label} ${formatUzDate(r.user.expiresAt, { year: true })} gacha` : ''}
            </p>
            {r.note && <p className="text-sm text-ink bg-bg rounded-lg px-3 py-2">“{r.note}”</p>}
            {r.status === 'rejected' && r.rejectReason && <p className="text-xs text-danger">Sabab: {r.rejectReason}</p>}
            {r.status !== 'pending' && (
              <p className={`text-xs font-semibold ${r.status === 'approved' ? 'text-success' : 'text-muted'}`}>
                {r.status === 'approved' ? 'Tasdiqlangan' : r.status === 'rejected' ? 'Rad etilgan' : 'Bekor qilingan'}
                {r.reviewedAt ? ` · ${formatUzDate(r.reviewedAt)}` : ''}
              </p>
            )}
          </div>
          {r.status === 'pending' && (
            <div className="flex sm:flex-col gap-2 sm:w-36">
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => act(r, 'approve')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 px-3 rounded-xl bg-success text-white text-sm font-semibold disabled:opacity-50"
              >
                {busy === r.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Tasdiqlash
              </button>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => act(r, 'reject')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 px-3 rounded-xl border border-border text-sm font-semibold text-danger hover:bg-danger-soft disabled:opacity-50"
              >
                <X size={15} /> Rad etish
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
