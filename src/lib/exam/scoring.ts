// IELTS Academic xom ball -> band konversiyasi. github.com/jamalxan/Everest-Mock
// backend/scoring.py'dan SO'ZMA-SO'Z portlangan — jadvallar keng e'lon qilingan
// taxminiy IELTS Academic Listening/Reading konversiyasi (40 savoldan).
//
// Umumiy band = 4 bo'lim bandining o'rtachasi, rasmiy IELTS yarim-band qoidasi
// bilan yaxlitlanadi (.25 -> .5 ga, .75 -> keyingi butun songa).
//
// TZ-vocably-v2.md §10.1 (IELTS CD Exam Engine v1.0) — bu faylga qo'shimcha:
// javob solishtirish (normalize/expandOptional/isCorrect). E'TIBOR: bu eski
// Everest-Mock `isAnswerCorrect` (./engine.ts) dan FARQLI — u eski `{type, correct,
// acceptable}` meta formatiga ishlaydi, bu esa yangi engine'ning `AnswerKey`
// (types.ts) formatiga. Ikkalasi bir muddat yonma-yon yashaydi (TZ §20).

import type { AnswerKey, WordLimit } from './types';

type BandRow = [number, number, number]; // [min_raw, max_raw, band]

const LISTENING_TABLE: BandRow[] = [
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [32, 34, 7.5],
  [30, 31, 7.0],
  [26, 29, 6.5],
  [23, 25, 6.0],
  [18, 22, 5.5],
  [16, 17, 5.0],
  [13, 15, 4.5],
  [10, 12, 4.0],
  [6, 9, 3.5],
  [4, 5, 3.0],
  [3, 3, 2.5],
  [2, 2, 2.0],
  [1, 1, 1.0],
  [0, 0, 0.0],
];

const READING_TABLE: BandRow[] = [
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [33, 34, 7.5],
  [30, 32, 7.0],
  [27, 29, 6.5],
  [23, 26, 6.0],
  [19, 22, 5.5],
  [15, 18, 5.0],
  [13, 14, 4.5],
  [10, 12, 4.0],
  [8, 9, 3.5],
  [6, 7, 3.0],
  [4, 5, 2.5],
  [3, 3, 2.0],
  [1, 2, 1.0],
  [0, 0, 0.0],
];

// TZ-vocably-v2.md §10.2 (IELTS CD Exam Engine v1.0) — General Training Reading,
// Academic'dan farqli konversiya. Faqat GT modul testlari uchun ishlatiladi
// (Test.module === 'general').
//
// ⚠️ TZ hujjatining o'zi bu jadvalni faqat 15 xom balgacha (4.0 band) beradi va
// pastroq oraliqlarni yozmagan (hujjatdagi eslatma: "Bu jadvallar Cambridge
// namunalariga yaqin taxminiy qiymatlar... rasmiy jadval har test uchun biroz
// farq qiladi"). Yo'q qatorlarni O'ZIMDAN TO'QIB CHIQARMADIM — 15 dan past xom
// ball uchun `generalTrainingReadingBand` eng past ma'lum bandni (4.0) qaytaradi
// (pastga clamp, aniq oraliq emas). GT rejimi ishga tushirilishidan oldin bu
// jadval rasmiy manbadan to'ldirilishi kerak (TZ §23 kabi ochiq savol).
const GENERAL_TRAINING_READING_TABLE: BandRow[] = [
  [40, 40, 9.0],
  [39, 39, 8.5],
  [37, 38, 8.0],
  [36, 36, 7.5],
  [34, 35, 7.0],
  [32, 33, 6.5],
  [30, 31, 6.0],
  [27, 29, 5.5],
  [23, 26, 5.0],
  [19, 22, 4.5],
  [15, 18, 4.0],
];

function lookup(table: BandRow[], raw: number): number {
  const r = Math.max(0, Math.trunc(raw));
  for (const [lo, hi, band] of table) {
    if (r >= lo && r <= hi) return band;
  }
  return table[0][2]; // jadvaldan yuqori -> eng yuqori band
}

export function listeningBand(rawCorrect: number): number {
  return lookup(LISTENING_TABLE, rawCorrect);
}

