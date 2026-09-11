import { getStoredAuthToken } from './examStore';
import type { AnswerValue, AttemptResult, AttemptReviewDetail, SanitizedTest } from '@/lib/exam/types';

// TZ-vocably-v2.md §4 — `/api/exam/attempts/*` uchun yupqa klient. Barcha
// bo'lim modullari (Reading — allaqachon, Listening/Writing Faza 2'da) shu bir
// xil kontrakt bilan gaplashadi, shuning uchun bu yerda BITTA joyda.
async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getStoredAuthToken();
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    sections: string[];
    currentSection: string;
    status: string;
    answers: Record<string, AnswerValue>;
    flagged: number[];
    lastQuestion: number;
    essays: AttemptEssaysResponse;
    audio: AttemptAudioResponse;
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

export async function createAttempt(testId: string, section: string): Promise<{ attemptId: string }> {
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify({ testId, mode: 'section', section }),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

/** TZ §9.1 — Mock: testda mavjud listening/reading/writing bo'limlarining
 * BARCHASI, bitta urinishda, ketma-ket. */
export async function createMockAttempt(testId: string): Promise<{ attemptId: string }> {
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify({ testId, mode: 'mock' }),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

/** TZ §4/§9.1 — joriy bo'lim (masalan Listening'ning audiosi+final-check'i)
 * o'z ichida tugaganda chaqiriladi, keyingi bo'limga o'tkazadi (yoki oxirgi
 * bo'lim bo'lsa — haqiqiy yakunlashni ishga tushiradi, attemptServer.ts#advanceMockSection). */
export async function advanceMockSection(attemptId: string): Promise<{ currentSection: string; status: string; endsAt: string }> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}/section/next`, { method: 'POST' });
  if (!res.ok) throw new Error("Keyingi bo'limga o'tib bo'lmadi");
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
