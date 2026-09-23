'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Clock, Users, Flame, CalendarCheck, BookOpenCheck, CheckCircle2, XCircle, Info } from 'lucide-react';

// Recharts faqat shu sahifa ochilganda yuklanadi (ActivityChart.jsx'dagi kabi naqsh).
const ActivityTrendChart = dynamic(() => import('./ActivityTrendChart'), {
  ssr: false,
  loading: () => <div className="h-[240px] flex items-center justify-center text-muted text-sm">Grafik yuklanmoqda…</div>,
});

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface border border-border p-4 sm:p-5 shadow-card hover:border-accent/40 transition-colors duration-300">
      <div className="w-11 h-11 rounded-xl bg-accent-soft border border-accent/20 text-accent flex items-center justify-center mb-4">
        <Icon size={19} strokeWidth={2} />
      </div>
      <p className="font-luxury text-2xl sm:text-3xl text-ink tabular-nums leading-tight break-words">{value}</p>
      <p className="text-xs text-muted mt-2 tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-muted/70 mt-1">{sub}</p>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em]">{children}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function formatMinutes(min) {
  if (min < 60) return `${min} daq`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} soat ${m} daq` : `${h} soat`;
}

export default function AdminActivity() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Yuklashda xatolik'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={26} />
      </div>
    );
  }
  if (error || !stats) return <p className="text-sm text-muted text-center py-8">{error || 'Statistika yuklanmadi'}</p>;

  const accuracyPct = stats.totalReviews ? Math.round((stats.correctCount / stats.totalReviews) * 100) : 0;

  return (
    <div className="space-y-9">
      <div className="flex items-start gap-3 rounded-2xl bg-accent-soft border border-accent/20 p-4 text-xs text-ink/80 leading-relaxed">
        <Info size={16} className="text-accent shrink-0 mt-0.5" />
        <p>
          Saytda sahifa ko'rish/heartbeat kuzatuvi hozircha yo'q, shuning uchun "sarflangan vaqt" — so'z takrorlash va
          Do'stlar xabarlari vaqt tamg'alaridan chiqarilgan <b>taxminiy</b> ko'rsatkich (ketma-ket hodisalar orasi 20
          daqiqadan kam bo'lsa, bitta sessiya deb hisoblanadi). Aniq ekran vaqti emas — faollik izi.
        </p>
      </div>

      <div>
        <SectionLabel>Oxirgi {stats.windowDays} kun — umumiy</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Clock} label="Taxminiy jami vaqt" value={formatMinutes(stats.totalEstimatedMinutes)} />
          <StatCard icon={Users} label="Faol foydalanuvchi" value={stats.activeUsers} />
          <StatCard icon={CalendarCheck} label="Bugun faol" value={stats.activeToday} />
          <StatCard icon={Flame} label="Shu hafta faol" value={stats.activeThisWeek} />
          <StatCard icon={BookOpenCheck} label="So'z takrorlari" value={stats.totalReviews} />
        </div>
      </div>

      <div>
        <SectionLabel>To'g'ri / xato javoblar</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={CheckCircle2} label="To'g'ri javoblar" value={stats.correctCount} sub={`${accuracyPct}% aniqlik`} />
          <StatCard icon={XCircle} label="Xato javoblar" value={stats.wrongCount} />
          <StatCard icon={Users} label="Do'stlar xabarlari" value={stats.totalMessages} />
        </div>
      </div>

      <div>
        <SectionLabel>Kunlik faollik (oxirgi 14 kun)</SectionLabel>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card">
          <ActivityTrendChart data={stats.dailyTrend} />
        </div>
      </div>

      <div>
        <SectionLabel>Eng faol foydalanuvchilar (taxminiy vaqt bo'yicha)</SectionLabel>
        {stats.topUsers.length === 0 ? (
          <p className="text-sm text-muted">Hali faollik yo'q.</p>
        ) : (
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-border">
                  <th className="px-5 py-3 font-semibold">Foydalanuvchi</th>
                  <th className="px-5 py-3 font-semibold">Taxminiy vaqt</th>
                  <th className="px-5 py-3 font-semibold">Sessiyalar</th>
                  <th className="px-5 py-3 font-semibold">Hodisalar</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.map((u, i) => (
                  <tr key={u.userId} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-ink font-medium">
                      <span className="text-muted mr-2 tabular-nums">{i + 1}.</span>
                      {u.name}
                    </td>
                    <td className="px-5 py-3 tabular-nums">{formatMinutes(u.estimatedMinutes)}</td>
                    <td className="px-5 py-3 tabular-nums text-muted">{u.sessionCount}</td>
                    <td className="px-5 py-3 tabular-nums text-muted">{u.eventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
