'use client';
import { useEffect, useState } from 'react';
import { Gift, Loader2, Check } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/entitlements';

// Admin settings. Welcome trial: the free starter plan every new account gets
// at registration (src/lib/welcomeTrial.js). Also editable from the bot:
// `/admin trial on|off`, `/admin trial premium 1`.
export default function SettingsPanel() {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
        setDraft(d.welcomeTrial);
      })
      .catch((e) => setError(e.message || 'Yuklanmadi'));
  }, []);

  const save = async (next) => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeTrial: next }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Saqlanmadi');
      setDraft(d.welcomeTrial);
      setData((prev) => ({ ...prev, welcomeTrial: d.welcomeTrial }));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <div className="flex justify-center py-16">
        {error ? <p className="text-sm text-danger">{error}</p> : <Loader2 className="animate-spin text-accent" size={24} />}
      </div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(data.welcomeTrial);
  const selectCls = 'px-3 py-2 bg-bg border border-border rounded-lg text-base md:text-sm text-ink outline-none focus:border-accent';

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4" aria-labelledby="welcome-trial">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="welcome-trial" className="text-sm font-bold text-ink flex items-center gap-2">
              <Gift size={16} className="text-accent" /> Yangi foydalanuvchiga bepul tarif
            </h2>
            <p className="text-xs text-muted mt-1">
              Ro'yxatdan o'tgan har bir yangi foydalanuvchiga tanlangan tarif avtomatik, bepul ochiladi. Muddat tugagach odatdagi 3 kunlik imtiyoz davri bilan Bepul rejaga o'tadi.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.enabled}
            aria-label="Bepul tarifni yoqish/o'chirish"
            disabled={saving}
            onClick={() => save({ ...draft, enabled: !draft.enabled })}
            className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${draft.enabled ? 'bg-success' : 'bg-border'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${draft.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className={`flex flex-wrap items-end gap-3 ${draft.enabled ? '' : 'opacity-60'}`}>
          <label className="text-xs text-muted">
            Tarif
            <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value })} className={`block mt-1 ${selectCls}`}>
              {data.options.tiers.map((t) => (
                <option key={t} value={t}>
                  {TIER_CONFIG[t]?.label || t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Muddat
            <select value={draft.months} onChange={(e) => setDraft({ ...draft, months: Number(e.target.value) })} className={`block mt-1 ${selectCls}`}>
              {data.options.months.map((m) => (
                <option key={m} value={m}>
                  {m} oy
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => save(draft)}
            className="inline-flex items-center gap-2 min-h-10 px-4 rounded-xl bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Saqlash
          </button>
        </div>

        <p className="text-xs text-ink">
          Hozir:{' '}
          <strong>
            {data.welcomeTrial.enabled ? `yoqilgan — ${TIER_CONFIG[data.welcomeTrial.tier]?.label} ${data.welcomeTrial.months} oy` : "o'chirilgan"}
          </strong>
          . Botdan: <code className="text-[11px] bg-bg px-1.5 py-0.5 rounded">/admin trial on|off</code>,{' '}
          <code className="text-[11px] bg-bg px-1.5 py-0.5 rounded">/admin trial premium 1</code>
        </p>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="text-xs text-success font-medium">
            Saqlandi.
          </p>
        )}
      </section>
    </div>
  );
}
