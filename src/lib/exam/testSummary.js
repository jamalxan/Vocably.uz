// Test ro'yxati/intro uchun YENGIL xulosa (vaqt va savol soni). Javob kalitlari, matn, audio transkripsiya qatnashmaydi.
// ILGARI `/api/exam/tests` BARCHA chop etilgan testlarni to'liq (passage matni, savollar, javob kalitlari bilan) bazadan o'qib,
// faqat sonlarni hisoblardi — har so'rovda o'nlab MB. Endi bazaning o'zida proyeksiya bilan faqat kerakli maydonlar olinadi.

export const TEST_SUMMARY_SELECT = [
  'title',
  'module',
  'sections.listening.durationSec',
  'sections.listening.parts.questionGroups.questions.number',
  'sections.reading.durationSec',
  'sections.reading.passages.questionGroups.questions.number',
  'sections.writing.durationSec',
  'sections.writing.tasks.order',
  'sections.speaking.durationSec',
].join(' ');

function countQuestions(containers) {
  return (containers || []).reduce((sum, c) => sum + (c.questionGroups || []).reduce((s, g) => s + (g.questions || []).length, 0), 0);
}

/** `test` — TEST_SUMMARY_SELECT bilan olingan (lean) hujjat. */
export function summarizeTest(test) {
  const sections = {};
  const s = test.sections || {};
  if (s.listening) sections.listening = { durationSec: s.listening.durationSec, questionCount: countQuestions(s.listening.parts) };
  if (s.reading) sections.reading = { durationSec: s.reading.durationSec, questionCount: countQuestions(s.reading.passages) };
  if (s.writing) sections.writing = { durationSec: s.writing.durationSec, taskCount: (s.writing.tasks || []).length };
  if (s.speaking) sections.speaking = { durationSec: s.speaking.durationSec };
  return { id: String(test._id), title: test.title, module: test.module, sections };
}
