'use client';
import type { SanitizedPassage } from '@/lib/exam/types';
import ParagraphLabel from './ParagraphLabel';

// TZ-vocably-v2.md §6.2 — "Yorliq faqat matching_headings yoki
// matching_information guruhi mavjud bo'lsa ko'rsatiladi." va "Sarlavha
// position: sticky; top: 0 ... scroll paytida qaysi passage ekanligi ko'rinib
// turadi."
const LABEL_TRIGGER_TYPES = new Set(['matching_headings', 'matching_information']);

export interface PassagePaneProps {
  passage: SanitizedPassage;
}

export default function PassagePane({ passage }: PassagePaneProps) {
  const showLabels = passage.questionGroups.some((g) => LABEL_TRIGGER_TYPES.has(g.type));

  return (
    <article>
      <div
        className="sticky -top-6 sm:-top-6 -mx-6 sm:-mx-7 px-6 sm:px-7 pt-6 pb-3 mb-4 z-10"
        style={{ background: 'var(--exam-bg)' }}
      >
        <h1 className="text-[20px] font-bold leading-[1.3]" style={{ color: 'var(--exam-text)' }}>
          {passage.title}
        </h1>
        {passage.subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--exam-muted)' }}>
            {passage.subtitle}
          </p>
        )}
      </div>
      <div className="space-y-4 text-[16px] leading-[1.75]" style={{ color: 'var(--exam-text)' }}>
        {passage.paragraphs.map((p, i) => (
          <ParagraphLabel key={i} label={showLabels ? p.label : undefined} html={p.html} />
        ))}
      </div>
    </article>
  );
}
