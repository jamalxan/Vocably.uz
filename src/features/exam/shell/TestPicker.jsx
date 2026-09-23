'use client';
import { useEffect, useState } from 'react';
import { Loader2, ChevronRight, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchSectionStatuses } from '../state/attemptsApi';

// TZ-vocably-v2.md §20 migratsiyasi — standalone Reading/Listening/Writing/
// Speaking sahifalari uchun test tanlash ekrani. Mock'dan FARQLI ravishda bu
// yerda qo'lda tanlash ATAYLAB bor — foydalanuvchi so'rovi faqat Mock'ni
// avtomatik-tasodifiy qilishni talab qilgan, mustaqil mashq uchun tanlash
// tabiiy va foydali.
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
  const { token } = useApp();
  const [tests, setTests] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/exam/tests', { headers: { Authorization: `Bearer ${token}` } })
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
  }, [token, sectionKey]);

  return (
    <div className="max-w-lg mx-auto p-6 sm:p-10">
      <h1 className="text-lg font-bold text-ink mb-6 font-display">{title}</h1>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!error && tests === null && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      )}

      {!error && tests !== null && tests.length === 0 && <p className="text-sm text-muted">Hozircha testlar yo'q.</p>}

      {!error && tests !== null && tests.length > 0 && (
        <div className="flex flex-col gap-2">
          {tests.map((test) => {
            const st = statuses[test.id];
            const badge = st ? STATUS_BADGE[st.status] : null;
            const canRestart = st && st.status !== 'in_progress';
            return (
              <div
                key={test.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface hover:border-accent/40 hover:bg-accent-soft/40 transition-colors"
              >
                <button onClick={() => onPicked(test.id)} className="flex-1 flex items-center justify-between gap-3 px-4 py-3.5 text-left min-w-0">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="block text-sm font-semibold text-ink">{test.title}</span>
                      {badge && (
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] leading-4 font-semibold ${badge.className}`}>
                          {badge.label}
                          {st.status === 'graded' && st.band != null ? `: ${st.band}` : ''}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-muted mt-0.5">{sectionMeta(test, sectionKey)}</span>
                  </span>
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </button>
                {canRestart && (
                  <button
                    onClick={() => onPicked(test.id, true)}
                    title="Yangi urinish boshlash"
                    aria-label="Yangi urinish boshlash"
                    className="flex-shrink-0 mr-1 w-11 h-11 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <RotateCcw size={16} />
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
