'use client';
import { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

// TZ 2.0 §6.6.1 — "So'z yaxshilashlari bir bosishda SRS'ga". Each row adds one phrase;
// "add all" sends the rest. Server: POST /api/words/upgrades (dedupes, word cap, system deck).
type Upgrade = { original: string; better: string; noteUz?: string };

export default function VocabUpgrades({ items }: { items: Upgrade[] }) {
  const { t } = useT();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string>('');
  const [error, setError] = useState('');

  if (!items?.length) return null;

  const add = async (list: Upgrade[], busyKey: string) => {
    const pending = list.filter((u) => !added.has(u.better));
    if (!pending.length) return;
    setBusy(busyKey);
    setError('');
    try {
      const r = await fetch('/api/words/upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pending.map(({ original, better }) => ({ original, better })) }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || t('rs.upgradeErr'));
      // Added or already in the vocabulary — either way it's in SRS now.
      setAdded((prev) => new Set([...prev, ...pending.map((u) => u.better)]));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t('rs.upgradeErr'));
    } finally {
      setBusy('');
    }
  };

  const allDone = items.every((u) => added.has(u.better));

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('rs.upgrades')}</p>
        <button
          type="button"
          onClick={() => add(items, '*')}
          disabled={allDone || !!busy}
          className="text-xs font-semibold text-accent disabled:text-muted inline-flex items-center gap-1 min-h-8 px-2 rounded-lg hover:bg-accent-soft disabled:hover:bg-transparent"
        >
          {busy === '*' ? <Loader2 size={12} className="animate-spin" aria-hidden /> : allDone ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
          {allDone ? t('rs.upgradesAdded') : t('rs.addAllSrs')}
        </button>
      </div>
      {items.map((u) => {
        const done = added.has(u.better);
        return (
          <div key={u.better} className="text-xs bg-bg-sunken rounded-lg p-2.5 flex items-start gap-2">
            <div className="min-w-0 flex-1 break-words">
              <p>
                <span className="text-muted">{u.original}</span> → <span className="text-success font-semibold">{u.better}</span>
              </p>
              {u.noteUz && <p className="text-muted mt-1">{u.noteUz}</p>}
            </div>
            <button
              type="button"
              onClick={() => add([u], u.better)}
              disabled={done || !!busy}
              aria-label={done ? `${u.better}: ${t('rs.upgradesAdded')}` : `${u.better} — ${t('rs.addSrs')}`}
              className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold border ${
                done ? 'border-success/30 text-success' : 'border-border text-ink hover:border-accent/50'
              }`}
            >
              {busy === u.better ? <Loader2 size={12} className="animate-spin" aria-hidden /> : done ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
              SRS
            </button>
          </div>
        );
      })}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}
