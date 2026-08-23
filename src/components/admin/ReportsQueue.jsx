'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Flag } from 'lucide-react';

const STATUS_STYLE = {
  open: 'bg-racing-900/40 border-racing-700/50 text-racing-400',
  reviewed: 'bg-gold-900/20 border-gold-700/40 text-gold-400',
  actioned: 'bg-cherry-900/50 border-cherry-700/50 text-alabaster-400',
};

export default function ReportsQueue({ token }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/chat/reports?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReports(data.reports || []);
    setLoading(false);
  }, [token, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/chat/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['open', 'reviewed', 'actioned', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-colors ${
              statusFilter === s
                ? 'bg-gradient-to-r from-racing-700 to-racing-600 text-alabaster-50 shadow-admin-glow'
                : 'bg-cherry-900/50 border border-cherry-800/60 text-alabaster-500 hover:text-alabaster-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-racing-500" size={22} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-cherry-800/60 bg-gradient-to-br from-cherry-900/50 to-coffee-900/50 shadow-admin-card p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${STATUS_STYLE[r.status] || STATUS_STYLE.actioned}`}>
                  <Flag size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-alabaster-100">
                    <span className="font-semibold">@{r.reporter?.username || '?'}</span>
                    <span className="text-alabaster-600"> — {r.targetType}: </span>
                    <span className="font-mono text-xs text-alabaster-500">{r.targetId}</span>
                  </p>
                  <p className="text-sm text-alabaster-400 mt-1">{r.reason}</p>
                  <p className="text-[11px] text-alabaster-700 mt-1.5">{new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {r.status !== 'reviewed' && (
                  <button
                    onClick={() => updateStatus(r._id, 'reviewed')}
                    className="px-3 py-1.5 bg-gold-500/10 border border-gold-600/40 text-gold-400 rounded-lg text-xs font-medium hover:bg-gold-500/20 transition-colors"
                  >
                    Ko'rildi
                  </button>
                )}
                {r.status !== 'actioned' && (
                  <button
                    onClick={() => updateStatus(r._id, 'actioned')}
                    className="px-3 py-1.5 bg-racing-900/40 border border-racing-700/50 text-racing-400 rounded-lg text-xs font-medium hover:bg-racing-900/60 transition-colors"
                  >
                    Chora ko'rildi
                  </button>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center text-sm text-alabaster-600 py-10">Report yo'q</p>}
        </div>
      )}
    </div>
  );
}
