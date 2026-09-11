// TZ-vocably-v2.md §4.1 (IELTS CD Exam Engine v1.0) — "eng muhim xavfsizlik qoidasi":
// exam rejimda `GET /attempts/:id` javobida to'g'ri javob va boshqa "kaliti"
// maydonlar (answer, explanationHtml, locatorParagraph, transcript, sampleAnswer,
// markingNotes) BO'LMASLIGI kerak. Bu funksiya API route'dan chaqiriladi — route
// hech qachon xom `Test` obyektini to'g'ridan-to'g'ri javob sifatida yubormaydi.
//
// Blind recursive key-delete ATAYLAB ishlatilmadi: har maydon `types.ts`dagi
// Sanitized* turlariga mos ravishda ANIQ ro'yxatlanadi, shunda TypeScript o'zi
// yangi maxfiy maydon qo'shilib-u sanitizatsiyaga kiritilmay qolib ketsa xato beradi
// (SanitizedTest turi mos kelmay qoladi) — kelajakda kimdir maxfiy maydonni
// e'tiborsiz qoldirib yubormasin degan maqsadda.
import type {
  Test,
  SanitizedTest,
  Question,
  SanitizedQuestion,
  QuestionGroup,
  SanitizedQuestionGroup,
  Passage,
  SanitizedPassage,
  ListeningPart,
  SanitizedListeningPart,
  WritingTask,
  SanitizedWritingTask,
} from './types';

function sanitizeQuestion(q: Question): SanitizedQuestion {
  const { answer, explanationHtml, locatorParagraph, ...rest } = q;
  return rest;
}

function sanitizeQuestionGroup(g: QuestionGroup): SanitizedQuestionGroup {
  return { ...g, questions: g.questions.map(sanitizeQuestion) };
}

function sanitizePassage(p: Passage): SanitizedPassage {
  return { ...p, questionGroups: p.questionGroups.map(sanitizeQuestionGroup) };
}

function sanitizeListeningPart(part: ListeningPart): SanitizedListeningPart {
  const { transcript, questionGroups, ...rest } = part;
  return { ...rest, questionGroups: questionGroups.map(sanitizeQuestionGroup) };
}

function sanitizeWritingTask(t: WritingTask): SanitizedWritingTask {
  const { sampleAnswer, markingNotes, ...rest } = t;
  return rest;
}

/** Exam (yoki review'dan tashqari har qanday) rejimda clientga yuboriladigan
 * kontentni tayyorlaydi — javob kalitlari va boshqa "orqa fon" maydonlar olib
 * tashlanadi. Review rejimida (imtihon tugagach) bu funksiya ISHLATILMAYDI —
 * o'sha holatda to'liq (sanitizatsiyalanmagan) Test + Attempt.result solishtirib
 * ko'rsatiladi (TZ §11.2), alohida `sanitizeForReview`ga hojat yo'q chunki
 * natija allaqachon topshirilgan.
 */
export function sanitizeForExam(test: Test): SanitizedTest {
  const sections: SanitizedTest['sections'] = {};

  if (test.sections.listening) {
    sections.listening = {
      ...test.sections.listening,
      parts: test.sections.listening.parts.map(sanitizeListeningPart),
    };
  }
  if (test.sections.reading) {
    sections.reading = {
      ...test.sections.reading,
      passages: test.sections.reading.passages.map(sanitizePassage),
    };
  }
  if (test.sections.writing) {
    const [task1, task2] = test.sections.writing.tasks;
    sections.writing = {
      ...test.sections.writing,
      tasks: [sanitizeWritingTask(task1), sanitizeWritingTask(task2)],
    };
  }
  if (test.sections.speaking) {
    // Faza 3'gacha maxfiy maydon yo'q — SpeakingSection to'liq public.
    sections.speaking = test.sections.speaking;
  }

  return { ...test, sections };
}
