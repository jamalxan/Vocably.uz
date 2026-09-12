'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import WritingSection from '@/features/exam/writing/WritingSection';
import WritingResult from '@/features/exam/review/WritingResult';

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami)."
function candidateIdFrom(attemptId) {
  return attemptId.slice(-7).toUpperCase();
}

export default function YozishAttemptPage() {
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
        <WritingResult attemptId={attemptId} result={result} onRegraded={setResult} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/yozish')} className="text-sm text-accent hover:underline font-semibold">
            Yangi urinish boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <WritingSection
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
