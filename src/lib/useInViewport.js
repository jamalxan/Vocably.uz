'use client';
import { useEffect, useRef, useState } from 'react';

// C-12 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 K) — IntersectionObserver
// asosida: qaytarilgan ref biriktirilgan element birinchi marta ekranga (yoki
// `rootMargin` bilan kengaytirilgan zonaga) kirganda `inView` `true`ga o'tadi va
// SHU ZAHOTI kuzatish to'xtaydi (keyin ro'yxatdan chiqib-qayta kirsa ham qayta
// hisoblanmaydi — media bir marta so'ralsa yetarli, qayta-qayta fetch qilinmasin).
// MessageBubble.jsx'dagi Image/Video/File pufakchalar shu hook orqali
// useAuthedMediaUrl'ga mediaKey'ni FAQAT `inView` bo'lganda uzatadi (aks holda
// `null` — hook hech qanday so'rov yubormaydi, src/lib/useAuthedMedia.js'ga qarang).
export function useInViewport(rootMargin = '200px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      // Juda eski brauzer — lazy-load imkoni yo'q, darhol yuklaymiz (funksionallik
      // performance'dan ustun).
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
