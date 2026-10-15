'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Yagona statistika kartasi — dashboard KPI qatori, profil statistikasi, o'yinlar
// markazi va admin statistikasi avval har biri o'z nusxasini chizardi (yorliq
// o'lchami, raqam shrifti, ikonka joyi har xil). Endi hammasi shu komponentdan:
//   label  — kichik yorliq (ikonka bilan), value — katta raqam (Sora, tabular),
//   sub    — izoh qatori, delta — foiz o'zgarish (pasayish jazolovchi rangda EMAS,
//            spec §5.2 Blok 3: muted; o'sish — success).
// `tone="sunken"` — karta ichidagi ichki panel (masalan hub hero'sidagi 4 raqam).
const TONES = {
  surface: 'bg-surface border border-border shadow-card',
  sunken: 'bg-bg-sunken/70 border border-border/60',
};

export function DeltaChip({ pct, suffix = '' }) {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return null;
  const up = pct > 0;
  const flat = pct === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const cls = flat ? 'bg-bg-sunken text-muted' : up ? 'bg-success-soft text-success' : 'bg-bg-sunken text-muted';
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums leading-none ${cls}`}>
      <Icon size={11} aria-hidden="true" />
      {Math.abs(pct)}%{suffix}
    </span>
  );
}

export default function StatTile({ icon: Icon, label, value, sub, delta, tone = 'surface', href, as: As = 'div', className = '', children, ...rest }) {
  const Tag = href ? 'a' : As;
  return (
    <Tag
      href={href}
      className={`group relative min-w-0 rounded-2xl p-4 ${TONES[tone] ?? TONES.surface} ${
        href ? 'transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent' : ''
      } ${className}`}
      {...rest}
    >
      <p className="flex items-start gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted leading-tight min-h-[2.4em] sm:min-h-0">
        {Icon && <Icon size={13} className="text-accent flex-shrink-0 -mt-px" aria-hidden="true" />}
        <span className="min-w-0">{label}</span>
      </p>
      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <p className="font-display text-2xl sm:text-[1.75rem] font-bold text-ink tabular-nums leading-none tracking-tight">{value}</p>
        <DeltaChip pct={delta} />
      </div>
      {sub && <p className="text-xs text-muted mt-1.5 truncate">{sub}</p>}
      {children}
    </Tag>
  );
}
