'use client';
import { useEffect, useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

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

export default function TestPicker({ sectionKey, title, onPicked }) {
  const { token } = useApp();
  const [tests, setTests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/exam/tests', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setTests((data.tests || []).filter((t) => t.sections?.[sectionKey]));
      })
      .catch(() => !cancelled && setError("Testlar ro'yxatini yuklab bo'lmadi."));
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
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => onPicked(test.id)}
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border bg-surface hover:border-accent/40 hover:bg-accent-soft/40 text-left transition-colors"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{test.title}</span>
                <span className="block text-xs text-muted mt-0.5">{sectionMeta(test, sectionKey)}</span>
              </span>
              <ChevronRight size={16} className="text-muted flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
