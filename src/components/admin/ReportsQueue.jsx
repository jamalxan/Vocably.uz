'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Flag } from 'lucide-react';

export default function ReportsQueue({ token }) {
  const [reports, setReports] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/chat/reports?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReports(data.reports || []);
    setNextCursor(data.nextCursor || null);
    setLoading(false);
  }, [token, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/admin/chat/reports?status=${statusFilter}&before=${encodeURIComponent(nextCursor)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReports((prev) => [...prev, ...(data.reports || [])]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

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
              statusFilter === s ? 'bg-accent text-on-accent shadow-glow' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-accent" size={22} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-border bg-surface shadow-card p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-soft border border-accent/25 text-accent flex items-center justify-center flex-shrink-0">
                  <Flag size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-primary">
                    <span className="font-semibold">@{r.reporter?.username || '?'}</span>
                    <span className="text-muted"> — {r.targetType}: </span>
                    <span className="font-mono text-xs text-muted">{r.targetId}</span>
                  </p>
                  <p className="text-sm text-muted mt-1">{r.reason}</p>
                  <p className="text-[11px] text-muted/70 mt-1.5">{new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {r.status !== 'reviewed' && (
                  <button
                    onClick={() => updateStatus(r._id, 'reviewed')}
                    className="px-3 py-1.5 bg-primary-soft border border-primary/15 text-primary rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors"
                  >
                    Ko'rildi
                  </button>
                )}
                {r.status !== 'actioned' && (
                  <button
                    onClick={() => updateStatus(r._id, 'actioned')}
                    className="px-3 py-1.5 bg-accent-soft border border-accent/25 text-accent rounded-lg text-xs font-medium hover:bg-accent/15 transition-colors"
                  >
                    Chora ko'rildi
                  </button>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center text-sm text-muted py-10">Report yo'q</p>}
          {nextCursor && (
            <div className="flex justify-center py-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore && <Loader2 size={13} className="animate-spin" />} Yana yuklash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
