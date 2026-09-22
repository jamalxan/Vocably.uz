'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ListeningPracticeSection from '@/features/exam/listening/ListeningPracticeSection';
import ListeningResult from '@/features/exam/review/ListeningResult';

export default function TinglashMashqAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthed } = useApp();
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const attemptId = params.attemptId;

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  if (submitted) {
    return (
      <div>
        <ListeningResult attemptId={attemptId} result={result} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/tinglash/mashq')} className="text-sm text-accent hover:underline font-semibold">
            Yangi mashq boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <ListeningPracticeSection
      attemptId={attemptId}
      onSubmitted={(r) => {
        setResult(r);
        setSubmitted(true);
      }}
    />
  );
}
