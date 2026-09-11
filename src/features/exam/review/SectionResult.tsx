'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAttemptResult } from '../state/attemptsApi';
import ReviewScreen from './ReviewScreen';
import ResultAnalytics from './ResultAnalytics';
import type { AttemptResult, AttemptReviewDetail } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 1 item 9 — "Natija ekrani (oddiy)". Bu ATAYLAB
// oddiy — §11'dagi to'liq premium natija ekrani (radar chart, zaif tomonlar
// tahlili, "lug'atga qo'shish", tarix taqqoslash) Faza 3 item 17 ishi. Shuning
// uchun ham bu — `[data-exam]` ICHIDA EMAS, oddiy ilova ranglarida (§5.1:
// "imtihondan keyin — to'liq Deep Merlot", lekin premium bezaksiz).
//
// Savol-savol tafsilot (izoh, to'g'ri javob, paragraf/transkript) endi bu
// yerda emas — "Javoblarni ko'rib chiqish" tugmasi ReviewScreen.tsx'ni
// ochadi (§11.2 item 16), shuning uchun ikki xil savol-ro'yxat UI'sini
// parallel saqlamaslik uchun bu yerdan olib tashlandi.
//
// Reading va Listening natija ko'rinishi bir xil (band + xom ball) — ATAYLAB
// bitta komponent, `ReadingResult.tsx`/`ListeningResult.tsx` shu yerga
// yupqa moslashtiruvchi (`sectionKey`).
export interface SectionResultProps {
  attemptId: string;
  result: AttemptResult | null;
  sectionKey: 'reading' | 'listening';
  label: string;
}

export default function SectionResult({ attemptId, result, sectionKey, label }: SectionResultProps) {
  const [reviewDetail, setReviewDetail] = useState<AttemptReviewDetail | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const section = result?.[sectionKey];

  const openReview = async () => {
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

  if (reviewDetail) return <ReviewScreen detail={reviewDetail} />;

  if (!result || !section) {
    return <div className="p-8 text-center text-sm text-muted">Natija topilmadi.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label} natijasi</p>
      <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">{section.band.toFixed(1)}</p>
      <p className="text-sm text-muted mt-1 tabular-nums">
        {section.raw} / {result.perQuestion.length} to&apos;g&apos;ri
      </p>

      {reviewError && <p className="text-xs text-danger mt-3">{reviewError}</p>}
      <button
        onClick={openReview}
        disabled={loadingReview}
        className="mt-5 mx-auto flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
      >
        {loadingReview && <Loader2 size={14} className="animate-spin" />}
        Javoblarni ko&apos;rib chiqish
      </button>

      <ResultAnalytics perQuestion={result.perQuestion} metric={sectionKey} />
    </div>
  );
}
