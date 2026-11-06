'use client';
import { useSyncExternalStore } from 'react';

// CSS media query holatiga obuna (SSR'da — false). ActionSheet (lg popover) va qo'ng'iroq PiP kartasi (md) uchun.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener?.('change', cb);
      return () => mq.removeEventListener?.('change', cb);
    },
    () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches,
    () => false
  );
}
