'use client';
import { io } from 'socket.io-client';

// realtime-server/ (alohida deploy qilinadigan Node xizmat) bilan yupqa wrapper.
// NEXT_PUBLIC_REALTIME_URL sozlanmagan bo'lsa null qaytaradi — chaqiruvchi kod
// buni "realtime yo'q, fallback (polling) ishlatilsin" deb talqin qiladi
// (docs/ chat plani, "Arxitektura qarorlari" §2 — graceful degradation).
//
// docs/chat/CALLS_SPEC.md §3.3 — `auth` endi FUNKSIYA: socket.io-client v4 uni HAR bir ulanish
// urinishida chaqiradi, shuning uchun har avtomatik qayta ulanish yangi 60 soniyalik chipta
// bilan boradi (avval birinchi chipta muddati o'tgach har reconnect 'unauthorized' bilan
// rad etilar va socket butunlay o'chib qolardi). Chipta olinmasa bo'sh token yuboriladi —
// server 'unauthorized' qaytaradi va RealtimeProvider o'z backoff'i bilan qayta urinadi.
export function connectChatSocket(fetchTicket) {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL;
  if (!url || typeof fetchTicket !== 'function') return null;

  return io(url, {
    auth: (cb) => {
      Promise.resolve()
        .then(fetchTicket)
        .then((token) => cb({ token: token || '' }))
        .catch(() => cb({ token: '' }));
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
    timeout: 5000,
  });
}
