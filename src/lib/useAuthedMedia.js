'use client';
import { useEffect, useState } from 'react';

// Galereya/suhbat bir vaqtda o'nlab media xabarni render qilganda, har biri
// mustaqil useEffect orqali DARHOL o'z fetch'ini otadi — bularning har biri
// serverda alohida DB so'rov (admin/foydalanuvchi tekshiruvi + audit log) qiladi.
// O'nlab bunday so'rov bir millisoniyada birga kelsa, MongoDB Atlas ulanish
// pool'ini portlatib, "MongoPoolClearedError"/TLS xatolariga olib kelgan (2026-09-28
// production log'da kuzatilgan). Shu modul darajasidagi navbat orqali bir vaqtning
// o'zida ko'pi bilan MAX_CONCURRENT ta so'rov yuborilishini ta'minlaymiz — qolganlari
// navbatda kutadi, DB'ga zarba bir vaqtda emas, oqim bo'lib boradi.
const MAX_CONCURRENT = 6;
let activeCount = 0;
const queue = [];

function runNext() {
  if (activeCount >= MAX_CONCURRENT) return;
  const next = queue.shift();
  if (!next) return;
  activeCount++;
  next();
}

function enqueue(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      task().then(resolve, reject).finally(() => {
        activeCount--;
        runNext();
      });
    };
    queue.push(run);
    runNext();
  });
}

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
//
// AUTH_MIGRATION_MAP.md — `token` parametri olib tashlandi: bu JSON so'rov endi
// httpOnly cookie orqali autentifikatsiya qilinadi (src/lib/auth.js), qo'lda
// Authorization header biriktirish shart emas.
export function useAuthedMediaUrl(mediaKey) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mediaKey) return undefined;
    let cancelled = false;

    enqueue(() => {
      if (cancelled) return Promise.resolve();
      return fetch(`/api/chat/media/${mediaKey}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });
    })
      .then((data) => {
        if (!cancelled && data) setUrl(data.url);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [mediaKey]);

  return { url, error };
}

// Admin panel uchun — xuddi shu naqsh, lekin /api/admin/chat/media orqali (ishtirokchi
// tekshiruvisiz, faqat admin roli — o'chirilgan/audit qilinayotgan suhbat fayllarini
// ham ko'rish uchun, src/app/api/admin/chat/media/[...key]).
export function useAuthedAdminMediaUrl(mediaKey) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mediaKey) return undefined;
    let cancelled = false;

    enqueue(() => {
      if (cancelled) return Promise.resolve();
      return fetch(`/api/admin/chat/media/${mediaKey}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });
    })
      .then((data) => {
        if (!cancelled && data) setUrl(data.url);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [mediaKey]);

  return { url, error };
}
