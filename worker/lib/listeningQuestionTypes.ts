// Listening-legal savol turlari ro'yxati — `worker/stages/parseListening.ts`
// (AI import sxemasi) VA `worker/orchestrator/contentGapScan.ts` (S16
// inventar auditi) IKKALASI HAM shu bitta ro'yxatga muhtoj, lekin
// `parseListening.ts`ning O'ZI `aiStageRunner`/`dependencies` orqali DB
// (Mongo `IngestJob`) va AI-chaqiruv zanjirini olib keladi — contentGapScan
// esa faqat RO'YXATNING o'ziga muhtoj, o'sha og'ir zanjirga emas. Shuning
// uchun ro'yxat shu ALOHIDA, hech qanday DB/AI import qilmaydigan faylda —
// contentGapScan birlik testlarida `@/lib/models`ni QISMAN mock qilish
// (faqat ExamTest/AgentAction/AutomationPolicy) kifoya bo'lishi uchun ham
// muhim (aks holda parseListening.ts'ning transitiv `IngestJob` importi
// mock'da yo'q hujjat haqida xato berardi — qo'lda sinovda TOPILDI).
//
// 2026-09-24 — ro'yxatning o'zi endi `src/lib/contentAgent/parsers/
// sectionParsers.ts`da (admin AI chat ham xuddi shu Listening sxemasini
// worker'siz ishlatadi); bu fayl faqat qayta eksport qiladi, shunda
// yuqoridagi izohda tasvirlangan "og'ir zanjirsiz import" xususiyati
// (contentGapScan testlari uchun muhim) saqlanib qoladi.
export { LISTENING_QUESTION_TYPES } from '@/lib/contentAgent/parsers/sectionParsers';
