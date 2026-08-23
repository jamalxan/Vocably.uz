'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuditLogTable({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-log', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader2 className="animate-spin text-slate-300" />;

  return (
    <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-[70vh] overflow-y-auto">
      {logs.map((l) => (
        <div key={l._id} className="px-3 py-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-700">
              @{l.actor?.username || '?'} — {l.action}
            </span>
            <span className="text-[10px] text-slate-300">{new Date(l.createdAt).toLocaleString('uz-UZ')}</span>
          </div>
          {l.targetType && (
            <p className="text-xs text-slate-400">
              {l.targetType}: <span className="font-mono">{l.targetId}</span>
            </p>
          )}
          {l.diff && <pre className="text-[10px] text-slate-400 mt-1 overflow-x-auto">{JSON.stringify(l.diff)}</pre>}
        </div>
      ))}
      {logs.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Yozuv yo'q</p>}
    </div>
  );
}
