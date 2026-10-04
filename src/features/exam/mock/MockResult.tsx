'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Loader2, RotateCcw, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useT } from '@/context/LocaleContext';
import { fetchAttempt, fetchAttemptResult, gradeWriting } from '../state/attemptsApi';
import ReviewScreen from '../review/ReviewScreen';
// recharts (~100 kB) faqat yakuniy natija ekranida kerak — imtihon sahifasining boshlang'ich bundle'iga kirmasin.
const ResultAnalytics = dynamic(() => import('../review/ResultAnalytics'), { ssr: false, loading: () => <div className="h-40 rounded-2xl bg-border/50 animate-pulse" aria-hidden="true" /> });
import { recommendNextPractice } from '@/lib/exam/mockRecommendation';
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

function SectionRow({ label, band, estimated }: { label: string; band?: number | null; estimated?: boolean }) {
  const { t } = useT();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-lg font-bold text-brand-text tabular-nums">
        {band != null ? band.toFixed(1) : '—'}
        {band != null && estimated && (
          <span className="ml-1 align-top text-[11px] font-semibold text-muted" title={t('mr.estimatedNote')}>
            {t('mr.estimated')}
          </span>
        )}
      </span>
    </div>
  );
}

function BackToApp() {
  const { t } = useT();
  return (
    <Link
      href="/app"
      className="inline-flex items-center gap-1.5 min-h-11 px-1 -mx-1 mb-2 text-sm font-medium text-muted hover:text-ink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ArrowLeft size={16} /> {t('mi.home')}
    </Link>
  );
}

export default function MockResult({ attemptId, result: initialResult }: MockResultProps) {
  const { t, ts } = useT();
  const [result, setResult] = useState<AttemptResult | null>(initialResult);
  const [reviewDetail, setReviewDetail] = useState<AttemptReviewDetail | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [regrading, setRegrading] = useState(false);
  const [regradeError, setRegradeError] = useState('');
  const [reloading, setReloading] = useState(false);
  const [reloadError, setReloadError] = useState('');

  const openReview = async () => {
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

  // Writing baholash submit paytida muvaffaqiyatsiz bo'lsa — fonda hech narsa
  // qayta baholamaydi, shuning uchun foydalanuvchi o'zi qayta ishga tushiradi.
  const regradeWriting = async () => {
    setRegrading(true);
    setRegradeError('');
    try {
      const { result: graded } = await gradeWriting(attemptId);
      if (graded) setResult(graded);
    } catch {
      setRegradeError(t('rs.writingErr'));
    } finally {
      setRegrading(false);
    }
  };

  const reloadResult = async () => {
    setReloading(true);
    setReloadError('');
    try {
      const data = await fetchAttempt(attemptId);
      if (data.attempt.result) setResult(data.attempt.result);
      else setReloadError(t('mr.resultMissing'));
    } catch {
      setReloadError(t('mr.loadErr'));
    } finally {
      setReloading(false);
    }
  };

  if (reviewDetail) return <ReviewScreen detail={reviewDetail} onBack={() => setReviewDetail(null)} />;

  if (!result) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-10">
        <BackToApp />
        <div className="text-center">
          <p className="text-sm text-muted">{t('rs.notFound')}</p>
          {reloadError && <p className="text-xs text-danger mt-2">{reloadError}</p>}
          <Button type="button" variant="secondary" onClick={reloadResult} disabled={reloading} className="mt-4">
            {reloading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            {t('mr.reload')}
          </Button>
        </div>
      </div>
    );
  }

  const writingPending = result.writing == null;
  const anyEstimated =
    (result.listening?.band != null && result.listening?.bandEstimated) || (result.reading?.band != null && result.reading?.bandEstimated);
  // §52.7 "skill-by-skill weaknesses" + "recommended next practice" — sof,
  // deterministik hisoblash (mockRecommendation.ts), yangi AI chaqiruvi YO'Q.
  // Writing hali baholanmagan bo'lsa ham (`writingPending`) ishlaydi — mavjud
  // 1-2 band bilan ham eng past ko'rsatkichni topadi, to'liq bo'lgach o'zi yangilanadi.
  const recommendation = recommendNextPractice({
    listening: result.listening?.band ?? null,
    reading: result.reading?.band ?? null,
    writing: result.writing?.band ?? null,
  });

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10">
      <BackToApp />
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('mr.overall')}</p>
        <p className="text-6xl font-bold text-brand-text mt-2 tabular-nums">
          {result.overall != null ? result.overall.toFixed(1) : '—'}
        </p>
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <SectionRow label="Listening" band={result.listening?.band} estimated={result.listening?.bandEstimated} />
        <SectionRow label="Reading" band={result.reading?.band} estimated={result.reading?.bandEstimated} />
        <SectionRow label="Writing" band={result.writing?.band} />
      </div>
      {anyEstimated && <p className="text-[11px] text-muted mt-2">{t('mr.estimatedNote')}.</p>}

      {/* §52.7 — "skill-by-skill weaknesses" + "recommended next practice".
          Boshqa (question-type/vocabulary weaknesses, readiness trend)
          analytics.ts infratuzilmasi kerak bo'lgani uchun ATAYLAB YO'Q. */}
      {recommendation && (
        <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-accent/5 border border-accent/20 rounded-lg text-xs text-ink">
          <Target size={15} className="flex-shrink-0 mt-0.5 text-accent" />
          {ts(recommendation.message)}
        </div>
      )}

      {writingPending && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">{t('mr.writingPending')}</p>
          {regradeError && <p className="text-xs text-danger mt-2">{regradeError}</p>}
          <Button type="button" variant="secondary" onClick={regradeWriting} disabled={regrading} className="mt-3">
            {regrading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            {t('rs.regrade')}
          </Button>
        </div>
      )}

      {reviewError && <p className="text-xs text-danger mt-3 text-center">{reviewError}</p>}
      <Button type="button" onClick={openReview} disabled={loadingReview || writingPending} className="mt-5 w-full">
        {loadingReview && <Loader2 size={14} className="animate-spin" />}
        {t('rs.review')}
      </Button>
      {writingPending && (
        <p className="text-[11px] text-muted mt-2 text-center">{t('mr.reviewLocked')}</p>
      )}

      <ResultAnalytics perQuestion={result.perQuestion} metric="overall" />
    </div>
  );
}
