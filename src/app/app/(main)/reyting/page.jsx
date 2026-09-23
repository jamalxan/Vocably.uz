'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Skeleton from '@/components/ui/Skeleton';

const PERIODS = [
  { key: 'week', label: 'Bu hafta' },
  { key: 'all', label: 'Umumiy' },
];

// Faqat tokenlar (dark-mode'da invert bo'ladi); o'rin raqami sr-only matn sifatida ham bor.
const MEDAL_COLOR = ['text-warning', 'text-muted', 'text-accent'];

// VOCABLY-TZ.md §13 — Leaderboard. Do'stlar orasidagi taqqoslash kiritilmadi
// (izoh: src/app/api/gamification/leaderboard/route.js) — hozircha barcha
// foydalanuvchilar bo'yicha umumiy reyting.
export default function ReytingPage() {
  const { token } = useApp();
  const [period, setPeriod] = useState('week');
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/gamification/leaderboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Xatolik');
      setRows(data.rows || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Trophy size={20} className="text-accent" />
        <h1 className="text-xl font-bold text-ink font-display">Reyting</h1>
      </div>
      <p className="text-sm text-muted mb-5">Eng ko'p XP to'plagan foydalanuvchilar.</p>

      <div role="group" aria-label="Davr" className="flex gap-2 p-1 bg-surface border border-border rounded-xl mb-5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            aria-pressed={period === p.key}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
              period === p.key ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && !loading ? (
        <div role="alert" className="bg-danger-soft border border-danger/25 rounded-2xl px-4 py-5 text-center">
          <p className="text-sm text-danger mb-3">Reytingni yuklab bo'lmadi. Internet aloqasini tekshiring.</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-semibold text-ink hover:bg-bg-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw size={14} /> Qayta urinish
          </button>
        </div>
      ) : loading && !rows ? (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-6 h-5" />
              <Skeleton className="flex-1 h-5" />
              <Skeleton className="w-14 h-5" />
            </div>
          ))}
          <span className="sr-only">Yuklanmoqda...</span>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="text-center text-sm text-muted py-8">Hali hech kim XP to'plamagan.</p>
      ) : (
        <div
          aria-busy={loading}
          className={`bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden transition-opacity ${
            loading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {rows.map((r) => (
            <div
              key={r.userId}
              className={`flex items-center gap-3 px-4 py-3 ${r.isMe ? 'bg-accent-soft' : ''}`}
            >
              <span className="w-6 flex justify-center flex-shrink-0" title={`${r.rank}-o'rin`}>
                {r.rank <= 3 ? (
                  <>
                    <Medal size={16} className={MEDAL_COLOR[r.rank - 1]} aria-hidden="true" />
                    <span className="sr-only">{r.rank}-o&apos;rin</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-muted tabular-nums">{r.rank}</span>
                )}
              </span>
              <span className={`flex-1 min-w-0 text-sm truncate ${r.isMe ? 'font-semibold text-accent' : 'text-ink'}`}>
                {r.displayName} {r.isMe && '(siz)'}
              </span>
              <span className="text-sm font-bold text-ink whitespace-nowrap flex-shrink-0 tabular-nums">{r.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
