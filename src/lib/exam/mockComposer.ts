// "To'liq mock har safar BOSHQACHA bo'lsin" (2026-09-24 foydalanuvchi
// so'rovi: "full mockda reading/listening/writing mashq manbalaridan random,
// aralashgan holatda tushsin — har doim har xil, inson tamoyiliga asoslanmagan
// holatda").
//
// Avval mock BITTA nashr qilingan testni butunligicha tanlardi ($sample) —
// ya'ni Reading, Listening va Writing har doim BIR XIL kitobning BIR XIL
// testidan kelardi. Endi har bo'lim MUSTAQIL tanlanadi, shuning uchun
// kombinatsiyalar soni manbalar ko'paygan sari ko'payadi va bir xil
// foydalanuvchi ikki marta bir xil to'plamga tushishi ehtimoli keskin
// kamayadi.
//
// Bu modul SOF: DB'ga ham, tasodifiylikning o'ziga ham bog'lanmagan (`rng`
// inject qilinadi) — shuning uchun to'liq test qilinadi. DB so'rovi va
// attempt yaratish chaqiruvchida (`/api/exam/attempts`).
import type { ExamModule } from './types';

export type MockSectionKey = 'listening' | 'reading' | 'writing';
export const MOCK_SECTION_KEYS: MockSectionKey[] = ['listening', 'reading', 'writing'];

export interface SectionSource {
  testId: string;
  title: string;
  module: ExamModule | string;
  /** Shu manbadagi bo'lim kontenti (`ExamTest.sections[key]`). */
  content: unknown;
}

export interface ComposedMock {
  sections: Record<string, unknown>;
  composedFrom: { testId: string; sectionKey: MockSectionKey }[];
  /** Snapshot sarlavhasi uchun — qaysi manbalardan yig'ilgani. */
  sourceTitles: string[];
  /** Attempt qaysi `ExamTest`ga bog'lanishi kerak (birinchi bo'lim manbasi). */
  parentTestId: string;
  /** Bitta manbadan yig'ilgan bo'lsa false — ya'ni haqiqiy aralashma emas. */
  mixed: boolean;
}

function defaultRng(): number {
  return Math.random();
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

/**
 * Har bo'lim uchun mustaqil manba tanlaydi.
 *
 * `avoidTestIds` — foydalanuvchi YAQINDA ishlagan testlar: iloji bo'lsa
 * ulardan qochamiz (takroriy kontent "yangi mock"dek ko'rinmasin), lekin
 * boshqa manba bo'lmasa ularni ham ishlatamiz — mock umuman ochilmay
 * qolgandan ko'ra takroriy bo'lgani yaxshi.
 */
export function composeMock(
  pools: Record<MockSectionKey, SectionSource[]>,
  { rng = defaultRng, avoidTestIds = [] }: { rng?: () => number; avoidTestIds?: string[] } = {}
): ComposedMock | null {
  const avoid = new Set(avoidTestIds);
  const sections: Record<string, unknown> = {};
  const composedFrom: ComposedMock['composedFrom'] = [];
  const sourceTitles: string[] = [];
  const usedTestIds = new Set<string>();

  for (const key of MOCK_SECTION_KEYS) {
    const pool = pools[key] || [];
    if (pool.length === 0) return null;

    // Ustuvorlik: (1) yaqinda ishlanmagan VA bu mockda hali ishlatilmagan
    // manba, (2) yaqinda ishlanmagan, (3) nima bo'lsa shu.
    const freshAndUnused = pool.filter((s) => !avoid.has(s.testId) && !usedTestIds.has(s.testId));
    const fresh = pool.filter((s) => !avoid.has(s.testId));
    const unused = pool.filter((s) => !usedTestIds.has(s.testId));
    const chosenPool = freshAndUnused.length ? freshAndUnused : fresh.length ? fresh : unused.length ? unused : pool;

    const source = pick(chosenPool, rng);
    sections[key] = source.content;
    composedFrom.push({ testId: source.testId, sectionKey: key });
    sourceTitles.push(source.title);
    usedTestIds.add(source.testId);
  }

  return {
    sections,
    composedFrom,
    sourceTitles,
    parentTestId: composedFrom[0].testId,
    mixed: usedTestIds.size > 1,
  };
}

/** Snapshot sarlavhasi — natija sahifasida va tarixda ko'rinadi. Manbalar
 * har xil bo'lsa "Aralash mock", bitta manbadan yig'ilgan bo'lsa (platformada
 * hali kontent kam) o'sha testning o'z nomi. */
export function composedTitle(composed: ComposedMock): string {
  if (!composed.mixed) return composed.sourceTitles[0];
  return `Aralash mock — ${new Set(composed.sourceTitles).size} manbadan`;
}
