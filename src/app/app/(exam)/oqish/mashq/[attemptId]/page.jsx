'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';
import ReadingPracticeSection from '@/features/exam/reading/ReadingPracticeSection';
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
  const { token } = useApp();
  const [reviewDetail, setReviewDetail] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const attemptId = params.attemptId;

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handleSubmitted = async () => {
    setLoadingReview(true);
    setReviewError('');
    try {
      const { detail } = await fetchAttemptResult(attemptId);
      setReviewDetail(detail);
    } catch {
      setReviewError("Ko'rib chiqishni yuklab bo'lmadi.");
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
            href="/app/oqish/mashq"
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

  if (reviewError) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-danger">{reviewError}</p>
        <Link href="/app/mashq" className="inline-flex items-center min-h-11 px-3 text-sm text-accent hover:underline font-semibold">
          Mashq bo&apos;limiga
        </Link>
      </div>
    );
  }

  if (loadingReview) {
    return <div className="p-8 text-center text-sm text-muted">Baholanmoqda...</div>;
  }

  return <ReadingPracticeSection attemptId={attemptId} onSubmitted={handleSubmitted} />;
}
