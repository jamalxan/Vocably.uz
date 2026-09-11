import { getStoredAuthToken } from './examStore';
import type { AnswerValue, AttemptResult, SanitizedTest } from '@/lib/exam/types';

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
    result: AttemptResult | null;
  };
  test: SanitizedTest;
}

export async function createAttempt(testId: string, section: string): Promise<{ attemptId: string }> {
  const res = await authedFetch('/api/exam/attempts', {
    method: 'POST',
    body: JSON.stringify({ testId, mode: 'section', section }),
  });
  if (!res.ok) throw new Error("Urinish yaratib bo'lmadi");
  return res.json();
}

export async function fetchAttempt(attemptId: string): Promise<AttemptStateResponse> {
  const res = await authedFetch(`/api/exam/attempts/${attemptId}`);
  if (!res.ok) throw new Error("Urinishni yuklab bo'lmadi");
  return res.json();
}

export async function sendHeartbeat(
  attemptId: string,
  body: { audioPositionSec?: number; currentQuestion?: number }
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
