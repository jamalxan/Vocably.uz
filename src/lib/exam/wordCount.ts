// TZ-vocably-v2.md §8.3 — "Haqiqiy IELTS'da so'z soni hisoblanadi va
// ko'rsatiladi — buni saqlang." Defis bilan yozilgan so'z (`well-known`) — 1 ta
// so'z (o'zi bitta bo'lak, alohida ajratilmaydi); raqam ham 1 ta so'z
// hisoblanadi (TZ §10.1 izohi bilan bir xil qoida). Faqat probel bilan
// ajratilgan, kamida bitta harf/raqamdan iborat bo'lakni "so'z" deb sanaydi —
// yolg'iz tinish belgisi ("--", "...") so'z hisoblanmaydi.
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;
}
