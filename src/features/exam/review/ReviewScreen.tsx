'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import ReviewQuestionRow from './ReviewQuestionRow';
import WritingScoreCard from './WritingScoreCard';
import WordSelectionCatcher from './WordSelectionCatcher';
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
  // Berilsa — tepada "Natijaga qaytish" tugmasi (natija ekraniga qaytaradi).
  onBack?: () => void;
}

const SECTION_LABEL: Record<'listening' | 'reading' | 'writing', string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
};

const ESTIMATED_NOTE = "Taxminiy konversiya — xom ball rasmiy jadval oralig'idan tashqarida";

function ScoreHeader({
  raw,
  band,
  estimated,
  onlyErrors,
  onOnlyErrorsChange,
}: {
  raw: number;
  band: number;
  estimated?: boolean;
  onlyErrors: boolean;
  onOnlyErrorsChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-semibold text-ink">
          Xom ball: {raw} · Band {band.toFixed(1)}
          {estimated && (
            <span className="ml-1 text-[11px] font-semibold text-muted" title={ESTIMATED_NOTE}>
              (taxminiy)
            </span>
          )}
        </p>
        <label className="shrink-0 flex items-center gap-2 min-h-11 md:min-h-0 text-xs text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyErrors}
            onChange={(e) => onOnlyErrorsChange(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Faqat xatolar
        </label>
      </div>
      {estimated && <p className="text-[11px] text-muted mt-0.5">{ESTIMATED_NOTE}.</p>}
    </div>
  );
}

function EmptyErrors() {
  return <p className="text-xs text-muted px-4 py-3">Bu qismda xato yo&apos;q.</p>;
}

export default function ReviewScreen({ detail, onBack }: ReviewScreenProps) {
  const availableSections = useMemo(
    () => (['listening', 'reading', 'writing'] as const).filter((k) => detail[k]),
    [detail]
  );
  const [activeSection, setActiveSection] = useState<ExamSectionKey>(availableSections[0] || 'reading');
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Natija ekranining pastidan ochilganda ko'rib chiqish tepadan boshlansin.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    window.scrollTo(0, 0);
    onBack?.();
  };

  const handleLocate = (passageOrder: number, label: string) => {
    const key = `${passageOrder}-${label}`;
    setHighlighted(key);
    const el = document.querySelector<HTMLElement>(`[data-review-paragraph="${key}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlighted((cur) => (cur === key ? null : cur)), 2500);
  };

  const navLinkClass =
    'inline-flex items-center gap-1.5 min-h-11 px-1 -mx-1 text-sm font-medium text-muted hover:text-ink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  const topBar = (
    <div className="flex items-center justify-between gap-2 mb-2">
      {onBack ? (
        <button type="button" onClick={handleBack} className={navLinkClass}>
          <ArrowLeft size={16} /> Natijaga qaytish
        </button>
      ) : (
        <Link href="/app" className={navLinkClass}>
          <ArrowLeft size={16} /> Bosh sahifa
        </Link>
      )}
      {onBack && (
        <Link href="/app" className={navLinkClass}>
          <Home size={16} /> Bosh sahifa
        </Link>
      )}
    </div>
  );

  if (availableSections.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        {topBar}
        <p className="p-8 text-center text-sm text-muted">Ko&apos;rib chiqish uchun natija topilmadi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      {topBar}
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ko&apos;rib chiqish rejimi</p>
        <p className="text-5xl font-bold text-brand-text mt-2 tabular-nums">
          {detail.overall != null ? detail.overall.toFixed(1) : '—'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
        {availableSections.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={activeSection === key}
            onClick={() => setActiveSection(key)}
            className={`min-h-11 md:min-h-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
              activeSection === key ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:border-accent/40'
            }`}
          >
            {SECTION_LABEL[key as 'listening' | 'reading' | 'writing']}
          </button>
        ))}
      </div>

      <WordSelectionCatcher>
        {activeSection === 'reading' && detail.reading && (
          <div>
            <ScoreHeader
              raw={detail.reading.raw}
              band={detail.reading.band}
              estimated={detail.reading.bandEstimated}
              onlyErrors={onlyErrors}
              onOnlyErrorsChange={setOnlyErrors}
            />
            {detail.reading.passages.map((p) => {
              const visible = p.questions.filter((q) => !onlyErrors || !q.correct);
              return (
                <div key={p.order} className="mb-6">
                  <p className="text-sm font-bold text-ink mb-2">{p.title}</p>
                  <div className="border border-border rounded-xl p-4 mb-3 max-h-[50dvh] sm:max-h-64 overflow-y-auto overscroll-contain text-sm leading-relaxed bg-surface">
                    {p.paragraphs.map((para, i) => {
                      const key = `${p.order}-${para.label || i}`;
                      return (
                        <p
                          key={i}
                          data-review-paragraph={key}
                          className={`relative mb-2 last:mb-0 transition-colors rounded ${highlighted === key ? 'bg-warning-soft' : ''}`}
                          style={{ padding: para.label ? '2px 4px 2px 24px' : '2px 4px' }}
                        >
                          {para.label && <span className="absolute left-1 font-bold text-muted">{para.label}</span>}
                          {/* eslint-disable-next-line react/no-danger */}
                          <span dangerouslySetInnerHTML={{ __html: para.html }} />
                        </p>
                      );
                    })}
                  </div>
                  <div className="border border-border rounded-xl overflow-hidden bg-surface">
                    {visible.length === 0 ? (
                      <EmptyErrors />
                    ) : (
                      visible.map((q) => (
                        <ReviewQuestionRow key={q.number} question={q} onLocate={(label) => handleLocate(p.order, label)} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === 'listening' && detail.listening && (
          <div>
            <ScoreHeader
              raw={detail.listening.raw}
              band={detail.listening.band}
              estimated={detail.listening.bandEstimated}
              onlyErrors={onlyErrors}
              onOnlyErrorsChange={setOnlyErrors}
            />
            {detail.listening.parts.map((part) => {
              const visible = part.questions.filter((q) => !onlyErrors || !q.correct);
              return (
                <div key={part.order} className="mb-6">
                  <p className="text-sm font-bold text-ink mb-2">Part {part.order}</p>
                  {part.transcript && (
                    <details className="border border-border rounded-xl mb-3 bg-surface">
                      <summary className="px-4 py-3 min-h-11 flex items-center text-sm font-semibold text-ink cursor-pointer">Transkript</summary>
                      <p className="px-4 pb-3 text-sm leading-relaxed text-ink whitespace-pre-wrap">{part.transcript}</p>
                    </details>
                  )}
                  <div className="border border-border rounded-xl overflow-hidden bg-surface">
                    {visible.length === 0 ? <EmptyErrors /> : visible.map((q) => <ReviewQuestionRow key={q.number} question={q} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === 'writing' && detail.writing && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-ink text-center">Band {detail.writing.band.toFixed(1)}</p>
            <WritingScoreCard title="Task 1" score={detail.writing.task1} essayText={detail.writing.essays.task1} />
            <WritingScoreCard title="Task 2" score={detail.writing.task2} essayText={detail.writing.essays.task2} />
          </div>
        )}
      </WordSelectionCatcher>
    </div>
  );
}
