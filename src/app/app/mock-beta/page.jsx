'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import MockShell from '@/features/exam/mock/MockShell';

// TZ-vocably-v2.md §20 — "Yangi engine /app/oqish-beta da qurib chiqing"
// (Mock uchun bir xil qoida). `MockShell` o'zi attempt yaratish/davom
// etishning butun tsiklini boshqaradi (intro → Listening → Reading → Writing
// → natija) — shuning uchun bu sahifa alohida `[attemptId]` yo'liga muhtoj
// emas (`/app/oqish-beta`dan farqli — u yerda har bo'lim MUSTAQIL attempt).
function MockBetaInner() {
  const searchParams = useSearchParams();
  const { token, displayName } = useApp();
  const testIdFromUrl = searchParams.get('testId') || '';
  const [testId, setTestId] = useState(testIdFromUrl);
  const [started, setStarted] = useState(!!testIdFromUrl);

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  if (!started) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-10">
        <h1 className="text-lg font-bold text-ink mb-1">Mock Beta — Exam Engine v1</h1>
        <p className="text-sm text-muted mb-6">
          TZ-vocably-v2.md &quot;IELTS CD Exam Engine&quot; Faza 3 sinovi — Listening → Reading → Writing ketma-ketligi,
          bitta urinishda. Avval <code className="text-xs bg-surface px-1 py-0.5 rounded">scripts/seed-exam-test.mjs</code>{' '}
          ni ishga tushiring, u bergan Test ID ni shu yerga qo&apos;ying.
        </p>
        <label className="block text-xs font-semibold text-muted mb-1.5">Test ID</label>
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="masalan 65f0..."
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent font-mono"
        />
        <button
          onClick={() => testId.trim() && setStarted(true)}
          className="mt-4 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Davom etish
        </button>
      </div>
    );
  }

  return <MockShell testId={testId.trim()} candidateName={displayName || 'Foydalanuvchi'} />;
}

export default function MockBetaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Yuklanmoqda...</div>}>
      <MockBetaInner />
    </Suspense>
  );
}
