'use client';

export default function CategoryProgress({ byCategory, onOpenCategory }) {
  return (
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Kategoriyalar bo'yicha</p>

      {byCategory.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">Hali kategoriya yo'q.</p>
      ) : (
        <div className="space-y-3">
          {byCategory.map((c, i) => (
            <div key={c.categoryId} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {c.mastered}/{c.total} · {c.masteryPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.masteryPct}%` }} />
                </div>
              </div>
              <button
                onClick={() => onOpenCategory(i)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
