// Ikonka-tugma — `label` MAJBURIY prop (aria-label sifatida ishlatiladi). Bu
// T2 (VOCABLY-TZ.md 1.4/17.1: "72 ta belgilanmagan tugma") muammosini yangi
// kod uchun ildizidan yopadi — shu komponent orqali yaratilgan ikonka-tugma
// hech qachon skrinriderga nomsiz chiqmaydi. `title` berilmasa, label vizual
// tooltip sifatida ham ishlatiladi.
'use client';
import { forwardRef } from 'react';

// `ghost` hover foni --color-bg-sunken — Button.jsx'dagi bilan bir xil sabab
// (--color-primary-soft dark-mode'da invert bo'lmaydi).
const VARIANTS = {
  ghost: 'text-muted hover:text-ink hover:bg-bg-sunken',
  'ghost-on-primary': 'text-on-primary/60 hover:text-on-primary hover:bg-primary-hover',
  accent: 'text-accent hover:bg-accent-soft',
  danger: 'text-danger hover:bg-danger-soft',
};

// md: mobilda 44px (bosish maydoni qoidasi), md+ da avvalgidek 40px.
const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11 md:w-10 md:h-10',
  lg: 'w-11 h-11',
};

/**
 * @typedef {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   icon?: import('react').ElementType,
 *   label: string,
 *   variant?: 'ghost' | 'ghost-on-primary' | 'accent' | 'danger',
 *   size?: 'sm' | 'md' | 'lg',
 *   active?: boolean,
 * }} IconButtonProps
 */
const IconButton = forwardRef(
  /**
   * @param {IconButtonProps} props
   * @param {import('react').ForwardedRef<HTMLButtonElement>} ref
   */
  function IconButton(
    { icon: Icon, label, variant = 'ghost', size = 'md', active, title, className = '', ...props },
    ref,
  ) {
    // active berilganda (toggle) holat skrinriderga ham aytiladi.
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={active === undefined ? undefined : !!active}
        className={`inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          active ? 'bg-accent text-on-accent hover:bg-accent-hover' : VARIANTS[variant]
        } ${SIZES[size]} ${className}`}
        {...props}
        title={title ?? label}
      >
        {Icon && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 15 : 18} aria-hidden="true" />}
      </button>
    );
  },
);

export default IconButton;
