'use client';
import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, Ban, Crown, MessagesSquare, Mail, Flag, TrendingUp } from 'lucide-react';

const TYPE_LABELS = { text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli', file: 'Fayl', sticker: 'Stiker' };

function StatCard({ icon: Icon, label, value, tone = 'racing' }) {
  const tones = {
    racing: 'from-racing-800/50 to-racing-950/40 border-racing-700/40 text-racing-400 shadow-admin-glow',
    gold: 'from-gold-800/40 to-gold-950/30 border-gold-600/40 text-gold-400 shadow-admin-gold-glow',
    neutral: 'from-cherry-800/40 to-cherry-950/30 border-cherry-700/40 text-alabaster-400 shadow-admin-card',
  };
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cherry-900/60 to-coffee-800/60 border border-cherry-800/60 p-5 shadow-admin-card group hover:border-racing-700/50 transition-colors duration-300">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${tones[tone]} opacity-20 blur-2xl group-hover:opacity-35 transition-opacity`} />
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tones[tone]} border flex items-center justify-center mb-4`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <p className="font-luxury text-3xl text-alabaster-50 tabular-nums leading-none">{value}</p>
      <p className="text-xs text-alabaster-500 mt-2 tracking-wide">{label}</p>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.2em]">{children}</span>
      <span className="flex-1 h-px bg-gradient-to-r from-cherry-700/60 to-transparent" />
    </div>
  );
}

export default function AdminStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-racing-500" size={26} />
      </div>
    );
  }
  if (!stats) return <p className="text-sm text-alabaster-500 text-center py-8">Statistika yuklanmadi</p>;

  return (
    <div className="space-y-9">
      <div>
        <SectionLabel>Foydalanuvchilar</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Jami foydalanuvchi" value={stats.totalUsers} tone="neutral" />
          <StatCard icon={ShieldCheck} label="Do'stlar ruxsati bor" value={stats.chatAccessUsers} tone="gold" />
          <StatCard icon={Ban} label="Bloklangan (chat)" value={stats.bannedUsers} tone="racing" />
          <StatCard icon={Crown} label="Adminlar" value={stats.adminCount} tone="gold" />
          <StatCard icon={TrendingUp} label="Bugun ro'yxatdan o'tgan" value={stats.newToday} tone="neutral" />
        </div>
      </div>

      <div>
        <SectionLabel>Do'stlar bo'limi faolligi</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={MessagesSquare} label="Jami suhbatlar" value={stats.totalConversations} tone="neutral" />
          <StatCard icon={Mail} label="Jami xabarlar" value={stats.totalMessages} tone="gold" />
          <StatCard icon={Flag} label="Ko'rilmagan reportlar" value={stats.openReports} tone="racing" />
        </div>
      </div>

      {Object.keys(stats.typeBreakdown || {}).length > 0 && (
        <div>
          <SectionLabel>Xabar turlari bo'yicha</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <span
                key={type}
                className="px-4 py-2 bg-cherry-900/50 border border-cherry-800/60 rounded-xl text-xs text-alabaster-300"
              >
                {TYPE_LABELS[type] || type}: <span className="font-bold text-alabaster-50">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
