// Server-authoritative IELTS mock dvigateli. github.com/jamalxan/Everest-Mock
// backend/exam.py'dan portlangan SOF funksiyalar (DB'ga bog'liq emas — chaqiruvchi
// API route joriy holatni o'qib, natijani saqlaydi — xuddi Python versiyasidagi kabi,
// lekin bu yerda buni fayl boshidagi izoh emas, haqiqiy arxitektura qoidasi qiladi).
//
// Buzilmaydigan qoidalar (asl fayldan, o'zgarishsiz):
//   1. Taymer serverda hisoblanadi (endsAt - now). Brauzer vaqtni hal qilmaydi.
//   2. Yangilash/uzilish vaqtni tiklamaydi, javoblarni yo'qotmaydi — hammasi
//      MongoDB'da saqlanadi va server soatidan qayta hisoblanadi.
//   3. Autosave — har bir javob/insho alohida so'rov bilan darhol saqlanadi.
//   4. Tinglash audiosi play-once: server yagona boshlanish vaqtini yozadi va
//      o'tgan vaqtni (offset) qaytaradi — yangilash bir xil joydan davom ettiradi,
//      qayta boshlanmaydi yoki orqaga qaytarilmaydi.
//   5. Submit idempotent (atomik shartli yangilash) va bo'lim taymerlari
//      tugaganda avtomatik submit ishga tushadi.
//   6. Tinglash/Reading xom -> band konversiyasi scoring.ts orqali.
//
// YAGONA qo'shimcha (Everest-Mock'da yo'q): `mode` maydoni. TZ §11.3 — "practice"da
// applyExpiry o'chadi (vaqt tugashi bo'lim/imtihonni qulflamaydi), audio play-once
// cheklovi olib tashlanadi. Bu — mavjud mantiqni buzish emas, ustiga qo'shilgan
// shart (mode === 'exam' bo'lganda ikkalasi ham asl fayldagidek ishlaydi).

import { gradingInfo, sectionOfQuestion as contentSectionOfQuestion } from './content';
import { listeningBand, readingBand, overallBand } from './scoring';
import { normalizeForCompare } from '../textCompare';

// 'mcq' — bir nechta to'g'ri variant "1,3" kabi vergul bilan yozilgan bo'lishi
// mumkin (masalan "TWO letters" turidagi savollar, tartib muhim emas) — shu holda
// tanlangan variant to'plamda bo'lsa yetarli. 'gap' — matn solishtirish, katta-kichik
// harf va apostrofga sezgir emas, `acceptable` muqobil variantlarni ham qabul qiladi.
export function isAnswerCorrect(given: unknown, meta: { type: 'mcq' | 'gap'; correct: number | string; acceptable?: string[] }): boolean {
  if (given == null || given === '') return false;
  if (meta.type === 'gap') {
    const candidates = [meta.correct, ...(meta.acceptable || [])].map((c) => normalizeForCompare(String(c)));
    return candidates.includes(normalizeForCompare(String(given)));
  }
  const accepted = String(meta.correct).split(',').map((s) => s.trim());
  return accepted.includes(String(given));
}

export type SectionKey = 'listening' | 'reading' | 'writing' | 'speaking';

export interface SectionState {
  startedAt: Date | null;
  endsAt: Date | null;
  locked: boolean;
  duration: number;
}

export interface ExamDoc {
  _id?: unknown;
  mockId: string;
  mode: 'exam' | 'practice';
  status: 'in_progress' | 'submitted';
  createdAt: Date;
  sections: Record<SectionKey, SectionState>;
  answers: Record<string, unknown>;
  essays: { task1: string; task2: string };
  audio: Record<string, { startedAt: Date; plays: number }>;
  highlights?: unknown[];
  result: unknown;
}

/** Bo'lim uchun vakolatli qolgan soniya, yoki hali boshlanmagan bo'lsa null. */
export function sectionRemaining(sec: SectionState, now: Date = new Date()): number | null {
  if (!sec.endsAt) return null;
  return Math.max(0, Math.round((sec.endsAt.getTime() - now.getTime()) / 1000));
}

