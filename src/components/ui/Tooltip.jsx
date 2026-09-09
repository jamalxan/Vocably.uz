// Faqat CSS bilan ishlaydigan yengil tooltip (JS pozitsiyalash kutubxonasi yo'q,
// shuning uchun hech qanday tashqi paket qo'shilmaydi). AppShell'ning planshet
// "rail" holatida (72px, faqat ikonka) har bir nav elementi label'ini shu bilan
// ko'rsatadi. `side="right"` — rail chap tomonda bo'lgani uchun standart.
export default function Tooltip({ label, side = 'right', children, className = '' }) {
  const position =
    side === 'right'
      ? 'left-full ml-2 top-1/2 -translate-y-1/2'
      : side === 'top'
        ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
        : 'top-full mt-2 left-1/2 -translate-x-1/2';

  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap px-2 py-1 rounded-md bg-primary text-on-primary text-xs font-medium opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-150 ${position}`}
      >
        {label}
      </span>
    </span>
  );
}
