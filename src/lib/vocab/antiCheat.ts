// Anti-cheat / integrity (TZ §39): mumkin bo'lmagan javob vaqti, takroriy so'rovlar, bot-ga o'xshash
// xatti-harakat, ball/XP manipulyatsiyasi. Hamma narsa SERVER tomonida baholanadi; shubhali sessiya
// XP bermaydi va flag qilinadi (o'chirilmaydi — admin ko'rishi uchun saqlanadi).
import { ANTI_CHEAT } from './config';

export interface TimedAnswer {
  responseMs: number;
  inputType: 'choice' | 'typed' | 'arrange' | 'match' | string;
  /** Savol matni uzunligi — o'qish uchun minimal vaqtni hisoblashga. */
  promptLength?: number;
  /** match savoli uchun juftliklar soni. */
  units?: number;
}

export function minPlausibleMs(a: Pick<TimedAnswer, 'inputType' | 'promptLength' | 'units'>): number {
  const base = ANTI_CHEAT.minResponseMs[a.inputType] ?? 500;
  const reading = Math.min(1200, (a.promptLength || 0) * 6);
  const unitsExtra = a.inputType === 'match' ? Math.max(0, (a.units || 1) - 1) * 500 : 0;
  return base + reading + unitsExtra;
}

export interface SessionTiming {
  answers: TimedAnswer[];
  startedAt: Date | string;
  completedAt: Date | string;
}

export interface Assessment {
  suspicious: boolean;
  flags: string[];
  /** 0..1 — shubha darajasi. */
  suspicion: number;
}

function stddev(values: number[]): number {
  if (values.length < 2) return Infinity;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length;
  return Math.sqrt(variance);
}

export function assessSession(t: SessionTiming): Assessment {
  const flags: string[] = [];
  let suspicion = 0;
  const n = t.answers.length;
  if (n === 0) return { suspicious: false, flags, suspicion: 0 };

  const elapsedMs = new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime();
  const responseSum = t.answers.reduce((s, a) => s + Math.max(0, a.responseMs || 0), 0);

  // 1) Mumkin bo'lmagan javob vaqti
  const tooFast = t.answers.filter((a) => (a.responseMs || 0) < minPlausibleMs(a)).length;
  if (tooFast / n >= 0.3) {
    flags.push('impossible_response_time');
    suspicion += 0.5;
  }

  // 2) Klient bergan vaqtlar yig'indisi haqiqiy (server) vaqtdan ancha katta — soxta vaqt
  if (elapsedMs > 0 && responseSum > elapsedMs * 1.35 + 3000) {
    flags.push('response_time_exceeds_elapsed');
    suspicion += 0.6;
  }

  // 3) Sessiya umumiy vaqti savollarning minimal vaqtlari yig'indisidan ancha kam
  const minTotal = t.answers.reduce((s, a) => s + minPlausibleMs(a), 0);
  if (elapsedMs > 0 && elapsedMs < minTotal * ANTI_CHEAT.minSessionFraction) {
    flags.push('session_too_fast');
    suspicion += 0.6;
  }

  // 4) Bot-ga o'xshash bir xil vaqtlar
  if (n >= 8 && stddev(t.answers.map((a) => a.responseMs || 0)) < ANTI_CHEAT.botVarianceMs) {
    flags.push('bot_like_timing');
    suspicion += 0.5;
  }

  suspicion = Math.min(1, suspicion);
  return { suspicious: suspicion >= 0.5, flags, suspicion };
}

export function isPlausibleResponse(a: TimedAnswer): boolean {
  return (a.responseMs || 0) >= minPlausibleMs(a) && (a.responseMs || 0) <= 10 * 60 * 1000;
}
