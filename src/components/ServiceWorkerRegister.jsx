'use client';
import { useEffect } from 'react';

// PWA (T1) uchun — public/sw.js endi app-shell'ni ham keshlaydi (faqat push
// bo'lganda emas), shuning uchun sahifa har safar ochilganda ro'yxatdan
// o'tkaziladi (ilgari faqat pushClient.js orqali, foydalanuvchi push yoqqanda
// register qilinardi — bu esa "hech qachon push yoqmagan" foydalanuvchilarni
// offline imkoniyatidan mahrum qilardi). Ikkala joyda ham chaqirilishi xavfsiz —
// brauzer bir xil scope/URL uchun registratsiyani o'zi dedupe qiladi.
// Dev rejimida o'chirilgan — Next.js HMR bilan kesh qarama-qarshiligini oldini olish uchun.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
}
