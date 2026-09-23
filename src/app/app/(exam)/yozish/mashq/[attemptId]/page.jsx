'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';
import WritingPracticeSection from '@/features/exam/writing/WritingPracticeSection';
import WritingResult from '@/features/exam/review/WritingResult';

export default function YozishMashqAttemptPage() {
  const params = useParams();
  const { token } = useApp();
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const attemptId = params.attemptId;

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  if (submitted) {
    return (
      <div>
        <ExamBackLink width="max-w-2xl" />
        <WritingResult attemptId={attemptId} result={result} onRegraded={setResult} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-10">
          <Link
            href="/app/yozish/mashq"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Yangi mashq boshlash
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
    <WritingPracticeSection
      attemptId={attemptId}
      onSubmitted={(r) => {
        setResult(r);
        setSubmitted(true);
      }}
    />
  );
}
