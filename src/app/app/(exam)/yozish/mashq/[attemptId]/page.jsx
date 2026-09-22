'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import WritingPracticeSection from '@/features/exam/writing/WritingPracticeSection';
import WritingResult from '@/features/exam/review/WritingResult';

export default function YozishMashqAttemptPage() {
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
        <WritingResult attemptId={attemptId} result={result} onRegraded={setResult} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/yozish/mashq')} className="text-sm text-accent hover:underline font-semibold">
            Yangi mashq boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <WritingPracticeSection
      attemptId={attemptId}
      onSubmitted={(r) => {
        setResult(r);
        setSubmitted(true);
      }}
    />
  );
}
