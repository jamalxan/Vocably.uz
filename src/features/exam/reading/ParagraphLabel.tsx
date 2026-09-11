'use client';

// TZ-vocably-v2.md §6.2 — "Paragraf yorliqlari (A, B, C) — chap chetda ...
// paragraf matni padding-left: 28px." `label` berilmasa (matching_headings/
// matching_information guruhi bo'lmagan passage'larda, §6.2 qoidasi) oddiy
// paragraf sifatida chiqadi.
export interface ParagraphLabelProps {
  label?: string;
  html: string;
}

export default function ParagraphLabel({ label, html }: ParagraphLabelProps) {
  return (
    <p className="relative" style={{ paddingLeft: label ? 28 : 0 }}>
      {label && (
        <span className="absolute left-0 top-0 font-bold" aria-hidden="true">
          {label}
        </span>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </p>
  );
}
