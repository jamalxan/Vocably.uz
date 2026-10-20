// Vocably brend belgisi (public/brand/*.svg — Vocably-Logo-Kit). `tone="auto"`
// temaga qarab och/to'q variantni ko'rsatadi (globals.css: .brand-logo-*);
// `tone="dark-bg"` — doim to'q fon (merlot sidebar) uchun variant.
const SRC = {
  horizontal: { light: '/brand/horizontal-light.svg', dark: '/brand/horizontal-dark.svg', ratio: 4784.4 / 1137.9 },
  mark: { light: '/brand/mark-light.svg', dark: '/brand/mark-dark.svg', ratio: 856.2 / 1000 },
  stacked: { light: '/brand/stacked-light.svg', dark: '/brand/stacked-dark.svg', ratio: 1 },
};

export default function BrandLogo({ variant = 'horizontal', tone = 'auto', height = 32, className = '', alt = 'Vocably' }) {
  const v = SRC[variant];
  const width = Math.round(height * v.ratio);
  const img = (src, cls, a) => (
    // eslint-disable-next-line @next/next/no-img-element -- statik SVG, next/image optimizatsiyasi kerak emas
    <img src={src} alt={a} width={width} height={height} className={`block shrink-0 ${cls} ${className}`} style={{ height, width: 'auto' }} draggable={false} />
  );
  if (tone === 'dark-bg') return img(v.dark, '', alt);
  return (
    <>
      {img(v.light, 'brand-logo-light', alt)}
      {img(v.dark, 'brand-logo-dark', '')}
    </>
  );
}
