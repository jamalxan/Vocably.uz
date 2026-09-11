'use client';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "multiple_choice_single: Radio, vertikal, A-D
// harflari bilan" va "multiple_choice_multi: Checkbox. selectCount ga
// yetganda qolganlari disabled. Yuqorida: '2 tadan 1 ta tanlangan'". Ikkalasi
// bitta faylda (TZ §16 fayl ro'yxatida ham bitta `MultipleChoice.tsx`) —
// `question.selectCount` bo'lsa checkbox rejimi, bo'lmasa radio.
export default function MultipleChoice({ question, value, onChange }: QuestionTypeProps) {
  const isMulti = typeof question.selectCount === 'number' && question.selectCount > 1;
  const selected = isMulti ? (Array.isArray(value) ? value : []) : null;

  const toggleMulti = (key: string) => {
    if (!selected) return;
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (selected.length < (question.selectCount || 0)) {
      onChange([...selected, key]);
    }
  };

  return (
    <fieldset data-question-number={question.number} className="text-sm" style={{ color: 'var(--exam-text)' }}>
      <legend className="mb-2 text-left">
        <sup className="text-[11px] font-bold mr-1.5" style={{ color: 'var(--exam-muted)' }}>
          {question.number}
        </sup>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: question.promptHtml || '' }} />
        {isMulti && (
          <span className="block text-xs mt-0.5" style={{ color: 'var(--exam-muted)' }}>
            {question.selectCount} tadan {selected?.length || 0} ta tanlangan
          </span>
        )}
      </legend>
      <div className="flex flex-col gap-2 pl-4">
        {(question.options || []).map((opt) => {
          const isChecked = isMulti ? !!selected?.includes(opt.key) : value === opt.key;
          const disabled = isMulti && !isChecked && (selected?.length || 0) >= (question.selectCount || 0);
          return (
            <label key={opt.key} className={`flex items-start gap-2 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={isMulti ? undefined : `q${question.number}`}
                checked={isChecked}
                disabled={disabled}
                onChange={() => (isMulti ? toggleMulti(opt.key) : onChange(opt.key))}
                className="mt-0.5 accent-[var(--exam-accent)]"
              />
              <span>
                <strong className="mr-1.5">{opt.key}</strong>
                {opt.text}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
