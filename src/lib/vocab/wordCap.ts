// Foydalanuvchi so'zlari User hujjati ichida (categories[].words[]) — MongoDB 16 MB hujjat chegarasi bor.
// O'lchandi (dashboard.perf.integration.test.ts): boyitilgan so'z ≈ 865 bayt, 20 000 so'z = 17.3 MB (yozib bo'lmadi).
// Shuning uchun qattiq tavan: chegaradan ~2.4x past — boshqa maydonlar (xp, chat, sessiyalar) va so'zlarning
// keyingi boyitilishi (stats, enrichment o'sishi) uchun zaxira qoldiradi. Katta limit kerak bo'lsa avval so'zlarni
// alohida kolleksiyaga ko'chirish kerak.
export const MAX_WORDS_PER_USER = 8000;

export const WORD_CAP_MESSAGE = (max = MAX_WORDS_PER_USER) =>
  `Lug'atingiz maksimal hajmga yetdi (${max.toLocaleString('en')} ta so'z). Yangi so'z qo'shish uchun eskilarini o'chiring.`;

export interface WordRoom {
  /** Qo'shish mumkin bo'lgan so'zlar soni (0 dan kam emas). */
  room: number;
  /** So'ralgan hammasi sig'adimi. */
  fits: boolean;
}

/** `current` ta so'z bor, `adding` ta qo'shilmoqchi — nechtasi sig'adi. */
export function wordRoom(current: number, adding: number, max = MAX_WORDS_PER_USER): WordRoom {
  const room = Math.max(0, max - Math.max(0, current));
  return { room, fits: adding <= room };
}
