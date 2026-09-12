'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';
import FlagToggle from '../FlagToggle';

// TZ-vocably-v2.md §6.4 — matching_information ("<select> yoki matn input,
// A-H harfi, bankReusable true"), matching_features ("<select> variantlar
// bankidan"), matching_sentence_endings ("Chap: gap boshi, o'ng: <select>
// A-G"). Uchalasi ham bir xil: har savol + shu guruh `bank`idan tanlanadigan
// bitta <select>. `matching_headings`dan farqli — bu yerda sticky ro'yxat
// SHART EMAS (TZ ularda buni talab qilmaydi), chunki `<select>` variantlari
// o'zi `key — text` ko'rinishida to'liq matnni ko'rsatadi.
//
// VOCABLY-TZ.md §1.4 auditi — `matching_information` uchun content muallifi
// (admin yoki AI-generatsiya) `bank`ni ko'pincha bo'sh qoldiradi, chunki
// haqiqiy IELTS'da bu turdagi variantlar shunchaki passage paragraf
// harflari (A, B, C...) — alohida yozib chiqishga hojat yo'qdek tuyuladi.
// Lekin bu komponent faqat `group.bank`dan o'qiydi, shuning uchun bo'sh
// `bank` = bo'sh dropdown = javob berib bo'lmaydigan savol. Shu sabab: `bank`
// bo'sh VA `paragraphLabels` berilgan bo'lsa (faqat Reading, faqat shu tur),
// variantlar avtomatik generatsiya qilinadi — content muallifidan har safar
// passage harflarini qo'lda takrorlashni talab qilmaydi.
export interface MatchingBankProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
  paragraphLabels?: string[];
}

export default function MatchingBank({ group, answers, onAnswerChange, paragraphLabels }: MatchingBankProps) {
  const explicitBank = group.bank || [];
  const bank =
    explicitBank.length === 0 && group.type === 'matching_information' && paragraphLabels && paragraphLabels.length > 0
      ? paragraphLabels.map((label) => ({ key: label, text: '' }))
      : explicitBank;

  return (
    <div className="space-y-2.5">
      {group.questions.map((q) => {
        const value = answers[`q${q.number}`];
        return (
          <div key={q.number} data-question-number={q.number} className="flex items-center gap-3 text-sm" style={{ color: 'var(--exam-text)' }}>
            <sup className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--exam-muted)' }}>
              {q.number}
            </sup>
            <FlagToggle questionNumber={q.number} />
            <span className="flex-1 min-w-0">
              {/* eslint-disable-next-line react/no-danger */}
              <span dangerouslySetInnerHTML={{ __html: q.promptHtml || '' }} />
            </span>
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onAnswerChange(q.number, e.target.value || null)}
              aria-label={`Question ${q.number} answer`}
              className="flex-shrink-0 max-w-[45%] rounded px-2 py-1 text-sm bg-transparent"
              style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)' }}
            >
              <option value="">—</option>
              {bank.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.text ? `${b.key} — ${b.text}` : b.key}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
