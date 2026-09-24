import type {
  AnswerValue,
  AttemptResult,
  AttemptReviewDetail,
  AttemptHistoryEntry,
  Highlight,
  SanitizedTest,
  SpeakingRecording,
} from '@/lib/exam/types';
import type { MockKind } from '@/lib/exam/mockKind';

// TZ-vocably-v2.md §4 — `/api/exam/attempts/*` uchun yupqa klient. Barcha
// bo'lim modullari (Reading — allaqachon, Listening/Writing Faza 2'da) shu bir
// xil kontrakt bilan gaplashadi, shuning uchun bu yerda BITTA joyda.
//
// AUTH_MIGRATION_MAP.md — Authorization header endi qo'lda biriktirilmaydi;
// httpOnly cookie orqali autentifikatsiya qilinadi (src/lib/auth.js), brauzer
// buni same-origin so'rovga o'zi qo'shadi.
async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export interface AttemptEssaysResponse {
  task1?: { text: string; wordCount: number; updatedAt?: string };
  task2?: { text: string; wordCount: number; updatedAt?: string };
}

export interface AttemptAudioResponse {
  partIndex: number;
  positionSec: number;
  playedParts: number[];
  volume: number;
}

export interface AttemptStateResponse {
  serverNow: string;
  endsAt: string;
  remainingSec: number;
  attempt: {
    id: string;
    testId: string;
    mode: string;
    mockKind?: MockKind;
    sections: string[];
    currentSection: string;
    status: string;
    answers: Record<string, AnswerValue>;
    flagged: number[];
    lastQuestion: number;
    essays: AttemptEssaysResponse;
    audio: AttemptAudioResponse;
    speaking: { recordings: SpeakingRecording[] };
    highlights: Highlight[];
    result: AttemptResult | null;
  };
  test: SanitizedTest;
}

export interface TestPreview {
  id: string;
  title: string;
  module: string;
  sections: {
    listening?: { durationSec: number; questionCount: number };
    reading?: { durationSec: number; questionCount: number };
    writing?: { durationSec: number; taskCount: number };
  };
}

/** TZ §9.2 — Mock intro ekrani uchun, attempt yaratilishidan OLDIN (aks holda
 * intro ekranida turgan vaqt ham bo'lim taymeridan yeb ketardi). */
export async function fetchTestPreview(testId: string): Promise<TestPreview> {
  const res = await authedFetch(`/api/exam/tests/${testId}`);
  if (!res.ok) throw new Error("Testni yuklab bo'lmadi");
  return res.json();
}

/** `testId` IXTIYORIY: berilmasa server shu bo'limi bor nashr qilingan
 * testlardan bittasini tasodifiy tanlaydi (2026-09-24 — "Writing va Speaking
 * o'zi random tushsin"). Reading/Listening sahifalari avvalgidek aniq
 * `testId` yuboradi. */
