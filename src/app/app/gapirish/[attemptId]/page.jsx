'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import SpeakingSection from '@/features/exam/speaking/SpeakingSection';
import SpeakingResult from '@/features/exam/review/SpeakingResult';

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami)."
function candidateIdFrom(attemptId) {
  return attemptId.slice(-7).toUpperCase();
}

export default function GapirishAttemptPage() {
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
        <SpeakingResult attemptId={attemptId} result={result} onRegraded={setResult} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/gapirish')} className="text-sm text-accent hover:underline font-semibold">
            Yangi urinish boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <SpeakingSection
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
