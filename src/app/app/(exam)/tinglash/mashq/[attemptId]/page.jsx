'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';
import ListeningPracticeSection from '@/features/exam/listening/ListeningPracticeSection';
import ListeningResult from '@/features/exam/review/ListeningResult';

export default function TinglashMashqAttemptPage() {
  const params = useParams();
  const { isAuthed } = useApp();
  const { t } = useT();
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const attemptId = params.attemptId;

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">{t('ex.login')}</p>;
  }

  if (submitted) {
    return (
      <div>
        <ExamBackLink width="max-w-2xl" />
        <ListeningResult attemptId={attemptId} result={result} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-10">
          <Link
            href="/app/tinglash"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {t('ex.practiceMore')}
          </Link>
          <Link
            href="/app/tinglash"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-muted hover:text-ink font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {t('ex.toSkill', { skill: 'Listening' })}
          </Link>
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
