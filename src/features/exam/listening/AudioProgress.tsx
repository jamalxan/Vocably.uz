'use client';

// TZ-vocably-v2.md §7.3 — "Progress bar: 4px balandlik, pointer-events: none,
// --exam-accent rangida to'ladi." Foydalanuvchi bu orqali SEEK QILOLMAYDI
// (§7.1 "seek bloklanadi" qoidasi) — shuning uchun pointer-events: none
// shart, boshqa progress-bar'lardan farqli bu FAQAT ko'rsatkich.
export interface AudioProgressProps {
  positionSec: number;
  durationSec: number;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export default function AudioProgress({ positionSec, durationSec }: AudioProgressProps) {
  const pct = durationSec > 0 ? Math.min(100, (positionSec / durationSec) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-1 rounded-full overflow-hidden pointer-events-none"
        style={{ background: 'var(--exam-chrome-border)' }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Audio pozitsiyasi"
      >
        <div className="h-full" style={{ width: `${pct}%`, background: 'var(--exam-accent)' }} />
      </div>
      <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'var(--exam-muted)' }}>
        {formatTime(positionSec)} / {formatTime(durationSec)}
      </span>
    </div>
  );
}
