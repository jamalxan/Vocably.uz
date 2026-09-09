'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const PERIODS = [
  { key: 'week', label: 'Bu hafta' },
  { key: 'all', label: 'Umumiy' },
];

const MEDAL_COLOR = ['text-yellow-500', 'text-slate-400', 'text-amber-700'];

// VOCABLY-TZ.md §13 — Leaderboard. Do'stlar orasidagi taqqoslash kiritilmadi
// (izoh: src/app/api/gamification/leaderboard/route.js) — hozircha barcha
// foydalanuvchilar bo'yicha umumiy reyting.
export default function ReytingPage() {
  const { token } = useApp();
  const [period, setPeriod] = useState('week');
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gamification/leaderboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRows(data.rows);
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

      <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl mb-5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              period === p.key ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted py-8">Yuklanmoqda...</p>
      ) : !rows || rows.length === 0 ? (
        <p className="text-center text-sm text-muted py-8">Hali hech kim XP to'plamagan.</p>
      ) : (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {rows.map((r) => (
            <div
              key={r.userId}
              className={`flex items-center gap-3 px-4 py-3 ${r.isMe ? 'bg-accent-soft' : ''}`}
            >
              <span className="w-6 text-center flex-shrink-0">
                {r.rank <= 3 ? (
                  <Medal size={16} className={MEDAL_COLOR[r.rank - 1]} />
                ) : (
                  <span className="text-xs font-semibold text-muted">{r.rank}</span>
                )}
              </span>
              <span className={`flex-1 text-sm truncate ${r.isMe ? 'font-semibold text-accent' : 'text-ink'}`}>
                {r.displayName} {r.isMe && '(siz)'}
              </span>
              <span className="text-sm font-bold text-ink">{r.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
