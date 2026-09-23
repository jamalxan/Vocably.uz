// TZ-vocably-v2.md §15.2 / §19 Faza 4 item 21 — "Validator — publish qilishdan
// oldin tekshiradi." Sof funksiya — DB'ga bog'liq emas, admin UI'da (instant,
// server so'rovsiz) va `POST /api/admin/exam-tests`da (client'ga ishonmaslik
// uchun — TZ §5-taxminiy qoida: "client'ga ishonmang") IKKALASIDA ham
// ishlatiladi. `models.js`dagi izohga qarang: `ExamTest.sections` ataylab
// Mixed — TZ §3'dagi chuqur ichma-ich turlar DB sxemasi darajasida emas, shu
// yerda (ilova darajasida) tekshiriladi.
import type { Test, QuestionGroup, Question } from './types';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  path: string; // masalan "reading.passages[0].questionGroups[1].questions[2]"
  message: string;
}

function allQuestions(groups: QuestionGroup[]): { group: QuestionGroup; question: Question }[] {
  return groups.flatMap((group) => group.questions.map((question) => ({ group, question })));
}

/** Bir bo'lim ichidagi (Reading YOKI Listening, alohida-alohida — haqiqiy
 * IELTS'da ikkalasi ham mustaqil 1-40 raqamlanadi, birga QO'SHILMAYDI)
 * savol raqamlari 1'dan boshlab uzilishsiz ekanini tekshiradi. */
function checkContiguousNumbering(sectionLabel: string, questions: Question[], issues: ValidationIssue[]) {
  if (questions.length === 0) return;
  const numbers = [...questions.map((q) => q.number)].sort((a, b) => a - b);
  const seen = new Set<number>();
  for (const n of numbers) {
    if (seen.has(n)) {
      issues.push({ severity: 'error', path: `${sectionLabel}`, message: `Savol raqami ${n} takrorlangan` });
    }
    seen.add(n);
  }
  for (let i = 0; i < numbers.length; i++) {
    const expected = i + 1;
    if (numbers[i] !== expected) {
      issues.push({
        severity: 'error',
        path: sectionLabel,
        message: `Savol raqamlari uzilishsiz emas — ${expected} kutilgan edi, ${numbers[i]} topildi`,
      });
      break; // birinchi uzilishdan keyin qolganlari ham "noto'g'ri" bo'ladi — bitta xabar yetarli
    }
  }
}

// `checkQuestions` bitta konteyner (bitta passage / bitta listening part) doirasida
// chaqiriladi — lekin uzluksiz raqamlash (1..40) butun BO'LIM bo'yicha (barcha
// passage/part birgalikda), bitta konteyner ichida EMAS: haqiqiy IELTS'da 2-passage
// 14dan boshlanadi, 1dan emas. Shuning uchun raqamlash tekshiruvi bu funksiyadan
// TASHQARIDA, butun bo'lim yig'ilgandan keyin bitta marta chaqiriladi (pastga q.,
// `validateTest`dagi `checkContiguousNumbering` chaqiruvlari) — bu yerda faqat
// savol/guruh darajasidagi (accepted/selectCount/bank/imageAlt) tekshiruvlar qoladi,
// har passage/part alohida `path` bilan yaxshi xato joylashuvi uchun.
function checkQuestions(sectionLabel: string, groups: QuestionGroup[], issues: ValidationIssue[]) {
  for (const { group, question } of allQuestions(groups)) {
    const path = `${sectionLabel} savol ${question.number}`;
    if (!question.answer || !Array.isArray(question.answer.accepted) || question.answer.accepted.length === 0) {
      issues.push({ severity: 'error', path, message: "Kamida 1 ta 'accepted' javob bo'lishi kerak" });
    }
    // selectCount savolda kutiladi (types.ts#Question.selectCount, guruhda emas) — bo'lmasa scoring ishlamaydi.
    if (group.type === 'multiple_choice_multi' && !question.selectCount) {
      issues.push({ severity: 'error', path, message: "multiple_choice_multi uchun 'selectCount' kerak" });
    }
  }

  for (const group of groups) {
    if (group.type === 'matching_headings' && (!group.bank || group.bank.length === 0)) {
      issues.push({ severity: 'error', path: `${sectionLabel} guruh (${group.id})`, message: "matching_headings uchun 'bank' to'ldirilmagan" });
    }
    if (group.imageUrl && !group.imageAlt?.trim()) {
      issues.push({ severity: 'error', path: `${sectionLabel} guruh (${group.id})`, message: "Rasm bor, lekin 'imageAlt' bo'sh" });
    }
  }
}

