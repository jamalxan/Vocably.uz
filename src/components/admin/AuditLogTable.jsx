'use client';
import { useEffect, useState } from 'react';
import { Loader2, ScrollText } from 'lucide-react';

export default function AuditLogTable({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-log', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-racing-500" size={22} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cherry-800/60 bg-gradient-to-b from-cherry-950/40 to-coffee-900/60 shadow-admin-card divide-y divide-cherry-900/60 overflow-hidden max-h-[75vh] overflow-y-auto">
      {logs.map((l) => (
        <div key={l._id} className="px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-alabaster-100 flex items-center gap-2">
              <ScrollText size={13} className="text-gold-400 flex-shrink-0" />
              @{l.actor?.username || '?'} <span className="text-alabaster-600 font-normal">— {l.action}</span>
            </span>
            <span className="text-[11px] text-alabaster-700 flex-shrink-0">{new Date(l.createdAt).toLocaleString('uz-UZ')}</span>
          </div>
          {l.targetType && (
            <p className="text-xs text-alabaster-600 mt-1 ml-5">
              {l.targetType}: <span className="font-mono">{l.targetId}</span>
            </p>
          )}
          {l.diff && (
            <pre className="text-[10px] text-alabaster-700 mt-1.5 ml-5 overflow-x-auto">{JSON.stringify(l.diff)}</pre>
          )}
        </div>
      ))}
      {logs.length === 0 && <p className="text-center text-sm text-alabaster-600 py-10">Yozuv yo'q</p>}
    </div>
  );
}
