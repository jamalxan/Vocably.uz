'use client';
import type { AttemptResult } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 3 item 15's scope stops at orchestration — this is
// a MINIMAL post-mock summary (overall + per-section bands) just so the mock
// flow has somewhere to land. The real thing (§11: radar chart, per-question
// review with explanations/transcript, weak-area analysis, "add to
// dictionary", history comparison) is items 16-19, separate work.
export interface MockResultProps {
  result: AttemptResult | null;
}

function SectionRow({ label, band }: { label: string; band?: number | null }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-lg font-bold text-brand-text tabular-nums">{band != null ? band.toFixed(1) : '—'}</span>
    </div>
  );
}

export default function MockResult({ result }: MockResultProps) {
  if (!result) {
    return <div className="p-8 text-center text-sm text-muted">Natija topilmadi.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 sm:p-10">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Umumiy band</p>
        <p className="text-6xl font-bold text-brand-text mt-2 tabular-nums">
          {result.overall != null ? result.overall.toFixed(1) : '—'}
        </p>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <SectionRow label="Listening" band={result.listening?.band} />
        <SectionRow label="Reading" band={result.reading?.band} />
        <SectionRow label="Writing" band={result.writing?.band} />
      </div>
      {result.writing == null && (
        <p className="text-xs text-muted mt-3 text-center">Writing hali baholanmagan bo&apos;lishi mumkin — bir necha soniya kuting.</p>
      )}
    </div>
  );
}
