'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
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
  const router = useRouter();
  const { isAuthed } = useApp();
  const [reviewDetail, setReviewDetail] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const attemptId = params.attemptId;

  if (!isAuthed) {
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
        <ReviewScreen detail={reviewDetail} />
        <div className="text-center pb-10">
          <button onClick={() => router.push('/app/oqish/mashq')} className="text-sm text-accent hover:underline font-semibold">
            Yangi mashq boshlash
          </button>
        </div>
      </div>
    );
  }

  if (reviewError) {
    return <div className="p-8 text-center text-sm text-danger">{reviewError}</div>;
  }

  if (loadingReview) {
    return <div className="p-8 text-center text-sm text-muted">Baholanmoqda...</div>;
  }

  return <ReadingPracticeSection attemptId={attemptId} onSubmitted={handleSubmitted} />;
}
