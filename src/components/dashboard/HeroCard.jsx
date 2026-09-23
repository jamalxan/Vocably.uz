'use client';
import Button from '@/components/ui/Button';
import ProgressRing from './ProgressRing';

// "Bugungi ish" — dashboard'ning bosh qahramoni. Har holatda (due bor / faqat yangi so'z bor /
// hammasi bajarilgan) aniq matn va harakat ko'rsatadi — bo'sh qolmaydi (spec §5.2 Blok 1).
export default function HeroCard({ due, newAvailable, reviews, goal, goalPct, onStart }) {
  const allDone = due === 0 && newAvailable === 0;

  let ctaLabel = "Takrorlashni boshlash";
  if (due === 0 && newAvailable > 0) ctaLabel = 'Yangi so\'zlarni o\'rganish';

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
      <ProgressRing value={reviews} max={goal}>
        <div className="text-center">
          <p className="text-lg font-bold text-ink tabular-nums leading-none">
            {reviews}/{goal}
          </p>
          <p className="text-[11px] leading-tight text-muted mt-1">bugungi maqsad</p>
        </div>
      </ProgressRing>

      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Bugungi ish</p>

        {allDone ? (
          <>
            <p className="text-base font-semibold text-ink mb-3">Bugun hammasi bajarildi 🎉</p>
            <Button variant="secondary" onClick={onStart}>
              Baribir mashq qilish
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1 mb-4 text-sm text-muted">
              {due > 0 && (
                <p>
                  <span className="font-bold text-ink">{due}</span> ta so'z takrorlashga tayyor
                </p>
              )}
              {newAvailable > 0 && (
                <p>
                  <span className="font-bold text-ink">{newAvailable}</span> ta yangi so'z kutmoqda
                </p>
              )}
            </div>
            <Button onClick={onStart} className="px-5">
              {ctaLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
