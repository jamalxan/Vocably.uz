'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ReadingSection from '@/features/exam/reading/ReadingSection';
import ReadingResult from '@/features/exam/review/ReadingResult';

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami) —
// bu haqiqiylik hissini beradi."
function candidateIdFrom(attemptId) {
  return attemptId.slice(-7).toUpperCase();
}

export default function OqishBetaAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { token, displayName } = useApp();
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const attemptId = params.attemptId;

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  if (submitted) {
    return (
      <div>
        <ReadingResult result={result} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/oqish-beta')} className="text-sm text-accent hover:underline font-semibold">
            Yangi urinish boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReadingSection
      attemptId={attemptId}
      candidateName={displayName || 'Foydalanuvchi'}
      candidateId={candidateIdFrom(attemptId)}
      onSubmitted={(r) => {
        setResult(r);
        setSubmitted(true);
      }}
    />
  );
}
