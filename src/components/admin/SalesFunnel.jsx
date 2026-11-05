'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Sales funnel on the admin overview (TZ 2.0 §6.12.3): landing → onboarding → signup → payment.

const LABELS = {
  landing: 'Landing (noyob tashrif)',
  onboarding_start: 'Onboarding boshladi',
  onboarding_done: 'Onboarding tugatdi',
  signup: "Ro'yxatdan o'tdi",
  payment: "Birinchi to'lov",
};
const RANGES = [7, 30, 90];
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('ru-RU') : '—');
const pct = (n) => (n === null || n === undefined ? '—' : `${n}%`);

export default function SalesFunnel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/funnel?days=${days}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Yuklanmadi');
        if (!cancelled) {
          setData(d);
          setError('');
        }
      })
      .catch((e) => !cancelled && setError(e.message || 'Yuklanmadi'));
    return () => {
      cancelled = true;
    };
  }, [days]);

  const top = data ? Math.max(1, ...data.steps.map((s) => s.count)) : 1;

  return (
    <section aria-label="Sotuv voronkasi" className="rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-ink">Sotuv voronkasi: landing → onboarding → ro&apos;yxat → to&apos;lov</h2>
        <div className="inline-flex rounded-lg border border-border overflow-hidden" role="group" aria-label="Davr">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDays(d);
                setData(null);
              }}
              aria-pressed={days === d}
              className={`px-3 min-h-9 text-xs font-semibold ${days === d ? 'bg-accent-soft text-accent-hover' : 'bg-surface text-muted hover:bg-bg-sunken'}`}
            >
              {d} kun
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {!data && !error && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      )}
      {data && (
        <>
          <ol className="space-y-2.5">
            {data.steps.map((s) => (
              <li key={s.key} data-testid={`funnel-${s.key}`}>
                <div className="flex items-baseline justify-between gap-3 text-xs mb-1">
                  <span className="text-ink font-medium">{LABELS[s.key] || s.key}</span>
                  <span className="text-muted tabular-nums">
                    <strong className="text-ink text-sm">{fmt(s.count)}</strong>
                    {s.fromPrev !== null && <> · oldingidan {pct(s.fromPrev)}</>}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-bg-sunken/70 overflow-hidden" aria-hidden="true">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(s.count ? 2 : 0, (s.count / top) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Kirish sahifalari</p>
              {data.landings.length === 0 ? (
                <p className="text-xs text-muted">Hali tashrif yo&apos;q.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {data.landings.map((l) => (
                    <li key={l.path} className="flex justify-between gap-3">
                      <code className="text-ink truncate">{l.path}</code>
                      <span className="tabular-nums text-muted">{fmt(l.visitors)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-xs space-y-1">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Pul</p>
              <p className="flex justify-between">
                <span className="text-muted">Tushum (tasdiqlangan to&apos;lovlar)</span>
                <strong className="text-ink tabular-nums">{fmt(data.revenue)} so&apos;m</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-muted">Qaytarilgan</span>
                <span className="text-ink tabular-nums">
                  {fmt(data.refunds.count)} · {fmt(data.refunds.amount)} so&apos;m
                </span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted mt-4 leading-relaxed">
            Davr bo&apos;yicha oqim: landing va onboarding — anonim noyob brauzerlar (kirgan foydalanuvchi va botlar sanalmaydi); ro&apos;yxat — shu davrda
            ochilgan hisoblar; to&apos;lov — birinchi to&apos;lovi shu davrga tushgan hisoblar (uzaytirish yangi konversiya emas).
          </p>
        </>
      )}
    </section>
  );
}
