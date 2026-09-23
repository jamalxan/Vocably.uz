// VOCABLY_TZ_FINAL...2026-09-20.md §52.1 — Mock rejimlari: Practice / Exam
// Simulation / Secure Mock. Sof, DB'siz modul (API route va client ikkalasi
// ham shu ro'yxatni ishlatadi, ATTEMPT_EVENT_TYPES bilan bir xil naqsh —
// models.js'dagi izohga q.).
export const MOCK_KINDS = ['practice', 'exam', 'secure'] as const;
export type MockKind = (typeof MOCK_KINDS)[number];

export const DEFAULT_MOCK_KIND: MockKind = 'exam';

export function isValidMockKind(value: unknown): value is MockKind {
  return typeof value === 'string' && (MOCK_KINDS as readonly string[]).includes(value);
}

/** So'rov tanasidan (`POST /api/exam/attempts`) kelgan `mockKind`ni
 * normallashtiradi: bo'lmasa (orqaga moslik — eski mock urinishlar/eski
 * klient) default 'exam', noto'g'ri qiymat bo'lsa `null` (chaqiruvchi 400
 * qaytaradi). */
export function normalizeMockKind(input: unknown): MockKind | null {
  if (input == null) return DEFAULT_MOCK_KIND;
  return isValidMockKind(input) ? input : null;
}
