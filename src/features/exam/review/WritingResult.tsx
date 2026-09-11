'use client';
import type { AttemptResult } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 2 item 13 — AI grader (queue+polling) hali
// qurilmagan, shuning uchun `result.writing` doim `null` (attemptServer.ts).
// Bu ekran shuni ochiq aytadi — "0" yoki bo'sh joy ko'rsatib chalg'itmaydi
// (TZ eski BUG-015'dagi qoidasi: baholanmagan bo'lim uchun aniq belgi, 0 emas).
export interface WritingResultProps {
  result: AttemptResult | null;
}

export default function WritingResult({ result }: WritingResultProps) {
  return (
    <div className="max-w-md mx-auto p-6 sm:p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Writing</p>
      <p className="text-5xl font-bold text-brand-text mt-2">—</p>
      <p className="text-sm text-muted mt-3">
        Insholaringiz saqlandi{result?.timeSpentSec ? ` (${Math.round(result.timeSpentSec / 60)} daqiqada)` : ''}. AI baholash
        hali ulanmagan — bu Exam Engine TZ'ning keyingi bosqichi.
      </p>
    </div>
  );
}
