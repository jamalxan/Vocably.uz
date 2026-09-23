'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import HeroCard from './HeroCard';
import StreakCard from './StreakCard';
import ExamPrepCard from './ExamPrepCard';
import KpiRow from './KpiRow';
import MasteryBreakdown from './MasteryBreakdown';
import LeechList from './LeechList';
import ForecastRow from './ForecastRow';
import CategoryProgress from './CategoryProgress';

// Recharts (ActivityChart) faqat shu sahifa ochilganda yuklanadi (spec §11.3).
const ActivityChart = dynamic(() => import('./ActivityChart'), {
  ssr: false,
  // Balandlik haqiqiy karta bilan bir xil (p-5 + tugmalar qatori + mb-4 + 200px grafik) — siljish bo'lmasin.
  loading: () => <div className="h-[298px] md:h-[286px] bg-surface rounded-2xl border border-border animate-pulse" />,
});

// spec §5.4: dashboard bitta so'rov bilan ochiladi — barcha bloklar shu bitta javobdan o'qiydi.
export default function DashboardHome() {
  const router = useRouter();
  const { isAuthed, displayName, setActiveCatIndex, startPracticeQueue } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard', { signal });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (!signal?.aborted) setData(json);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Token almashsa/unmount bo'lsa eski so'rov bekor qilinadi — eski javob yangisini bosmasin.
  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return undefined;
    }
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [isAuthed, load]);

  const goToReview = () => {
    router.push('/app/lugat/takrorlash');
  };

  const openCategory = (idx) => {
    setActiveCatIndex(idx);
    router.push('/app/lugat/kartochka');
  };

  const practiceLeeches = (leeches) => {
    startPracticeQueue(leeches.map((l) => l.wordId));
    goToReview();
  };

  if (loading) {
    // Haqiqiy tartibni takrorlaydigan skelet — kontent kelganda sahifa sakramasin.
    return (
      <div className="space-y-5" role="status" aria-live="polite">
        <span className="sr-only">Yuklanmoqda…</span>
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-[176px] rounded-2xl" />
          <Skeleton className="h-[176px] rounded-2xl" />
        </div>
        <Skeleton className="h-[104px] rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[298px] md:h-[286px] rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-muted mb-3">Statistikani yuklab bo'lmadi.</p>
        <Button onClick={() => load()}>Qayta urinish</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5 max-w-none">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-ink font-luxury">
          Xush kelibsiz, {displayName}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <HeroCard
            due={data.today.due}
            newAvailable={data.today.newAvailable}
            reviews={data.today.reviews}
            goal={data.today.goal}
            goalPct={data.today.goalPct}
            onStart={goToReview}
          />
        </div>
        {/* activity7 — xuddi shu 7 kunning sanalari (API'da bitta last7 massividan). */}
        <StreakCard
          current={data.streak.current}
          longest={data.streak.longest}
          last7Days={data.streak.last7Days}
          dates={data.activity7?.map((d) => d.date)}
        />
      </div>

      <ExamPrepCard examPrep={data.examPrep} />

      <KpiRow today={data.today} deltas={data.deltas} totals={data.totals} />

      <ActivityChart activity7={data.activity7} activity30={data.activity30} />

      {/* Qiynalayotgan so'z bo'lmasa LeechList chiqmaydi — o'ng ustun bo'sh qolmasin. */}
      <div className={`grid grid-cols-1 gap-5 ${data.leeches?.length > 0 ? 'lg:grid-cols-2' : ''}`}>
        <MasteryBreakdown mastery={data.mastery} />
        <LeechList leeches={data.leeches} onPractice={practiceLeeches} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ForecastRow forecast={data.forecast} />
        <CategoryProgress byCategory={data.byCategory} onOpenCategory={openCategory} />
      </div>
    </div>
  );
}
