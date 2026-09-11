// TZ-vocably-v2.md §3 (IELTS CD Exam Engine v1.0) — yagona ma'lumotlar modeli.
// Bu fayl FAQAT tur (type) e'lonlaridan iborat, runtime kodi yo'q.
//
// MUHIM: bu — YANGI exam engine (`features/exam/`, `/api/exam/attempts/*`) uchun
// tur tizimi. Eski Everest-Mock'dan portlangan dvigatel (`./engine.ts`, `./content.ts`,
// `/api/exam/[id]/*`, `ExamSession` mongoose modeli) BUZILMAYDI — TZ §20 "Migratsiya"
// qoidasi bo'yicha ikkalasi vaqtincha yonma-yon yashaydi, `/app/oqish` va boshqalar
// bosqichma-bosqich (feature-flag bilan) yangi engine'ga o'tkaziladi. Shu sabab bu
// yerdagi tur nomlari eski `engine.ts`dagi (`ExamDoc`, `SectionState`, `SectionKey`)
// nomlar bilan ATAYLAB bir xil emas.

// ============================================================================
// §3.1 — Test (kontent, admin kiritadi)
// ============================================================================

export type ExamModule = 'academic' | 'general';
export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export interface Test {
  _id: string;
  slug: string; // "cambridge-19-test-1"
  title: string; // "Cambridge IELTS 19 — Test 1"
  module: ExamModule;
  difficulty: ExamDifficulty;
  sections: {
    listening?: ListeningSection;
    reading?: ReadingSection;
    writing?: WritingSection;
    speaking?: SpeakingSection;
  };
  // §10.2 — jadvallar odatda umumiy (bandTables.ts default), lekin test o'ziga xos
  // konversiyaga muhtoj bo'lsa shu yerda ustiga yozadi.
  bandTable?: {
    listening?: BandTable;
    reading?: BandTable;
  };
  isPublished: boolean;
  createdBy: string;
  createdAt: string; // ISO
}

export type BandRow = { min: number; max: number; band: number };
export type BandTable = BandRow[];

// ============================================================================
// §3.2 — Reading
// ============================================================================

export interface ReadingSection {
  durationSec: number; // 3600 — 60 daqiqa
  passages: Passage[]; // uzunligi 3
}

export interface Passage {
  order: 1 | 2 | 3;
  title: string; // "The history of glass"
  subtitle?: string; // "Read the text and answer questions 1-13"
  paragraphs: PassageParagraph[];
  questionGroups: QuestionGroup[];
}

export interface PassageParagraph {
  label?: string; // "A", "B", "C" — matching_headings uchun
  html: string; // <p>...</p>, faqat p/em/strong/sup ruxsat
}

// ============================================================================
// §3.3 — Listening
// ============================================================================

export interface ListeningSection {
  durationSec: number; // 1800 — audio davomiyligi + 2 daq tekshirish
  checkTimeSec: number; // 120
  parts: ListeningPart[]; // uzunligi 4
}

export interface ListeningPart {
  order: 1 | 2 | 3 | 4;
  audioUrl: string; // har part alohida fayl — eng barqaror yechim
  durationSec: number;
  transcript?: string; // faqat practice rejimda, tugagandan keyin — sanitizatsiyada olib tashlanadi
  contextText?: string; // "You will hear a conversation between..."
  // §7.4 — audio faylda part orasidagi "javoblaringizni tekshiring" pauzasi yo'q bo'lsa,
  // klient shu qadar sun'iy countdown ko'rsatadi.
  gapAfterSec?: number; // masalan 30
  questionGroups: QuestionGroup[];
}

// ============================================================================
// §3.4 — Writing
// ============================================================================

export interface WritingSection {
  durationSec: number; // 3600
  tasks: [WritingTask, WritingTask];
}

export interface WritingTask {
  order: 1 | 2;
  minWords: 150 | 250;
  recommendedMin: 20 | 40;
  promptHtml: string;
  imageUrl?: string; // Task 1 Academic uchun grafik
  imageAlt?: string; // accessibility uchun majburiy (rasm bo'lsa)
  sampleAnswer?: string; // faqat practice rejimda, tugagandan keyin — sanitizatsiyada olib tashlanadi
  markingNotes?: string; // AI grader uchun yashirin kontekst — clientga HECH QACHON yuborilmaydi
}

