'use client';
import { useT } from '@/context/LocaleContext';

// SRS holat tokenlari — ikkala temada ham bir-biridan va fondan ajralib turadi
// (bg-primary dark'da invert bo'lmaydi, bg-border esa fonga singib ketardi).
const SEGMENTS = [
  { key: 'new', color: 'bg-srs-new' },
  { key: 'learning', color: 'bg-srs-learning' },
  { key: 'young', color: 'bg-srs-review' },
  { key: 'mastered', color: 'bg-srs-mastered' },
];

export default function MasteryBreakdown({ mastery }) {
  const { t } = useT();
  const total = SEGMENTS.reduce((sum, s) => sum + (mastery[s.key] || 0), 0);
  const masteredPct = total ? Math.round(((mastery.mastered || 0) / total) * 100) : 0;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">{t('dash.masteryTitle')}</p>
        {total > 0 && (
          <p className="text-xs text-muted tabular-nums">
            <span className="font-display text-base font-bold text-ink">{masteredPct}%</span> {t('dash.seg.mastered').toLowerCase()}
          </p>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted py-4">{t('dash.noWordsYet')}</p>
      ) : (
        <>
          <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-bg-sunken/70 gap-px" role="img" aria-label={t('dash.masteryTitle')}>
            {SEGMENTS.map((s) => {
              const count = mastery[s.key] || 0;
              if (!count) return null;
              return (
                <div
                  key={s.key}
                  className={`${s.color} first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${(count / total) * 100}%` }}
                  title={`${t(`dash.seg.${s.key}`)}: ${count}`}
                />
              );
            })}
          </div>

          {/* Tor ekranda bitta ustun — yorliq ("O'rganilmoqda") qisqarib qolmasin. */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-4 gap-y-1.5">
            {SEGMENTS.map((s) => {
              const count = mastery[s.key] || 0;
              return (
                <div key={s.key} className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`} />
                  <span className="text-xs text-muted flex-1 min-w-0 leading-tight">{t(`dash.seg.${s.key}`)}</span>
                  <span className="text-xs font-semibold text-ink tabular-nums">{count}</span>
                  <span className="text-[11px] text-muted tabular-nums w-9 text-right">{Math.round((count / total) * 100)}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
