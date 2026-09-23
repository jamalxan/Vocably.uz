// TZ-vocably-v2.md §3 (IELTS CD Exam Engine v1.0) — yagona ma'lumotlar modeli.
// Bu fayl FAQAT tur (type) e'lonlaridan iborat, runtime kodi yo'q.
//
// MUHIM: bu — exam engine (`features/exam/`, `/api/exam/attempts/*`) uchun tur
// tizimi. Eski Everest-Mock'dan portlangan dvigatel (`./engine.ts`, `./content.ts`,
// `/api/exam/[id]/*`, `ExamSession` mongoose modeli) TZ §20 migratsiyasi
// YAKUNLANGANDA (2026-09-12) butunlay o'chirildi — `/app/oqish`, `/app/tinglash`,
// `/app/yozish`, `/app/mock`, `/app/gapirish` barchasi endi shu yerdagi tur
// tizimiga ishlaydi. Shu tarixiy sabab bilan bu yerdagi tur nomlari eski
// `engine.ts`dagi (`ExamDoc`, `SectionState`, `SectionKey`) nomlar bilan
// ATAYLAB bir xil emas edi va hozir ham shunday qolmoqda.

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
  // AUDIT LEGAL-01 (VOCABLY_TZ_FINAL... 2026-09-20 §17) — "Copyright/content
  // rights — MAJBURIY." Repo ichida haqiqiy Cambridge Practice Test PDF
  // mavjud edi (audit topilmasi) — professional platformada kontentning
  // huquqiy kelib chiqishi birinchi darajali metadata bo'lishi kerak, admin
  // "unutib qo'yishi" mumkin bo'lgan ixtiyoriy izoh emas. `rights` YO'Q bo'lsa
  // (eski test) — `contentValidator.ts` va serverdagi model default'i
  // `sourceType:'own', publishScope:'public'` deb hisoblaydi (orqaga moslik,
  // mavjud testlarni to'satdan bloklamaydi); YANGI test uchun admin buni ONGLI
  // to'ldirishi kutiladi.
  rights?: ContentRights;
}

// LEGAL-01 §17 — "Content source turlari": admin kontent qayerdan kelganini
// aniq deklaratsiya qiladi. `third_party_copyright` + `publishScope:'public'`
// birikmasi — hech qachon avtomatik OK emas, `contentValidator.ts`dagi
// `checkCopyright()` buni BLOCKING xato deb hisoblaydi (AI policy'dan ham
// ustun — §14 "AI hech qachon o'zi hal qilmasin: copyrighted contentni public
// qilish").
export type ContentSourceType = 'own' | 'licensed' | 'public_domain' | 'third_party_copyright' | 'ai_generated_original';

// Hozircha faqat metadata/gate uchun — tizimda hali org/classroom-scoped
// yetkazish yo'li yo'q (Faza 4, Teacher/Classroom bilan birga keladi), shuning
// uchun bugun `isPublished:true` = har doim `public` bilan bir xil ta'sir
// qiladi. Maydon shunga qaramay endi kiritiladi: bugun 'organization'/'private'
// belgilash `third_party_copyright` kontent uchun publish gate'ni "men buni
// ONGLI ravishda ommaga emas deb belgiladim" degan aniq qaror sifatida ishlaydi
// (hali hech qanday cheklangan auditoriyaga real yetkazish yo'q, lekin kamida
// ommaviy nashr gate'i orqali o'tmaydi).
export type PublishScope = 'public' | 'organization' | 'private';