export async function createAttempt(testId: string | undefined, section: string, abandonExisting?: boolean): Promise<{ attemptId: string }> {
  const body: Record<string, unknown> = { mode: 'section', section };
  if (testId) body.testId = testId;
  if (abandonExisting) body.abandonExisting = true;
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

/** TZ "Practice mode" (Listening: replay/tezlik erkin) — `createAttempt`ning
 * amalda vaqtsiz varianti (server tomoni `mode:'practice'`ni juda uzoq
 * muddat bilan yaratadi, attempts/route.js#PRACTICE_ATTEMPT_DURATION_SEC). */
export async function createPracticeAttempt(testId: string, section: string, abandonExisting?: boolean): Promise<{ attemptId: string }> {
  const body: Record<string, unknown> = { testId, mode: 'practice', section };
  if (abandonExisting) body.abandonExisting = true;
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

export interface SectionAttemptStatus {
  attemptId: string;
  status: 'in_progress' | 'submitted' | 'graded' | 'expired' | 'abandoned';
  band: number | null;
  submittedAt: string | null;
}

/** VOCABLY-TZ.md §2.4/§5 item 12 — TestPicker'dagi har test kartasida holat
 * (Boshlanmagan / Davom etmoqda / Tugallangan: Band X) ko'rsatish uchun. */
export async function fetchSectionStatuses(section: string): Promise<Record<string, SectionAttemptStatus>> {
  const res = await authedFetch(`/api/exam/attempts/section-status?section=${section}`);
  if (!res.ok) return {};
  const data = await res.json();
  return data.statuses || {};
}

/** TZ §9.1 — Mock: testda mavjud listening/reading/writing bo'limlarining
 * BARCHASI, bitta urinishda, ketma-ket. `testId` IXTIYORIY — berilmasa,
 * server tomoni tasodifiy nashr etilgan testni tanlaydi (foydalanuvchi
 * so'rovi: "mockda tanlash bo'lmasin, to'liq avto" — /api/exam/attempts
 * route.js'dagi izohga q.). `abandonExisting` — faqat `testId` bo'lmaganda
 * ma'noga ega: `true` bo'lsa, mavjud tugallanmagan mock bekor qilinib,
 * chinakam yangi tasodifiy test bilan boshlanadi (VOCABLY-TZ.md "Attempt
 * boshqaruvi" auditi — aks holda "Imtihonni boshlash" jimgina eski
 * urinishni davom ettirar edi, go'yo Listening o'tkazib yuborilgandek). */
export async function createMockAttempt(testId?: string, abandonExisting?: boolean, mockKind?: MockKind): Promise<{ attemptId: string }> {
  const body: Record<string, unknown> = { mode: 'mock' };
  if (testId) body.testId = testId;
  if (abandonExisting) body.abandonExisting = true;
  if (mockKind) body.mockKind = mockKind;
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

export interface ActiveMockInfo {
  attemptId: string;
  currentSection: string;
}

/** Mock intro ekrani "Imtihonni boshlash"dan OLDIN shu yerdan so'raydi —
 * tugallanmagan mock bo'lsa, "Davom ettirish" deb ko'rsatish va "Yangi
 * boshlash" tanlovini berish uchun (faqat tasodifiy mock oqimida, `testId`
 * berilmaganda ishlatiladi). */
export async function fetchActiveMock(): Promise<ActiveMockInfo | null> {
  const res = await authedFetch('/api/exam/attempts/active-mock');
  if (!res.ok) return null;
  const data = await res.json();
  return data.active;
}

/** TZ §4/§9.1 — joriy bo'lim (masalan Listening'ning audiosi+final-check'i)
 * o'z ichida tugaganda chaqiriladi, keyingi bo'limga o'tkazadi (yoki oxirgi
 * bo'lim bo'lsa — haqiqiy yakunlashni ishga tushiradi, attemptServer.ts#advanceMockSection). */
export async function advanceMockSection(attemptId: string): Promise<{ currentSection: string; status: string; endsAt: string }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/section/next`, { method: 'POST' });
  if (!res.ok) throw new Error("Keyingi bo'limga o'tib bo'lmadi");
  return res.json();
}

/** AUDIT Sprint 2/§52.1 — Practice mock'da bo'limlar orasida ERKIN (oldinga
 * HAM orqaga HAM) o'tish, `advanceMockSection`dan farqli. Server bu faqat
 * `mockKind:'practice'`da ruxsat etilishini tekshiradi (403 aks holda) —
 * bu yerda qo'shimcha tekshiruv YO'Q, chaqiruvchi (MockShell.tsx) UI'da
 * tugmani faqat Practice'da ko'rsatadi. */
export async function goToMockSection(attemptId: string, targetSection: string): Promise<{ currentSection: string; status: string; endsAt: string }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/section/go`, {
    method: 'POST',
    body: JSON.stringify({ targetSection }),
  });
  if (!res.ok) throw new Error("Bo'limga o'tib bo'lmadi");
  return res.json();
}

export async function fetchAttempt(attemptId: string): Promise<AttemptStateResponse> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}`);
  if (!res.ok) throw new Error("Urinishni yuklab bo'lmadi");
  return res.json();
}

export async function sendHeartbeat(
  attemptId: string,
  body: { audioPositionSec?: number; currentQuestion?: number; partIndex?: number; partEnded?: boolean; volume?: number }
): Promise<{ remainingSec: number; status: string } | null> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function submitAttempt(attemptId: string): Promise<{ result: AttemptResult | null }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/submit`, { method: 'POST' });
  if (!res.ok) throw new Error("Yakunlab bo'lmadi");
  return res.json();
}

/** TZ §4/§11.2 — faqat `status==='graded'` bo'lganda ishlaydi (aks holda
 * server 409 qaytaradi). */
