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
    <div className={`bg-danger-soft border border-danger/20 rounded-lg px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-danger font-medium flex-1">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline flex-shrink-0"
          >
            <RotateCcw size={12} /> Qayta urinish
          </button>
        )}
      </div>
      {requestId && <p className="text-[10px] text-danger/70 font-mono mt-1">{requestId}</p>}
    </div>
  );
}
