'use client';
import { parseGapHtml } from '../parseGapHtml';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';

// TZ-vocably-v2.md §3.5/§6.4/§7.5/§8.1 — summary_completion, summary_completion_bank,
// note_completion, table_completion, flowchart_completion va form_completion
// HAMMASI bitta mexanizm: admin `group.stemHtml` ichiga butun matn/jadval/
// oqim-chizma/formani HTML sifatida yozadi, `{{qN}}` bilan gaplarni belgilaydi
// (TZ: "stemHtml — summary/table/flowchart uchun umumiy karkas"). Farq faqat
// admin qanday HTML yozishida (oddiy paragraf yoki `<table>`) va gap erkin
// matnmi yoki bankdanmi (`_bank` turlari — parseGapHtml'ga `bank` uzatiladi) —
// render mexanizmi bir xil, shuning uchun TZ §16 fayl ro'yxatidagi bir nechta
// alohida nomdan farqli, BITTA komponent (deyarli bir xil fayllarni
// takrorlash o'rniga). `QuestionGroupBlock.tsx` shu turlarni shu yerga yo'naltiradi.
export interface GroupGapFillProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
}

export default function GroupGapFill({ group, answers, onAnswerChange }: GroupGapFillProps) {
  if (!group.stemHtml) return null;

  const content = parseGapHtml(group.stemHtml, {
    answers,
    onChangeGap: (qNum, value) => onAnswerChange(qNum, value),
    defaultWordLimit: group.wordLimit,
    // `summary_completion_bank` — bank berilgan bo'lsa gaplar erkin matn emas,
    // shu bankdan tanlanadigan <select> bo'ladi (parseGapHtml.tsx).
    bank: group.type === 'summary_completion_bank' ? group.bank : undefined,
  });

  return (
    <div
      className="leading-[1.75] [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-[var(--exam-chrome-border)] [&_th]:border-[var(--exam-chrome-border)] [&_td]:p-2 [&_th]:p-2"
      style={{ color: 'var(--exam-text)' }}
    >
      {content}
    </div>
  );
}
