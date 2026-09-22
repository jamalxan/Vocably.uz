// TZ-vocably-v2.md §11.1/§19 Faza 3 item 17 — "Savol turi bo'yicha tahlil:
// 'TRUE/FALSE/NOT GIVEN: 2/6 — bu sizning eng zaif turingiz'". Sof hisoblash —
// DB'ga bog'liq emas, `attempt.result.perQuestion`dan (allaqachon `type` bilan
// boyitilgan, attemptServer.ts#scoreSection) ishlaydi.
import type { AttemptResult, QuestionType } from './types';

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice_single: "Ko'p tanlovli (bitta)",
  multiple_choice_multi: "Ko'p tanlovli (bir nechta)",
  sentence_completion: 'Gapni to‘ldirish',
  short_answer: 'Qisqa javob',
  note_completion: 'Qaydnomani to‘ldirish',
  table_completion: 'Jadvalni to‘ldirish',
  flowchart_completion: 'Oqim-chizmani to‘ldirish',
  summary_completion: 'Xulosani to‘ldirish',
  summary_completion_bank: 'Xulosani to‘ldirish (bankdan)',
  matching_features: 'Moslashtirish (xususiyat)',
  matching_sentence_endings: 'Gap oxirini moslashtirish',
  diagram_label: 'Diagramma yorlig‘i',
  true_false_notgiven: 'TRUE / FALSE / NOT GIVEN',
  yes_no_notgiven: 'YES / NO / NOT GIVEN',
  matching_headings: 'Sarlavhalarni moslashtirish',
  matching_information: 'Ma’lumotni moslashtirish',
  form_completion: 'Formani to‘ldirish',
  map_label: 'Xarita yorlig‘i',
  plan_label: 'Reja yorlig‘i',
};

export interface TypeAccuracy {
  type: QuestionType;
  correct: number;
  total: number;
  accuracy: number; // 0-1
}

/** Har savol turi bo'yicha to'g'ri/jami sonini hisoblaydi, ENG ZAIF turdan
 * (eng past accuracy) boshlab saralaydi. */
export function computeTypeAccuracy(perQuestion: AttemptResult['perQuestion']): TypeAccuracy[] {
  const byType = new Map<QuestionType, { correct: number; total: number }>();
  for (const q of perQuestion) {
    const entry = byType.get(q.type) || { correct: 0, total: 0 };
    entry.total += 1;
    if (q.correct) entry.correct += 1;
    byType.set(q.type, entry);
  }
  return Array.from(byType.entries())
    .map(([type, { correct, total }]) => ({ type, correct, total, accuracy: total > 0 ? correct / total : 0 }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Eng zaif turni qaytaradi (kamida 1 ta savol bo'lgan turlar orasidan) —
 * bir nechta tur bir xil eng past accuracy'ga ega bo'lsa, ko'proq savol
 * beriladigan tur ustunlik qiladi (statistik jihatdan ko'proq ishonchli). */
export function weakestType(perQuestion: AttemptResult['perQuestion']): TypeAccuracy | null {
  const sorted = computeTypeAccuracy(perQuestion);
  if (sorted.length === 0) return null;
  const lowestAccuracy = sorted[0].accuracy;
  const tied = sorted.filter((t) => t.accuracy === lowestAccuracy);
  return tied.sort((a, b) => b.total - a.total)[0];
}

// Bitta savolli tur "0% aniqlik" yoki "100% aniqlik" bo'lib chiqishi mumkin
// shunchaki tasodifdan — kuchli/zaif tomonlar ro'yxatiga faqat statistik
// jihatdan biroz ishonchliroq turlarni (kamida 2 ta savol) qo'shamiz.
const MIN_TOTAL_FOR_SIGNAL = 2;

/** To'liq savol turi bo'yicha taqsimot (jadval uchun) — kamida 2 ta savolli
 * BARCHA turlar, eng zaifidan boshlab (computeTypeAccuracy tartibida). */
export function meaningfulTypeAccuracy(perQuestion: AttemptResult['perQuestion']): TypeAccuracy[] {
  return computeTypeAccuracy(perQuestion).filter((t) => t.total >= MIN_TOTAL_FOR_SIGNAL);
}
