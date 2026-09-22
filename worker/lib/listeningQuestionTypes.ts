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
export const LISTENING_QUESTION_TYPES = [
  'multiple_choice_single',
  'multiple_choice_multi',
  'sentence_completion',
  'short_answer',
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'summary_completion',
  'summary_completion_bank',
  'matching_features',
  'matching_sentence_endings',
  'form_completion',
];
