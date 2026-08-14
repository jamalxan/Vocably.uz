'use client';

const SEGMENTS = [
  { key: 'new', label: 'Yangi', color: 'bg-slate-300' },
  { key: 'learning', label: "O'rganilmoqda", color: 'bg-indigo-300' },
  { key: 'young', label: 'Mustahkam', color: 'bg-indigo-500' },
  { key: 'mastered', label: "O'zlashtirilgan", color: 'bg-green-500' },
];

export default function MasteryBreakdown({ mastery }) {
  const total = SEGMENTS.reduce((sum, s) => sum + (mastery[s.key] || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">O'zlashtirish darajasi</p>

      {total === 0 ? (
        <p className="text-sm text-slate-400 py-4">Hali so'z yo'q — Jadval bo'limidan qo'shing.</p>
      ) : (
        <>
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
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
                <span className="text-xs text-slate-500 flex-1 min-w-0 truncate">{s.label}</span>
                <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">{mastery[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
