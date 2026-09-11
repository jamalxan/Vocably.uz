'use client';
import { useEffect, useRef } from 'react';
import { applyHighlights } from '../highlight/highlightDom';
import type { Highlight } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.2 — "Paragraf yorliqlari (A, B, C) — chap chetda ...
// paragraf matni padding-left: 28px." `label` berilmasa (matching_headings/
// matching_information guruhi bo'lmagan passage'larda, §6.2 qoidasi) oddiy
// paragraf sifatida chiqadi.
//
// §6.3 — matn belgilash. `contentRef`'ga `applyHighlights` chaqiriladi har
// safar `highlights` (shu paragrafga tegishli qismi) o'zgarganda —
// `dangerouslySetInnerHTML`'ning `html`'i o'zgarmagani uchun React bu
// subdrevni qayta yozmaydi, shuning uchun bevosita DOM mutatsiyasi
// (unwrap+rewrap) xavfsiz saqlanib qoladi keyingi render'larda ham.
export interface ParagraphLabelProps {
  label?: string;
  html: string;
  paragraphIndex: number;
  highlights: Highlight[];
  onActivateHighlight?: (id: string, rect: DOMRect) => void;
}

export default function ParagraphLabel({ label, html, paragraphIndex, highlights, onActivateHighlight }: ParagraphLabelProps) {
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contentRef.current) applyHighlights(contentRef.current, highlights, onActivateHighlight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights]);

  return (
    <p className="relative" style={{ paddingLeft: label ? 28 : 0 }}>
      {label && (
        <span className="absolute left-0 top-0 font-bold" aria-hidden="true">
          {label}
        </span>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <span ref={contentRef} data-paragraph-index={paragraphIndex} dangerouslySetInnerHTML={{ __html: html }} />
    </p>
  );
}
