// VOCABLY_TZ_FINAL...2026-09-20.md §52.7 — mock natijasida "skill-by-skill
// weaknesses" + "recommended next practice" kerak. TZ shu bilan birga
// "question-type weaknesses"/"vocabulary weaknesses"/"readiness trend"ni ham
// so'raydi — ULAR BU YERDA YO'Q (analytics.ts infratuzilmasi kerak, alohida
// katta ish — task hujjatiga q.). Bu modul FAQAT eng oddiy, deterministik
// qismni beradi: 3 skill band'idan ENG PASTINI topib, o'sha bo'lim uchun
// mashq tavsiyasi qaytaradi — yangi AI chaqiruvi YO'Q, sof funksiya.
export type MockSkillKey = 'listening' | 'reading' | 'writing';

export interface MockSkillBands {
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
}

export interface MockRecommendation {
  weakestSkill: MockSkillKey;
  band: number;
  message: string;
}

const SKILL_ORDER: MockSkillKey[] = ['listening', 'reading', 'writing'];

const SKILL_LABEL_UZ: Record<MockSkillKey, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
};

/** Uch skill'dan qaysi biri ENG KO'P mashqqa muhtojligini aniqlaydi (eng past
 * band). Tenglik bo'lsa `SKILL_ORDER` tartibi (Listening → Reading → Writing)
 * g'olibni belgilaydi — bu ixtiyoriy, lekin deterministik bo'lishi kerak
 * (bir xil kirish har doim bir xil natija bersin). `null`/`undefined` band —
 * hali baholanmagan (masalan Writing AI navbatida) — hisobga OLINMAYDI. Hech
 * bir band mavjud bo'lmasa `null` qaytadi. */
export function findWeakestMockSkill(bands: MockSkillBands): { skill: MockSkillKey; band: number } | null {
  let best: { skill: MockSkillKey; band: number } | null = null;
  for (const skill of SKILL_ORDER) {
    const band = bands[skill];
    if (band == null) continue;
    if (best === null || band < best.band) best = { skill, band };
  }
  return best;
}

/** §52.7 "recommended next practice" — yuqoridagi eng past skill'dan oddiy,
 * deterministik uzbek matnli tavsiya quradi. Barcha 3 band mavjud
 * bo'lmaguncha (hali Writing baholanmagan bo'lishi mumkin) ishlatilmasligi
 * kerak degan majburiyat YO'Q — chaqiruvchi (MockResult.tsx) mavjud
 * bandlarning o'zi bilan chaqiradi, natija shunga qarab moslashadi. */
export function recommendNextPractice(bands: MockSkillBands): MockRecommendation | null {
  const weakest = findWeakestMockSkill(bands);
  if (!weakest) return null;
  const label = SKILL_LABEL_UZ[weakest.skill];
  return {
    weakestSkill: weakest.skill,
    band: weakest.band,
    message: `${label} bo'limingiz eng past ko'rsatkichga ega (${weakest.band.toFixed(1)}) — shu bo'limga ko'proq mashq qiling.`,
  };
}
