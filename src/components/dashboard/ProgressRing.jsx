'use client';

// Kunlik maqsad halqasi (spec §3.1 "imzo element" / §3.5 ProgressRing). To'lganda yashilga
// o'tadi — foydalanuvchi maqsadga yetganini bir qarashda ko'radi.
export default function ProgressRing({ value, max, size = 128, strokeWidth = 10, children }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = max > 0 && value >= max;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={done ? '#16A34A' : '#F59E0B'}
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
