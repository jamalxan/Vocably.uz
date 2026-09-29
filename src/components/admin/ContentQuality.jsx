'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronDown, Loader2, Users, CheckCircle2 } from 'lucide-react';

// Content quality: which tests people actually take, how they score, and
// which questions look broken. "Kalit shubhali" = most learners missed it
// with the same wrong answer — open the test and check the answer key.
const pct = (x) => `${Math.round(x * 100)}%`;

function QuestionRow({ q }) {
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 rounded-lg text-sm ${q.keySuspect ? 'bg-warning-soft' : 'bg-bg'}`}>
      <span className="font-semibold text-ink w-12">Q{q.number}</span>
      <span className="text-muted text-xs w-40 truncate">{q.type}</span>
      <span className="tabular-nums text-ink">{pct(q.accuracy)} to‘g‘ri</span>
      <span className="text-xs text-muted">({q.total} javob)</span>
      {q.topWrong && (
        <span className="text-xs text-muted">
          ko‘p yozilgan xato: <strong className="text-ink">“{q.topWrong}”</strong> ({pct(q.topWrongShare)})
        </span>
      )}
      <span className="text-xs text-muted">kalit: {q.accepted?.join(' / ') || '—'}</span>
      {q.keySuspect && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-warning">
          <AlertTriangle size={13} /> Kalit shubhali
        </span>
      )}
    </li>
  );
}

export default function ContentQuality() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    fetch('/api/admin/content-quality')
      .then((r) => r.json().then((d) => (r.ok ? d : Promise.reject(d.error))))
      .then(setData)
      .catch((e) => setError(e || 'Yuklanmadi'));
  }, []);

  if (error) return <p className="text-sm text-danger">{String(error)}</p>;
  if (!data)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );

  const suspects = data.tests.reduce((n, t) => n + t.suspects.length, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <p className="text-xs text-muted">Faol testlar (90 kun)</p>
          <p className="text-2xl font-display font-bold text-ink tabular-nums">{data.tests.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <p className="text-xs text-muted">Urinishlar</p>
          <p className="text-2xl font-display font-bold text-ink tabular-nums">{data.tests.reduce((n, t) => n + t.attempts, 0)}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${suspects ? 'bg-warning-soft border-warning/30' : 'bg-surface border-border'}`}>
          <p className="text-xs text-muted">Kaliti shubhali savollar</p>
          <p className="text-2xl font-display font-bold text-ink tabular-nums">{suspects}</p>
        </div>
      </div>

      {data.tests.length === 0 && <p className="text-sm text-muted py-10 text-center">Hali urinishlar yo‘q.</p>}

      <ul className="space-y-2.5">
        {data.tests.map((t) => (
          <li key={t.testId} className="rounded-2xl border border-border bg-surface shadow-card">
            <button
              type="button"
              onClick={() => setOpen(open === t.testId ? null : t.testId)}
              aria-expanded={open === t.testId}
              className="w-full flex flex-wrap items-center gap-x-5 gap-y-2 p-4 text-left"
            >
              <span className="min-w-0 flex-1 font-semibold text-ink">{t.title || t.testId}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Users size={13} /> {t.learners} · {t.attempts} urinish
              </span>
              <span className="text-xs text-muted">yakunlangan {pct(t.completion)}</span>
              <span className="text-xs text-muted">R {t.avgReading ?? '—'} · L {t.avgListening ?? '—'}</span>
              {t.suspects.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                  <AlertTriangle size={13} /> {t.suspects.length} shubhali
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 size={13} /> muammo yo‘q
                </span>
              )}
              <ChevronDown size={16} className={`text-muted transition-transform ${open === t.testId ? 'rotate-180' : ''}`} />
            </button>
            {open === t.testId && (
              <div className="px-4 pb-4 space-y-2">
                <p className="text-xs text-muted">Eng qiyin savollar (kamida 5 ta javob bo‘lganlari):</p>
                {t.hardest.length ? (
                  <ul className="space-y-1.5">
                    {[...t.suspects, ...t.hardest.filter((h) => !h.keySuspect)].map((q) => (
                      <QuestionRow key={q.number} q={q} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">Hali yetarli javob yo‘q.</p>
                )}
                <Link href="/admin/exam-tests" className="inline-block text-xs font-semibold text-accent hover:underline mt-1">
                  Testni tahrirlash → IELTS testlar
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
