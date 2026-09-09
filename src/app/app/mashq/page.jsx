import Link from 'next/link';
import { SKILL_SECTIONS } from '@/components/layout/navConfig';

// Mobil pastki tab-bar'ning "Mashq" tugmasi ochadigan to'liq ekranli menyu
// (VOCABLY-TZ.md 3.2) — barcha ko'nikma bo'limlari (Lug'at/Oqish/Tinglash/
// Gapirish/Yozish) shu yerdan boshlanadi. Desktop/planshetda bu bo'limlar
// sidebar'da to'g'ridan-to'g'ri ko'rinadi, lekin bu sahifa u yerda ham foydali
// kirish nuqtasi.
export default function MashqPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-ink font-display mb-1">Mashq</h2>
      <p className="text-sm text-muted mb-6">Qaysi ko'nikma ustida ishlaysiz?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SKILL_SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
              <s.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{s.label}</p>
              <p className="text-xs text-muted truncate">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