// VOCABLY-TZ.md (AI Content Ingestion Agent) §13 — "Warning (nashr
// qilinadi, lekin belgilanadi)" qoidalarining bir qismi. Bu uchtasi (W01/
// W02/W03) sof, deterministik va HECH QANDAY AI/tashqi xizmatga muhtoj
// EMAS — shuning uchun bu sessiyada (R2/Redis/OpenRouter ulanmagan bo'lsa
// ham) to'g'ridan-to'g'ri ishlab chiqarish validatoriga qo'shildi va HOZIR
// FAOL (admin "Nashr qilish" bosganda ham, qo'lda "Validatsiya" chaqirganda
// ham ishlaydi). Qolgan W-qoidalar (masalan W04 — "yes_no_notgiven faktik
// matnda ishlatilgan" — "AI klassifikatori" talab qiladi) ataylab
// QO'SHILMAGAN, chunki ular haqiqatan ham AI xulosasiga muhtoj.
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// §13 W01 — "Reading passage 650 so'zdan kam yoki 1000 dan ko'p."
function checkPassageLength(passage: { order: number; paragraphs?: { html: string }[] }, issues: ValidationIssue[]) {
  const words = countWords((passage.paragraphs || []).map((p) => stripHtml(p.html)).join(' '));
  if (words > 0 && (words < 650 || words > 1000)) {
    issues.push({
      severity: 'warning',
      path: `reading.passage[${passage.order}]`,
      message: `Passage ${words} so'z (IELTS normasi 650-1000)`,
    });
  }
}

// §13 W02 — "Listening umumiy audio 25 daqiqadan kam yoki 35 dan ko'p."
function checkListeningDuration(parts: { durationSec?: number }[], issues: ValidationIssue[]) {
  const totalSec = parts.reduce((sum, p) => sum + (p.durationSec || 0), 0);
  if (totalSec > 0 && (totalSec < 25 * 60 || totalSec > 35 * 60)) {
    issues.push({
      severity: 'warning',
      path: 'listening',
      message: `Umumiy audio ${Math.round(totalSec / 60)} daqiqa (IELTS normasi 25-35 daqiqa)`,
    });
  }
}

// §13 W03 — "Bitta testda bir xil savol turi 2 martadan ko'p ishlatilgan."
function checkQuestionTypeRepetition(allGroups: QuestionGroup[], issues: ValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const g of allGroups) counts.set(g.type, (counts.get(g.type) || 0) + 1);
  for (const [type, count] of counts) {
    if (count > 2) {
      issues.push({ severity: 'warning', path: 'sections', message: `'${type}' turi ${count} marta ishlatilgan (tavsiya: 2 martadan ko'p emas)` });
    }
  }
}

// §13 W06 — "explanation yoki evidence yo'q (tahlil sifati pasayadi)." Har
// savol uchun alohida emas (40 ta alohida ogohlantirish shovqin bo'lardi) —
// bitta konteyner (passage/part) ichida NECHTA savolda yo'qligini bitta
// xabarda jamlab beradi.
function checkExplanations(sectionLabel: string, groups: QuestionGroup[], issues: ValidationIssue[]) {
  const missing = allQuestions(groups).filter(({ question }) => !question.explanationHtml?.trim());
  if (missing.length > 0) {
    issues.push({
      severity: 'warning',
      path: sectionLabel,
      message: `${missing.length} ta savolda 'explanationHtml' (tahlil) yo'q — natija ekranida tushuntirish ko'rsatilmaydi`,
    });
  }
}

// §13 W08 — "Audioscript yo'q."
function checkAudioscript(parts: { order: number; transcript?: string }[], issues: ValidationIssue[]) {
  for (const part of parts) {
    if (!part.transcript?.trim()) {
      issues.push({ severity: 'warning', path: `listening.part[${part.order}]`, message: "Audioscript ('transcript') yo'q" });
    }
  }
}

// §13 W07 — "Passage qiyinligi (Flesch-Kincaid) P1→P3 oshmagan." Bo'g'in
// sanash sof matndan taxminiy hisoblanadi (unli-guruh usuli — inglizcha
// imlodan aniq bo'g'in sonini olish printsipial jihatdan noaniq, lekin
// ogohlantirish darajasida yetarli). Flesch-Kincaid Grade Level formulasi:
// yuqoriroq qiymat = qiyinroq matn.
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  const groups = clean.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 1;
  if (clean.endsWith('e') && !clean.endsWith('le') && count > 1) count -= 1;
  return Math.max(1, count);
}