export function readingBand(rawCorrect: number): number {
  return lookup(READING_TABLE, rawCorrect);
}

/** GT jadvali 15 xom balldan pastini bermaydi (yuqoridagi izohga q.) — shu oraliqda
 * eng past ma'lum bandga (4.0) clamp qilinadi, `lookup()`dagi "eng yuqori band"
 * fallback'i BU YERDA ATAYLAB ishlatilmaydi (u noto'g'ri — past ballni 9.0 qilib qo'yardi). */
export function generalTrainingReadingBand(rawCorrect: number): number {
  const r = Math.max(0, Math.trunc(rawCorrect));
  for (const [lo, hi, band] of GENERAL_TRAINING_READING_TABLE) {
    if (r >= lo && r <= hi) return band;
  }
  const lowest = GENERAL_TRAINING_READING_TABLE[GENERAL_TRAINING_READING_TABLE.length - 1];
  return r < lowest[0] ? lowest[2] : GENERAL_TRAINING_READING_TABLE[0][2];
}

/** Rasmiy IELTS yaxlitlash: .25 -> .5, .75 -> keyingi butun. */
export function roundOverall(avg: number): number {
  const base = Math.floor(avg);
  const frac = avg - base;
  if (frac < 0.25) return base;
  if (frac < 0.75) return base + 0.5;
  return base + 1;
}

export type SectionBands = {
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
};

/** Mavjud (null bo'lmagan) bo'lim bandlarining o'rtachasini oladi va yaxlitlaydi —
 * Writing/Speaking hali baholanmagan bo'lsa ham qisman umumiy ball ko'rsatish uchun. */
export function overallBand(sectionBands: SectionBands): number | null {
  const vals = Object.values(sectionBands).filter((b): b is number => b != null);
  if (vals.length === 0) return null;
  return roundOverall(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ============================================================================
// §10.1 — Javob solishtirish
// ============================================================================

/** Katta/kichik harf, aqlli tirnoq/apostrof, ortiqcha probel va oxirgi tinish
 * belgisini bir xillashtiradi — TZ §10.1 ga qat'iy mos. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'") // aqlli apostrof -> oddiy
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ') // ko'p probel -> bitta
    .replace(/[.,;:!?]+$/g, ''); // oxirgi tinish belgisi
}

/** "(the) museum" kabi ixtiyoriy qism qavsli javoblarni ikkala variantga yoyadi:
 * ["museum", "the museum"]. Qavs yo'q bo'lsa o'zgarishsiz qaytadi. */
export function expandOptional(s: string): string[] {
  const m = s.match(/\(([^)]+)\)/);
  if (!m) return [s];
  const without = s.replace(/\s*\([^)]+\)\s*/, ' ').trim();
  const withIt = s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return [without, withIt];
}

/** Bitta gap/short-answer/sentence-completion javobini `AnswerKey` bo'yicha
 * tekshiradi. Ko'p tanlovli (multi-select) savollar bu yerga kirmaydi — ular
 * to'plam sifatida solishtiriladi (TZ §10.1 izohi), alohida joyda hisoblanadi. */
export function isCorrect(user: string, key: AnswerKey, limit?: WordLimit): boolean {
  if (!user) return false;
  const u = normalize(user);

  // 1. So'z limiti tekshiruvi — oshsa noto'g'ri (yozishni to'xtatmaydi, faqat baholashda).
  if (limit) {
    const words = u.split(' ').filter(Boolean);
    if (words.length > limit.maxWords) return false;
  }

  // 2. Qabul qilinadigan javoblar (ixtiyoriy qismlar bilan yoyilgan)
  for (const raw of key.accepted) {
    for (const variant of expandOptional(raw)) {
      if (u === normalize(variant)) return true;
    }
  }

  // 3. Regex (murakkab holatlar) — admin tomonidan yoziladigan kontent, foydalanuvchi
  // kiritmasi emas, shuning uchun to'g'ridan-to'g'ri RegExp'ga beriladi.
  if (key.pattern && new RegExp(`^${key.pattern}$`, 'i').test(u)) return true;

  return false;
}
