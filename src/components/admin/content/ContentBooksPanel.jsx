'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, BookOpen, Trash2 } from 'lucide-react';

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

export default function ContentBooksPanel({ token }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBooks(data.books || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (book) => {
    if (!confirm(`"${book.title}" kitobini o'chirishni tasdiqlaysizmi? Bu qaytarib bo'lmaydi (R2'dagi fayllar ham o'chadi).`)) return;
    setBusyId(book.id);
    try {
      await fetch(`/api/admin/books/${book.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink font-display">Kutubxona</h2>
          <p className="text-sm text-muted mt-1">
            Kitob (PDF) yuklang — tizim Listening/Reading/Writing/Speaking testlarga ajratadi.
          </p>
        </div>
        <Link
          href="/admin/content/books/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-lg text-sm font-semibold transition-colors"
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
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-surface"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink truncate">{book.title}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${st.className}`}>{st.label}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {book.publisher || '—'} · {book.module} · {book.licence}
                    {book.detected?.generatedTestsCount > 0 && ` · ${book.detected.generatedTestsCount} test yaratildi`}
                  </p>
                  {book.progress?.message && <p className="text-xs text-muted mt-0.5 truncate">{book.progress.message}</p>}
                </div>
                <button
                  onClick={() => remove(book)}
                  disabled={busyId === book.id}
                  aria-label="Kitobni o'chirish"
                  className="p-2 text-muted hover:text-danger hover:bg-danger-soft rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
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
