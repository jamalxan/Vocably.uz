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
  danger: 'bg-danger text-on-danger hover:bg-danger/90 disabled:hover:bg-danger',
};

// md: mobilda (<768) kamida 44px bosish maydoni, desktop zichligi o'zgarmaydi.
const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2 min-h-11 md:min-h-0',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const BASE =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

/** @typedef {'primary' | 'secondary' | 'ghost' | 'danger'} ButtonVariant */
/** @typedef {'sm' | 'md' | 'lg'} ButtonSize */
/**
 * @typedef {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: ButtonVariant,
 *   size?: ButtonSize,
 * }} ButtonProps
 */

// Link/<a> CTA'lar uchun ham xuddi shu ko'rinish (masalan <Link className={buttonClasses()}>).
/**
 * @param {{ variant?: ButtonVariant, size?: ButtonSize, className?: string }} [opts]
 * @returns {string}
 */
export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`;
}

const Button = forwardRef(
  /**
   * @param {ButtonProps} props
   * @param {import('react').ForwardedRef<HTMLButtonElement>} ref
   */
  function Button({ variant = 'primary', size = 'md', type = 'button', className = '', children, ...props }, ref) {
    // type standart "button" — forma ichida tasodifan submit qilmasin.
    return (
      <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props}>
        {children}
      </button>
    );
  },
);

export default Button;
