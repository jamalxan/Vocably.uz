'use client';
import { useEffect, useState } from 'react';

// TZ-vocably-v2.md §7.4/§7.5 + VOCABLY-TZ.md §2.1/item 10 — uchala holat ham
// bir xil mexanizm:
//   item 10: HAR part boshlanishidan OLDIN 30s "You will have 30 seconds to
//            look at questions X-Y", keyin audio avtomatik boshlanadi.
//   §7.4: part tugagach 30s "Javoblaringizni tekshiring — 0:28", keyin
//         avtomatik keyingi partga o'tadi.
//   §7.5: audio butunlay tugagach "Endi javoblaringizni 2 daqiqa tekshirish
//         uchun vaqtingiz bor", 02:00 dan sanaydi, keyin avtomatik submit.
// Farq faqat `durationSec`/`message`/`onComplete`da — shu sabab bitta komponent.
export interface PartGapProps {
  durationSec: number;
  message: string;
  onComplete: () => void;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export default function PartGap({ durationSec, message, onComplete }: PartGapProps) {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    setRemaining(durationSec);
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, durationSec - Math.floor((Date.now() - start) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onComplete();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSec]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6" role="status" aria-live="polite">
      <p className="text-base font-semibold" style={{ color: 'var(--exam-text)' }}>
        {message}
      </p>
      <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--exam-accent)' }}>
        {formatTime(remaining)}
      </p>
    </div>
  );
}
