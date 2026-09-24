'use client';
import { useEffect, useState } from 'react';
import { Loader2, ChevronRight, RotateCcw } from 'lucide-react';
import { fetchSectionStatuses } from '../state/attemptsApi';

// TZ-vocably-v2.md §20 migratsiyasi — standalone Reading/Listening test
// tanlash ekrani. Mock'dan FARQLI ravishda bu yerda qo'lda tanlash ATAYLAB
// bor (Mock esa to'liq avtomatik/tasodifiy), Writing/Speaking esa
// 2026-09-24 so'rovidan keyin umuman ro'yxat ko'rsatmaydi ("writing va
// speaking o'zi random tushsin") — ya'ni bu komponent endi faqat
// Reading/Listening uchun ishlatiladi.
//
// 2026-09-24 (foydalanuvchi so'rovi): "mashqlar o'rtada bir qator turmasin,
// 4 qator bo'lsin, yonga-pastga esa bemalol qancha bo'lsa ham tushsin" —
// ro'yxat o'rniga TO'R (grid): keng ekranda 4 ustun, pastga cheksiz.
// Shuning uchun konteyner endi `max-w-lg` emas.
function formatMinutes(sec) {
  return Math.round(sec / 60);
}

function sectionMeta(test, sectionKey) {
  const s = test.sections?.[sectionKey];
  if (!s) return null;
  if (sectionKey === 'writing') return `${formatMinutes(s.durationSec)} daq · ${s.taskCount} task`;
  if (sectionKey === 'speaking') return `${formatMinutes(s.durationSec)} daq`;
  return `${formatMinutes(s.durationSec)} daq · ${s.questionCount} savol`;
}

// VOCABLY-TZ.md §2.4/§5 item 12 — "Test ro'yxati kartalarida holat va oxirgi
// ball ko'rsatilsin." Har status uchun qisqa yorliq + rang.
const STATUS_BADGE = {
  in_progress: { label: 'Davom etmoqda', className: 'text-warning bg-warning-soft' },
  expired: { label: "Muddati o'tgan", className: 'text-muted bg-bg' },
  submitted: { label: 'Baholanmoqda', className: 'text-muted bg-bg' },
  graded: { label: 'Tugallangan', className: 'text-success bg-success-soft' },
};

export default function TestPicker({ sectionKey, title, onPicked }) {
  const [tests, setTests] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/exam/tests')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTests((data.tests || []).filter((t) => t.sections?.[sectionKey]));
      })
      .catch(() => !cancelled && setError("Testlar ro'yxatini yuklab bo'lmadi."));
    fetchSectionStatuses(sectionKey)
      .then((s) => !cancelled && setStatuses(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sectionKey]);

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10">
      <h1 className="text-lg font-bold text-ink mb-1 font-display">{title}</h1>
      <p className="text-xs text-muted mb-6">Har bir mashqni istagancha qayta ishlash mumkin — "Qaytadan" tugmasi yangi urinish boshlaydi.</p>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!error && tests === null && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      )}

      {!error && tests !== null && tests.length === 0 && <p className="text-sm text-muted">Hozircha testlar yo'q.</p>}

      {!error && tests !== null && tests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tests.map((test) => {
            const st = statuses[test.id];
            const badge = st ? STATUS_BADGE[st.status] : null;
            return (
              <div
                key={test.id}
                className="flex flex-col rounded-xl border border-border bg-surface hover:border-accent/40 hover:bg-accent-soft/40 transition-colors"
              >
                <button
                  onClick={() => onPicked(test.id)}
                  className="flex-1 flex items-start justify-between gap-2 px-4 py-3.5 text-left min-w-0"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink line-clamp-2">{test.title}</span>
                    <span className="block text-xs text-muted mt-1">{sectionMeta(test, sectionKey)}</span>
                    {badge && (
                      <span className={`inline-block mt-2 px-1.5 py-0.5 rounded text-[11px] leading-4 font-semibold ${badge.className}`}>
                        {badge.label}
                        {st.status === 'graded' && st.band != null ? `: ${st.band}` : ''}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={16} className="text-muted flex-shrink-0 mt-0.5" />
                </button>
                {/* "Qayta-qayta ishlash imkoni" (2026-09-24) — avval bu tugma
                    faqat urinish TUGAGANDA chiqardi; endi urinish boshlangan
                    bo'lsa ham chiqadi va eskisini bekor qilib yangisini
                    boshlaydi (`abandonExisting`). */}
                {st && (
                  <button
                    onClick={() => onPicked(test.id, true)}
                    title="Yangi urinish boshlash"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border-t border-border text-xs font-semibold text-muted hover:text-ink hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-b-xl"
                  >
                    <RotateCcw size={13} /> Qaytadan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
