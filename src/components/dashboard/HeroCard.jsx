'use client';
import ProgressRing from './ProgressRing';

// "Bugungi ish" — dashboard'ning bosh qahramoni. Har holatda (due bor / faqat yangi so'z bor /
// hammasi bajarilgan) aniq matn va harakat ko'rsatadi — bo'sh qolmaydi (spec §5.2 Blok 1).
export default function HeroCard({ due, newAvailable, reviews, goal, goalPct, onStart }) {
  const allDone = due === 0 && newAvailable === 0;

  let ctaLabel = "Takrorlashni boshlash";
  if (due === 0 && newAvailable > 0) ctaLabel = 'Yangi so\'zlarni o\'rganish';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cherry-900/60 to-coffee-800/60 rounded-2xl shadow-admin-card border border-cherry-800/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-racing-600/15 blur-3xl" />
      <ProgressRing value={reviews} max={goal}>
        <div className="text-center">
          <p className="text-lg font-bold text-alabaster-50 font-mono tabular-nums leading-none">
            {reviews}/{goal}
          </p>
          <p className="text-[10px] text-alabaster-600 mt-1">bugungi maqsad</p>
        </div>
      </ProgressRing>

      <div className="flex-1 text-center sm:text-left relative">
        <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">Bugungi ish</p>

        {allDone ? (
          <>
            <p className="text-base font-semibold text-alabaster-100 mb-3">Bugun hammasi bajarildi 🎉</p>
            <button
              onClick={onStart}
              className="px-4 py-2 bg-cherry-900/60 border border-cherry-700/50 hover:bg-cherry-800/70 text-alabaster-300 rounded-lg text-sm font-medium transition-colors"
            >
              Baribir mashq qilish
            </button>
          </>
        ) : (
          <>
            <div className="space-y-1 mb-4 text-sm text-alabaster-400">
              {due > 0 && (
                <p>
                  <span className="font-bold text-alabaster-50">{due}</span> ta so'z takrorlashga tayyor
                </p>
              )}
              {newAvailable > 0 && (
                <p>
                  <span className="font-bold text-alabaster-50">{newAvailable}</span> ta yangi so'z kutmoqda
                </p>
              )}
            </div>
            <button
              onClick={onStart}
              className="px-5 py-2.5 bg-gradient-to-r from-racing-600 to-racing-700 hover:from-racing-500 hover:to-racing-600 text-alabaster-50 rounded-xl text-sm font-semibold transition-all shadow-admin-glow"
            >
              {ctaLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
