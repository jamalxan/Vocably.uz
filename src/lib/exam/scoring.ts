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

import type { AnswerKey, BandTable, ExamModule, WordLimit } from './types';

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
// farq qiladi"). Yo'q qatorlarni O'ZIMDAN TO'QIB CHIQARMADIM. 15 dan past xom
// ball uchun endi 4.0'ga CLAMP QILINMAYDI (bu eski xatti-harakat raw=0 bilan
// raw=14'ni bir xil 4.0 band qilib ko'rsatardi — noto'g'ri edi, audit P0-03).
// Buning o'rniga `lookupBand()` (0, 0.0) va (eng past ma'lum qator)ni bog'lovchi
// chiziqli taxminni ishlatadi va natijani `estimated: true` deb belgilaydi —
// bu ham to'qib chiqarilgan "official" raqam emas, ochiq taxmin.
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

export type BandLookup = { band: number; estimated: boolean };

function roundToHalfBand(v: number): number {
  return Math.round(v * 2) / 2;
}

/** Jadval qatoridan tashqarida qolgan (eng past qatordan ham past) xom ball uchun
 * (0 xom ball -> 0.0 band) va (eng past ma'lum qator) orasida chiziqli taxmin
 * qiladi, so'ng eng yaqin 0.5 bandga yaxlitlaydi. Aniq band emas — `estimated: true`. */
function estimateBelowTable(table: BandRow[], raw: number): number {
  const lowestRow = table[table.length - 1];
  const [lowestRaw, , lowestBand] = lowestRow;
  if (lowestRaw <= 0) return 0;
  const ratio = Math.max(0, raw) / lowestRaw;
  return roundToHalfBand(ratio * lowestBand);
}

function lookupBand(table: BandRow[], raw: number): BandLookup {
  const r = Math.max(0, Math.trunc(raw));
  for (const [lo, hi, band] of table) {
    if (r >= lo && r <= hi) return { band, estimated: false };
  }
  if (r > table[0][1]) return { band: table[0][2], estimated: false }; // jadvaldan yuqori -> eng yuqori band
  return { band: estimateBelowTable(table, r), estimated: true }; // eng past qatordan ham past -> taxmin
}

function toBandRows(table: BandTable): BandRow[] {
  return table.map((row) => [row.min, row.max, row.band] as BandRow).sort((a, b) => b[0] - a[0]);
}

/** `override` — admin testga o'ziga xos `bandTable` bersa (TZ §10.2), shu
 * ishlatiladi; aks holda standart Listening jadvali. */
export function listeningBand(rawCorrect: number, override?: BandTable): BandLookup {
  const table = override && override.length > 0 ? toBandRows(override) : LISTENING_TABLE;
  return lookupBand(table, rawCorrect);
}

/** `module` — Academic va General Training turli konversiya jadvaliga ega
 * (TZ §10.2, audit P0-03: bu yerda tanlanmasa GT test doim Academic jadvali
 * bilan baholanardi). `override` mavjud bo'lsa `module`dan ustun turadi. */
export function readingBand(rawCorrect: number, module: ExamModule = 'academic', override?: BandTable): BandLookup {
  const table =
    override && override.length > 0 ? toBandRows(override) : module === 'general' ? GENERAL_TRAINING_READING_TABLE : READING_TABLE;
  return lookupBand(table, rawCorrect);
}

/** @deprecated to'g'ridan-to'g'ri `readingBand(raw, 'general')` ishlating —
 * bu faqat eski test/chaqiruvlar buzilmasligi uchun saqlangan ingichka wrapper. */
export function generalTrainingReadingBand(rawCorrect: number): BandLookup {
  return readingBand(rawCorrect, 'general');
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

/** Mavjud (null bo'lmagan) bo'lim bandlarining o'rtachasini oladi va yaxlitlaydi.
 * Bitta bo'limli practice/drill urinish uchun ishlatiladi — u yerda "overall"
 * shunchaki shu bitta bo'lim bandining o'zi, chalkashlik yo'q. TO'LIQ (mock)
 * urinishlar uchun BUNI EMAS, pastdagi `officialStyleOverallBand()`ni ishlating —
 * audit P0-04: bu funksiya hali baholanmagan bo'limlarni e'tiborsiz qoldiradi,
 * shuning uchun mockda Writing hali navbatda turgan bo'lsa ham L+R o'rtachasini
 * "umumiy band" sifatida ko'rsatib qo'yishi mumkin edi. */
export function overallBand(sectionBands: SectionBands): number | null {
  const vals = Object.values(sectionBands).filter((b): b is number => b != null);
  if (vals.length === 0) return null;
  return roundOverall(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** TZ §5/P0-04: to'liq (mock) urinish uchun "umumiy band" faqat SHU URINISHGA
 * kiritilgan (`attemptSections`) barcha bo'limlar baholangandan keyin chiqishi
 * kerak — aks holda "partial average" rasmiy overall bandga o'xshab qolib,
 * foydalanuvchini chalg'itadi. Hali navbatda turgan (baholanmagan) bo'lim bo'lsa
 * `null` ("pending") qaytaradi — `overallBand()`dan farqli, mavjudlarni
 * "yetarli" deb hisoblamaydi. */
export function officialStyleOverallBand(attemptSections: string[], sectionBands: SectionBands): number | null {
  const relevant = attemptSections.filter(
    (s): s is keyof SectionBands => s === 'listening' || s === 'reading' || s === 'writing' || s === 'speaking'
  );
  if (relevant.length === 0) return null;
  const vals = relevant.map((s) => sectionBands[s]);
  if (vals.some((v) => v == null)) return null; // hali baholanmagan bo'lim bor -> pending
  return roundOverall((vals as number[]).reduce((a, b) => a + b, 0) / vals.length);
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

/** Ko'p tanlovli (`multiple_choice_multi`, "Choose TWO letters") savollar uchun
 * — TZ §10.1: "tartibsiz to'plam solishtiruvi... Qisman ball YO'Q (2 tadan
 * 1 tasi to'g'ri = 0)." `key.accepted` — to'g'ri javoblar to'plami (masalan
 * `['B', 'D']`). Foydalanuvchi to'plami AYNAN shu to'plamga teng bo'lishi kerak
 * — na kam, na ko'p. */
export function isSetCorrect(userValues: string[], key: AnswerKey): boolean {
  if (!userValues || userValues.length === 0) return false;
  const normalizedUser = new Set(userValues.map((v) => normalize(v)));
  const normalizedAccepted = new Set(key.accepted.map((v) => normalize(v)));
  if (normalizedUser.size !== normalizedAccepted.size) return false;
  for (const v of normalizedUser) {
    if (!normalizedAccepted.has(v)) return false;
  }
  return true;
}
