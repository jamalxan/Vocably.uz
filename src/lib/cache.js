import { LRUCache } from 'lru-cache';

// Faqat umumiy, tez-tez o'qiladigan va soniyama-soniya aniqlik shart bo'lmagan
// ma'lumotlar uchun (masalan admin statistikasi) — foydalanuvchiga xos yoki tez
// o'zgaruvchi narsalar (kategoriyalar, chat xabarlari, joriy sessiya) hech qachon
// bu yerga qo'yilmaydi.
//
// Eslatma: Vercel serverless funksiyalari orasida xotira umumiy emas — bu kesh faqat
// bitta "issiq" (warm) funksiya nusxasi ichida ketma-ket so'rovlar orasida ishlaydi,
// global/cross-instance kesh emas (buning uchun Redis kerak bo'lardi, hozircha loyihada
// yo'q). Shunga qaramay, admin panelni tez-tez yangilash/bir nechta admin bir vaqtda
// ko'rish holatlarida haqiqiy DB yukini kamaytiradi.
const cache = new LRUCache({ max: 200, ttl: 60_000 });

/**
 * `key` bo'yicha keshda bor bo'lsa shuni qaytaradi; bo'lmasa `compute()`ni chaqirib,
 * natijani `ttlMs` (default 60s) muddatga saqlaydi va qaytaradi.
 */
export async function cached(key, compute, ttlMs) {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const value = await compute();
  cache.set(key, value, ttlMs ? { ttl: ttlMs } : undefined);
  return value;
}

/** Yozishdan keyin keshni majburiy tozalash uchun (hozircha admin/stats bevosita ishlatmaydi). */
export function invalidateCache(key) {
  cache.delete(key);
}
