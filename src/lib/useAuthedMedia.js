'use client';
import { useEffect, useState } from 'react';

// <img src>/<video src> Authorization header yubora olmaydi, shuning uchun media
// baytlarini fetch() bilan (Bearer token bilan) olib, blob URL yasaydi. Token hech
// qachon URL'ga yozilmaydi (server loglari/brauzer tarixida qolmasligi uchun).
export function useAuthedMediaUrl(mediaKey, token) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mediaKey || !token) return undefined;
    let objectUrl = null;
    let cancelled = false;

    fetch(`/api/chat/media/${mediaKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
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
    let objectUrl = null;
    let cancelled = false;

    fetch(`/api/admin/chat/media/${mediaKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaKey, token]);

  return { url, error };
}
