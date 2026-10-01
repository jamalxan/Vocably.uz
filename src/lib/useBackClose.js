'use client';
import { useEffect, useRef } from 'react';

// Telefonda modal/panel ochiq paytda "orqaga" (qurilma tugmasi yoki yon-chetdan surish) avval SHUNI yopishi kerak, sahifadan
// chiqarib yubormasligi. Ochilganda joriy URL bilan bitta tarix yozuvi qo'shiladi; "orqaga" shu yozuvni olib tashlaydi (popstate)
// va biz `onClose` ni chaqiramiz. Qatlam tugma/Escape bilan yopilsa — qo'shilgan yozuv `history.back()` bilan olib tashlanadi,
// lekin faqat HALI shu yozuv ustida turgan bo'lsak: qatlam ichidagi havola boshqa sahifaga o'tgan bo'lsa (navigatsiya), uni
// bekor qilib yubormaymiz.
//
// Next.js 14.2 `window.history.pushState` ni o'z ichki holati bilan o'rab, router bilan sinxron saqlaydi — shuning uchun
// o'z `state` obyektimiz xavfsiz (to'liq qayta yuklanishga olib kelmaydi). Push `setTimeout(0)` bilan kechiktiriladi: React
// StrictMode (dev) effektni ikki marta ishga tushiradi va darhol `back()` chaqirish tarixni buzardi.
let counter = 0;

/**
 * @param {boolean} open qatlam ochiqmi
 * @param {() => void} onClose qatlamni yopadigan funksiya ("orqaga" bosilganda chaqiriladi)
 */
export function useBackClose(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;
    const token = `ovl-${Date.now()}-${++counter}`;
    let pushed = false;
    let closedByBack = false;

    const onPop = () => {
      if (!pushed) return;
      closedByBack = true;
      closeRef.current?.();
    };

    const timer = setTimeout(() => {
      window.history.pushState({ vocablyOverlay: token }, '');
      pushed = true;
      window.addEventListener('popstate', onPop);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
      if (pushed && !closedByBack && window.history.state?.vocablyOverlay === token) {
        window.history.back();
      }
    };
  }, [open]);
}