/** Vaqti o'tgan har qanday bo'limni qulflaydi. `true` qaytarsa — hujjat o'zgargan
 * (chaqiruvchi DB'ga saqlashi kerak). "practice" rejimida HECH NARSA qulflanmaydi. */
export function applyExpiry(doc: ExamDoc, now: Date = new Date()): boolean {
  if (doc.mode === 'practice') return false;
  let changed = false;
  for (const sec of Object.values(doc.sections)) {
    if (sec.endsAt && !sec.locked && sectionRemaining(sec, now) === 0) {
      sec.locked = true;
      changed = true;
    }
  }
  return changed;
}

const GLOBAL_BUFFER_SEC = 30 * 60;

export function shouldAutosubmit(doc: ExamDoc, now: Date = new Date()): boolean {
  if (doc.status !== 'in_progress' || doc.mode === 'practice') return false;
  const secs = Object.values(doc.sections);
  const started = secs.filter((s) => s.startedAt);
  if (started.length > 0 && secs.every((s) => s.locked)) return true;

  const totalDuration = secs.reduce((sum, s) => sum + s.duration, 0);
  const deadline = doc.createdAt.getTime() + (totalDuration + GLOBAL_BUFFER_SEC) * 1000;
  return now.getTime() > deadline;
}

/** Clientga yuboriladigan holat — javob kalitlari YO'Q. */
export function publicState(doc: ExamDoc, now: Date = new Date()) {
  const sections: Record<string, unknown> = {};
  for (const [key, sec] of Object.entries(doc.sections)) {
    sections[key] = {
      started: !!sec.startedAt,
      locked: !!sec.locked,
      duration: sec.duration,
      endsAt: sec.endsAt,
      remaining: sectionRemaining(sec, now),
    };
  }
  return {
    sessionId: doc._id ? String(doc._id) : undefined,
    mockId: doc.mockId,
    mode: doc.mode,
    status: doc.status,
    serverNow: now,
    sections,
    // Mongoose'ning minimize:true (eski hujjatlarda, modelSchema tuzatilishidan
    // oldin yaratilgan) bo'sh {} maydonlarni saqlamay tashlab yuborishi mumkin edi —
    // shuning uchun bu yerda ham `|| {}` bilan himoyalanadi (schema'dagi
    // minimize:false yangi hujjatlar uchun ildiz sababni tuzatadi).
    audio: doc.audio || {},
    answers: doc.answers || {},
    essays: doc.essays,
    highlights: doc.highlights || [],
    result: doc.result,
  };
}

export function sectionOfQuestion(mockId: string, questionId: string): string | null {
  return contentSectionOfQuestion(mockId, questionId);
}

/** Listening/Reading avtomatik baholanadi; Writing/Speaking alohida (AI) baholanadi —
 * bu yerda `null` qoldiriladi, chaqiruvchi (submit route) keyinroq to'ldirishi mumkin. */
export function scoreExam(doc: ExamDoc) {
  const review: Record<string, unknown> = {};
  const sectionBands: Record<string, number | null> = {};

  for (const section of ['listening', 'reading'] as const) {
    const info = gradingInfo(doc.mockId, section);
    let raw = 0;
    const items: unknown[] = [];
    for (const [qid, meta] of Object.entries(info)) {
      const given = doc.answers[qid];
      const ok = isAnswerCorrect(given, meta);
      if (ok) raw += 1;
      items.push({ id: qid, given, correct: meta.correct, ok });
    }
    const band = section === 'listening' ? listeningBand(raw) : readingBand(raw);
    sectionBands[section] = band;
    review[section] = { raw, total: Object.keys(info).length, band, items };
  }

  sectionBands.writing = null;
  sectionBands.speaking = null;

  return {
    overall: overallBand(sectionBands),
    sections: sectionBands,
    review,
    gradedAt: new Date(),
    gradingPending: ['writing', 'speaking'],
  };
}
