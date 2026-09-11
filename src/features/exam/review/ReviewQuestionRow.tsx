'use client';
import { Check, X, Circle } from 'lucide-react';
import type { ReviewQuestion } from '@/lib/exam/types';

// TZ-vocably-v2.md §11.2 — "Har savol yonida: ✅ / ❌ / ⚪ (javobsiz).
// Foydalanuvchi javobi + to'g'ri javob(lar) ko'rsatiladi. explanationHtml
// izoh bloki ochiladi." `locatorParagraph` bo'lsa — "Matnda ko'rish" havolasi
// tegishli paragrafga scroll qiladi (ReviewScreen.tsx — data-review-paragraph
// orqali).
export interface ReviewQuestionRowProps {
  question: ReviewQuestion;
  onLocate?: (locatorParagraph: string) => void;
}

export default function ReviewQuestionRow({ question: q, onLocate }: ReviewQuestionRowProps) {
  const answered = q.userAnswer !== '';
  const icon = !answered ? (
    <Circle size={16} className="text-muted flex-shrink-0" />
  ) : q.correct ? (
    <Check size={16} className="text-success flex-shrink-0" />
  ) : (
    <X size={16} className="text-danger flex-shrink-0" />
  );

  return (
    <div className={`px-4 py-3 border-b border-border last:border-0 ${!q.correct ? 'bg-danger-soft/40' : ''}`}>
      <div className="flex items-start gap-2.5">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink">
            <span className="font-semibold mr-1.5">{q.number}.</span>
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: q.promptHtml }} />
          </p>
          <p className="text-xs mt-1.5 text-muted">
            Sizning javobingiz: <span className={q.correct ? 'text-success font-medium' : 'text-danger font-medium'}>{q.userAnswer || '—'}</span>
          </p>
          {!q.correct && (
            <p className="text-xs mt-0.5 text-muted">
              To&apos;g&apos;ri javob: <span className="text-success font-medium">{q.accepted.join(' / ')}</span>
            </p>
          )}
          {q.explanationHtml && (
            <p className="text-xs mt-1.5 bg-bg rounded-lg px-2.5 py-2 text-ink">{q.explanationHtml}</p>
          )}
          {q.locatorParagraph && onLocate && (
            <button
              type="button"
              onClick={() => onLocate(q.locatorParagraph!)}
              className="text-xs mt-1.5 text-accent hover:underline font-semibold"
            >
              Matnda ko&apos;rish →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
