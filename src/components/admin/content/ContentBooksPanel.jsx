'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, BookOpen, Trash2, Bot, Settings2 } from 'lucide-react';

const LEVEL_LABEL = { manual: "Qo'lda", assisted: 'Yordamchi', autopilot: "To'liq avtopilot" };

// docs/ai-content-agent-tz-avtopilot.md §7.2 — Kontent studiyasi bosh
// sahifasiga status paneli. `agent_actions` hali bo'sh bo'lishi mumkin
// (orchestrator qurilmagan) — shunda "hali faoliyat yo'q" ko'rsatiladi,
// panel o'zi baribir joriy avtomatlashtirish darajasini ko'rsatadi.
function AutopilotStatusBanner() {
  const [policy, setPolicy] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/admin/automation/policy').then((r) => r.json()),
      fetch('/api/admin/agent-actions/summary').then((r) => r.json()),
    ])
      .then(([p, s]) => {
        if (cancelled) return;
        setPolicy(p.global || null);
        setSummary(s || null);
      })
      // Banner ixtiyoriy — xatoda shunchaki ko'rsatilmaydi.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!policy) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface flex-wrap">
      <Bot size={16} className={policy.paused ? 'text-danger' : 'text-accent'} />
      <span className="text-sm font-semibold text-ink">
        Avtopilot: {policy.paused ? "TO'XTATILGAN" : 'YOQILGAN'} ({LEVEL_LABEL[policy.level] || policy.level})
      </span>
      <span className="text-xs text-muted">
        {summary && summary.totalActions > 0
          ? `Bugun: ${summary.totalActions} ta AI harakat, $${summary.costUsdToday.toFixed(3)}`
          : 'Bugun hali AI harakati yo‘q'}
      </span>
      <Link href="/admin/content/ai" className="ml-auto flex items-center gap-1.5 min-h-11 md:min-h-0 text-xs font-semibold text-accent hover:underline flex-shrink-0">
        <Settings2 size={13} /> Boshqarish
      </Link>
    </div>
  );
}

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11 — "Kutubxona" ekrani.
// M1 doirasida: ro'yxat + o'chirish + "Yangi kitob"ga o'tish. Tekshiruv
// navbati/media/mock konstruktor/AI sozlamalari ekranlari — keyingi
// bosqichlar (worker ulangandan keyin haqiqiy ma'no kasb etadi).
const STATUS_LABEL = {
  uploaded: { label: 'Yuklandi', className: 'text-muted bg-bg' },
  processing: { label: 'Navbatda', className: 'text-warning bg-warning-soft' },
  needs_review: { label: 'Tekshiruv kerak', className: 'text-warning bg-warning-soft' },
  ready: { label: 'Tayyor', className: 'text-success bg-success-soft' },
  published: { label: 'Nashr qilingan', className: 'text-success bg-success-soft' },
  failed: { label: 'Xatolik', className: 'text-danger bg-danger-soft' },
};

// UX-02 — `book.module`/`book.licence` (src/lib/models.js ContentBookSchema)
// ilgari xom enum qiymati bilan ko'rsatilardi. `licence` ExamTestsPanel'dagi
// RIGHTS_SOURCE_LABEL bilan bir xil g'oya (bu yerda `ai_generated_original` yo'q —
// ContentBook litsenziyasi shu 4 qiymatga cheklangan).
const MODULE_LABEL = { academic: 'Academic', general: 'General', both: 'Academic + General' };
const LICENCE_LABEL = {
  own: "O'ziniki",
  licensed: 'Litsenziyalangan',
  public_domain: 'Ommaviy domen',
  third_party_copyright: 'Uchinchi tomon',
};

export default function ContentBooksPanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      if (res.ok) setBooks(data.books || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (book) => {
    if (!confirm(`"${book.title}" kitobini o'chirishni tasdiqlaysizmi? Bu qaytarib bo'lmaydi (R2'dagi fayllar ham o'chadi).`)) return;
    setBusyId(book.id);
    try {
      await fetch(`/api/admin/books/${book.id}`, { method: 'DELETE' });
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AutopilotStatusBanner />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink font-display">Kutubxona</h2>
          <p className="text-sm text-muted mt-1">
            Kitob (PDF) yuklang — tizim Listening / Reading / Writing / Speaking testlarga ajratadi.
          </p>
        </div>
        <Link
          href="/admin/content/books/new"
          className="flex-shrink-0 self-start sm:self-auto flex items-center gap-2 whitespace-nowrap px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Yangi kitob
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <BookOpen size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm text-muted">Hozircha kitob yuklanmagan.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {books.map((book) => {
            const st = STATUS_LABEL[book.status] || STATUS_LABEL.uploaded;
            return (
              <div
                key={book.id}
                className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl border border-border bg-surface"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span title={book.title} className="text-sm font-semibold text-ink truncate">{book.title}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-semibold ${st.className}`}>{st.label}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {book.publisher || '—'} · {MODULE_LABEL[book.module] || book.module} · {LICENCE_LABEL[book.licence] || book.licence}
                    {book.detected?.generatedTestsCount > 0 && ` · ${book.detected.generatedTestsCount} test yaratildi`}
                  </p>
                  {book.progress?.message && <p className="text-xs text-muted mt-0.5 truncate">{book.progress.message}</p>}
                </div>
                <button
                  onClick={() => remove(book)}
                  disabled={busyId === book.id}
                  aria-label="Kitobni o'chirish"
                  className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center text-muted hover:text-danger hover:bg-danger-soft rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
