'use client';
import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, Ban, Crown, MessagesSquare, Mail, Flag, TrendingUp } from 'lucide-react';
import StatTile from '@/components/ui/StatTile';

const TYPE_LABELS = { text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli', file: 'Fayl', sticker: 'Stiker' };

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em]">{children}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('uz-UZ') : n ?? '—');

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/stats')
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.error) throw new Error(data?.error || 'Statistika yuklanmadi');
        return data;
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Statistika yuklanmadi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={26} />
      </div>
    );
  }
  if (error || !stats) return <p className="text-sm text-muted text-center py-8">{error || 'Statistika yuklanmadi'}</p>;

  const breakdown = Object.entries(stats.typeBreakdown || {});
  const breakdownTotal = breakdown.reduce((s, [, n]) => s + (n || 0), 0);

  return (
    <div className="space-y-9" data-tabular>
      <div>
        <SectionLabel>Foydalanuvchilar</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatTile icon={Users} label="Jami foydalanuvchi" value={fmt(stats.totalUsers)} />
          <StatTile icon={ShieldCheck} label="Do'stlar ruxsati bor" value={fmt(stats.chatAccessUsers)} />
          <StatTile icon={Ban} label="Bloklangan (chat)" value={fmt(stats.bannedUsers)} />
          <StatTile icon={Crown} label="Adminlar" value={fmt(stats.adminCount)} />
          <StatTile icon={TrendingUp} label="Bugun ro'yxatdan o'tgan" value={fmt(stats.newToday)} />
        </div>
      </div>

      <div>
        <SectionLabel>Do'stlar bo'limi faolligi</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatTile icon={MessagesSquare} label="Jami suhbatlar" value={fmt(stats.totalConversations)} />
          <StatTile icon={Mail} label="Jami xabarlar" value={fmt(stats.totalMessages)} />
          <StatTile
            icon={Flag}
            label="Ko'rilmagan reportlar"
            value={fmt(stats.openReports)}
            sub={stats.openReports > 0 ? 'navbatda' : 'navbat bo\'sh'}
            className={stats.openReports > 0 ? 'border-warning/40' : ''}
          />
        </div>
      </div>

      {breakdown.length > 0 && (
        <div>
          <SectionLabel>Xabar turlari bo'yicha</SectionLabel>
          <div className="rounded-2xl bg-surface border border-border shadow-card p-4 sm:p-5">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-bg-sunken/70 gap-px mb-4" aria-hidden="true">
              {breakdown.map(([type, count], i) => (
                <div
                  key={type}
                  className="bg-accent first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${breakdownTotal ? (count / breakdownTotal) * 100 : 0}%`, opacity: 1 - i * 0.13 }}
                  title={`${TYPE_LABELS[type] || type}: ${count}`}
                />
              ))}
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
              {breakdown.map(([type, count], i) => (
                <li key={type} className="flex items-center gap-2 text-xs text-muted min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" style={{ opacity: 1 - i * 0.13 }} aria-hidden="true" />
                  <span className="truncate">{TYPE_LABELS[type] || type}</span>
                  <span className="ml-auto font-semibold text-ink tabular-nums">{fmt(count)}</span>
                  <span className="w-9 text-right tabular-nums text-[11px]">{breakdownTotal ? Math.round((count / breakdownTotal) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
