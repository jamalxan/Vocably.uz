// Imtihon sahifalari (/app/mock, /app/oqish, /app/tinglash, /app/yozish,
// /app/gapirish) — VOCABLY-TZ.md §1.5 auditi. ATAYLAB hech narsa render
// qilmaydi (sidebar yo'q, AI FAB yo'q, bildirishnoma provayderlari yo'q) —
// `ExamShell` (features/exam/shell/ExamShell.tsx) o'zi to'liq ekranli
// `[data-exam]` chrome'ni ta'minlaydi. Auth/loading holati `(exam)`dan
// TASHQARIDAGI `src/app/app/layout.jsx`da (AppProvider + Gate) hal qilinadi —
// bu yerga yetib kelganda foydalanuvchi allaqachon aniqlangan.
export default function ExamLayout({ children }) {
  return children;
}
