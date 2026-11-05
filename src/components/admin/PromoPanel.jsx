'use client';
import { useEffect, useState } from 'react';
import { Loader2, Plus, Ticket, Users } from 'lucide-react';

// Admin: promo / creator codes and referral numbers (TZ 2.0 §6.11 5, §10 3–4).
const som = (n) => `${Number(n || 0).toLocaleString('ru-RU')} so'm`;
const EMPTY = { code: '', kind: 'promo', percentOff: 10, creatorUsername: '', creatorShare: 20, maxUses: '', expiresAt: '', note: '' };

export default function PromoPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let on = true;
    fetch('/api/admin/promo', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load'))))
      .then((j) => on && setData(j))
      .catch(() => on && setError("Yuklab bo'lmadi"));
    return () => {
      on = false;
    };
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const r = await fetch('/api/admin/promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Xatolik');
      setData((d) => ({ ...d, codes: j.codes }));
      setForm(EMPTY);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c) => {
    const r = await fetch(`/api/admin/promo/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !c.active }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) setData((d) => ({ ...d, codes: j.codes }));
  };

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <Loader2 className="w-5 h-5 animate-spin text-muted" aria-label="Yuklanmoqda" />;

  const input = 'rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent';
  return (
    <div className="space-y-6" data-testid="promo-panel">
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <h2 className="text-base font-bold text-ink font-display flex items-center gap-2 mb-3">
          <Plus size={18} aria-hidden="true" /> Yangi kod
        </h2>
        <form onSubmit={create} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="text-xs text-muted">
            Kod
            <input value={form.code} onChange={set('code')} placeholder="SPRING25" required className={`${input} mt-1 w-full uppercase`} />
          </label>
          <label className="text-xs text-muted">
            Tur
            <select value={form.kind} onChange={set('kind')} className={`${input} mt-1 w-full`}>
              <option value="promo">Promo (chegirma)</option>
              <option value="creator">Creator (chegirma + ulush)</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            Chegirma, %
            <input type="number" min={1} max={100} value={form.percentOff} onChange={set('percentOff')} required className={`${input} mt-1 w-full`} />
          </label>
          <label className="text-xs text-muted">
            Limit (bo‘sh = cheksiz)
            <input type="number" min={1} value={form.maxUses} onChange={set('maxUses')} className={`${input} mt-1 w-full`} />
          </label>
          {form.kind === 'creator' && (
            <>
              <label className="text-xs text-muted">
                Creator username
                <input value={form.creatorUsername} onChange={set('creatorUsername')} placeholder="@username" required className={`${input} mt-1 w-full`} />
              </label>
              <label className="text-xs text-muted">
                Creator ulushi, % (to‘langan summadan)
                <input type="number" min={0} max={100} value={form.creatorShare} onChange={set('creatorShare')} className={`${input} mt-1 w-full`} />
              </label>
            </>
          )}
          <label className="text-xs text-muted">
            Muddat (ixtiyoriy)
            <input type="date" value={form.expiresAt} onChange={set('expiresAt')} className={`${input} mt-1 w-full`} />
          </label>
          <label className="text-xs text-muted">
            Izoh
            <input value={form.note} onChange={set('note')} maxLength={200} className={`${input} mt-1 w-full`} />
          </label>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
            <button type="submit" disabled={busy} className="rounded-xl bg-accent text-on-accent px-4 py-2 text-sm font-semibold disabled:opacity-60">
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : 'Yaratish'}
            </button>
            {formError && <p className="text-sm text-danger" role="alert">{formError}</p>}
          </div>
        </form>
      </section>

      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <h2 className="text-base font-bold text-ink font-display flex items-center gap-2 mb-3">
          <Ticket size={18} aria-hidden="true" /> Kodlar
        </h2>
        {data.codes.length === 0 ? (
          <p className="text-sm text-muted">Hali kod yo‘q.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="promo-table">
              <thead className="text-xs text-muted text-left">
                <tr>
                  <th className="py-2 pr-3">Kod</th>
                  <th className="py-2 pr-3">Tur</th>
                  <th className="py-2 pr-3">Chegirma</th>
                  <th className="py-2 pr-3">Creator</th>
                  <th className="py-2 pr-3">Ishlatildi</th>
                  <th className="py-2 pr-3">Tushum</th>
                  <th className="py-2 pr-3">Ulush</th>
                  <th className="py-2 pr-3">Muddat</th>
                  <th className="py-2">Holat</th>
                </tr>
              </thead>
              <tbody>
                {data.codes.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-2 pr-3 font-bold tracking-wider text-ink">
                      {c.code}
                      {c.note && <span className="block text-[11px] font-normal text-muted">{c.note}</span>}
                    </td>
                    <td className="py-2 pr-3">{c.kind === 'creator' ? 'Creator' : 'Promo'}</td>
                    <td className="py-2 pr-3 tabular-nums">−{c.percentOff}%</td>
                    <td className="py-2 pr-3">{c.owner ? `@${c.owner.username || '?'} · ${c.creatorShare}%` : '—'}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.usedCount}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ''}
                      {c.pending > 0 && <span className="text-muted"> (+{c.pending} kutilmoqda)</span>}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{som(c.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.kind === 'creator' ? som(c.commission) : '—'}</td>
                    <td className="py-2 pr-3 text-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('ru-RU') : '—'}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => toggle(c)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${c.active ? 'bg-success-soft text-success' : 'bg-bg border border-border text-muted'}`}
                        aria-pressed={c.active}
                      >
                        {c.active ? 'Faol' : "O'chirilgan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <h2 className="text-base font-bold text-ink font-display flex items-center gap-2 mb-3">
          <Users size={18} aria-hidden="true" /> Referral
        </h2>
        <p className="text-sm text-ink tabular-nums" data-testid="referral-summary">
          Jami <b>{data.referrals.total}</b> ta taklif · oxirgi 30 kunda <b>{data.referrals.last30}</b> ta
        </p>
        {data.referrals.top.length > 0 && (
          <ul className="mt-3 text-sm space-y-1">
            {data.referrals.top.map((t, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-ink">
                  {t.name || '—'} {t.username && <span className="text-muted">@{t.username}</span>} <span className="text-muted">· {t.code}</span>
                </span>
                <span className="tabular-nums text-muted">{t.invited} ta</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
