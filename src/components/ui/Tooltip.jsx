// Faqat CSS bilan ishlaydigan yengil tooltip (JS pozitsiyalash kutubxonasi yo'q,
// shuning uchun hech qanday tashqi paket qo'shilmaydi). `side="right"` — standart.
// aria-hidden: nom trigger'ning o'z aria-label'idan o'qiladi (ikki marta o'qilmasin).
// Hover faqat haqiqiy hover bor qurilmalarda — sensorli ekranda tapdan keyin osilib qolmaydi.
// Diqqat: overflow-hidden ota ichida (masalan planshet rail) kesilib qoladi.
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
        aria-hidden="true"
        className={`pointer-events-none absolute z-50 whitespace-nowrap px-2 py-1 rounded-md bg-primary text-on-primary text-xs font-medium opacity-0 scale-95 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:scale-100 group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:scale-100 transition-[opacity,transform] duration-150 ${position}`}
      >
        {label}
      </span>
    </span>
  );
}
