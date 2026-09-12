'use client';
import { useEffect, useState } from 'react';

// <img src>/<video src> Authorization header yubora olmaydi, shuning uchun avval
// (auth tekshiruvi bilan) qisqa JSON so'rov orqali S3/MinIO'ning presigned GET
// URL'ini olamiz — o'sha URL o'zida vaqtinchalik imzoni olib yuradi, shuning
// uchun keyin uni to'g'ridan-to'g'ri `src`ga berish mumkin. Token hech qachon
// bu URL'ga yozilmaydi (u faqat qisqa muddatli JSON so'rovda ketadi).
//
// VOCABLY-TZ.md (chat audit) — ILGARI bu yerda butun media fayl `fetch()...blob()`
// bilan xotiraga tortib olinib, `URL.createObjectURL` bilan ko'rsatilardi. Bu
// video/rasm HECH NARSA ko'rsatmasdan to'liq yuklanishini kutishga (sezilarli
// sekinlik, hatto tez internetda ham) va `<video>`ning HTTP Range so'rovlaridan
// (forward/backward "scrub" qilish uchun zarur) butunlay mahrum bo'lishiga olib
// kelgan edi — presigned URL endi to'g'ridan-to'g'ri src bo'lgani uchun brauzer
// progressiv oqim va Range so'rovlarini o'zi, tabiiy ravishda boshqaradi.
export function useAuthedMediaUrl(mediaKey, token) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mediaKey || !token) return undefined;
    let cancelled = false;

    fetch(`/api/chat/media/${mediaKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [mediaKey, token]);

  return { url, error };
}

// Admin panel uchun — xuddi shu naqsh, lekin /api/admin/chat/media orqali (ishtirokchi
// tekshiruvisiz, faqat admin roli — o'chirilgan/audit qilinayotgan suhbat fayllarini
// ham ko'rish uchun, src/app/api/admin/chat/media/[...key]).
export function useAuthedAdminMediaUrl(mediaKey, token) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mediaKey || !token) return undefined;
    let cancelled = false;

    fetch(`/api/admin/chat/media/${mediaKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [mediaKey, token]);

  return { url, error };
}
