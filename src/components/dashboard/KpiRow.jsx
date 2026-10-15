'use client';
import { CalendarCheck, CalendarRange, Repeat, CheckCircle2 } from 'lucide-react';
import StatTile from '@/components/ui/StatTile';
import { useT } from '@/context/LocaleContext';

// To'rtta asosiy ko'rsatkich — umumiy StatTile (components/ui/StatTile.jsx) orqali,
// profil va o'yinlar markazidagi raqamlar bilan bir xil ko'rinishda.
// Pasayish jazolovchi rangda emas (spec §5.2 Blok 3) — DeltaChip buni o'zi hal qiladi.
export default function KpiRow({ today, deltas, totals }) {
  const { t } = useT();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-tabular>
      <StatTile
        icon={CalendarCheck}
        label={t('dash.kpiToday')}
        value={today.reviews}
        sub={t('dash.kpiAccuracy', { n: today.accuracyPct })}
        delta={deltas.reviewsVsYesterdayPct}
      />
      <StatTile icon={CalendarRange} label={t('dash.kpiWeek')} value={totals.thisWeekReviews} delta={deltas.weekVsLastWeekPct} sub={t('dash.kpiWeekSub')} />
      <StatTile icon={Repeat} label={t('dash.kpiTotal')} value={totals.reviews} />
      <StatTile icon={CheckCircle2} label={t('dash.kpiMastered')} value={totals.mastered} sub={t('dash.kpiOf', { n: totals.words })} />
    </div>
  );
}
