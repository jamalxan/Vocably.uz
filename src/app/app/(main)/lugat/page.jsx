import Link from 'next/link';
import { LUGAT_MODES } from '@/components/layout/navConfig';

// Lug'at bo'limining kirish sahifasi — 8 ta rejimni menyu sifatida ko'rsatadi.
// Mobilda bu bottom-nav'ning "Lug'at" tugmasi ochadigan to'liq ekranli menyu
// (VOCABLY-TZ.md 3.2); desktop/planshetda sidebar/rail orqali ham to'g'ridan-to'g'ri
// har bir rejimga o'tish mumkin, lekin bu sahifa hamon foydali kirish nuqtasi.
export default function LugatIndexPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink font-display mb-1">Lug'at</h2>
      <p className="text-sm text-muted mb-6">Qaysi rejimda mashq qilmoqchisiz?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LUGAT_MODES.map((mode) => (
          <Link
            key={mode.key}
            href={mode.href}
            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
              <mode.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{mode.label}</p>
              <p className="text-xs text-muted truncate">{mode.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
