'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ListeningSection from '@/features/exam/listening/ListeningSection';
import ListeningResult from '@/features/exam/review/ListeningResult';

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami)."
function candidateIdFrom(attemptId) {
  return attemptId.slice(-7).toUpperCase();
}

export default function TinglashBetaAttemptPage() {
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
        <ListeningResult result={result} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/tinglash-beta')} className="text-sm text-accent hover:underline font-semibold">
            Yangi urinish boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <ListeningSection
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
