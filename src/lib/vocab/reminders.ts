// Lug'at eslatmalari (TZ §55): "18 ta so'z takrorlashga tayyor", "12 kunlik seriyangizni saqlang".
// Sof mantiq — qachon va nima yuborishni hal qiladi. Spam bo'lmasligi uchun: kuniga ko'pi bilan 1 ta,
// foydalanuvchi bugun allaqachon o'qigan bo'lsa yuborilmaydi, chastota sozlamasi hurmat qilinadi,
// aytadigan gap bo'lmasa (takrorlash ham, xavf ostidagi seriya ham yo'q) — jim turadi (TZ §65: jazolamaydigan ohang).
import { daysBetween, effectiveStreak, type StreakState } from './streak';
import { localDateWithCutoff } from '../srs';

export const REMINDER_FREQUENCIES = ['daily', 'every_2_days', 'weekly'] as const;
export type ReminderFrequency = (typeof REMINDER_FREQUENCIES)[number];

export const REMINDER_CONFIG = {
  /** Eslatma uchun kamida shuncha so'z takrorlashga tayyor bo'lishi kerak. */
  minDue: 5,
  /** Seriya shu kundan kam bo'lsa "seriyani saqlang" xabari yuborilmaydi. */
  minStreakForNudge: 3,
  minGapDays: { daily: 1, every_2_days: 2, weekly: 7 } as Record<ReminderFrequency, number>,
};

export interface ReminderPrefs {
  enabled?: boolean;
  frequency?: string;
  /** Oxirgi YUBORILGAN eslatma sanasi ('YYYY-MM-DD', foydalanuvchi vaqt mintaqasida). */
  lastSentOn?: string | null;
}

export interface ReminderInput {
  dueCount: number;
  streak: StreakState;
  timeZone: string;
  prefs?: ReminderPrefs | null;
  now?: Date;
}

export interface Reminder {
  kind: 'streak' | 'due';
  title: string;
  body: string;
  url: string;
}

export function normalizePrefs(p?: ReminderPrefs | null): { enabled: boolean; frequency: ReminderFrequency; lastSentOn: string | null } {
  const frequency = (REMINDER_FREQUENCIES as readonly string[]).includes(p?.frequency || '') ? (p!.frequency as ReminderFrequency) : 'daily';
  return { enabled: p?.enabled !== false, frequency, lastSentOn: p?.lastSentOn || null };
}

export function decideReminder(input: ReminderInput): Reminder | null {
  const now = input.now ?? new Date();
  const prefs = normalizePrefs(input.prefs);
  if (!prefs.enabled) return null;

  const today = localDateWithCutoff(now, input.timeZone);
  // Bugun allaqachon o'qigan bo'lsa bezovta qilmaymiz.
  if (input.streak.lastDate === today) return null;
  // Chastota: oxirgi eslatmadan keyin yetarli kun o'tmagan bo'lsa jim.
  if (prefs.lastSentOn && daysBetween(prefs.lastSentOn, today) < REMINDER_CONFIG.minGapDays[prefs.frequency]) return null;

  const eff = effectiveStreak(input.streak, now, input.timeZone);
  if (eff.atRisk && eff.streak >= REMINDER_CONFIG.minStreakForNudge) {
    const due = input.dueCount > 0 ? ` Bugun ${input.dueCount} ta so'z takrorlashni kutmoqda.` : '';
    return {
      kind: 'streak',
      title: `🔥 ${eff.streak} kunlik seriyangizni saqlang`,
      body: `Bugun 5 daqiqa mashq qilsangiz yetarli.${due}`,
      url: '/app/oyinlar',
    };
  }
  if (input.dueCount >= REMINDER_CONFIG.minDue) {
    return {
      kind: 'due',
      title: `🔔 ${input.dueCount} ta so'z takrorlashga tayyor`,
      body: "Qisqa takrorlash so'zlarni uzoq muddat eslab qolishga yordam beradi.",
      url: '/app/lugat/takrorlash',
    };
  }
  return null;
}