export async function fetchAttemptResult(attemptId: string): Promise<{ detail: AttemptReviewDetail }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/result`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Natijani yuklab bo'lmadi");
  }
  return res.json();
}

/** TZ §8.5 — Writing bo'limi bo'lgan attemptlar uchun submit'dan KEYIN
 * chaqiriladi (WritingSection.tsx). Xato tashlashi mumkin (AI vaqtincha band) —
 * chaqiruvchi buni "baholanmadi, keyinroq qayta urinib ko'ring" sifatida
 * ko'rsatishi kerak, submit natijasining o'zi baribir saqlangan bo'ladi. */
export async function gradeWriting(attemptId: string): Promise<{ result: AttemptResult | null }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/grade-writing`, { method: 'POST' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Baholab bo'lmadi");
  }
  return res.json();
}

/** TZ §19 Faza 4 item 23 — bitta Speaking javobi yozib olingandan keyin
 * yuklaydi. `authedFetch` ishlatilmaydi — u har doim `Content-Type:
 * application/json` qo'yadi, FormData esa brauzerning o'ziga xos
 * multipart boundary sarlavhasini talab qiladi (qo'lda qo'yilsa buziladi). */
export async function uploadSpeakingRecording(
  attemptId: string,
  args: { part: 1 | 2 | 3; questionIndex: number; blob: Blob; durationSec: number }
): Promise<{ audioFileId: string; transcript: string }> {
  const form = new FormData();
  form.append('part', String(args.part));
  form.append('questionIndex', String(args.questionIndex));
  form.append('durationSec', String(Math.round(args.durationSec)));
  form.append('audio', new File([args.blob], `speaking-${Date.now()}.webm`, { type: args.blob.type || 'audio/webm' }));

  const res = await fetch(`/api/exam/attempts/${attemptId}/speaking-recording`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Yozuvni yuklab bo'lmadi");
  return data;
}

/** TZ §19 Faza 4 item 23 — Speaking bo'limi submit qilingandan keyin (Writing'ning
 * gradeWriting'iga o'xshab) darhol chaqiriladi — yig'ilgan barcha transkriptlarni
 * bitta yaxlit AI so'roviga jamlab baholaydi. */
export async function gradeSpeaking(attemptId: string): Promise<{ result: AttemptResult | null }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/grade-speaking`, { method: 'POST' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Baholab bo'lmadi");
  }
  return res.json();
}

/** TZ §19 Faza 3 item 17 — natija analitikasi uchun foydalanuvchining oldingi
 * baholangan urinishlari (progress chart). */
export async function fetchAttemptHistory(): Promise<{ history: AttemptHistoryEntry[] }> {
  const res = await authedFetch('/api/exam/attempts/history');
  if (!res.ok) throw new Error("Tarixni yuklab bo'lmadi");
  return res.json();
}

/** TZ §6.3 / §19 Faza 3 item 19 — Reading passage'da matn belgilash + eslatma.
 * Uch amal bitta endpointda (old-engine'dagi `/api/exam/[id]/highlight` bilan
 * bir xil naqsh) — har biri darhol saqlanadi (belgilash kam-tez-tez, davomiy
 * typing emas, shuning uchun `examStore`ning dirtyKeys-debounce autosave'iga
 * qo'shilmaydi). */
export async function addHighlight(
  attemptId: string,
  h: { passageOrder: number; paragraphIndex: number; startOffset: number; endOffset: number }
): Promise<{ highlight: Highlight }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/highlight`, {
    method: 'POST',
    body: JSON.stringify({ action: 'add', ...h }),
  });
  if (!res.ok) throw new Error("Belgilab bo'lmadi");
  return res.json();
}

export async function removeHighlight(attemptId: string, highlightId: string): Promise<void> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/highlight`, {
    method: 'POST',
    body: JSON.stringify({ action: 'remove', highlightId }),
  });
  if (!res.ok) throw new Error("Belgini olib bo'lmadi");
}

export async function setHighlightNote(attemptId: string, highlightId: string, note: string): Promise<void> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/highlight`, {
    method: 'POST',
    body: JSON.stringify({ action: 'note', highlightId, note }),
  });
  if (!res.ok) throw new Error("Eslatmani saqlab bo'lmadi");
}
