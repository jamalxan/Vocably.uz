// Mock → lug'at zaifligi → tavsiya (TZ §26) va CEFR/IELTS yo'llari (TZ §46).
// Lug'at darajasi va IELTS band BIR NARSA EMAS — alohida indikatorlar.
export type IeltsSkill = 'listening' | 'reading' | 'writing' | 'speaking';

export interface SkillBands {
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
}

export interface Recommendation {
  academicWords: number;
  listeningGames: number;
  readingExercises: number;
  writingChallenges: number;
  speakingChallenges: number;
  /** Eng zaif ko'nikma (aniqlanmasa null). */
  weakestSkill: IeltsSkill | null;
  /** Foydalanuvchiga ko'rsatiladigan qisqa izoh. */
  message: string;
}

const SKILLS: IeltsSkill[] = ['listening', 'reading', 'writing', 'speaking'];

/**
 * Mock natijasi (ko'nikma bandlari) asosida shaxsiy tavsiya. Maqsad bandga qanchalik uzoq bo'lsa,
 * shuncha ko'p mashq. Ma'lumot yo'q bo'lsa — umumiy muvozanatli tavsiya.
 */
export function recommendFromMock(bands: SkillBands, targetBand: number | null | undefined): Recommendation {
  const target = targetBand && targetBand >= 4 ? targetBand : 6.5;
  const gaps: Partial<Record<IeltsSkill, number>> = {};
  let weakest: IeltsSkill | null = null;
  let worstGap = 0;
  for (const s of SKILLS) {
    const b = bands[s];
    if (b == null || !isFinite(b)) continue;
    const gap = Math.max(0, target - b);
    gaps[s] = gap;
    if (gap > worstGap) {
      worstGap = gap;
      weakest = s;
    }
  }
  const totalGap = Object.values(gaps).reduce((a, b) => a + (b || 0), 0);

  const scale = (skill: IeltsSkill, base: number, extra: number) => base + Math.round(Math.min(2, (gaps[skill] || 0) * 1.5) * extra);

  const rec: Recommendation = {
    academicWords: Math.min(40, 10 + Math.round(totalGap * 4)),
    listeningGames: scale('listening', 1, 1),
    readingExercises: scale('reading', 1, 1),
    writingChallenges: scale('writing', 1, 1),
    speakingChallenges: scale('speaking', 1, 1),
    weakestSkill: weakest,
    message: '',
  };
  rec.message = weakest
    ? `Eng zaif ko'nikma: ${labelOf(weakest)}. Avval shu yo'nalishdagi lug'atni mustahkamlang.`
    : "Lug'atni barcha ko'nikmalar bo'yicha muvozanatli mustahkamlang.";
  return rec;
}

export function labelOf(skill: IeltsSkill): string {
  return { listening: 'Tinglash', reading: "O'qish", writing: 'Yozish', speaking: 'Gapirish' }[skill];
}

// --- CEFR va IELTS yo'llari ---
export const CEFR_PATH = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const IELTS_PATH = [4.0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0] as const;

export interface CefrStep {
  level: (typeof CEFR_PATH)[number];
  total: number;
  /** mastery >= 40 (estimateVocabularyCefr bilan bir xil chegara). */
  learned: number;
  status: 'reached' | 'current' | 'upcoming';
}

/**
 * CEFR yo'li (TZ §46): har daraja bo'yicha so'zlar soni va o'zlashtirilgani. `current` — baholangan daraja
 * (`estimateVocabularyCefr`); undan pastlari `reached`, yuqorilari `upcoming`. Baholash uchun ma'lumot kam bo'lsa
 * hech biri `current` emas. IELTS band bilan ARALASHTIRILMAYDI — ular alohida ko'rsatkich.
 */
export function buildCefrPath(words: Array<{ cefr?: string; mastery?: number }>): { steps: CefrStep[]; current: string | null; unlabeled: number } {
  const current = estimateVocabularyCefr(words);
  const curIdx = current ? CEFR_PATH.indexOf(current as (typeof CEFR_PATH)[number]) : -1;
  const steps: CefrStep[] = CEFR_PATH.map((level, i) => {
    const inLevel = words.filter((w) => w.cefr === level);
    return {
      level,
      total: inLevel.length,
      learned: inLevel.filter((w) => (w.mastery || 0) >= 40).length,
      status: curIdx < 0 ? 'upcoming' : i < curIdx ? 'reached' : i === curIdx ? 'current' : 'upcoming',
    };
  });
  return { steps, current, unlabeled: words.filter((w) => !CEFR_PATH.includes(w.cefr as (typeof CEFR_PATH)[number])).length };
}

/** So'zlarning CEFR taqsimotidan foydalanuvchining lug'at darajasini baholaydi (kamida 10 ta so'z). */
export function estimateVocabularyCefr(words: Array<{ cefr?: string; mastery?: number }>): string | null {
  const rated = words.filter((w) => w.cefr && (w.mastery || 0) >= 40);
  if (rated.length < 10) return null;
  const counts: Record<string, number> = {};
  for (const w of rated) counts[w.cefr as string] = (counts[w.cefr as string] || 0) + 1;
  let level: string | null = null;
  // Eng yuqori daraja, unda kamida 15% (yoki 5 ta) o'zlashtirilgan so'z bo'lsa
  for (const c of CEFR_PATH) {
    const n = counts[c] || 0;
    if (n >= Math.max(5, rated.length * 0.15)) level = c;
  }
  return level;
}