// ============================================================================
// §3 (Faza 3 uchun joy tutuvchi) — Speaking
// ============================================================================

export interface SpeakingSection {
  part1Questions: string[];
  part2CueCard: { topic: string; bulletPoints: string[]; prepSec: number; speakSec: number };
  part3Questions: string[];
}

// ============================================================================
// §3.5 — QuestionGroup va Question
// ============================================================================

export interface BankItem {
  key: string; // "A", "i", ...
  text: string;
}

export interface Hotspot {
  questionNumber: number;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
}

export interface Option {
  key: string; // "A", "B", ...
  text: string;
}

export interface QuestionGroup {
  id: string;
  type: QuestionType;
  instructionHtml: string; // "Choose NO MORE THAN TWO WORDS..."
  wordLimit?: WordLimit;
  bank?: BankItem[]; // matching / wordbank turlari uchun
  bankReusable?: boolean; // variantni qayta ishlatish mumkinmi
  stemHtml?: string; // summary/table/flowchart uchun umumiy karkas ({{q14}} placeholder bilan)
  imageUrl?: string; // map / diagram / plan
  imageAlt?: string; // imageUrl bo'lsa majburiy
  imageHotspots?: Hotspot[]; // diagram_label uchun
  questions: Question[];
}

export interface WordLimit {
  maxWords: number;
  maxNumbers?: number;
  label: string; // "NO MORE THAN TWO WORDS AND/OR A NUMBER"
}

export interface Question {
  number: number; // 1-40 global
  promptHtml?: string;
  options?: Option[]; // MC uchun
  selectCount?: number; // multiple_choice_multi: 2 yoki 3
  answer: AnswerKey; // ⚠️ MIJOZGA HECH QACHON YUBORILMAYDI (exam rejimda) — sanitize.ts
  explanationHtml?: string; // natija ekranida ko'rsatiladi — sanitizatsiyada olib tashlanadi
  locatorParagraph?: string; // "C" — javob qaysi paragrafda (review uchun) — sanitizatsiyada olib tashlanadi
}

export interface AnswerKey {
  accepted: string[]; // ["museum", "the museum"]
  pattern?: string; // ixtiyoriy regex, murakkab holatlar uchun
  caseSensitive?: false;
}

// ============================================================================
// §3.6 — Savol turlari (to'liq ro'yxat, 16 ta)
// ============================================================================

export type QuestionType =
  // Umumiy
  | 'multiple_choice_single' // A/B/C/D — bitta
  | 'multiple_choice_multi' // "Choose TWO letters"
  | 'sentence_completion' // matn ichida gap
  | 'short_answer' // savolga qisqa javob
  | 'note_completion'
  | 'table_completion'
  | 'flowchart_completion'
  | 'summary_completion' // bo'sh joy, erkin yozish
  | 'summary_completion_bank' // bo'sh joy, variantlar bankidan
  | 'matching_features' // "Which person said..."
  | 'matching_sentence_endings'
  | 'diagram_label' // rasm ustiga yorliq
  // Faqat Reading
  | 'true_false_notgiven'
  | 'yes_no_notgiven'
  | 'matching_headings' // i, ii, iii rim raqamlari
  | 'matching_information' // "Which paragraph contains..."
  // Faqat Listening
  | 'form_completion'
  | 'map_label' // xarita/plan ustiga drag-drop
  | 'plan_label';

// ============================================================================
// §3.7 — Attempt (foydalanuvchi urinishi)
// ============================================================================

export type ExamSectionKey = 'listening' | 'reading' | 'writing' | 'speaking';
export type AttemptMode = 'mock' | 'section';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded' | 'expired' | 'abandoned';
export type AnswerValue = string | string[] | null;

export interface Attempt {
  _id: string;
  userId: string;
  testId: string;
  mode: AttemptMode;
  sections: ExamSectionKey[]; // mock'da hammasi
  currentSection: ExamSectionKey;
  status: AttemptStatus;

  // Taymer — SERVER manbai
  startedAt: string; // ISO
  sectionStartedAt: string; // ISO
  endsAt: string; // ISO — server hisoblaydi
  pausedSec: number; // faqat practice rejimda

  // Javoblar
  answers: Record<string, AnswerValue>; // key = "q12"
  flagged: number[]; // review uchun belgilangan savollar
  lastQuestion: number;

