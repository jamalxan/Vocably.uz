// BILL-01/02 — Entitlement config. VOCABLY_TZ_FINAL_WITH_ALL_AGREED_REQUIREMENTS_2026-09-20.md
// §46.2 aynan shunday talab qiladi: "narxlarni hard-code qilmaslik va
// entitlement'larni alohida configuration sifatida saqlash kerak" — shuning
// uchun narx/feature ro'yxati FAQAT shu bitta faylda yashaydi. Pricing sahifasi
// (/narxlar), admin panel (tarif tayinlash) va AI limit tekshiruvi
// (src/lib/ai/client.js) barchasi shu yerdan o'qiydi, hech biri o'z nusxasini
// hardcode qilmaydi.
//
// Narxlar §46.2'dagi "dastlabki launch narx taklifi" — biznesning final
// tasdiqlangan narxi emas, shuning uchun keyinroq shu bitta joyda o'zgartiriladi.

/** @typedef {'free' | 'standard' | 'premium'} SubscriptionTier */

export const SUBSCRIPTION_TIERS = ['free', 'standard', 'premium'];

// FREE tarifda Writing+Speaking AI grading (baholash) uchun birgalikda
// hisoblangan oylik chegara — TZ §46.1 FREE ro'yxatidagi "Writing AI check —
// cheklangan oylik limit" / "Speaking AI practice — cheklangan oylik limit"ni
// aniq raqamga aylantiradi.
//
// Tanlangan qiymat: 10/oy. Mulohaza (muhandislik qarori, biznes tomonidan
// keyinroq real AI xarajati/konversiya ma'lumotlari asosida qayta ko'rib
// chiqilishi kutiladi — §46.2 shuni aytadi): har bir grading chaqiruvi to'liq
// LLM javobi talab qiladi (eng qimmat AI operatsiyalaridan biri, oddiy so'z
// generatsiyasidan farqli). 10 ta/oy foydalanuvchiga mahsulotni haqiqatda
// sinab ko'rish uchun yetarli (haftasiga 2-3 marta Writing/Speaking
// mashqlarini baholatish), lekin cheksiz emas — shu bilan AI xarajatini
// nazorat qiladi va STANDARD'ga o'tish uchun tabiiy turtki yaratadi.
const FREE_MONTHLY_AI_GRADING_LIMIT = 10;

export const TIER_CONFIG = {
  free: {
    label: 'Bepul',
    priceMonthly: 0,
    priceYearly: 0,
    monthlyAiGradingLimit: FREE_MONTHLY_AI_GRADING_LIMIT,
    features: [
      'Reading practice — cheklangan foydalanish',
      'Listening practice — cheklangan foydalanish',
      `Writing AI check — oyiga ${FREE_MONTHLY_AI_GRADING_LIMIT} tagacha`,
      `Speaking AI practice — oyiga ${FREE_MONTHLY_AI_GRADING_LIMIT} tagacha`,
      "Basic Vocabulary va Mini testlar",
      'Cheklangan Mini Mock imtihon',
      'Basic progress tracking',
      'Asosiy IELTS materiallari',
    ],
  },
  standard: {
    label: 'Standard',
    priceMonthly: 69000,
    priceYearly: 599000,
    monthlyAiGradingLimit: null,
    features: [
      "To'liq Reading va Listening practice",
      'Academic Writing Task 1/2 + AI feedback va band baholash',
      "4 mezon bo'yicha batafsil Writing tahlili (TA/CC/LR/GRA)",
      'Speaking Part 1/2/3 + AI feedback va pronunciation tahlili',
      "To'liq Mock testlar",
      "4 skill bo'yicha advanced analytics va weakness tahlili",
      'Personal study plan + xatolar banki (mistake notebook)',
      'Vocabulary repetition/review tizimi',
      "Reklamasiz foydalanish, yuqoriroq AI limitlari",
    ],
  },
  premium: {
    label: 'Premium',
    priceMonthly: 129000,
    priceYearly: 999000,
    monthlyAiGradingLimit: null,
    features: [
      "STANDARD'dagi barcha imkoniyatlar",
      'AI IELTS Tutor — shaxsiy adaptiv tayyorgarlik',
      'Zaif tomonlarni avtomatik aniqlash + har kunlik adaptive study plan',
      'Xatolarga asoslangan avtomatik yangi mashqlar',
      'Advanced Writing AI (paragraph-by-paragraph tahlil)',
      'Advanced Speaking conversation practice',
      'Individual Writing/Speaking/Reading/Listening generatsiya',
      'IELTS Readiness report + target band bilan progress taqqoslash',
      'Adaptive vocabulary engine, spaced repetition, advanced analytics',
      "Juda yuqori ('fair use') AI limiti",
    ],
  },
};

/** Berilgan tarif+joriy hisoblagich (currentCount, so'nggi urinishdan KEYINGI
 * qiymat) oylik AI grading chegarasidan oshganmi — pure funksiya, DB'siz
 * test qilinadi. `monthlyAiGradingLimit: null` bo'lsa (standard/premium)
 * hech qachon `true` qaytmaydi. */
export function hasReachedMonthlyLimit(tier, currentCount) {
  const config = TIER_CONFIG[tier];
  const limit = config?.monthlyAiGradingLimit;
  if (limit == null) return false;
  return Number(currentCount) > limit;
}

/** Foydalanuvchiga ko'rsatiladigan o'zbekcha xabar — FREE oylik AI grading
 * limitiga yetganda /narxlar'ga yo'naltiradi (TZ D1.3 uslubi: aniq, texnik
 * tafsilotsiz). */
export function monthlyGradingLimitMessage() {
  const limit = TIER_CONFIG.free.monthlyAiGradingLimit;
  return `Bepul reja oyligi AI baholash limitiga (${limit} ta) yetdingiz. Ko'proq uchun /narxlar sahifasidan STANDARD rejaga o'ting.`;
}
