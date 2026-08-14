'use client';
import ProgressRing from './ProgressRing';

// "Bugungi ish" — dashboard'ning bosh qahramoni. Har holatda (due bor / faqat yangi so'z bor /
// hammasi bajarilgan) aniq matn va harakat ko'rsatadi — bo'sh qolmaydi (spec §5.2 Blok 1).
export default function HeroCard({ due, newAvailable, reviews, goal, goalPct, onStart }) {
  const allDone = due === 0 && newAvailable === 0;

  let ctaLabel = "Takrorlashni boshlash";
  if (due === 0 && newAvailable > 0) ctaLabel = 'Yangi so\'zlarni o\'rganish';

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
      <ProgressRing value={reviews} max={goal}>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 font-mono tabular-nums leading-none">
            {reviews}/{goal}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">bugungi maqsad</p>
        </div>
      </ProgressRing>

      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bugungi ish</p>

        {allDone ? (
          <>
            <p className="text-base font-semibold text-slate-800 mb-3">Bugun hammasi bajarildi 🎉</p>
            <button
              onClick={onStart}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              Baribir mashq qilish
            </button>
          </>
        ) : (
          <>
            <div className="space-y-1 mb-4 text-sm text-slate-600">
              {due > 0 && (
                <p>
                  <span className="font-bold text-slate-800">{due}</span> ta so'z takrorlashga tayyor
                </p>
              )}
              {newAvailable > 0 && (
                <p>
                  <span className="font-bold text-slate-800">{newAvailable}</span> ta yangi so'z kutmoqda
                </p>
              )}
            </div>
            <button
              onClick={onStart}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-900/20"
            >
              {ctaLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
