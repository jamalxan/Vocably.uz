'use client';

// SRS holat tokenlari — ikkala temada ham bir-biridan va fondan ajralib turadi
// (bg-primary dark'da invert bo'lmaydi, bg-border esa fonga singib ketardi).
const SEGMENTS = [
  { key: 'new', label: 'Yangi', color: 'bg-srs-new' },
  { key: 'learning', label: "O'rganilmoqda", color: 'bg-srs-learning' },
  { key: 'young', label: 'Mustahkam', color: 'bg-srs-review' },
  { key: 'mastered', label: "O'zlashtirilgan", color: 'bg-srs-mastered' },
];

export default function MasteryBreakdown({ mastery }) {
  const total = SEGMENTS.reduce((sum, s) => sum + (mastery[s.key] || 0), 0);

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">O'zlashtirish darajasi</p>

      {total === 0 ? (
        <p className="text-sm text-muted py-4">Hali so'z yo'q — Jadval bo'limidan qo'shing.</p>
      ) : (
        <>
          <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-bg">
            {SEGMENTS.map((s) => {
              const count = mastery[s.key] || 0;
              if (!count) return null;
              return (
                <div
                  key={s.key}
                  className={s.color}
                  style={{ width: `${(count / total) * 100}%` }}
                  title={`${s.label}: ${count}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SEGMENTS.map((s) => (
              <div key={s.key} className="flex items-center gap-2 px-1.5 py-1 -mx-1.5">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`} />
                <span className="text-xs text-muted flex-1 min-w-0 truncate">{s.label}</span>
                <span className="text-xs font-semibold text-ink font-mono tabular-nums">{mastery[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
