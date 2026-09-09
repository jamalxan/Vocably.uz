// Kichik yorliq/belgi — SRS holati, CEFR daraja, status ko'rsatish uchun
// (VOCABLY-TZ.md 14.4). `tone="srs-*"` FAZA 1'da kartalar holatini ko'rsatishda
// ishlatiladi (globals.css'dagi --color-srs-* tokenlariga mos).
const TONES = {
  neutral: 'bg-primary-soft/60 text-ink-muted',
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
