'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Check, X, Pencil, AlertTriangle, AlertCircle, Inbox } from 'lucide-react';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11.3 — "Tekshiruv navbati
// — eng muhim ekran." Ikki panelli (sahifa dalili + tahrirlanadigan forma),
// J/K/A/E klaviatura yorliqlari, blocker/warning hisoblagichi. Worker
// ULANMAGANI uchun bu ro'yxat hozircha bo'sh turadi — lekin butun oqim
// (ro'yxat, tanlash, qabul/tuzatish/rad etish, ommaviy qabul qilish)
// haqiqiy ma'lumot bilan sinaladi worker birinchi `ReviewItem`ni
// yozganda, hech qanday kod o'zgarishisiz.
const REASON_LABEL = {
  low_confidence: 'Ishonch past',
  validation_failed: 'Validatsiya xatosi',
  qa_disagreement: 'QA kelishmovchiligi',
  missing_answer: 'Javob yo\'q',
  image_unmatched: 'Rasm bog\'lanmagan',
  word_limit_violation: 'So\'z limiti buzilgan',
  // N-10 — manually-created `ExamTest` docs (no `ContentBook`), synced from
  // `contentValidator.ts#validateTest` via `src/lib/exam/reviewSync.ts`.
  content_validator_warning: 'Validator ogohlantirishi',
};

export default function ReviewQueuePanel() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ blocker: 0, warning: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState('open');
  const [actionError, setActionError] = useState('');
  const detailRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/review?status=${statusFilter}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
        setCounts(data.counts || { blocker: 0, warning: 0 });
        setSelectedId((prev) => (prev && data.items.some((i) => i.id === prev) ? prev : data.items[0]?.id || null));
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((i) => i.id === selectedId) || null;
  const selectedIndex = items.findIndex((i) => i.id === selectedId);

  const resolve = useCallback(
    async (action) => {
      if (!selected || busy) return;
      setBusy(true);
      setActionError('');
      try {
        const res = await fetch(`/api/admin/review/${selected.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setActionError(data.error || "Amalni bajarib bo'lmadi");
          return;
        }
        await load();
      } catch {
        setActionError("Tarmoq xatosi — qayta urinib ko'ring");
      } finally {
        setBusy(false);
      }
    },
    [selected, busy, load]
  );

  // TZ §11.3 — "Klaviatura: J/K — keyingi/oldingi element, A — qabul
  // qilish, E — tahrirlash." E hozircha oddiy `accept`ka mos (to'liq inline
  // tahrirlash formasi — worker haqiqiy `proposed` maydonlarini yozganda
  // ma'noga ega bo'ladi).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'j' || e.key === 'J') {
        const next = items[selectedIndex + 1];
        if (next) setSelectedId(next.id);
      } else if (e.key === 'k' || e.key === 'K') {
        const prev = items[selectedIndex - 1];
        if (prev) setSelectedId(prev.id);
      } else if (e.key === 'a' || e.key === 'A') {
        resolve('accept');
      } else if (e.key === 'e' || e.key === 'E') {
        resolve('fix');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, selectedIndex, resolve]);

  // Mobil/planshetda ro'yxat tepada — tanlanganda detal ko'rinadigan joyga suriladi.
  const selectItem = (id) => {
    setSelectedId(id);
    setActionError('');
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 1023px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink font-display">Tekshiruv navbati</h2>
          <p className="text-sm text-muted mt-1">
            AI ishonchi past yoki validatsiya xatosi bo'lgan savol guruhlari. Klaviatura: J/K — o'tish, A — qabul, E — tuzatish.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold flex-shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-danger-soft text-danger">
            <AlertCircle size={13} /> {counts.blocker} blocker
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-warning-soft text-warning">
            <AlertTriangle size={13} /> {counts.warning} warning
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {['open', 'fixed', 'accepted', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
            className={`px-3 py-1.5 min-h-11 md:min-h-0 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === s ? 'bg-accent text-on-accent' : 'text-muted hover:bg-bg'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Inbox size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm text-muted">Bu holatda element yo'q.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <div className="space-y-1.5 max-h-[40dvh] lg:max-h-[600px] overflow-y-auto overscroll-contain">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => selectItem(item.id)}
                aria-current={item.id === selectedId ? 'true' : undefined}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  item.id === selectedId ? 'border-accent bg-accent-soft/40' : 'border-border bg-surface hover:border-accent/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.severity === 'blocker' ? 'bg-danger' : 'bg-warning'}`} />
                  <span className="sr-only">{item.severity}:</span>
                  <span className="text-xs font-semibold text-ink truncate">{REASON_LABEL[item.reason] || item.reason}</span>
                </div>
                <p className="text-[11px] text-muted mt-0.5 truncate">
                  {item.bookTitle && `${item.bookTitle} · `}
                  {item.target?.sectionKey}
                  {item.target?.questionNumber ? ` · Q${item.target.questionNumber}` : ''}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div ref={detailRef} className="min-w-0 scroll-mt-24 bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${selected.severity === 'blocker' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                    {selected.severity}
                  </span>
                  <span className="text-sm font-semibold text-ink">{REASON_LABEL[selected.reason] || selected.reason}</span>
                </div>
                {selected.confidence != null && <span className="text-xs text-muted">ishonch: {(selected.confidence * 100).toFixed(0)}%</span>}
              </div>

              <div className="text-xs text-muted space-y-0.5">
                <p>{selected.bookTitle}</p>
                <p>
                  {selected.target?.sectionKey}
                  {selected.target?.partIndex != null ? `, part ${selected.target.partIndex}` : ''}
                  {selected.target?.questionNumber != null ? `, savol ${selected.target.questionNumber}` : ''}
                  {selected.evidence?.pageNumber ? `, sahifa ${selected.evidence.pageNumber}` : ''}
                </p>
              </div>

              {selected.evidence?.pageImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selected.evidence.pageImageUrl} alt="Sahifa dalili" className="max-w-full rounded-lg border border-border" />
              ) : selected.evidence?.rawText ? (
                <p className="px-3 py-2.5 bg-bg rounded-lg text-sm text-ink whitespace-pre-wrap">{selected.evidence.rawText}</p>
              ) : null}

              {selected.proposed && (
                <div className="px-3 py-2.5 bg-bg rounded-lg text-xs text-muted">
                  <p className="font-semibold text-ink mb-1">AI taklifi</p>
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(selected.proposed, null, 2)}</pre>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => resolve('accept')}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 min-h-11 md:min-h-0 bg-success-soft border border-success/30 text-success hover:bg-success/20 disabled:opacity-40 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Check size={15} /> Qabul qilish
                </button>
                <button
                  onClick={() => resolve('fix')}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 min-h-11 md:min-h-0 bg-bg hover:bg-border disabled:opacity-40 text-ink rounded-lg text-sm font-semibold transition-colors"
                >
                  <Pencil size={15} /> Tuzatildi deb belgilash
                </button>
                <button
                  onClick={() => resolve('reject')}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 min-h-11 md:min-h-0 text-danger hover:bg-danger-soft disabled:opacity-40 rounded-lg text-sm font-semibold transition-colors"
                >
                  <X size={15} /> Rad etish
                </button>
              </div>
              {actionError && (
                <p role="alert" className="text-sm text-danger">
                  {actionError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
