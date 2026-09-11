'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.4 — matching_information ("<select> yoki matn input,
// A-H harfi, bankReusable true"), matching_features ("<select> variantlar
// bankidan"), matching_sentence_endings ("Chap: gap boshi, o'ng: <select>
// A-G"). Uchalasi ham bir xil: har savol + shu guruh `bank`idan tanlanadigan
// bitta <select>. `matching_headings`dan farqli — bu yerda sticky ro'yxat
// SHART EMAS (TZ ularda buni talab qilmaydi), chunki `<select>` variantlari
// o'zi `key — text` ko'rinishida to'liq matnni ko'rsatadi.
export interface MatchingBankProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
}

export default function MatchingBank({ group, answers, onAnswerChange }: MatchingBankProps) {
  const bank = group.bank || [];

  return (
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
              className="flex-shrink-0 max-w-[45%] rounded px-2 py-1 text-sm bg-transparent"
              style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)' }}
            >
              <option value="">—</option>
              {bank.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.key} — {b.text}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