function fleschKincaidGrade(text: string): number | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (words.length === 0 || sentences.length === 0) return null;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
}

function checkReadingDifficultyProgression(
  passages: { order: number; paragraphs?: { html: string }[] }[],
  issues: ValidationIssue[]
) {
  const sorted = [...passages].sort((a, b) => a.order - b.order);
  if (sorted.length < 2) return;
  const grades = sorted.map((p) => fleschKincaidGrade((p.paragraphs || []).map((par) => stripHtml(par.html)).join(' ')));
  const first = grades[0];
  const last = grades[grades.length - 1];
  // "P1->P3 OSHMAGAN" — teng qolishi ham "oshmagan" hisoblanadi, shuning
  // uchun `<=`, faqat qat'iy kamayish emas.
  if (first != null && last != null && last <= first) {
    issues.push({
      severity: 'warning',
      path: 'reading',
      message: `Qiyinlik P${sorted[0].order}dan P${sorted[sorted.length - 1].order}ga oshmagan (Flesch-Kincaid ${first.toFixed(1)} -> ${last.toFixed(1)})`,
    });
  }
}

// LEGAL-01 §17 — "Publish gate: third_party_copyright + public = BLOCK. Bu
// qoida AI policy'dan ham ustun bo'lishi shart." `rights` butunlay yo'q bo'lsa
// (eski test, bu maydon qo'shilishidan oldin yaratilgan) model default'i bilan
// bir xil taxmin qilinadi (`sourceType:'own', publishScope:'public'`) — orqaga
// mos, hech narsani to'satdan bloklamaydi. Bloklanadi FAQAT admin ONGLI
// ravishda "bu uchinchi tomon materiali" deb belgilab, uni public qilmoqchi
// bo'lsa.
function checkCopyright(rights: Test['rights'], issues: ValidationIssue[]) {
  const sourceType = rights?.sourceType || 'own';
  const publishScope = rights?.publishScope || 'public';

  if (sourceType === 'third_party_copyright' && publishScope === 'public') {
    issues.push({
      severity: 'error',
      path: 'rights',
      message:
        "Kontent manbasi 'third_party_copyright' deb belgilangan, lekin nashr doirasi 'public' — ruxsatsiz uchinchi tomon materialini ommaga chiqarish TAQIQLANADI. Litsenziya mavjud bo'lsa sourceType'ni 'licensed'ga o'zgartirib 'licence' maydonini to'ldiring, aks holda publishScope'ni 'public'dan boshqasiga o'zgartiring.",
    });
  }
  if (sourceType === 'licensed' && !rights?.licence?.trim()) {
    issues.push({ severity: 'error', path: 'rights', message: "sourceType 'licensed', lekin 'licence' (litsenziya turi/raqami) bo'sh — dalilsiz litsenziya da'vosi" });
  }
}

