'use client';
import { useSyncExternalStore } from 'react';

// TZ-vocably-v2.md §12.1 — "<768px: Tab rejimi." Xuddi shu naqsh loyihaning
// boshqa joylarida ham bor (masalan chat-friends/EmojiPicker.jsx#useIsMobile)
// — bu yerda alohida nusxa, chunki chegara qiymati (`768px`, ilova bo'yicha
// umumiy `sm`/`md` breakpoint'laridan farqli, aynan TZ §12.1 jadvalidan) va
// ishlatiladigan joy (exam feature) boshqa.
const MOBILE_QUERY = '(max-width: 767px)';

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

// useSyncExternalStore — client'da mount paytidayoq to'g'ri qiymat (desktop
// layout bir lahza chaqnab ketmaydi); SSR/hydration'da esa `false`.
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}
