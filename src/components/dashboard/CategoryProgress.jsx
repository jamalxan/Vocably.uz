'use client';

export default function CategoryProgress({ byCategory, onOpenCategory }) {
  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Kategoriyalar bo'yicha</p>

      {byCategory.length === 0 ? (
        <p className="text-sm text-muted py-2">Hali kategoriya yo'q.</p>
      ) : (
        <div className="space-y-3">
          {byCategory.map((c, i) => (
            <div key={c.categoryId} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-ink truncate min-w-0" title={c.name}>
                    {c.name}
                  </span>
                  <span className="text-xs text-muted flex-shrink-0 ml-2">
                    {c.mastered}/{c.total} · {c.masteryPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${c.masteryPct}%` }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCategory(i)}
                aria-label={`${c.name} — boshlash`}
                className="flex-shrink-0 px-3 py-1.5 min-h-11 md:min-h-0 text-xs font-semibold text-accent hover:bg-accent-soft rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Boshlash
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
