'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';

// TZ-vocably-v2.md §20 / §19 Faza 4 item 23 — `/app/oqish-beta`/`/app/yozish-beta`
// bilan bir xil naqsh — `?testId=` shu bitta ExamTest hujjatidagi "speaking"
// bo'limi uchun attempt yaratadi.
function GapirishBetaEntryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useApp();
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const testIdFromUrl = searchParams.get('testId') || '';
  const [testId, setTestId] = useState(testIdFromUrl);

  const start = async () => {
    if (!testId.trim()) {
      setError('Test ID kiriting (scripts/seed-exam-test.mjs natijasida chiqadi).');
      return;
    }
    setError('');
    setStarting(true);
    try {
      const { attemptId } = await createAttempt(testId.trim(), 'speaking');
      router.push(`/app/gapirish-beta/${attemptId}`);
    } catch {
      setError("Urinish yaratib bo'lmadi. Test ID to'g'riligini tekshiring.");
      setStarting(false);
    }
  };

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10">
      <h1 className="text-lg font-bold text-ink mb-1">Speaking Beta — Exam Engine v1</h1>
      <p className="text-sm text-muted mb-6">
        TZ-vocably-v2.md &quot;IELTS CD Exam Engine&quot; Faza 4 item 23 sinovi. Avval{' '}
        <code className="text-xs bg-surface px-1 py-0.5 rounded">scripts/seed-exam-test.mjs</code> ni ishga tushiring, u
        bergan Test ID ni shu yerga qo&apos;ying. Mikrofon ruxsati so&apos;raladi.
      </p>

      <label className="block text-xs font-semibold text-muted mb-1.5">Test ID</label>
      <input
        type="text"
        value={testId}
        onChange={(e) => setTestId(e.target.value)}
        placeholder="masalan 65f0..."
        className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent font-mono"
      />
      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      <button
        onClick={start}
        disabled={starting}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
      >
        {starting ? <Loader2 size={16} className="animate-spin" /> : null}
        Speaking bo&apos;limini boshlash
      </button>
    </div>
  );
}

export default function GapirishBetaEntryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Yuklanmoqda...</div>}>
      <GapirishBetaEntryInner />
    </Suspense>
  );
}
