'use client';
import type { AttemptResult } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 1 item 9 — "Natija ekrani (oddiy)". Bu ATAYLAB
// oddiy — §11'dagi to'liq premium natija ekrani (radar chart, zaif tomonlar
// tahlili, "lug'atga qo'shish", tarix taqqoslash) Faza 3 ishi. Shuning uchun
// ham bu — `[data-exam]` ICHIDA EMAS, oddiy ilova ranglarida (§5.1: "imtihondan
// keyin — to'liq Deep Merlot", lekin premium bezaksiz — bu "oddiy" versiya).
export interface ReadingResultProps {
  result: AttemptResult | null;
}

export default function ReadingResult({ result }: ReadingResultProps) {
  if (!result || !result.reading) {
    return <div className="p-8 text-center text-sm text-muted">Natija topilmadi.</div>;
  }

  const { reading, perQuestion } = result;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reading natijasi</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">{reading.band.toFixed(1)}</p>
        <p className="text-sm text-muted mt-1 tabular-nums">
          {reading.raw} / {perQuestion.length} to&apos;g&apos;ri
        </p>
      </div>

      <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
        {perQuestion.map((q) => (
          <div
            key={q.number}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm ${q.correct ? '' : 'bg-danger-soft'}`}
          >
            <span className="w-6 flex-shrink-0 font-semibold text-ink">{q.number}</span>
            <span className="flex-1 min-w-0 truncate text-ink">
              {q.userAnswer || <em className="text-muted">javobsiz</em>}
            </span>
            {!q.correct && (
              <span className="flex-shrink-0 max-w-[40%] truncate text-muted" title={q.accepted.join(', ')}>
                {q.accepted.join(', ')}
              </span>
            )}
            <span className="flex-shrink-0" aria-hidden="true">
              {q.correct ? '✅' : '❌'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
