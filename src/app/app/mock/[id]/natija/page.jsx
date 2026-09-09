'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Trophy, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const SECTION_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

// VOCABLY-TZ.md §11.5 — natija sahifasi: umumiy band, bo'limlar bo'yicha,
// savol-savol tahlil. Writing/Speaking bandlari bu mockda hali "kutilmoqda"
// (alohida AI-baholash /app/yozish, /app/gapirish'da qilinadi — bu yerga
// avtomatik ko'chirilmagan, TZ o'zi ham bu ikkalasini "asinxron baholanadi"
// deb ajratgan, 11.1-bo'lim).
export default function MockResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useApp();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/exam/${id}/state`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Yuklab bo'lmadi");
        if (cancelled) return;
        if (data.status !== 'submitted' || !data.result) {
          router.replace(`/app/mock/${id}`);
          return;
        }
        setState(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }
  if (error) return <p className="p-8 text-center text-sm text-danger">{error}</p>;
  if (!state) return null;

  const { result } = state;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-5">
      <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-card">
        <Trophy size={28} className="mx-auto text-accent mb-2" />
        <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Umumiy band</p>
        <p className="text-5xl font-bold text-accent font-display">{result.overall ?? '—'}</p>
        {result.gradingPending?.length > 0 && (
          <p className="text-[11px] text-warning mt-2">
            {result.gradingPending.map((s) => SECTION_LABEL[s]).join(', ')} hali baholanmagan — alohida bo'limlarda
            baholang, umumiy ball shunda yangilanadi.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(result.sections).map(([key, band]) => (
          <div key={key} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">{SECTION_LABEL[key]}</span>
            {band != null ? <Badge tone="accent">{band}</Badge> : <Badge tone="neutral">kutilmoqda</Badge>}
          </div>
        ))}
      </div>

      {['listening', 'reading'].map((key) => {
        const r = result.review[key];
        if (!r) return null;
        return (
          <div key={key} className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">{SECTION_LABEL[key]}</p>
              <span className="text-xs text-muted">
                {r.raw}/{r.total} to'g'ri
              </span>
            </div>
            <div className="space-y-1.5">
              {r.items.map((item, i) => (
                <div
                  key={item.id}
                  className={`text-xs px-2.5 py-1.5 rounded-lg ${item.ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}
                >
                  Savol {i + 1}: {item.ok ? "to'g'ri" : "noto'g'ri"}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Button onClick={() => router.push('/app/mock')} variant="secondary" className="w-full">
        <RotateCcw size={15} /> Yangi mock
      </Button>
    </div>
  );
}
