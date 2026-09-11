'use client';
import { useEffect, useState } from 'react';

// TZ-vocably-v2.md §9.1 — "'Listening tugadi' ekrani (10s sanoq)" / "'Reading
// tugadi' ekrani (10s)". Real imtihonda tanaffus yo'q — bu uzoq tanaffus emas,
// faqat qisqa o'tish signali (§9.1: "shuning uchun 10 soniyalik o'tish
// ekrani, uzoq tanaffus emas"). `[data-exam]` ICHIDA — hali imtihon davom
// etyapti, faqat bo'limlar orasidagi qisqa pauza.
const TRANSITION_SEC = 10;

export interface SectionTransitionProps {
  completedLabel: string; // "Listening", "Reading"
  nextLabel: string; // "Reading", "Writing"
  onComplete: () => void;
}

export default function SectionTransition({ completedLabel, nextLabel, onComplete }: SectionTransitionProps) {
  const [remaining, setRemaining] = useState(TRANSITION_SEC);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, TRANSITION_SEC - Math.floor((Date.now() - start) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onComplete();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedLabel, nextLabel]);

  return (
    <div data-exam="" className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 text-center px-6" style={{ background: 'var(--exam-bg)' }}>
      <p className="text-lg font-bold" style={{ color: 'var(--exam-text)' }}>
        {completedLabel} tugadi
      </p>
      <p className="text-sm" style={{ color: 'var(--exam-muted)' }}>
        {nextLabel} bo&apos;limi {remaining} soniyadan keyin boshlanadi
      </p>
    </div>
  );
}
