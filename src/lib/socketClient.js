'use client';
import { io } from 'socket.io-client';

// realtime-server/ (alohida deploy qilinadigan Node xizmat) bilan yupqa wrapper.
// NEXT_PUBLIC_REALTIME_URL sozlanmagan bo'lsa null qaytaradi — chaqiruvchi kod
// buni "realtime yo'q, fallback (polling) ishlatilsin" deb talqin qiladi
// (docs/ chat plani, "Arxitektura qarorlari" §2 — graceful degradation).
export function connectChatSocket(token) {
  const url = process.env.NEXT_PUBLIC_REALTIME_URL;
  if (!url || !token) return null;

  return io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    timeout: 5000,
  });
}
