'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.4 — "Har savol yonida <select> (rim raqamlari i–x).
// Yuqorida sarlavhalar ro'yxati sticky blokda." Sarlavhalar ro'yxati BUTUN
// GURUH uchun BITTA marta ko'rsatilishi kerak — shuning uchun bu komponent
// (QuestionRenderer'dagi kabi) har savol uchun emas, `QuestionGroupBlock.tsx`
// tomonidan GURUH darajasida bir marta chaqiriladi.
export interface MatchingHeadingsProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
}

export default function MatchingHeadings({ group, answers, onAnswerChange }: MatchingHeadingsProps) {
  const bank = group.bank || [];

  return (
    <div>
      <div
        className="sticky top-0 z-10 mb-4 px-3.5 py-3 rounded"
        style={{ background: 'var(--exam-instruction)', border: '1px solid var(--exam-chrome-border)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--exam-muted)' }}>
          List of Headings
        </p>
        <ul className="space-y-1 text-sm" style={{ color: 'var(--exam-text)' }}>
          {bank.map((b) => (
            <li key={b.key}>
              <strong className="mr-1.5">{b.key}</strong>
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2.5">
        {group.questions.map((q) => {
          const value = answers[`q${q.number}`];
          return (
            <div key={q.number} data-question-number={q.number} className="flex items-center gap-3 text-sm" style={{ color: 'var(--exam-text)' }}>
              <sup className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--exam-muted)' }}>
                {q.number}
              </sup>
              <span className="flex-1 min-w-0">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: q.promptHtml || '' }} />
              </span>
              <select
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => onAnswerChange(q.number, e.target.value || null)}
                aria-label={`Savol ${q.number} javobi`}
                className="flex-shrink-0 rounded px-2 py-1 text-sm bg-transparent"
                style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)' }}
              >
                <option value="">—</option>
                {bank.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.key}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
