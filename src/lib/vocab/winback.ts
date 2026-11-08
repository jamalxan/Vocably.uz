// "Qaytarish" xabari (win-back): kamida 3 kun takrorlamagan va takrorlanadigan so'zi bor foydalanuvchiga — har bir
// nofaollik davri uchun BIR MARTA. Davr foydalanuvchining oxirgi takrorlash sanasi (`lastReviewDate`) bilan
// belgilanadi: qaytib kelib, yana yo'qolsa — sana o'zgargan, yangi davr, xabar yana bir marta ketadi.
// Sof mantiq; yuborish src/lib/vocab/server/winbackService.js'da.
import { daysBetween } from './streak';

export const WINBACK_CONFIG = {
  /** Oxirgi takrorlashdan beri kamida shuncha kun o'tgan bo'lsa. */
  minInactiveDays: 3,
  /** Kamida shuncha so'z takrorlashga tayyor bo'lsa ("0 ta so'z kutyapti" demaymiz). */
  minDue: 1,
  url: '/app',
};

export interface WinbackPrefs {
  enabled?: boolean;
  /** Xabar qaysi `lastReviewDate` davri uchun yuborilgan. */
  winbackFor?: string | null;
}

export interface WinbackInput {
  lastReviewDate: string | null;
  today: string;
  dueCount: number;
  prefs?: WinbackPrefs | null;
}

/** Yuborish kerakmi → necha kun nofaol (yoki null). */
export function decideWinback({ lastReviewDate, today, dueCount, prefs }: WinbackInput): { days: number } | null {
  if (prefs?.enabled === false) return null;
  if (!lastReviewDate) return null; // hech qachon takrorlamagan — "yodlagan so'zlaringiz" degan gap to'g'ri kelmaydi
  if (prefs?.winbackFor === lastReviewDate) return null; // shu davr uchun allaqachon yuborilgan
  if (dueCount < WINBACK_CONFIG.minDue) return null;
  const days = daysBetween(lastReviewDate, today);
  if (days < WINBACK_CONFIG.minInactiveDays) return null;
  return { days };
}

/** Ismning birinchi so'zi ("Jamol Karimov" → "Jamol"); bo'sh bo'lsa ''. */
export function firstName(name: string | null | undefined): string {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface WinbackMessage {
  title: string;
  body: string;
  /** Telegram (parse_mode=HTML) uchun to'liq matn. */
  html: string;
  url: string;
}

export function formatWinback({ name, days, due, baseUrl }: { name: string; days: number; due: number; baseUrl: string }): WinbackMessage {
  const n = firstName(name);
  const greet = n ? `Salom, ${n} 👋` : 'Salom 👋';
  const p1 = `Oxirgi marta Vocably'da ${days} kun oldin bo'lgansiz. Yodlagan so'zlaringiz takrorlanmasa, asta-sekin xotiradan o'chib ketadi.`;
  const p2 = `Yaxshi xabar: ularni qaytarish uchun 5 daqiqa yetadi. "Bugungi takrorlash"da sizni ${due} ta so'z kutyapti.`;
  const link = `${baseUrl}${WINBACK_CONFIG.url}`;
  const shown = link.replace(/^https?:\/\//, '');
  return {
    title: greet,
    body: `${p1}\n\n${p2}`,
    html: `${esc(greet)}\n\n${esc(p1)}\n\n${esc(p2)}\n\n👉 Hozir takrorlash: <a href="${link}">${esc(shown)}</a>`,
    url: WINBACK_CONFIG.url,
  };
}

export function winbackMarkup(baseUrl: string) {
  return {
    inline_keyboard: [[{ text: '👉 Hozir takrorlash', url: `${baseUrl}${WINBACK_CONFIG.url}` }], [{ text: "🔕 Eslatmalarni o'chirish", callback_data: 'rm:off' }]],
  };
}
