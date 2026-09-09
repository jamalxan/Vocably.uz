'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import HeroCard from './HeroCard';
import StreakCard from './StreakCard';
import KpiRow from './KpiRow';
import MasteryBreakdown from './MasteryBreakdown';
import LeechList from './LeechList';
import ForecastRow from './ForecastRow';
import CategoryProgress from './CategoryProgress';

// Recharts (ActivityChart) faqat shu sahifa ochilganda yuklanadi (spec §11.3).
const ActivityChart = dynamic(() => import('./ActivityChart'), {
  ssr: false,
  loading: () => <div className="h-[268px] bg-surface rounded-2xl border border-border animate-pulse" />,
});

// spec §5.4: dashboard bitta so'rov bilan ochiladi — barcha bloklar shu bitta javobdan o'qiydi.
export default function DashboardHome() {
  const router = useRouter();
  const { token, displayName, setActiveCatIndex, startPracticeQueue } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

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
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-muted mb-3">Statistikani yuklab bo'lmadi.</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-semibold transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5 max-w-none">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary font-luxury">
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
        <StreakCard current={data.streak.current} longest={data.streak.longest} last7Days={data.streak.last7Days} />
      </div>

      <KpiRow today={data.today} deltas={data.deltas} totals={data.totals} />

      <ActivityChart activity7={data.activity7} activity30={data.activity30} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
