'use client';

function DeltaBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  // Pasayish qizil emas — foydalanuvchini ayblamaslik uchun (spec §5.2 Blok 3).
  const color = pct >= 0 ? 'text-green-600' : 'text-slate-400';
  const arrow = pct >= 0 ? '↑' : '↓';
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {arrow} {Math.abs(pct)}%
    </span>
  );
}

function KpiCard({ label, value, sub, delta }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-2xl font-bold text-slate-800 font-mono tabular-nums leading-none">{value}</p>
        <DeltaBadge pct={delta} />
      </div>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function KpiRow({ today, deltas, totals }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Bugun takrorlangan"
        value={today.reviews}
        sub={`aniqlik: ${today.accuracyPct}%`}
        delta={deltas.reviewsVsYesterdayPct}
      />
      <KpiCard label="Bu hafta" value={totals.thisWeekReviews} delta={deltas.weekVsLastWeekPct} sub="o'tgan haftaga nisbatan" />
      <KpiCard label="Jami takrorlar" value={totals.reviews} />
      <KpiCard label="O'zlashtirilgan so'zlar" value={totals.mastered} sub={`${totals.words} tadan`} />
    </div>
  );
}
