import Link from 'next/link';
import { SKILL_SECTIONS } from '@/components/layout/navConfig';
import OfflineReviewCard from '@/components/practice/OfflineReviewCard';
import { T } from '@/context/LocaleContext';

// Mobil pastki tab-bar'ning "Mashq" tugmasi ochadigan to'liq ekranli menyu
// (VOCABLY-TZ.md 3.2) — barcha ko'nikma bo'limlari (Lug'at/Oqish/Tinglash/
// Gapirish/Yozish) shu yerdan boshlanadi. Desktop/planshetda bu bo'limlar
// sidebar'da to'g'ridan-to'g'ri ko'rinadi, lekin bu sahifa u yerda ham foydali
// kirish nuqtasi. Matnlar i18n orqali (uz/ru); bo'lim nomlari ataylab inglizcha.
export default function MashqPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-ink font-display mb-1">
        <T k="practice.title" />
      </h2>
      <p className="text-sm text-muted mb-6">
        <T k="practice.subtitle" />
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SKILL_SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium motion-safe:hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
              <s.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{s.label}</p>
              <p className="text-xs text-muted line-clamp-2">
                <T k={`skill.${s.key}`} />
              </p>
            </div>
          </Link>
        ))}
      </div>
      <OfflineReviewCard />
    </div>
  );
}
