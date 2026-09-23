'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Flag } from 'lucide-react';

// Qiymatlar (`value`) API/DB status maydoni bilan bir xil bo'lishi kerak — faqat ko'rinadigan
// yorliq (`label`) o'zbekchaga tarjima qilingan, admin panelning qolgan qismi bilan izchillik uchun.
const STATUS_FILTERS = [
  { value: 'open', label: 'Ochiq' },
  { value: 'reviewed', label: "Ko'rildi" },
  { value: 'actioned', label: 'Chora ko\'rildi' },
  { value: 'all', label: 'Barchasi' },
];

export default function ReportsQueue() {
  const [reports, setReports] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/reports?status=${statusFilter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reportlarni yuklab bo\'lmadi');
      setReports(data.reports || []);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      setError(err.message || 'Reportlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/admin/chat/reports?status=${statusFilter}&before=${encodeURIComponent(nextCursor)}`
      );
      const data = await res.json();
      setReports((prev) => [...prev, ...(data.reports || [])]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/chat/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Holatni o\'zgartirib bo\'lmadi');
        return;
      }
      await load();
    } catch {
      setError('Tarmoq xatosi — qayta urinib ko\'ring');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            aria-pressed={statusFilter === value}
            className={`px-4 py-2 min-h-11 md:min-h-0 rounded-xl text-xs font-medium tracking-wide transition-colors ${
              statusFilter === value ? 'bg-accent text-on-accent shadow-glow' : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-border bg-surface shadow-card p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-soft border border-accent/25 text-accent flex items-center justify-center flex-shrink-0">
                  <Flag size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-ink break-words">
                    <span className="font-semibold">@{r.reporter?.username || '?'}</span>
                    <span className="text-muted"> — {r.targetType}: </span>
                    <span className="font-mono text-xs text-muted break-all">{r.targetId}</span>
                  </p>
                  <p className="text-sm text-muted mt-1 break-words">{r.reason}</p>
                  <p className="text-[11px] text-muted/70 mt-1.5">{new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-shrink-0 sm:justify-end">
                {r.status !== 'reviewed' && (
                  <button
                    onClick={() => updateStatus(r._id, 'reviewed')}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 min-h-11 md:min-h-0 disabled:opacity-50 bg-primary-soft border border-primary/15 text-ink rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors"
                  >
                    Ko'rildi
                  </button>
                )}
                {r.status !== 'actioned' && (
                  <button
                    onClick={() => updateStatus(r._id, 'actioned')}
                    disabled={busyId === r._id}
                    className="px-3 py-1.5 min-h-11 md:min-h-0 disabled:opacity-50 bg-accent-soft border border-accent/25 text-accent rounded-lg text-xs font-medium hover:bg-accent/15 transition-colors"
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
                className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
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
