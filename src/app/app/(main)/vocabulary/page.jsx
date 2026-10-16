'use client';
import Link from 'next/link';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { LUGAT_MODES } from '@/components/layout/navConfig';
import { useT } from '@/context/LocaleContext';

// Lug'at bo'limining kirish sahifasi — rejimlar ikki guruhda ko'rsatiladi (2026-10-16 auditi):
//  • "O'rganish" — SRS/kartochka/ro'yxat/mnemonika kabi faqat shu bo'limda bor usullar;
//  • "Mashq" — tez, ballsiz mashqlar. Ularning XP/kvest/reyting bilan ishlaydigan, server
//    tomonidan baholanadigan ko'rinishi Games bo'limida (TZ §9) — shuning uchun pastda havola bor.
// Mobilda bu bottom-nav'ning "Lug'at" tugmasi ochadigan to'liq ekranli menyu (VOCABLY-TZ.md 3.2).
// Rejim nomlari ataylab inglizcha; tavsiflar i18n (lugatmode.<key>).
const GROUPS = [
  { key: 'study', titleKey: 'lugat.groupStudy', hintKey: 'lugat.groupStudyHint' },
  { key: 'drill', titleKey: 'lugat.groupDrill', hintKey: 'lugat.groupDrillHint' },
];

function ModeCard({ mode, t }) {
  return (
    <Link
      href={mode.href}
      className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
        <mode.icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{mode.label}</p>
        <p className="text-xs text-muted truncate" title={t(`lugatmode.${mode.key}`)}>
          {t(`lugatmode.${mode.key}`)}
        </p>
      </div>
    </Link>
  );
}

export default function LugatIndexPage() {
  const { t } = useT();
  return (
    <div>
      <h2 className="text-xl font-bold text-ink font-display mb-1">{t('lugat.title')}</h2>
      <p className="text-sm text-muted mb-6">{t('lugat.prompt')}</p>
      {GROUPS.map((group) => (
        <section key={group.key} aria-labelledby={`lugat-group-${group.key}`} className="mb-7">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 id={`lugat-group-${group.key}`} className="text-xs font-semibold uppercase tracking-wider text-accent">
              {t(group.titleKey)}
            </h3>
            <p className="text-xs text-muted truncate">{t(group.hintKey)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LUGAT_MODES.filter((m) => (m.group || 'drill') === group.key).map((mode) => (
              <ModeCard key={mode.key} mode={mode} t={t} />
            ))}
          </div>
        </section>
      ))}
      <Link
        href="/app/games"
        className="flex items-center gap-3 p-4 rounded-2xl border border-accent/30 bg-accent-soft/40 hover:bg-accent-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="w-10 h-10 rounded-xl bg-accent text-on-accent flex items-center justify-center flex-shrink-0">
          <Gamepad2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{t('lugat.gamesCtaTitle')}</p>
          <p className="text-xs text-muted">{t('lugat.gamesCtaText')}</p>
        </div>
        <ArrowRight size={16} className="text-accent flex-shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}
