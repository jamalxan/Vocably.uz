'use client';
import { useSyncExternalStore } from 'react';

// Admin paneldagi "Umumiy suhbatlar" (boshqa foydalanuvchilar suhbatlari)
// odatda yashirin — faqat adminning o'z suhbatlari ko'rinadi. "Suhbatlar"
// menyusi (yoki sahifa sarlavhasi) TAP_WINDOW_MS ichida TAPS_NEEDED marta
// bosilsa ochiladi, yana shuncha bosilsa qayta yashirinadi. Holat faqat shu
// brauzer tabida (sessionStorage) saqlanadi — tab yopilsa yana yashirin.
// Bu faqat UI darajasidagi yashirish: endpoint baribir admin huquqi bilan himoyalangan.
const STORAGE_KEY = 'vocably:admin-all-chats';
const EVENT = 'vocably:admin-all-chats-change';
const TAPS_NEEDED = 5;
const TAP_WINDOW_MS = 2000;

let taps = [];

export function isAllChatsUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, '1');
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage yo'q (private rejim) — hodisa baribir yuboriladi.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function registerChatsTap() {
  const now = Date.now();
  taps = [...taps.filter((t) => now - t < TAP_WINDOW_MS), now];
  if (taps.length >= TAPS_NEEDED) {
    taps = [];
    setUnlocked(!isAllChatsUnlocked());
  }
}

function subscribeUnlocked(cb) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useAllChatsUnlocked() {
  return useSyncExternalStore(subscribeUnlocked, isAllChatsUnlocked, () => false);
}