export function validateTest(test: Partial<Test>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkCopyright(test.rights, issues);

  if (!test.title?.trim()) issues.push({ severity: 'error', path: 'title', message: "Test sarlavhasi bo'sh bo'lmasin" });
  if (!test.slug?.trim()) issues.push({ severity: 'error', path: 'slug', message: "Slug bo'sh bo'lmasin" });
  else if (!/^[a-z0-9-]+$/.test(test.slug)) {
    issues.push({ severity: 'error', path: 'slug', message: "Slug faqat kichik lotin harflari, raqam va '-' bo'lishi mumkin" });
  }

  const sections = test.sections || {};
  if (!sections.reading && !sections.listening && !sections.writing && !sections.speaking) {
    issues.push({ severity: 'error', path: 'sections', message: "Kamida bitta bo'lim (reading/listening/writing/speaking) bo'lishi kerak" });
  }

  if (sections.reading) {
    const passages = sections.reading.passages || [];
    if (passages.length === 0) issues.push({ severity: 'warning', path: 'reading', message: "Reading'da hech qanday passage yo'q" });
    const orders = passages.map((p) => p.order);
    if (new Set(orders).size !== orders.length) issues.push({ severity: 'error', path: 'reading', message: 'Passage order qiymatlari takrorlangan' });
    for (const p of passages) {
      if (!p.title?.trim()) issues.push({ severity: 'error', path: `reading.passage[${p.order}]`, message: "Passage sarlavhasi bo'sh" });
      if (!p.paragraphs || p.paragraphs.length === 0) {
        issues.push({ severity: 'warning', path: `reading.passage[${p.order}]`, message: 'Paragraflar bo’sh' });
      } else {
        checkPassageLength(p, issues);
      }
      checkQuestions(`reading.passage[${p.order}]`, p.questionGroups || [], issues);
      checkExplanations(`reading.passage[${p.order}]`, p.questionGroups || [], issues);
    }
    // Raqamlash butun BO'LIM bo'yicha uzluksiz (haqiqiy IELTS'da 2-passage 14dan
    // boshlanadi, 1dan emas) — shuning uchun barcha passage'lar birlashtirilgan
    // holda BITTA marta tekshiriladi, yuqoridagi per-passage `checkQuestions`dan tashqarida.
    checkContiguousNumbering(
      'reading',
      passages.flatMap((p) => (p.questionGroups || []).flatMap((g) => g.questions)),
      issues
    );
    checkReadingDifficultyProgression(passages, issues);
  }

  if (sections.listening) {
    const parts = sections.listening.parts || [];
    if (parts.length === 0) issues.push({ severity: 'warning', path: 'listening', message: "Listening'da hech qanday part yo'q" });
    for (const part of parts) {
      if (!part.audioUrl?.trim()) issues.push({ severity: 'error', path: `listening.part[${part.order}]`, message: "audioUrl bo'sh — audio fayl yuklanmagan" });
      checkQuestions(`listening.part[${part.order}]`, part.questionGroups || [], issues);
      checkExplanations(`listening.part[${part.order}]`, part.questionGroups || [], issues);
    }
    checkContiguousNumbering(
      'listening',
      parts.flatMap((p) => (p.questionGroups || []).flatMap((g) => g.questions)),
      issues
    );
    checkListeningDuration(parts, issues);
    checkAudioscript(parts, issues);
  }

  if (sections.writing) {
    const tasks = sections.writing.tasks || [];
    if (tasks.length !== 2) issues.push({ severity: 'error', path: 'writing', message: "Writing'da aynan 2 ta task bo'lishi kerak" });
    for (const task of tasks) {
      if (!task.promptHtml?.trim()) issues.push({ severity: 'error', path: `writing.task[${task.order}]`, message: "Topshiriq matni ('promptHtml') bo'sh" });
      if (task.imageUrl && !task.imageAlt?.trim()) {
        issues.push({ severity: 'error', path: `writing.task[${task.order}]`, message: "Rasm bor, lekin 'imageAlt' bo'sh" });
      }
    }
  }

  if (sections.speaking) {
    const s = sections.speaking;
    if (!s.durationSec || s.durationSec <= 0) {
      issues.push({ severity: 'error', path: 'speaking', message: "'durationSec' 0dan katta bo'lishi kerak" });
    }
    if (!s.part1Questions || s.part1Questions.length === 0) {
      issues.push({ severity: 'error', path: 'speaking.part1Questions', message: 'Kamida 1 ta Part 1 savoli kerak' });
    }
    if (!s.part2CueCard?.topic?.trim()) {
      issues.push({ severity: 'error', path: 'speaking.part2CueCard', message: "Cue card mavzusi ('topic') bo'sh" });
    }
    if (!s.part2CueCard?.bulletPoints || s.part2CueCard.bulletPoints.length === 0) {
      issues.push({ severity: 'warning', path: 'speaking.part2CueCard', message: "'bulletPoints' bo'sh — foydalanuvchiga tayyorgarlik uchun yo'l-yo'riq bo'lmaydi" });
    }
    if (!s.part2CueCard?.prepSec || s.part2CueCard.prepSec <= 0) {
      issues.push({ severity: 'error', path: 'speaking.part2CueCard', message: "'prepSec' 0dan katta bo'lishi kerak" });
    }
    if (!s.part2CueCard?.speakSec || s.part2CueCard.speakSec <= 0) {
      issues.push({ severity: 'error', path: 'speaking.part2CueCard', message: "'speakSec' 0dan katta bo'lishi kerak" });
    }
    if (!s.part3Questions || s.part3Questions.length === 0) {
      issues.push({ severity: 'error', path: 'speaking.part3Questions', message: 'Kamida 1 ta Part 3 savoli kerak' });
    }
  }

  checkQuestionTypeRepetition(
    [
      ...(sections.reading?.passages || []).flatMap((p) => p.questionGroups || []),
      ...(sections.listening?.parts || []).flatMap((p) => p.questionGroups || []),
    ],
    issues
  );

  return issues;
}

