'use client';
import { useEffect, useState } from 'react';

// TZ-vocably-v2.md §12.1 — "<768px: Tab rejimi." Xuddi shu naqsh loyihaning
// boshqa joylarida ham bor (masalan chat-friends/EmojiPicker.jsx#useIsMobile)
// — bu yerda alohida nusxa, chunki chegara qiymati (`768px`, ilova bo'yicha
// umumiy `sm`/`md` breakpoint'laridan farqli, aynan TZ §12.1 jadvalidan) va
// ishlatiladigan joy (exam feature) boshqa.
const MOBILE_QUERY = '(max-width: 767px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return isMobile;
}
