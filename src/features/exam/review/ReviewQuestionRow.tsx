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
  const statusLabel = !answered ? 'Javobsiz' : q.correct ? "To'g'ri" : "Noto'g'ri";
  const icon = (
    <span role="img" aria-label={statusLabel} title={statusLabel} className="flex-shrink-0">
      {!answered ? (
        <Circle size={16} aria-hidden="true" className="text-muted" />
      ) : q.correct ? (
        <Check size={16} aria-hidden="true" className="text-success" />
      ) : (
        <X size={16} aria-hidden="true" className="text-danger" />
      )}
    </span>
  );

  return (
    <div className={`px-4 py-3 border-b border-border last:border-0 ${!q.correct ? 'bg-danger-soft/40' : ''}`}>
      <div className="flex items-start gap-2.5">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink break-words">
            <span className="font-semibold mr-1.5">{q.number}.</span>
            {/* eslint-disable-next-line react/no-danger */}
            <span dangerouslySetInnerHTML={{ __html: q.promptHtml }} />
          </p>
          <p className="text-xs mt-1.5 text-muted break-words">
            Sizning javobingiz: <span className={q.correct ? 'text-success font-medium' : 'text-danger font-medium'}>{q.userAnswer || '—'}</span>
          </p>
          {!q.correct && (
            <p className="text-xs mt-0.5 text-muted break-words">
              To&apos;g&apos;ri javob: <span className="text-success font-medium">{q.accepted.join(' / ')}</span>
            </p>
          )}
          {q.explanationHtml && (
            // eslint-disable-next-line react/no-danger
            <p className="text-xs mt-1.5 bg-bg-sunken rounded-lg px-2.5 py-2 text-ink break-words" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
          )}
          {q.locatorParagraph && onLocate && (
            <button
              type="button"
              onClick={() => onLocate(q.locatorParagraph!)}
              className="inline-flex items-center min-h-9 -mb-2 mt-0.5 px-1 -mx-1 text-xs text-accent hover:underline font-semibold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Matnda ko&apos;rish →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
