'use client';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, BarChart3 } from 'lucide-react';

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em]">{children}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

const MODE_LABEL = {
  spaced: 'Bugungi takrorlash',
  flashcard: 'Kartochka',
  quiz: 'Test/Tezkor/Yangi rejimlar',
  typing: 'Yozish testi',
  matching: 'Juftlikni topish',
  listening: 'Tinglab yozish',
  cloze: 'Kontekstda tanish',
};

// VOCABLY-TZ.md §16 "O'quv analitikasi". src/app/api/admin/learning-analytics
// izohidagi kabi — retention egri chizig'i va kontent-sifat foizi FAZA1/3
// arxitektura qarorlari tufayli hozircha yo'q.
export default function AdminLearningAnalytics({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/learning-analytics', { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Xatolik');
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }
  if (error) return <p className="text-sm text-danger text-center py-12">{error}</p>;

  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Qiyin so'zlar (eng ko'p leech)</SectionLabel>
        <p className="text-xs text-muted mb-4">
          Ko'p foydalanuvchida "leech" (8+ marta unutilgan) bo'lgan so'zlar — kontentni (misol/mnemonika) tuzatish signali.
        </p>
        {data.leechWords.length === 0 ? (
          <p className="text-sm text-muted">Hali leech so'z yo'q.</p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-bg text-[10px] font-semibold text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-4">So'z</th>
                  <th className="py-2.5 px-4">Foydalanuvchilar soni</th>
                  <th className="py-2.5 px-4">O'rtacha unutish</th>
                </tr>
              </thead>
              <tbody>
                {data.leechWords.map((w) => (
                  <tr key={w.word} className="border-t border-border">
                    <td className="py-2.5 px-4 font-semibold text-ink font-word">{w.word}</td>
                    <td className="py-2.5 px-4 text-muted">{w.userCount}</td>
                    <td className="py-2.5 px-4 flex items-center gap-1.5 text-warning">
                      <AlertTriangle size={13} /> {w.avgLapses}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Rejim samaradorligi</SectionLabel>
        <p className="text-xs text-muted mb-4">Har rejimdagi to'g'ri javob foizi — ReviewEvent audit-logidan.</p>
        {data.modeStats.length === 0 ? (
          <p className="text-sm text-muted">Hali ma'lumot yo'q.</p>
        ) : (
          <div className="space-y-2.5">
            {data.modeStats.map((m) => (
              <div key={m.mode} className="rounded-xl bg-surface border border-border p-4 flex items-center gap-4">
                <BarChart3 size={16} className="text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink">{MODE_LABEL[m.mode] || m.mode}</span>
                    <span className="text-xs text-muted">{m.total} urinish</span>
                  </div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${m.accuracy}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-accent tabular-nums w-14 text-right">{m.accuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
