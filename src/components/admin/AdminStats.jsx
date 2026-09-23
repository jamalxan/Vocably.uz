'use client';
import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, Ban, Crown, MessagesSquare, Mail, Flag, TrendingUp } from 'lucide-react';

const TYPE_LABELS = { text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli', file: 'Fayl', sticker: 'Stiker' };

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface border border-border p-4 sm:p-5 shadow-card hover:border-accent/40 transition-colors duration-300">
      <div className="w-11 h-11 rounded-xl bg-accent-soft border border-accent/20 text-accent flex items-center justify-center mb-4">
        <Icon size={19} strokeWidth={2} />
      </div>
      <p className="font-luxury text-2xl sm:text-3xl text-ink tabular-nums leading-tight break-words">{value}</p>
      <p className="text-xs text-muted mt-2 tracking-wide">{label}</p>
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

export default function AdminStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
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
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={26} />
      </div>
    );
  }
  if (error || !stats) return <p className="text-sm text-muted text-center py-8">{error || 'Statistika yuklanmadi'}</p>;

  return (
    <div className="space-y-9">
      <div>
        <SectionLabel>Foydalanuvchilar</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Jami foydalanuvchi" value={stats.totalUsers} />
          <StatCard icon={ShieldCheck} label="Do'stlar ruxsati bor" value={stats.chatAccessUsers} />
          <StatCard icon={Ban} label="Bloklangan (chat)" value={stats.bannedUsers} />
          <StatCard icon={Crown} label="Adminlar" value={stats.adminCount} />
          <StatCard icon={TrendingUp} label="Bugun ro'yxatdan o'tgan" value={stats.newToday} />
        </div>
      </div>

      <div>
        <SectionLabel>Do'stlar bo'limi faolligi</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={MessagesSquare} label="Jami suhbatlar" value={stats.totalConversations} />
          <StatCard icon={Mail} label="Jami xabarlar" value={stats.totalMessages} />
          <StatCard icon={Flag} label="Ko'rilmagan reportlar" value={stats.openReports} />
        </div>
      </div>

      {Object.keys(stats.typeBreakdown || {}).length > 0 && (
        <div>
          <SectionLabel>Xabar turlari bo'yicha</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <span key={type} className="px-4 py-2 bg-surface border border-border rounded-xl text-xs text-muted">
                {TYPE_LABELS[type] || type}: <span className="font-bold text-ink">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
