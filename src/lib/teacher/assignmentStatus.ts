// TCH-01/02 MVP (VOCABLY_TZ_FINAL...2026-09-20.md §53 "student natijasini
// ko'rish") — bu yerda ENG KICHIK yetarli holat qaytariladi: har
// (student, assignment) juftligiga tegishli ExamAttempt'lar to'plamidan
// bitta yig'ma holat (+ agar baholangan bo'lsa, band) chiqariladi. Chuqur
// analitika (har xato turi, vaqt sarfi, urinishlar tarixi va h.k.) bu MVP
// doirasida ATAYLAB QILINMAGAN (buyurtma: "don't build a deep analytics
// view" — full "Teacher AI Copilot"/class analytics keyingi bosqich).
//
// DB'dan MUSTAQIL, sof funksiya — chaqiruvchi (teacher/classrooms/[id]/
// assignments route.js GET) tegishli attemptlarni OLDINDAN filtrlab beradi
// (userId + testId + section mos kelishi bo'yicha, ExamAttempt.find orqali)
// — bu yerda faqat "shu ro'yxatdan qanday YAGONA holat chiqadi" mantiqi bor.

export type AssignmentAttemptLike = {
  status: 'in_progress' | 'submitted' | 'graded' | 'expired' | 'abandoned' | string;
  result?: { overall?: number | null } | null;
  createdAt?: Date | string | number | null;
};

export type AssignmentStudentStatus =
  | { status: 'not_started'; band: null }
  | { status: 'in_progress'; band: null }
  | { status: 'graded'; band: number | null };

/**
 * Bitta (student, assignment) juftligiga tegishli BARCHA ExamAttempt'lardan
 * yagona holat chiqaradi:
 *  - attempt umuman yo'q (yoki hammasi 'expired'/'abandoned') -> 'not_started'
 *    ("expired"/"abandoned" — natijasiz qolgan urinish, hali chindan
 *    "boshlagan" hisoblanmaydi — student qayta boshlashi mumkin);
 *  - hech biri 'graded' emas, lekin kamida bittasi 'in_progress'/'submitted' -> 'in_progress';
 *  - kamida bittasi 'graded' -> 'graded', band ENG YANGI (createdAt bo'yicha)
 *    graded attemptdan olinadi — eski, pastroq/yuqoriroq band bilan
 *    chalkashtirmaslik uchun (student qayta urinib, qayta baholanishi mumkin).
 */
export function deriveAssignmentStatus(
  attempts: AssignmentAttemptLike[] | null | undefined
): AssignmentStudentStatus {
  if (!attempts || attempts.length === 0) return { status: 'not_started', band: null };

  const sorted = [...attempts].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const graded = sorted.find((a) => a.status === 'graded');
  if (graded) return { status: 'graded', band: graded.result?.overall ?? null };

  const active = sorted.find((a) => a.status === 'in_progress' || a.status === 'submitted');
  if (active) return { status: 'in_progress', band: null };

  return { status: 'not_started', band: null };
}
