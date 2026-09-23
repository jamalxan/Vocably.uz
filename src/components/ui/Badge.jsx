// Kichik yorliq/belgi — SRS holati, CEFR daraja, status ko'rsatish uchun
// (VOCABLY-TZ.md 14.4). `tone="srs-*"` FAZA 1'da kartalar holatini ko'rsatishda
// ishlatiladi (globals.css'dagi --color-srs-* tokenlariga mos).
// TZ-vocably-v2.md BUG-002 tuzatilishidan (2026-09-10) so'ng --color-primary-soft
// dark-mode'da ham invert bo'ladi (globals.css'dagi --color-primary-soft izohiga
// q.), shuning uchun `neutral` endi --color-ink (invert bo'ladigan matn tokeni)
// bilan xavfsiz juftlashadi — ikkalasi ham dark'da mos ravishda o'zgaradi.
const TONES = {
  neutral: 'bg-primary-soft text-ink',
  accent: 'bg-accent-soft text-accent-hover',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  'srs-new': 'bg-srs-new/15 text-srs-new',
  'srs-learning': 'bg-srs-learning/15 text-srs-learning',
  'srs-review': 'bg-srs-review/15 text-srs-review',
  'srs-mastered': 'bg-srs-mastered/15 text-srs-mastered',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