export interface ContentRights {
  sourceType: ContentSourceType;
  publisher?: string; // masalan "Cambridge University Press"
  licence?: string; // masalan "CC-BY-4.0", "Cambridge institutional license #..."
  licenceNote?: string;
  rightsVerifiedBy?: string; // admin userId — kim tasdiqladi
  rightsVerifiedAt?: string; // ISO
  publishScope: PublishScope;
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
// §3 / §19 Faza 4 item 23 — Speaking
// ============================================================================

export interface SpeakingSection {
  // Butun bo'lim uchun server taymeri (attempts/route.js'dagi umumiy
  // `durationSec * 1000` naqshi — Reading/Listening/Writing bilan bir xil).
  // Haqiqiy IELTS 11-14 daq (§C0) — har alohida javob o'zi cheklanmaydi
  // (Part1/3 — GapInput'dagi so'z limiti kabi, faqat yo'naltiruvchi; Part2
  // esa `speakSec`gacha), lekin butun bo'lim shu umumiy byudjetdan
  // oshmasligi kerak.
  durationSec: number;
  part1Questions: string[];
  part2CueCard: { topic: string; bulletPoints: string[]; prepSec: number; speakSec: number };
  part3Questions: string[];
}

// Attempt tarafida bitta yozib olingan javobga havola — `part`+`questionIndex`
// juftligi shu javob QAYSI savolga tegishli ekanini bildiradi (Part 2'da
// har doim questionIndex=0, chunki bitta cue card). `transcript` yozuv
// yuklangan ZAHOTI (Whisper orqali, §13 real-time emas) to'ldiriladi — AI
// baholash (gradeSpeakingAttempt) qayta transkripsiya qilmaydi, faqat mavjud
// matnlarni yig'ib bitta so'rovda baholaydi (audio fayllarni ketma-ket qayta
// yuklab-transkripsiya qilish sekinroq va serverless timeout xavfini oshiradi).
export interface SpeakingRecording {
  part: 1 | 2 | 3;
  questionIndex: number; // part1Questions/part3Questions'dagi index, Part 2'da 0
  audioFileId: string; // GridFS (audioStorage.ts, Listening bilan bir xil bucket)
  transcript: string;
  durationSec: number;
  recordedAt: string; // ISO
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

// TZ §6.3 / §19 Faza 3 item 19 — Reading passage'da matn belgilash. Offset
// `TreeWalker` bilan paragraf ichidagi barcha text node'lar birlashtirilgan
// holda hisoblanadi — DOM qayta chizilganda shu offsetlardan `Range` tiklanadi.
export interface Highlight {
  id: string;
  passageOrder: number;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  note?: string;
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
export type AttemptMode = 'mock' | 'section' | 'practice';
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

  // Reading — matn belgilash + eslatma (§6.3, faqat Reading)
  highlights: Highlight[];

