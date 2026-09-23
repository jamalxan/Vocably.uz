'use client';

// Kunlik maqsad halqasi (spec §3.1 "imzo element" / §3.5 ProgressRing). To'lganda yashilga
// (--color-success, dark'da ham ko'rinadi) o'tadi — maqsadga yetganini bir qarashda ko'radi.
export default function ProgressRing({ value, max, size = 128, strokeWidth = 10, children }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = max > 0 && value >= max;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* rgb(var(--color-x)) — globals.css'dagi tokenlarga to'g'ridan-to'g'ri ishora (BUG-005/§B2
            hardcode-hex tuzatilishi). Bu CSS custom property, shuning uchun tema almashganda
            hech qanday JS'siz avtomatik yangilanadi. */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(var(--color-border))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={done ? 'rgb(var(--color-success))' : 'rgb(var(--color-accent))'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
