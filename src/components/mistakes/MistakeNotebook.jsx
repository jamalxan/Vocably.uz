'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpenText, Ear, RotateCw, Loader2, CheckCircle2, XCircle, BookX } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatUzDate } from '@/lib/uzDate';

// Mistake notebook. Every wrong Reading/Listening answer lands here with the
// correct answer next to it, and the words behind those mistakes are added
// to the vocabulary automatically — "Takrorlash" drills them with SRS.
const SKILL = {
  reading: { label: 'Reading', icon: BookOpenText },
  listening: { label: 'Listening', icon: Ear },
};

export default function MistakeNotebook() {
  const router = useRouter();
  const { startPracticeQueue } = useApp();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/mistakes')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const list = useMemo(() => (data?.mistakes || []).filter((m) => filter === 'all' || m.section === filter), [data, filter]);
  const words = data?.words || [];
  const due = words.filter((w) => w.due);

  const drill = (ws) => {
    if (!ws.length) return;
    startPracticeQueue(ws.map((w) => w.id));
    router.push('/app/lugat/takrorlash');
  };

  if (failed) return <p className="p-8 text-sm text-muted">Yuklab bo‘lmadi. Sahifani yangilang.</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-primary text-on-primary p-6 sm:p-7">
        <div aria-hidden="true" className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <BookX size={14} aria-hidden="true" /> Mistake notebook
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">Xatolar daftari</h1>
            <p className="text-sm text-on-primary/75 mt-2 max-w-lg">
              Reading va Listening’dagi har bir xatongiz shu yerda. Ulardagi so‘zlar lug‘atingizga o‘zi qo‘shiladi — har kuni takrorlab, zaif joyni
              yoping.
            </p>
          </div>
          <div className="flex sm:flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => drill(due.length ? due : words)}
              disabled={!words.length}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold shadow-glow disabled:opacity-50"
            >
              <RotateCw size={16} aria-hidden="true" /> Takrorlash ({due.length || words.length})
            </button>
            <span className="text-xs text-on-primary/70 self-center sm:self-end">
              {words.length} ta so‘z · {due.length} ta bugun
            </span>
          </div>
        </div>
      </header>

      {words.length > 0 && (
        <section aria-labelledby="mw" className="rounded-2xl border border-border bg-surface shadow-card p-5">
          <h2 id="mw" className="text-sm font-semibold text-ink mb-3">
            Xatolardan yig‘ilgan so‘zlar
          </h2>
          <ul className="flex flex-wrap gap-2">
            {words.slice(0, 40).map((w) => (
              <li
                key={w.id}
                title={w.syns.join(', ') || 'Tarjima hali yo‘q'}
                className={`px-3 py-1.5 rounded-full border text-sm ${w.due ? 'border-accent/40 bg-accent-soft text-ink' : 'border-border bg-bg text-muted'}`}
              >
                {w.word}
                {w.syns[0] && <span className="text-muted"> · {w.syns[0]}</span>}
              </li>
            ))}
          </ul>
          {words.some((w) => !w.syns.length) && (
            <p className="text-xs text-muted mt-3">
              Tarjimasi yo‘q so‘zlarni{' '}
              <Link href="/app/lugat/jadval" className="text-accent font-semibold hover:underline">
                lug‘at jadvalida
              </Link>{' '}
              bir bosishda boyitishingiz mumkin.
            </p>
          )}
        </section>
      )}

      <div className="flex gap-1 p-1 rounded-xl bg-bg border border-border w-fit" role="group" aria-label="Filtr">
        {[
          ['all', 'Hammasi'],
          ['reading', 'Reading'],
          ['listening', 'Listening'],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`px-3.5 py-1.5 min-h-10 md:min-h-0 rounded-lg text-xs font-semibold ${filter === k ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <CheckCircle2 size={28} className="mx-auto text-success" aria-hidden="true" />
          <p className="text-sm font-semibold text-ink mt-3">Hozircha xato yo‘q</p>
          <p className="text-xs text-muted mt-1">Reading yoki Listening testini ishlang — xatolaringiz shu yerda tahlil qilinadi.</p>
          <div className="flex justify-center gap-2 mt-4">
            <Link href="/app/oqish" className="px-4 py-2 rounded-xl bg-accent text-on-accent text-sm font-semibold">
              Reading
            </Link>
            <Link href="/app/tinglash" className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-ink">
              Listening
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {list.map((m) => {
            const S = SKILL[m.section];
            return (
              <li key={`${m.attemptId}-${m.number}`} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 font-semibold text-accent">
                    <S.icon size={13} aria-hidden="true" /> {S.label}
                  </span>
                  <span>· {m.testTitle}</span>
                  <span>· Q{m.number}</span>
                  <span className="ml-auto">{m.date ? formatUzDate(m.date) : ''}</span>
                </div>
                {m.promptText && <p className="text-sm text-ink mt-2 leading-relaxed">{m.promptText}</p>}
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2">
                    <XCircle size={15} className="text-danger mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-[11px] text-muted">Sizning javobingiz</span>
                      <span className="text-ink">{m.userAnswer || '— (javob berilmagan)'}</span>
                    </span>
                  </p>
                  <p className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2">
                    <CheckCircle2 size={15} className="text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-[11px] text-muted">To‘g‘ri javob</span>
                      <span className="text-ink font-semibold">{m.accepted.join(' / ') || '—'}</span>
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
