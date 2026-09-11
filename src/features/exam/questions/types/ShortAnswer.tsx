'use client';
import GapInput from '../GapInput';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "Bitta qatorli input + so'z limiti hisoblagichi."
// Savol raqami alohida qo'shilmaydi — GapInput o'zi input oldida ko'rsatadi
// (§6.5, ikkalasi bo'lsa raqam ikki marta chiqib qolardi).
export default function ShortAnswer({ group, question, value, onChange }: QuestionTypeProps) {
  return (
    <p className="text-sm" style={{ color: 'var(--exam-text)' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: question.promptHtml || '' }} />{' '}
      <GapInput
        questionNumber={question.number}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        wordLimit={group.wordLimit}
      />
    </p>
  );
}
