// "Yozmoqda" uchun uchta sakrovchi nuqta (PARITY_PLAN WP8.15) — animatsiya globals.css'dagi
// `.chat-typing-dot` (reduced-motion'da to'xtaydi). Matn yorlig'i yonida, dekorativ.
export default function TypingDots({ className = '' }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-end gap-[3px] h-3 ${className}`}>
      <span className="chat-typing-dot w-1 h-1 rounded-full bg-current" />
      <span className="chat-typing-dot w-1 h-1 rounded-full bg-current" />
      <span className="chat-typing-dot w-1 h-1 rounded-full bg-current" />
    </span>
  );
}

/** "yozmoqda..." → "yozmoqda" (nuqtalarni animatsiya chizadi). */
export function stripDots(label) {
  return String(label || '').replace(/[.…\s]+$/, '');
}
