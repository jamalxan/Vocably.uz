'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Loader2, GraduationCap, Dumbbell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';

// VOCABLY-TZ.md §11.3 — ikki xil rejim: "exam" (real vaqt, pauza yo'q, natija
// oxirida) va "practice" (bo'lim vaqti bosim qilmaydi, har javobdan keyin darhol
// to'g'ri javob ko'rinadi, audio cheklovsiz qayta tinglanadi).
// 2026-09-10 — bir nechta mock (AI-demo + Cambridge IELTS 15) qo'shilgani sababli
// tanlash imkoni kerak bo'ldi (ilgari faqat 'full-8' qattiq yozilgan edi). Ro'yxat
// /api/exam/mocks'dan OLINADI (lib/exam/content'ni bu yerga to'g'ridan-to'g'ri
// import qilib bo'lmaydi — u holda butun MOCKS obyekti, jumladan to'g'ri javoblar,
// client JS bundle'iga qo'shilib ketardi).
export default function MockPage() {
  const { token } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState('exam');
  const [mocks, setMocks] = useState([]);
  const [mockId, setMockId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/exam/mocks')
      .then((r) => r.json())
      .then((data) => {
        setMocks(data.mocks || []);
        if (data.mocks?.[0]) setMockId(data.mocks[0].id);
      })
      .catch(() => {});
  }, []);

  const start = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mockId, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Boshlab bo'lmadi");
      router.push(`/app/mock/${data.state.sessionId || data.sessionId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Target size={20} className="text-accent" />
        <h1 className="text-xl font-bold text-ink font-display">Mock imtihon</h1>
      </div>
      <p className="text-sm text-muted mb-6">
        4 bo'lim: Listening (30 daq) · Reading (60 daq) · Writing (60 daq) · Speaking (14 daq).
      </p>

      {mocks.length > 1 && (
        <div className="mb-5">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Test</label>
          <div className="flex flex-col gap-1.5">
            {mocks.map((m) => (
              <button
                key={m.id}
                onClick={() => setMockId(m.id)}
                className={`text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  mockId === m.id ? 'border-accent bg-accent-soft text-accent font-semibold' : 'border-border bg-surface text-ink hover:border-accent/30'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 mb-5">
        <button
          onClick={() => setMode('exam')}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${
            mode === 'exam' ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:border-accent/30'
          }`}
        >
          <GraduationCap size={20} className={mode === 'exam' ? 'text-accent' : 'text-muted'} />
          <div>
            <p className="text-sm font-semibold text-ink">To'liq imtihon</p>
            <p className="text-xs text-muted">Real vaqt, pauza yo'q, natija faqat oxirida. Haqiqiy imtihon tajribasi.</p>
          </div>
        </button>
        <button
          onClick={() => setMode('practice')}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${
            mode === 'practice' ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:border-accent/30'
          }`}
        >
          <Dumbbell size={20} className={mode === 'practice' ? 'text-accent' : 'text-muted'} />
          <div>
            <p className="text-sm font-semibold text-ink">Mashq (Practice)</p>
            <p className="text-xs text-muted">Vaqt bosim qilmaydi, har javobdan keyin darhol to'g'ri javob ko'rinadi.</p>
          </div>
        </button>
      </div>

      {error && <p className="text-xs text-danger font-medium mb-3">{error}</p>}
      <Button onClick={start} disabled={loading} className="w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Tayyorlanmoqda...' : 'Boshlash'}
      </Button>
    </div>
  );
}
