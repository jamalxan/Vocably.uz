import type { AnswerValue } from '@/lib/exam/types';

// "Yakunlash" tasdiqlash oynasi uchun — javob berilmagan savol raqamlari
// (MockShell.tsx#confirmFinish bilan bir xil qoida).
export function unansweredNumbers(numbers: number[], answers: Record<string, AnswerValue>): number[] {
  return numbers.filter((n) => {
    const v = answers[`q${n}`];
    return v == null || v === '' || (Array.isArray(v) && v.length === 0);
  });
}
