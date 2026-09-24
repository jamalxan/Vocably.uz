'use client';
import { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

// G-2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 G — "Tab ochiq, lekin boshqa
// suhbatda bo'lsa — in-app toast") — vizual naqsh/joylashuv src/components/UndoToast.jsx
// bilan bir xil (pastki markaz, mobil'da pastki tab bar ustida) — lekin mazmuni
// boshqacha (bekor qilish emas, bosilganda suhbatni ochish) bo'lgani uchun alohida,
// kichik komponent sifatida qayta yozilgan (UndoToast'ni to'g'ridan-to'g'ri qayta
// ishlatish uni "Bekor qilish" semantikasiga qattiq bog'lab qo'yardi).
// 5s'dan keyin o'zi yopiladi (`toast` identifikatori — clientMessageId yo'qligi
// sababli conversationId+messageId+createdAt — o'zgarganda qayta boshlanadi).
export default function NewMessageToast({ toast, onOpen, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => onDismiss?.(), 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 left-4 right-20 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-5 md:max-w-sm md:w-full bg-primary text-on-primary rounded-xl shadow-card px-4 py-3 flex items-center gap-3 text-sm"
    >
      <button
        type="button"
        onClick={() => onOpen?.(toast)}
        className="flex-1 min-w-0 flex items-center gap-2.5 text-left"
      >
        <MessageCircle size={16} className="flex-shrink-0" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block font-semibold truncate">{toast.senderLabel}</span>
          <span className="block text-on-primary/80 truncate">{toast.preview}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Yopish"
        className="flex-shrink-0 p-2 -m-1 rounded-lg text-on-primary/80 hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
