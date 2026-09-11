'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAttemptResult } from '../state/attemptsApi';
import ReviewScreen from '../review/ReviewScreen';
import ResultAnalytics from '../review/ResultAnalytics';
import type { AttemptResult, AttemptReviewDetail } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 3 item 15's scope stops at orchestration — this is
// a MINIMAL post-mock summary (overall + per-section bands) just so the mock
// flow has somewhere to land. The real premium version (§11: radar chart,
// weak-area analysis, "add to dictionary", history comparison) is items
// 17-19, separate work — but the per-question review itself (item 16,
// ReviewScreen.tsx) IS wired in here already, same as the standalone section
// result screens.
export interface MockResultProps {
  attemptId: string;
  result: AttemptResult | null;
}

function SectionRow({ label, band }: { label: string; band?: number | null }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-lg font-bold text-brand-text tabular-nums">{band != null ? band.toFixed(1) : '—'}</span>
    </div>
  );
}

export default function MockResult({ attemptId, result }: MockResultProps) {
  const [reviewDetail, setReviewDetail] = useState<AttemptReviewDetail | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  if (!result) {
    return <div className="p-8 text-center text-sm text-muted">Natija topilmadi.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Umumiy band</p>
        <p className="text-6xl font-bold text-brand-text mt-2 tabular-nums">
          {result.overall != null ? result.overall.toFixed(1) : '—'}
        </p>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <SectionRow label="Listening" band={result.listening?.band} />
        <SectionRow label="Reading" band={result.reading?.band} />
        <SectionRow label="Writing" band={result.writing?.band} />
      </div>
      {result.writing == null && (
        <p className="text-xs text-muted mt-3 text-center">Writing hali baholanmagan bo&apos;lishi mumkin — bir necha soniya kuting.</p>
      )}

      {reviewError && <p className="text-xs text-danger mt-3 text-center">{reviewError}</p>}
      <button
        onClick={openReview}
        disabled={loadingReview}
        className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
      >
        {loadingReview && <Loader2 size={14} className="animate-spin" />}
        Javoblarni ko&apos;rib chiqish
      </button>

      <ResultAnalytics perQuestion={result.perQuestion} metric="overall" />
    </div>
  );
}