export function hasBlockingErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}

// EX-06/N-06 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — "Mock
// imtihon uchun mos ekanligini alohida, BLOKLOVCHI tekshiruv." Bu funksiya
// ATAYLAB `validateTest`dan ALOHIDA: `validateTest` oddiy nashr etishni
// bloklaydi (masalan faqat Reading bo'limi bo'lgan test ham undan
// muvaffaqiyatli o'tadi — standalone Reading practice uchun to'liq
// 3-passage/40-savol shart emas), lekin TO'LIQ Mock imtihon
// (`/api/exam/attempts` mode:'mock') uchun qat'iy IELTS shakli (3 ta passage/
// jami 40 savol/2150-2750 so'z Reading; 4 ta part x 10 savol Listening, har
// birida audioUrl; 2 ta Writing task) shart. Bu funksiya HECH QACHON
// `validateTest`/`hasBlockingErrors` ichiga birlashtirilmaydi va ularning
// xatti-harakatini o'zgartirmaydi — aks holda mavjud 4 ta nashr etilgan test
// (ular mock shaklga mos kelmasligi mumkin) standalone Reading/Listening/
// Writing practice uchun ham bloklanib qolardi.
export function checkMockEligibility(test: Partial<Test>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sections = test.sections || {};

  const reading = sections.reading;
  if (!reading) {
    issues.push({ severity: 'error', path: 'reading', message: "Mock imtihon uchun Reading bo'limi yo'q" });
  } else {
    const passages = reading.passages || [];
    if (passages.length !== 3) {
      issues.push({
        severity: 'error',
        path: 'reading',
        message: `Mock imtihon uchun aynan 3 ta passage kerak (${passages.length} ta topildi)`,
      });
    }
    const totalQuestions = passages.reduce((sum, p) => sum + allQuestions(p.questionGroups || []).length, 0);
    if (totalQuestions !== 40) {
      issues.push({
        severity: 'error',
        path: 'reading',
        message: `Mock imtihon uchun Reading'da jami 40 ta savol kerak (${totalQuestions} ta topildi)`,
      });
    }
    const totalWords = passages.reduce(
      (sum, p) => sum + countWords((p.paragraphs || []).map((par) => stripHtml(par.html)).join(' ')),
      0
    );
    if (totalWords < 2150 || totalWords > 2750) {
      issues.push({
        severity: 'error',
        path: 'reading',
        message: `Mock imtihon uchun Reading umumiy so'z soni 2150-2750 oralig'ida bo'lishi kerak (${totalWords} ta topildi)`,
      });
    }
  }

  const listening = sections.listening;
  if (!listening) {
    issues.push({ severity: 'error', path: 'listening', message: "Mock imtihon uchun Listening bo'limi yo'q" });
  } else {
    const parts = listening.parts || [];
    if (parts.length !== 4) {
      issues.push({
        severity: 'error',
        path: 'listening',
        message: `Mock imtihon uchun aynan 4 ta part kerak (${parts.length} ta topildi)`,
      });
    }
    for (const part of parts) {
      const count = allQuestions(part.questionGroups || []).length;
      if (count !== 10) {
        issues.push({
          severity: 'error',
          path: `listening.part[${part.order}]`,
          message: `Mock imtihon uchun har part'da aynan 10 ta savol kerak (${count} ta topildi)`,
        });
      }
      if (!part.audioUrl?.trim()) {
        issues.push({
          severity: 'error',
          path: `listening.part[${part.order}]`,
          message: "Mock imtihon uchun audioUrl bo'sh bo'lmasligi kerak",
        });
      }
    }
  }

  const writing = sections.writing;
  if (!writing) {
    issues.push({ severity: 'error', path: 'writing', message: "Mock imtihon uchun Writing bo'limi yo'q" });
  } else {
    const tasks = writing.tasks || [];
    if (tasks.length !== 2) {
      issues.push({
        severity: 'error',
        path: 'writing',
        message: `Mock imtihon uchun aynan 2 ta task kerak (${tasks.length} ta topildi)`,
      });
    }
  }

  return issues;
}

export function isMockEligible(test: Partial<Test>): boolean {
  return checkMockEligibility(test).length === 0;
}
