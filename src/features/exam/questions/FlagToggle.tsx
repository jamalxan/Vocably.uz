'use client';
import { Flag } from 'lucide-react';
import { useExamStore } from '../state/examStore';

// VOCABLY-TZ.md §1.8 auditi — Yordam oynasida "Belgilash (flag)" tushuntirilgan
// edi, lekin UI'da hech qanday tugma yo'q edi: `examStore`da `flagged`/
// `toggleFlag` allaqachon bor edi (ExamFooterNav'dagi kichik uchburchak
// belgisi ham shundan o'qiydi), faqat ULARNI CHAQIRADIGAN tugma qayerda ham
// yo'q edi. Har savol raqami yonida shu kichik bayroqcha — bosilsa
// `toggleFlag(qNumber)`, nav panelidagi mos raqamda darhol aks etadi.
export interface FlagToggleProps {
  questionNumber: number;
}

export default function FlagToggle({ questionNumber }: FlagToggleProps) {
  const isFlagged = useExamStore((s) => s.flagged.has(questionNumber));
  const toggleFlag = useExamStore((s) => s.toggleFlag);

  return (
    <button
      type="button"
      onClick={() => toggleFlag(questionNumber)}
      aria-pressed={isFlagged}
      aria-label={isFlagged ? `Remove flag from question ${questionNumber}` : `Flag question ${questionNumber} for review`}
      title="Flag for review"
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ width: 16, height: 16, color: isFlagged ? 'var(--exam-flag)' : 'var(--exam-muted)' }}
    >
      <Flag size={12} fill={isFlagged ? 'currentColor' : 'none'} />
    </button>
  );
}
