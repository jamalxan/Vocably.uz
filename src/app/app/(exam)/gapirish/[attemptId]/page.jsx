'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';
import SpeakingSection from '@/features/exam/speaking/SpeakingSection';
import SpeakingResult from '@/features/exam/review/SpeakingResult';

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami)."
function candidateIdFrom(attemptId) {
  return attemptId.slice(-7).toUpperCase();
}

export default function GapirishAttemptPage() {
  const params = useParams();
  const { isAuthed, displayName } = useApp();
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const attemptId = params.attemptId;

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  if (submitted) {
    return (
      <div>
        <ExamBackLink width="max-w-2xl" />
        <SpeakingResult attemptId={attemptId} result={result} onRegraded={setResult} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-10">
          <Link
            href="/app/gapirish"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Yangi urinish boshlash
          </Link>
          <Link
            href="/app/mashq"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-muted hover:text-ink font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Mashq bo&apos;limiga
          </Link>
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
