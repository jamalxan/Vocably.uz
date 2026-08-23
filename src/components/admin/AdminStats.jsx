'use client';
import { useEffect, useState } from 'react';
import { Loader2, Users, ShieldCheck, Ban, Crown, MessagesSquare, Mail, Flag, TrendingUp } from 'lucide-react';

const TYPE_LABELS = { text: 'Matn', image: 'Rasm', video: 'Video', voice: 'Ovozli', file: 'Fayl', sticker: 'Stiker' };

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-800 tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
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
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }
  if (!stats) return <p className="text-sm text-slate-400 text-center py-8">Statistika yuklanmadi</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Foydalanuvchilar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Users} label="Jami foydalanuvchi" value={stats.totalUsers} accent="bg-indigo-50 text-indigo-600" />
          <StatCard icon={ShieldCheck} label="Do'stlar ruxsati bor" value={stats.chatAccessUsers} accent="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Ban} label="Bloklangan (chat)" value={stats.bannedUsers} accent="bg-red-50 text-red-600" />
          <StatCard icon={Crown} label="Adminlar" value={stats.adminCount} accent="bg-amber-50 text-amber-600" />
          <StatCard icon={TrendingUp} label="Bugun ro'yxatdan o'tgan" value={stats.newToday} accent="bg-violet-50 text-violet-600" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Do'stlar bo'limi faolligi</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={MessagesSquare} label="Jami suhbatlar" value={stats.totalConversations} accent="bg-sky-50 text-sky-600" />
          <StatCard icon={Mail} label="Jami xabarlar" value={stats.totalMessages} accent="bg-teal-50 text-teal-600" />
          <StatCard icon={Flag} label="Ko'rilmagan reportlar" value={stats.openReports} accent="bg-rose-50 text-rose-600" />
        </div>
      </div>

      {Object.keys(stats.typeBreakdown || {}).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Xabar turlari bo'yicha</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <span key={type} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600">
                {TYPE_LABELS[type] || type}: <span className="font-semibold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