  // Speaking — yozib olingan javoblar (§19 Faza 4 item 23). `essays`dan farqli
  // ravishda ro'yxat (array), chunki bitta bo'lim ichida bir nechta alohida
  // javob bor (Part 1: bir necha savol, Part 2: bitta, Part 3: bir necha) —
  // sobit `task1`/`task2` kalitlar Writing'ga xos, Speaking'da mos kelmaydi.
  speaking: { recordings: SpeakingRecording[] };

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
  // `bandEstimated` — TZ §10.2/P0-03: xom ball rasmiy jadval oralig'idan tashqarida
  // bo'lganda (masalan past GT Reading ball) band chiziqli taxmin bilan olinadi,
  // "aniq" konversiya emas — UI shu bayroq bilan buni ochiq ko'rsatishi kerak.
  listening?: { raw: number; band: number; bandEstimated?: boolean; perPart: number[] };
  reading?: { raw: number; band: number; bandEstimated?: boolean; perPassage: number[] };
  writing?: {
    task1: WritingScore;
    task2: WritingScore;
    band: number; // (task1 + task2*2) / 3, 0.5 ga yaxlitlanadi
  };
  speaking?: SpeakingScore;
  overall?: number;
  timeSpentSec: number;
  // `type` — TZ §19 Faza 3 item 17 ("natija analitikasi... zaif savol
  // turlari") shu maydonga tayanadi: savol turi bo'yicha to'g'ri/noto'g'ri
  // nisbatini hisoblash uchun. Faza 1'dan buyon yo'q edi (scoring uchun shart
  // emas edi) — analytics.ts qo'shilganda kiritildi.
  perQuestion: { number: number; type: QuestionType; userAnswer: string; correct: boolean; accepted: string[] }[];
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
  // Audit metadata (writingGrader.ts) — eski (bu maydonlar qo'shilishidan
  // oldingi) saqlangan urinishlarda yo'q bo'lishi mumkin, shuning uchun
  // optional: UI ularsiz ham to'g'ri ishlashi kerak.
  graderModel?: string; // haqiqatan javob bergan provayder (masalan 'groq', 'gemini')
  graderVersion?: string; // baholash prompt/sxemasi versiyasi (writingGrader.ts#GRADER_VERSION)
  underMinWords?: boolean; // insho task.minWords'dan kam yozilgan — TA/TR bahosi shunga qarab jarimalangan
  // AUDIT N-13 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — qaysi IELTS
  // band-descriptor rubrika revisiyasi ishlatilgani. Bugun `graderVersion`
  // bilan bir xil qiymat (writingGrader.ts#GRADER_VERSION) — tushunchalar
  // sal farqli (prompt/sxema versiyasi vs. rubrika revisiyasi), lekin hozircha
  // bittagina rubrika kuzatiladi, shuning uchun ikkalasi bir manbadan keladi.
  rubricVersion?: string;
  // 0-1, grader modelning o'z bahosiga qanchalik ishonchi bor — hozirgi AI
  // provayder zanjirida (aiJson.js) bunday signal umuman yo'q, shuning uchun
  // amalda hamisha `undefined` (writingGrader.ts'dagi izohga q.).
  confidence?: number;
}

// Eski (pre-exam-engine) `/api/speaking/submit`dagi javob shakli bilan ATAYLAB
// bir xil (src/app/api/speaking/submit/route.js) — o'sha yerdagi Whisper+LLM
// pipeline shu yerga ham qayta ishlatiladi (speakingGrader.ts), faqat endi
// bitta javob emas, butun Speaking bo'lim (3 part) uchun BITTA umumiy band —
// haqiqiy IELTS'da ham Speaking alohida-alohida emas, yaxlit baholanadi.
export interface SpeakingScore {
  band: number;
  fluencyCoherence: { band: number; note: string };
  lexicalResource: { band: number; note: string };
  grammaticalRange: { band: number; note: string };
  // Fonema darajasidagi talaffuz bahosi YO'Q (Azure Pronunciation Assessment
  // ulanmagan, §20.1'dagi "bepul tarif" zaxirasi) — shuning uchun ball emas,
  // faqat matn asosidagi kuzatuv.
  pronunciationNote: string;
  // EX-02 — YANGI, haqiqiy audio asosidagi baho (Gemini multimodal, speakingGrader.ts
  // assessPronunciation()). Faqat mos yozuv topilgan VA Gemini audio chaqiruvi
  // muvaffaqiyatli bo'lganda mavjud bo'ladi — bo'lmasa umuman qaytarilmaydi
  // (eski, audio-siz baholangan urinishlar bilan orqaga moslik uchun). Yuqoridagi
  // `pronunciationNote` bundan MUSTAQIL — eski, har doim mavjud, faqat matn asosidagi
  // kuzatuv, bu yerda o'zgartirilmagan.
  pronunciation?: { band: number; note: string };
  strengths: string[];
  corrections: { original: string; suggestion: string }[];
  nextStepsUz: string[];
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

// TZ §11.1 item 8 / §19 Faza 3 item 17 — "Tarix: oldingi mocklar bilan
// taqqoslash grafigi" uchun yengil ro'yxat elementi (to'liq Attempt emas).
export interface AttemptHistoryEntry {
  id: string;
  testId: string;
  testTitle: string;
  mode: AttemptMode;
  submittedAt: string | null;
  overall: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
}

export interface ReviewSpeakingRecording {
  part: 1 | 2 | 3;
  questionIndex: number;
  promptText: string; // part1Questions[i] / part2CueCard.topic / part3Questions[i]
  audioFileId: string;
  transcript: string;
}

export interface AttemptReviewDetail {
  overall?: number;
  reading?: { band: number; raw: number; bandEstimated?: boolean; passages: ReviewPassage[] };
  listening?: { band: number; raw: number; bandEstimated?: boolean; parts: ReviewListeningPart[] };
  writing?: {
    task1: WritingScore;
    task2: WritingScore;
    band: number;
    essays: { task1: string; task2: string };
  };
  speaking?: SpeakingScore & { recordings: ReviewSpeakingRecording[] };
}
