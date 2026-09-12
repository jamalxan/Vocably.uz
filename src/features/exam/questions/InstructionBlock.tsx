'use client';

// TZ-vocably-v2.md §5.6 — har QuestionGroup tepasidagi ko'rsatma bloki.
// `instructionHtml` admin tomonidan yoziladi (TZ §15 kontent quvuri) — foydalanuvchi
// kiritmasi emas, shuning uchun `dangerouslySetInnerHTML` shu trust modeliga mos
// (xuddi `promptHtml`/`stemHtml` kabi — TZ butun hujjat davomida bularni admin-
// authored rich text sifatida ishlatadi).
export interface InstructionBlockProps {
  rangeLabel: string; // "Questions 14–18"
  instructionHtml: string;
}

export default function InstructionBlock({ rangeLabel, instructionHtml }: InstructionBlockProps) {
  return (
    <div
      className="mb-4 px-4 py-3.5"
      style={{ background: 'var(--exam-instruction)', borderLeft: '3px solid var(--exam-accent)' }}
    >
      <p className="text-[0.94em] font-bold mb-1.5" style={{ color: 'var(--exam-text)' }}>
        {rangeLabel}
      </p>
      {/* eslint-disable-next-line react/no-danger */}
      <div
        className="text-[0.94em] leading-[1.55] [&_strong]:font-bold [&_em]:italic"
        style={{ color: 'var(--exam-text)' }}
        dangerouslySetInnerHTML={{ __html: instructionHtml }}
      />
    </div>
  );
}
