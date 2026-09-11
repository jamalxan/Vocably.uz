'use client';
import { useEffect } from 'react';
import { useExamStore } from './examStore';

// TZ-vocably-v2.md §4.2/§17 — "Klientdagi taymer faqat ko'rsatkich. Haqiqat
// serverda." Har soniyada `endsAt`/`serverOffset`dan `remainingSec` hisoblanadi
// (server bilan qayta so'rashsiz — shu ikkalasi allaqachon serverdan kelgan).
// Haqiqiy server bilan qayta tekshirish (drift tuzatish) — heartbeat orqali,
// `useExamStore.reconcileFromHeartbeat()` (bu hook uni chaqirmaydi, ExamShell
// keyingi qadamda heartbeat javobini shu funksiyaga uzatadi).
export function useExamTimer(onExpire?: () => void) {
  const endsAt = useExamStore((s) => s.endsAt);
  const serverOffset = useExamStore((s) => s.serverOffset);
  const setRemainingSec = useExamStore((s) => s.setRemainingSec);

  useEffect(() => {
    if (!endsAt) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAt - (Date.now() + serverOffset)) / 1000));
      setRemainingSec(remaining);
      if (remaining <= 0) onExpire?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, serverOffset]);

  return useExamStore((s) => s.remainingSec);
}
