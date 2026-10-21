'use client';
import { useCallback, useSyncExternalStore } from 'react';

// localStorage'dagi matn qiymati uchun useSyncExternalStore: server va gidratatsiya paytida `serverValue`,
// brauzerda saqlangan qiymat. Yozish xotirada ham saqlanadi (private rejimda localStorage yopiq bo'lsa ham ishlaydi).
const listeners = new Set();
const memory = new Map();

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.storageArea === window.localStorage) {
      memory.delete(e.key);
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function read(key) {
  if (memory.has(key)) return memory.get(key);
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useLocalStorageString(key, serverValue = null) {
  const value = useSyncExternalStore(subscribe, () => read(key), () => serverValue);
  const set = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(read(key)) : updater;
      memory.set(key, next);
      try {
        if (next == null) localStorage.removeItem(key);
        else localStorage.setItem(key, next);
      } catch {
        // xususiy rejim yoki kvota — qiymat shu sessiyada xotirada qoladi
      }
      listeners.forEach((l) => l());
    },
    [key]
  );
  return [value, set];
}

const noopSubscribe = () => () => {};
// Birinchi (gidratatsiya) renderda false, mount'dan keyin true — effektda setState qilmasdan.
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
