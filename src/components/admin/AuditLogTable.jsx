'use client';
import { useCallback, useEffect, useState } from 'react';
import { Bot, Loader2, ScrollText } from 'lucide-react';
import { formatAuditDiff } from '@/lib/auditDiffFormat';

// U-04 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md P2) — "Admin audit log'da xom JSON".
// `formatAuditDiff` tanigan shakllar uchun odam o'qiydigan qator(lar) qaytaradi;
// tanimagan/ichma-ich shakllar uchun `null` — bunda chiroyli formatlangan
// (indent bilan) JSON'ga tushamiz, avvalgi xom bitta-qatorli JSON o'rniga.
function DiffDisplay({ diff }) {
  const lines = formatAuditDiff(diff);
  if (lines === null) {
    return (
      <pre className="text-[11px] text-muted/80 mt-1.5 ml-5 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(diff, null, 2)}
      </pre>
    );
  }
  if (lines.length === 0) return null;
  return (
    <ul className="text-[11px] text-muted/80 mt-1.5 ml-5 space-y-0.5 list-disc list-inside">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

const ACTORS = [
  { value: 'admin', label: 'Admin' },
  { value: 'ai_agent', label: 'AI agent' },
  { value: 'all', label: 'Hammasi' },
];

// docs/ai-content-agent-tz-avtopilot.md §7.4 — "Aktyor: Hammasi / Admin /
// AI agent" filtri.
export default function AuditLogTable() {
  const [actor, setActor] = useState('admin');
  const [logs, setLogs] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback((actorValue) => {
    setLoading(true);
    fetch(`/api/admin/audit-log?actor=${actorValue}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setNextCursor(d.nextCursor || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(actor);
  }, [load, actor]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/audit-log?actor=${actor}&before=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      setLogs((prev) => [...prev, ...(data.logs || [])]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-bg border border-border rounded-xl w-fit">
        {ACTORS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => setActor(a.value)}
            aria-pressed={actor === a.value}
            className={`px-3 py-1.5 min-h-11 md:min-h-0 rounded-lg text-xs font-semibold transition-colors ${
              actor === a.value ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden max-h-[75dvh] overflow-y-auto">
          {logs.map((l) => (
            <div key={l._id} className="px-4 sm:px-5 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="min-w-0 text-sm font-medium text-ink flex flex-wrap items-center gap-2 [overflow-wrap:anywhere]">
                  {l.isAgent ? <Bot size={13} className="text-accent flex-shrink-0" /> : <ScrollText size={13} className="text-accent flex-shrink-0" />}
                  {l.isAgent ? (
                    <span className="px-1.5 py-0.5 rounded bg-accent-soft text-accent text-[11px] font-bold">AI agent</span>
                  ) : (
                    <>@{l.actor?.username || '?'}</>
                  )}
                  <span className="text-muted font-normal">— {l.action}</span>
                </span>
                <span className="text-[11px] text-muted/70 flex-shrink-0">{new Date(l.createdAt).toLocaleString('uz-UZ')}</span>
              </div>
              {l.targetType && (
                <p className="text-xs text-muted mt-1 ml-5 break-all">
                  {l.targetType}: <span className="font-mono">{l.targetId}</span>
                </p>
              )}
              {l.diff && <DiffDisplay diff={l.diff} />}
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-sm text-muted py-10">Yozuv yo'q</p>}
          {nextCursor && (
            <div className="flex justify-center py-3">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-bg border border-border rounded-lg text-xs font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
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
