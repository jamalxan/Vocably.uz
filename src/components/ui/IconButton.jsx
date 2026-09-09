// Ikonka-tugma — `label` MAJBURIY prop (aria-label sifatida ishlatiladi). Bu
// T2 (VOCABLY-TZ.md 1.4/17.1: "72 ta belgilanmagan tugma") muammosini yangi
// kod uchun ildizidan yopadi — shu komponent orqali yaratilgan ikonka-tugma
// hech qachon skrinriderga nomsiz chiqmaydi. `title` berilmasa, label vizual
// tooltip sifatida ham ishlatiladi.
'use client';
import { forwardRef } from 'react';

const VARIANTS = {
  ghost: 'text-muted hover:text-ink hover:bg-primary-soft/40',
  'ghost-on-primary': 'text-on-primary/60 hover:text-on-primary hover:bg-primary-hover',
  accent: 'text-accent hover:bg-accent-soft',
  danger: 'text-danger hover:bg-danger-soft',
};

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-11 h-11',
};

const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', active = false, className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={props.title ?? label}
      className={`inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
        active ? 'bg-accent text-on-accent hover:bg-accent-hover' : VARIANTS[variant]
      } ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 15 : 18} />}
    </button>
  );
});

export default IconButton;
