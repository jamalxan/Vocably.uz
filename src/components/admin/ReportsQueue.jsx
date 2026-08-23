'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

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
      <div className="flex gap-2 mb-4">
        {['open', 'reviewed', 'actioned', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-slate-300" />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r._id} className="border border-slate-100 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">@{r.reporter?.username || '?'}</span> — {r.targetType}:{' '}
                  <span className="font-mono text-xs">{r.targetId}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
                <p className="text-[10px] text-slate-300 mt-1">{new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {r.status !== 'reviewed' && (
                  <button
                    onClick={() => updateStatus(r._id, 'reviewed')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs"
                  >
                    Ko'rildi
                  </button>
                )}
                {r.status !== 'actioned' && (
                  <button
                    onClick={() => updateStatus(r._id, 'actioned')}
                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs"
                  >
                    Chora ko'rildi
                  </button>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Report yo'q</p>}
        </div>
      )}
    </div>
  );
}
