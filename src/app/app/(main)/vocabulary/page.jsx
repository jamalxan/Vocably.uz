'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Flame, Gamepad2, Play, RotateCw } from 'lucide-react';
import { LUGAT_MODES } from '@/components/layout/navConfig';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';

// Lug'at bo'limining kirish sahifasi (2026-11-07 qayta dizayn):
//  • tepada "Bugungi takrorlash" — bo'limning asosiy harakati, navbatdagi so'zlar soni bilan;
//  • "O'rganish" — ro'yxat, kartochka, mnemonika, zaif so'zlar, kutubxona;
//  • "Mashqlar" — faqat shu bo'limda bor ballsiz mashqlar (kollokatsiya, so'z oilasi).
//    O'yinlarni takrorlaydigan drill'lar olib tashlandi — ularning XP'li ko'rinishi /app/games'da.
// Mobilda bu bottom-nav'ning "Lug'at" tugmasi ochadigan to'liq ekranli menyu (VOCABLY-TZ.md 3.2).
// Rejim nomlari ataylab inglizcha; tavsiflar i18n (lugatmode.<key>).
const HERO_KEY = 'takrorlash';
const GROUPS = [
  { key: 'study', titleKey: 'lugat.groupStudy', hintKey: 'lugat.groupStudyHint' },
  { key: 'drill', titleKey: 'lugat.groupDrill', hintKey: 'lugat.groupDrillHint' },
];

function ModeCard({ mode, t, count }) {
  return (
    <Link
      href={mode.href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:border-accent/40 hover:shadow-premium motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
        <mode.icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-bold text-ink">{mode.label}</span>
        <span className="block truncate text-xs text-muted" title={t(`lugatmode.${mode.key}`)}>
          {t(`lugatmode.${mode.key}`)}
        </span>
      </span>
      {count != null && (
        <span className="flex-shrink-0 rounded-full bg-bg-sunken px-2.5 py-1 text-xs font-bold tabular-nums text-ink">{count}</span>
      )}
      <ArrowRight size={16} aria-hidden="true" className="flex-shrink-0 text-accent opacity-60 motion-safe:transition-all group-hover:opacity-100 motion-safe:group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function LugatIndexPage() {
  const { t } = useT();
  const { categories, activeCategory, reviewStreak, loadingApp } = useApp();

  // Daily review barcha kategoriyalardan takrorlatadi (SpacedRepetition) — shuning uchun hero umumiy son;
  // Word list esa tepadagi faol kategoriyani ko'rsatadi, uning badge'i ham shu kategoriya soni.
  const { total, due } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- navbatni hozirgi vaqt bilan solishtirish uchun — ataylab
    const now = Date.now();
    let total = 0;
    let due = 0;
    for (const c of categories || []) {
      for (const w of c.words || []) {
        total += 1;
        const next = w.stats?.nextReview ? new Date(w.stats.nextReview).getTime() : 0;
        if (next <= now) due += 1;
      }
    }
    return { total, due };
  }, [categories]);

  const hero = LUGAT_MODES.find((m) => m.key === HERO_KEY);
  const ready = !loadingApp;
  const counts = { jadval: ready ? (activeCategory?.words?.length ?? 0) : null };

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">{t('lugat.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('lugat.prompt')}</p>
      </div>

      {/* --- Bugungi takrorlash: bo'limning asosiy harakati --- */}
      {hero && (
        <Link
          href={hero.href}
          className="group relative overflow-hidden rounded-3xl bg-primary p-6 text-on-primary shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:p-7"
        >
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(110% 140% at 100% 0%, rgb(var(--color-accent) / .45), transparent 55%)' }}
            aria-hidden="true"
          />
          <RotateCw size={150} strokeWidth={1} className="pointer-events-none absolute -bottom-10 -right-6 text-on-primary/10" aria-hidden="true" />
          <span className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <span className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-on-primary/70">{hero.label} · {t('lugat.allCategories')}</span>
              <span className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold leading-none">{ready ? due : '—'}</span>
                <span className="text-sm font-semibold text-on-primary/80">{t('lugat.dueWords')}</span>
              </span>
              <span className="mt-2 block max-w-md text-sm text-on-primary/75">
                {!ready ? t('lugat.loading') : due > 0 ? t('lugat.dueHint') : total > 0 ? t('lugat.dueNone') : t('lugat.noWords')}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-3">
              {reviewStreak > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-on-primary/10 px-3 py-2 text-sm font-bold tabular-nums">
                  <Flame size={16} aria-hidden="true" /> {reviewStreak}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-on-accent shadow-glow motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5">
                <Play size={16} aria-hidden="true" fill="currentColor" /> {due > 0 ? t('lugat.startReview') : t('lugat.openReview')}
              </span>
            </span>
          </span>
        </Link>
      )}

      {GROUPS.map((group) => {
        const modes = LUGAT_MODES.filter((m) => m.key !== HERO_KEY && (m.group || 'drill') === group.key);
        if (!modes.length) return null;
        return (
          <section key={group.key} aria-labelledby={`lugat-group-${group.key}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 id={`lugat-group-${group.key}`} className="font-display text-lg font-bold text-ink">
                {t(group.titleKey)}
              </h3>
              <p className="truncate text-xs text-muted">{t(group.hintKey)}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {modes.map((mode) => (
                <ModeCard key={mode.key} mode={mode} t={t} count={counts[mode.key]} />
              ))}
            </div>
          </section>
        );
      })}

      <Link
        href="/app/games"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:border-accent/40 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-white" style={{ background: 'linear-gradient(160deg, #26163f, #e0566a)' }}>
          <Gamepad2 size={20} aria-hidden="true" />
          <span className="absolute -right-1.5 -top-1.5 inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-on-accent">
            <Box size={9} aria-hidden="true" />
            3D
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] font-bold text-ink">{t('lugat.gamesCtaTitle')}</span>
          <span className="block text-xs text-muted">{t('lugat.gamesCtaText')}</span>
        </span>
        <ArrowRight size={16} className="flex-shrink-0 text-accent motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
