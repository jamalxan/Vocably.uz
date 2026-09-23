'use client';
import { RotateCcw } from 'lucide-react';

// TZ-vocably-v2.md §D1.3/§H3 — barcha AI generatsiya/baholash sahifalarida (Reading,
// Writing, Listening, Speaking, so'z boyitish) bitta xabar shakli: faqat o'zbekcha
// matn + "Qayta urinish" tugmasi + (mavjud bo'lsa) requestId. `error` — string yoki
// `{ message, requestId }`; `onRetry` berilmasa tugma ko'rsatilmaydi.
export default function AiErrorNotice({ error, onRetry, className = '' }) {
  if (!error) return null;
  const { message, requestId } = typeof error === 'string' ? { message: error, requestId: null } : error;

  return (
    <div role="alert" className={`bg-danger-soft border border-danger/20 rounded-lg px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-danger font-medium flex-1 min-w-0 break-words [overflow-wrap:anywhere]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 px-2 -mx-2 -my-1 min-h-11 md:min-h-8 rounded-lg text-xs font-semibold text-danger hover:underline hover:bg-danger/10 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <RotateCcw size={12} aria-hidden="true" /> Qayta urinish
          </button>
        )}
      </div>
      {requestId && <p className="text-[11px] text-danger/80 font-mono mt-1 select-all break-all">{requestId}</p>}
    </div>
  );
}
