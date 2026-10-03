'use client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useT } from '@/context/LocaleContext';
import ProgressRing from './ProgressRing';

// "Bugungi ish" — dashboard'ning bosh qahramoni. Har holatda (due bor / faqat yangi so'z bor /
// hammasi bajarilgan) aniq matn va harakat ko'rsatadi — bo'sh qolmaydi (spec §5.2 Blok 1).
export default function HeroCard({ due, newAvailable, reviews, goal, goalPct, onStart, totalWords }) {
  const { t } = useT();
  // A brand-new user with an empty vocabulary has nothing due either — that is
  // "not started", not "all done" (it used to congratulate them).
  const noWordsYet = totalWords === 0;
  const allDone = !noWordsYet && due === 0 && newAvailable === 0;

  const ctaLabel = due === 0 && newAvailable > 0 ? t('dash.ctaNew') : t('dash.ctaReview');

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
      <ProgressRing value={reviews} max={goal}>
        <div className="text-center">
          <p className="text-lg font-bold text-ink tabular-nums leading-none">
            {reviews}/{goal}
          </p>
          <p className="text-[11px] leading-tight text-muted mt-1">{t('dash.goalToday')}</p>
        </div>
      </ProgressRing>

      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">{t('dash.workToday')}</p>

        {noWordsYet ? (
          <>
            <p className="text-base font-semibold text-ink mb-1">{t('dash.emptyVocabTitle')}</p>
            <p className="text-sm text-muted mb-3">{t('dash.emptyVocabText')}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Link href="/app/lugat/jadval" className="inline-flex items-center min-h-10 px-4 rounded-xl bg-accent text-on-accent text-sm font-semibold hover:bg-accent-hover">
                {t('hub.addWords')}
              </Link>
              <Link href="/app/mashq" className="inline-flex items-center min-h-10 px-4 rounded-xl border border-border text-sm font-semibold text-ink hover:border-accent/40">
                {t('dash.ieltsPractice')}
              </Link>
            </div>
          </>
        ) : allDone ? (
          <>
            <p className="text-base font-semibold text-ink mb-3">{t('dash.allDone')}</p>
            <Button variant="secondary" onClick={onStart}>
              {t('dash.practiceAnyway')}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1 mb-4 text-sm text-muted">
              {due > 0 && (
                <p>
                  <span className="font-bold text-ink">{due}</span> {t('dash.dueSuffix', { n: due })}
                </p>
              )}
              {newAvailable > 0 && (
                <p>
                  <span className="font-bold text-ink">{newAvailable}</span> {t('dash.newSuffix', { n: newAvailable })}
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
