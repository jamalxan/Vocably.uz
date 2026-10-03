'use client';
import Link from 'next/link';
import { Target, Headphones, BookOpen, PenLine, Mic } from 'lucide-react';
import { useT } from '@/context/LocaleContext';

// EDU-01b — "Target Band / Current Estimate / Days Left", plus the latest band
// per skill so the estimate is explainable ("based on 2 of 4 skills").
// Presentational only — all data arrives in the single /api/dashboard call.
const SKILLS = [
  { key: 'listening', label: 'Listening', Icon: Headphones, href: '/app/tinglash' },
  { key: 'reading', label: 'Reading', Icon: BookOpen, href: '/app/oqish' },
  { key: 'writing', label: 'Writing', Icon: PenLine, href: '/app/yozish' },
  { key: 'speaking', label: 'Speaking', Icon: Mic, href: '/app/gapirish' },
];

function bandPct(band) {
  return Math.max(4, Math.min(100, (band / 9) * 100));
}

export default function ExamPrepCard({ examPrep }) {
  const { t } = useT();
  if (!examPrep) return null;
  const { targetBand, currentEstimate, daysLeft, skillBands, skillsCovered } = examPrep;
  const gap = targetBand != null && currentEstimate != null ? targetBand - currentEstimate : null;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Target size={13} /> {t('settings.prep')}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-muted mb-1">{t('dash.targetBand')}</p>
          {targetBand != null ? (
            <p className="text-xl font-bold text-ink tabular-nums">{targetBand.toFixed(1)}</p>
          ) : (
            <Link href="/app/profil" className="text-xs text-accent font-semibold hover:underline">
              {t('dash.setInProfile')}
            </Link>
          )}
        </div>

        <div>
          <p className="text-[11px] text-muted mb-1">{t('dash.estBand')}</p>
          <p className={`text-xl font-bold tabular-nums ${currentEstimate != null ? 'text-ink' : 'text-muted text-sm'}`}>
            {currentEstimate != null ? currentEstimate.toFixed(1) : t('dash.noneYet')}
          </p>
          {currentEstimate != null && skillsCovered > 0 && skillsCovered < 4 && (
            <p className="text-[10px] text-muted mt-0.5">{t('dash.skillsBased', { n: skillsCovered })}</p>
          )}
        </div>

        <div>
          <p className="text-[11px] text-muted mb-1">{daysLeft != null ? t('dash.untilExam') : t('dash.gap')}</p>
          {daysLeft != null ? (
            <p className="text-xl font-bold text-ink tabular-nums">
              {daysLeft >= 0 ? daysLeft : 0}
              <span className="ml-1 text-xs font-medium text-muted">{t('dash.daysUnit')}</span>
            </p>
          ) : (
            <p className={`text-xl font-bold tabular-nums ${gap != null ? (gap > 0 ? 'text-warning' : 'text-success') : 'text-muted text-sm'}`}>
              {gap != null ? (gap > 0 ? `−${gap.toFixed(1)}` : '✓') : '—'}
            </p>
          )}
        </div>
      </div>

      {skillBands && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SKILLS.map(({ key, label, Icon, href }) => {
            const band = skillBands[key];
            return (
              <Link
                key={key}
                href={href}
                className="group rounded-xl border border-border bg-bg p-3 transition-colors hover:border-accent/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <Icon size={13} className="text-accent" /> {label}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${band != null ? 'text-ink' : 'text-muted'}`}>
                    {band != null ? band.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full bg-border overflow-hidden">
                  {band != null && <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${bandPct(band)}%` }} />}
                  {targetBand != null && (
                    <span className="absolute inset-y-0 w-0.5 bg-ink/50" style={{ left: `${bandPct(targetBand)}%` }} aria-hidden="true" />
                  )}
                </div>
                {band == null && <p className="mt-1.5 text-[10px] text-muted group-hover:text-accent">{t('dash.firstTest')}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
