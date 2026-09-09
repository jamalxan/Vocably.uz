// Baza tugma — VOCABLY-TZ.md 14.4 (components/ui/Button). Variant/size ranglari
// tailwind.config.js'dagi token'larga ishora qiladi, xom hex yo'q. Yangi kod shu
// yerdan foydalansin; eski, joyida yozilgan tugma className'lari FAZA 0'da
// qayta yozilmaydi (katta, tegishsiz diff bo'lardi) — ular vaqt topilganda
// bosqichma-bosqich shu komponentga ko'chadi.
'use client';
import { forwardRef } from 'react';

// MUHIM: hover foni --color-bg-sunken (dark-mode'da INVERT BO'LADI), --color-primary-soft
// EMAS — ikkinchisi doim yengil pushti bo'lib qoladi (globals.css'dagi --color-primary
// izohiga q.), text-ink (invert bo'ladigan) bilan hover paytida past kontrast beradi
// (2026-09-10'da topilgan bug klassi — Badge.jsx'dagi bilan bir xil sabab).
const VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-glow disabled:hover:bg-accent',
  secondary: 'bg-surface text-ink border border-border hover:bg-bg-sunken disabled:hover:bg-surface',
  ghost: 'bg-transparent text-ink hover:bg-bg-sunken disabled:hover:bg-transparent',
  danger: 'bg-danger text-white hover:bg-danger/90 disabled:hover:bg-danger',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
