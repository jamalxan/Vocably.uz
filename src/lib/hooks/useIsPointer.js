'use client';
import { useMediaQuery } from '@/lib/useMediaQuery';

// Aniq ko'rsatkichli (sichqoncha/trackpad) qurilma — PARITY_PLAN WP8.9: menyular shu yerda tugmaga
// bog'langan popover, sensorli ekranda pastdan chiquvchi varaq. Ekran kengligi emas, kiritish turi
// hal qiladi (keng planshetda ham varaq, tor desktop oynasida ham popover).
export const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export function useIsPointer() {
  return useMediaQuery(POINTER_QUERY);
}
