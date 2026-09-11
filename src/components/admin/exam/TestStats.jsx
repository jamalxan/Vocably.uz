'use client';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

// TZ-vocably-v2.md §15.2 — "Statistika: har savol bo'yicha to'g'ri javob %.
// 95% dan yuqori yoki 10% dan past bo'lsa — savol shubhali, belgilanadi."
export default function TestStats({ token, testId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/admin/exam-tests/${testId}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (active) setData(d);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, testId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-muted">
        <Loader2 size={14} className="animate-spin" /> Yuklanmoqda...
      </div>
    );
  }
  if (!data || data.attemptCount === 0) {
    return <p className="text-xs text-muted py-2">Hali baholangan urinish yo&apos;q — statistika mavjud emas.</p>;
  }

  return (
    <div className="bg-bg rounded-lg p-3">
      <p className="text-xs text-muted mb-2">{data.attemptCount} ta baholangan urinish asosida</p>
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {data.questions.map((q) => (
          <div
            key={q.number}
            title={`Savol ${q.number}: ${q.correct}/${q.total} to'g'ri (${Math.round(q.accuracy * 100)}%)`}
            className={`relative flex items-center justify-center rounded text-[11px] font-semibold h-8 ${
              q.suspicious ? 'bg-warning-soft text-warning' : 'bg-surface text-ink border border-border'
            }`}
          >
            {q.number}
            {q.suspicious && <AlertTriangle size={9} className="absolute -top-1 -right-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}
