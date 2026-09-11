'use client';
import { parseGapHtml } from '../parseGapHtml';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';

// TZ-vocably-v2.md §3.5/§6.4/§8.1 — summary_completion, note_completion,
// table_completion va flowchart_completion HAMMASI bitta mexanizm: admin
// `group.stemHtml` ichiga butun matn/jadval/oqim-chizmani HTML sifatida yozadi,
// `{{qN}}` bilan gaplarni belgilaydi (TZ: "stemHtml — summary/table/flowchart
// uchun umumiy karkas"). Farq faqat admin qanday HTML yozishida (oddiy paragraf
// yoki `<table>`) — render mexanizmi bir xil, shuning uchun TZ §16 fayl
// ro'yxatidagi 4 ta alohida nomdan farqli, BITTA komponent (deyarli bir xil
// 4 ta faylni takrorlash o'rniga). `QuestionGroupBlock.tsx` shu turlarni shu
// yerga yo'naltiradi.
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
  });

  return (
    <div
      className="text-[16px] leading-[1.75] [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-[var(--exam-chrome-border)] [&_th]:border-[var(--exam-chrome-border)] [&_td]:p-2 [&_th]:p-2"
      style={{ color: 'var(--exam-text)' }}
    >
      {content}
    </div>
  );
}
