'use client';
import { useMemo, useState } from 'react';
import ReviewQuestionRow from './ReviewQuestionRow';
import WritingScoreCard from './WritingScoreCard';
import type { AttemptReviewDetail, ExamSectionKey } from '@/lib/exam/types';

// TZ-vocably-v2.md §11.2 — Review ekrani: "Imtihon shell'ining o'zi, lekin
// taymer yo'q, o'rniga 'Ko'rib chiqish rejimi'... Bo'limlar va savol turlari
// bo'yicha filtr: Faqat xatolar / Faqat TFNG."
//
// SODDALASHTIRISH: TZ "imtihon shell'ining o'zi"ni (to'liq split-pane, savol
// paneli va h.k.) qayta ishlatishni taklif qiladi. Bu yerda ATAYLAB tekis
// ro'yxat + yuqorida matn/transkript ko'rinishi tanlandi — Review'da vaqt
// bosimi yo'q (SplitPane'ning asosiy sababi — bir vaqtda o'qish+javob berish
// — endi yo'q), shuning uchun oddiyroq, lekin barcha MA'LUMOT talablarini
// (✅/❌/⚪, javob/to'g'ri javob, izoh, paragraf highlight, transkript, filtr)
// to'liq qondiruvchi ko'rinish tanlandi. Savol-turi bo'yicha filtr (masalan
// "Faqat TFNG") ham QILINMADI — faqat "Faqat xatolar" (asosiy, TZ'ning o'zi
// "misol"ligicha ko'rsatgan ikkita filtrning birinchisi); savol turi
// filtri kam qiymat/ko'p murakkablik nisbati past bo'lgani uchun qoldirilgan
// keyingi sayqal ishi sifatida (bu yerda ochiq qoldirilgan, unutilmagan).
export interface ReviewScreenProps {
  detail: AttemptReviewDetail;
}

const SECTION_LABEL: Record<'listening' | 'reading' | 'writing', string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
};

export default function ReviewScreen({ detail }: ReviewScreenProps) {
  const availableSections = useMemo(
    () => (['listening', 'reading', 'writing'] as const).filter((k) => detail[k]),
    [detail]
  );
  const [activeSection, setActiveSection] = useState<ExamSectionKey>(availableSections[0] || 'reading');
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const handleLocate = (passageOrder: number, label: string) => {
    const key = `${passageOrder}-${label}`;
    setHighlighted(key);
    const el = document.querySelector<HTMLElement>(`[data-review-paragraph="${key}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlighted((cur) => (cur === key ? null : cur)), 2500);
  };

  if (availableSections.length === 0) {
    return <div className="p-8 text-center text-sm text-muted">Ko&apos;rib chiqish uchun natija topilmadi.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ko&apos;rib chiqish rejimi</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">
          {detail.overall != null ? detail.overall.toFixed(1) : '—'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-5">
        {availableSections.map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeSection === key ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:border-accent/40'
            }`}
          >
            {SECTION_LABEL[key as 'listening' | 'reading' | 'writing']}
          </button>
        ))}
      </div>

      {activeSection === 'reading' && detail.reading && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">
              Xom ball: {detail.reading.raw} · Band {detail.reading.band.toFixed(1)}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} className="accent-accent" />
              Faqat xatolar
            </label>
          </div>
          {detail.reading.passages.map((p) => (
            <div key={p.order} className="mb-6">
              <p className="text-sm font-bold text-ink mb-2">{p.title}</p>
              <div className="border border-border rounded-xl p-4 mb-3 max-h-64 overflow-y-auto text-sm leading-relaxed bg-surface">
                {p.paragraphs.map((para, i) => {
                  const key = `${p.order}-${para.label || i}`;
                  return (
                    <p
                      key={i}
                      data-review-paragraph={key}
                      className="relative mb-2 last:mb-0 transition-colors rounded"
                      style={{ padding: para.label ? '2px 4px 2px 24px' : '2px 4px', background: highlighted === key ? 'var(--exam-highlight)' : 'transparent' }}
                    >
                      {para.label && <span className="absolute left-1 font-bold text-muted">{para.label}</span>}
                      {/* eslint-disable-next-line react/no-danger */}
                      <span dangerouslySetInnerHTML={{ __html: para.html }} />
                    </p>
                  );
                })}
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                {p.questions
                  .filter((q) => !onlyErrors || !q.correct)
                  .map((q) => (
                    <ReviewQuestionRow key={q.number} question={q} onLocate={(label) => handleLocate(p.order, label)} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'listening' && detail.listening && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">
              Xom ball: {detail.listening.raw} · Band {detail.listening.band.toFixed(1)}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} className="accent-accent" />
              Faqat xatolar
            </label>
          </div>
          {detail.listening.parts.map((part) => (
            <div key={part.order} className="mb-6">
              <p className="text-sm font-bold text-ink mb-2">Part {part.order}</p>
              {part.transcript && (
                <details className="border border-border rounded-xl mb-3 bg-surface">
                  <summary className="px-4 py-2.5 text-sm font-semibold text-ink cursor-pointer">Transkript</summary>
                  <p className="px-4 pb-3 text-sm leading-relaxed text-ink whitespace-pre-wrap">{part.transcript}</p>
                </details>
              )}
              <div className="border border-border rounded-xl overflow-hidden">
                {part.questions.filter((q) => !onlyErrors || !q.correct).map((q) => (
                  <ReviewQuestionRow key={q.number} question={q} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'writing' && detail.writing && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-ink text-center">Band {detail.writing.band.toFixed(1)}</p>
          <WritingScoreCard title="Task 1" score={detail.writing.task1} essayText={detail.writing.essays.task1} />
          <WritingScoreCard title="Task 2" score={detail.writing.task2} essayText={detail.writing.essays.task2} />
        </div>
      )}
    </div>
  );
}