  // Listening holati
  audio: {
    partIndex: number;
    positionSec: number; // refresh qilsa shu joydan davom etadi
    playedParts: number[]; // qayta tinglash mumkin emas
    volume: number;
  };

  // Writing
  essays: {
    task1?: { text: string; wordCount: number; updatedAt: string };
    task2?: { text: string; wordCount: number; updatedAt: string };
  };

  // Integrity
  events: { type: string; at: string; meta?: Record<string, unknown> }[];
  tabSwitchCount: number;

  // Natija
  result?: AttemptResult;
  submittedAt?: string;
}

// ============================================================================
// §3.8 — Natija
// ============================================================================

export interface AttemptResult {
  listening?: { raw: number; band: number; perPart: number[] };
  reading?: { raw: number; band: number; perPassage: number[] };
  writing?: {
    task1: WritingScore;
    task2: WritingScore;
    band: number; // (task1 + task2*2) / 3, 0.5 ga yaxlitlanadi
  };
  speaking?: { band: number; criteria: Record<string, number> };
  overall?: number;
  timeSpentSec: number;
  perQuestion: { number: number; userAnswer: string; correct: boolean; accepted: string[] }[];
}

export interface WritingScore {
  taskAchievement: number; // TA / TR
  coherenceCohesion: number; // CC
  lexicalResource: number; // LR
  grammaticalRange: number; // GRA
  band: number;
  feedbackUz: string;
  // §8.5 JSON sxemasi — har mezon bo'yicha alohida qisqa izoh (feedbackUz —
  // umumiy 3-5 jumlalik tahlil, bu esa mezon-mezon).
  criteriaFeedbackUz: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  corrections: { original: string; suggested: string; reason: string }[];
  improvedVersion?: string;
}

// ============================================================================
// Clientga yuboriladigan (sanitizatsiya qilingan) shakllar — §4.1
// ============================================================================

/** `answer`/`explanationHtml`/`locatorParagraph` olib tashlangan savol. */
export type SanitizedQuestion = Omit<Question, 'answer' | 'explanationHtml' | 'locatorParagraph'>;

export type SanitizedQuestionGroup = Omit<QuestionGroup, 'questions'> & {
  questions: SanitizedQuestion[];
};

export type SanitizedPassage = Omit<Passage, 'questionGroups'> & {
  questionGroups: SanitizedQuestionGroup[];
};

export type SanitizedListeningPart = Omit<ListeningPart, 'questionGroups' | 'transcript'> & {
  questionGroups: SanitizedQuestionGroup[];
};

export type SanitizedWritingTask = Omit<WritingTask, 'sampleAnswer' | 'markingNotes'>;

export type SanitizedTest = Omit<Test, 'sections'> & {
  sections: {
    listening?: Omit<ListeningSection, 'parts'> & { parts: SanitizedListeningPart[] };
    reading?: Omit<ReadingSection, 'passages'> & { passages: SanitizedPassage[] };
    writing?: Omit<WritingSection, 'tasks'> & { tasks: [SanitizedWritingTask, SanitizedWritingTask] };
    speaking?: SpeakingSection;
  };
};

// ============================================================================
// §4/§11.2 — Review (to'liq, izohli) ko'rinish. Sanitized* dan FARQLI — bu
// yerda javob kaliti/izoh/transkript ATAYLAB bor, chunki §4.1'dagi maxfiylik
// qoidasi faqat EXAM rejimiga tegishli; review faqat `status==='graded'`dan
// keyin, alohida `/attempts/:id/result` endpointi orqali ochiladi (TZ §19
// Faza 3 item 16).
// ============================================================================

export interface ReviewQuestion {
  number: number;
  promptHtml: string;
  options?: Option[];
  userAnswer: string;
  correct: boolean;
  accepted: string[];
  explanationHtml: string;
  locatorParagraph?: string;
}

export interface ReviewPassage {
  order: number;
  title: string;
  paragraphs: PassageParagraph[];
  questions: ReviewQuestion[];
}

export interface ReviewListeningPart {
  order: number;
  transcript: string;
  contextText?: string;
  questions: ReviewQuestion[];
}

export interface AttemptReviewDetail {
  overall?: number;
  reading?: { band: number; raw: number; passages: ReviewPassage[] };
  listening?: { band: number; raw: number; parts: ReviewListeningPart[] };
  writing?: {
    task1: WritingScore;
    task2: WritingScore;
    band: number;
    essays: { task1: string; task2: string };
  };
}
