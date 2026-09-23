'use client';
import { useEffect, useRef } from 'react';

// TZ-vocably-v2.md §5.4/§13 (IELTS CD Exam Engine v1.0) — taymer ko'rsatkichi.
// Vizual matn har soniyada yangilanadi, lekin ekran o'qigich (screen reader)
// e'lonlari FAQAT 10/5/1 daqiqa chegarasida beriladi (§13: "har soniyada emas") —
// shuning uchun ikkita alohida qism bor: ko'zga ko'ruvchi vaqt va yashirin
// `aria-live` matni.

const WARN_THRESHOLD_SEC = 10 * 60;
const DANGER_THRESHOLD_SEC = 5 * 60;
const FINAL_THRESHOLD_SEC = 60;

function formatMMSS(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export interface ExamTimerProps {
  remainingSec: number;
  hidden: boolean;
  /** 10/5/1 daqiqa chegarasidan o'tganda BIR MARTA chaqiriladi (toast uchun). */
  onThresholdCrossed?: (message: string) => void;
}

export default function ExamTimer({ remainingSec, hidden, onThresholdCrossed }: ExamTimerProps) {
  const announcedRef = useRef<Set<number>>(new Set());

  // Bir vaqtda bir nechta chegaradan o'tilgan bo'lsa (masalan, vaqti kam qolgan urinish
  // qayta ochilganda) faqat eng dolzarbi ko'rsatiladi. Ref komponent bilan birga
  // yaratiladi — alohida "reset" effekti StrictMode'da takroriy toast chiqarardi.
  useEffect(() => {
    const crossings: [number, string][] = [
      [FINAL_THRESHOLD_SEC, "1 daqiqa qoldi."],
      [DANGER_THRESHOLD_SEC, "5 daqiqa qoldi."],
      [WARN_THRESHOLD_SEC, "10 daqiqa qoldi."],
    ];
    const due = crossings.filter(([threshold]) => remainingSec <= threshold && !announcedRef.current.has(threshold));
    if (!due.length) return;
    for (const [threshold] of due) announcedRef.current.add(threshold);
    onThresholdCrossed?.(due[0][1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec]);

  const isDanger = remainingSec <= DANGER_THRESHOLD_SEC;
  const isWarn = !isDanger && remainingSec <= WARN_THRESHOLD_SEC;
  const justCrossedDanger = isDanger && announcedRef.current.has(DANGER_THRESHOLD_SEC);

  if (hidden) {
    return (
      <span className="text-[13px] font-semibold text-[var(--exam-muted)]">
        <span aria-hidden="true">⏱ ——:——</span>
        <span className="sr-only">Taymer yashirilgan</span>
      </span>
    );
  }

  return (
    <span
      role="timer"
      className={`text-[18px] font-semibold tabular-nums transition-colors ${
        isDanger
          ? `text-[var(--exam-danger)] ${justCrossedDanger ? 'animate-[exam-timer-pulse_600ms_ease-in-out_2]' : ''}`
          : isWarn
            ? 'text-[var(--exam-accent-soft)]'
            : 'text-[var(--exam-text)]'
      }`}
    >
      ⏱ {formatMMSS(remainingSec)}
      {/* Ekran o'qigich uchun — faqat chegaralarda yangilanadi, har soniyada emas (§13). */}
      <span className="sr-only" aria-live="polite">
        {remainingSec <= FINAL_THRESHOLD_SEC
          ? '1 daqiqa qoldi.'
          : remainingSec <= DANGER_THRESHOLD_SEC
            ? '5 daqiqa qoldi.'
            : remainingSec <= WARN_THRESHOLD_SEC
              ? '10 daqiqa qoldi.'
              : ''}
      </span>
    </span>
  );
}
