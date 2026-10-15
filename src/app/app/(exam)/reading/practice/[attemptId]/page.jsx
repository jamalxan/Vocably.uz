'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';
import ReadingSection from '@/features/exam/reading/ReadingSection';
import ReviewScreen from '@/features/exam/review/ReviewScreen';
import { fetchAttemptResult } from '@/features/exam/state/attemptsApi';

// Practice'ning butun ma'nosi — darhol batafsil fikr-mulohaza (izoh/evidence
// paragraf), shuning uchun oddiy `SectionResult` (band-score) o'rniga
// to'g'ridan-to'g'ri `ReviewScreen`ga o'tkaziladi. Reading (Listening'dan
// farqli) submit'da SINXRON baholanadi (attemptServer.ts), shuning uchun
// `fetchAttemptResult` (faqat `status==='graded'`da ishlaydi) shu yerda
// kutishsiz, submit tugagach darhol chaqiriladi.
export default function OqishMashqAttemptPage() {
  const params = useParams();
  const { isAuthed, displayName } = useApp();
  const { t } = useT();
  const [reviewDetail, setReviewDetail] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const attemptId = params.attemptId;

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">{t('ex.login')}</p>;
  }

  const handleSubmitted = async () => {
    setLoadingReview(true);
    setReviewError('');
    try {
      const { detail } = await fetchAttemptResult(attemptId);
      setReviewDetail(detail);
    } catch {
      setReviewError(t('ex.reviewErr'));
    } finally {
      setLoadingReview(false);
    }
  };

  if (reviewDetail) {
    return (
      <div>
        <ExamBackLink width="max-w-3xl" />
        <ReviewScreen detail={reviewDetail} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-10">
          <Link
            href="/app/oqish"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {t('ex.practiceMore')}
          </Link>
          <Link
            href="/app/oqish"
            className="inline-flex items-center min-h-11 px-3 rounded-lg text-sm text-muted hover:text-ink font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {t('ex.toSkill', { skill: 'Reading' })}
          </Link>
        </div>
      </div>
    );
  }

  if (reviewError) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-danger">{reviewError}</p>
        <Link href="/app/oqish" className="inline-flex items-center min-h-11 px-3 text-sm text-accent hover:underline font-semibold">
          {t('ex.toSkill', { skill: 'Reading' })}
        </Link>
      </div>
    );
  }

  if (loadingReview) {
    return <div className="p-8 text-center text-sm text-muted">{t('ex.grading')}</div>;
  }

  // 2026-09-29: mashq ham haqiqiy imtihon interfeysida (split panel, matnni
  // belgilash, savollar paneli) — faqat taymersiz.
  return (
    <ReadingSection
      practice
      attemptId={attemptId}
      candidateName={displayName}
      candidateId={attemptId.slice(-7).toUpperCase()}
      onSubmitted={handleSubmitted}
    />
  );
}
