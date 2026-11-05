// Lug'at eslatmalari (TZ §55, TZ 2.0 §6.10): "18 ta so'z takrorlashga tayyor", "12 kunlik seriyangizni saqlang".
// Sof mantiq — qachon va nima yuborishni hal qiladi. Kuniga ikki "slot": (1) foydalanuvchi tanlagan soatda kunlik
// reja eslatmasi, (2) seriya xavfda bo'lsa 21:00 da qisqa turtki — demak kuniga ko'pi bilan 2 ta xabar.
// Spam bo'lmasligi uchun:
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
  /** Foydalanuvchi mahalliy vaqtida eslatma yuboriladigan standart soat (avval bitta cron soati edi: 20:00 Toshkent). */
  defaultHour: 20,
  /** Tanlash mumkin bo'lgan oraliq; shundan keyin (tun) hech qachon yuborilmaydi. */
  minHour: 8,
  maxHour: 21,
  /** Seriya xavfda bo'lsa ikkinchi (oxirgi) turtki shu mahalliy soatdan boshlab (TZ 2.0 §6.10.2). */
  riskHour: 21,
  /** Reja eslatmasi faqat shu kun ichida faol bo'lgan foydalanuvchiga (uzoq "uxlagan"ni har kuni bezovta qilmaymiz). */
  planActiveDays: 7,
  /** Bir kunda foydalanuvchiga ko'pi bilan shuncha proaktiv xabar (TZ 2.0 §6.10.5). */
  maxPerDay: 2,
};

export interface ReminderPrefs {
  enabled?: boolean;
  frequency?: string;
  /** Telegram'ga ham yuborish (opt-in, standart: yo'q). */
  telegram?: boolean;
  /** Mahalliy soat (8–21), shu soatdan boshlab yuboriladi. */
  sendHour?: number;
  /** Oxirgi YUBORILGAN eslatma sanasi ('YYYY-MM-DD', foydalanuvchi vaqt mintaqasida). */
  lastSentOn?: string | null;
  /** Oxirgi yuborilgan reja eslatmasining turi — 21:00 turtkisi bir xil gapni takrorlamasin. */
  lastKind?: string | null;
  /** 21:00 seriya turtkisi yuborilgan sana. */
  riskSentOn?: string | null;
}

export interface ReminderInput {
  dueCount: number;
  streak: StreakState;
  timeZone: string;
  prefs?: ReminderPrefs | null;
  now?: Date;
}

export interface Reminder {
  kind: 'streak' | 'due' | 'plan' | 'risk';
  title: string;
  body: string;
  url: string;
}

export function normalizeSendHour(h: unknown): number {
  const n = Number(h);
  return Number.isInteger(n) && n >= REMINDER_CONFIG.minHour && n <= REMINDER_CONFIG.maxHour ? n : REMINDER_CONFIG.defaultHour;
}

export function normalizePrefs(
  p?: ReminderPrefs | null
): { enabled: boolean; frequency: ReminderFrequency; telegram: boolean; sendHour: number; lastSentOn: string | null } {
  const frequency = (REMINDER_FREQUENCIES as readonly string[]).includes(p?.frequency || '') ? (p!.frequency as ReminderFrequency) : 'daily';
  return { enabled: p?.enabled !== false, frequency, telegram: p?.telegram === true, sendHour: normalizeSendHour(p?.sendHour), lastSentOn: p?.lastSentOn || null };
}

/** Berilgan vaqt mintaqasidagi soat (0–23). Noto'g'ri mintaqada UTC. */
export function localHour(now: Date, timeZone: string): number {
  const fmt = (tz: string) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: tz }).format(now);
  try {
    return Number(fmt(timeZone));
  } catch {
    return Number(fmt('UTC'));
  }
}

/**
 * Hozir foydalanuvchining eslatma vaqtimi? Tanlangan soatdan boshlab (cron kechiksa — "yetib oladi"), lekin kechki
 * soatlardan keyin emas (tunda bezovta qilmaymiz).
 */
export function isReminderHour(prefs: ReminderPrefs | null | undefined, now: Date, timeZone: string): boolean {
  const h = localHour(now, timeZone);
  return h >= normalizePrefs(prefs).sendHour && h <= 22;
}

/** 21:00 dan keyin (tunda emas) — seriya turtkisi vaqti. */
export function isRiskHour(now: Date, timeZone: string): boolean {
  const h = localHour(now, timeZone);
  return h >= REMINDER_CONFIG.riskHour && h <= 22;
}

/** Telegram xabari ostidagi tugmalar: ochish + bir bosishda o'chirish (TZ 2.0 §6.10.5). */
export function telegramReminderMarkup(r: Reminder, baseUrl: string) {
  return {
    inline_keyboard: [[{ text: 'Ochish', url: `${baseUrl}${r.url}` }], [{ text: "🔕 Eslatmalarni o'chirish", callback_data: 'rm:off' }]],
  };
}

/** Telegram uchun HTML matn (sendMessage parse_mode=HTML). `baseUrl` — ilovaning bosh manzili (oxirida "/" yo'q). */
export function formatTelegramReminder(r: Reminder, baseUrl: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<b>${esc(r.title)}</b>\n${esc(r.body)}\n\n<a href="${baseUrl}${r.url}">Ochish</a>`;
}

/** Telegram xatosi foydalanuvchi botni bloklagani/o'chirgani bo'lsa true — shunda kanalni o'chirib qo'yamiz. */
export function isTelegramBlockedError(message: string): boolean {
  return /blocked by the user|user is deactivated|chat not found|bot was kicked/i.test(message || '');
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
      url: '/app/games',
    };
  }
  if (input.dueCount >= REMINDER_CONFIG.minDue) {
    return {
      kind: 'due',
      title: `🔔 ${input.dueCount} ta so'z takrorlashga tayyor`,
      body: "Qisqa takrorlash so'zlarni uzoq muddat eslab qolishga yordam beradi.",
      url: '/app/vocabulary/review',
    };
  }
  // TZ 2.0 §6.10.2: tanlangan soatda kunlik reja — yaqinda faol bo'lganlarga (aytadigan aniq gap bo'lmasa ham).
  if (input.streak.lastDate && daysBetween(input.streak.lastDate, today) <= REMINDER_CONFIG.planActiveDays) {
    const due = input.dueCount > 0 ? ` ${input.dueCount} ta so'z takrorlashni kutmoqda.` : '';
    return {
      kind: 'plan',
      title: '📋 Bugungi rejangiz tayyor',
      body: `10–15 daqiqalik vazifalar.${due}`,
      url: '/app',
    };
  }
  return null;
}

/**
 * Ikkinchi slot: 21:00 da seriya xavfda bo'lsa (bugun hali vazifa bajarilmagan). Chastota sozlamasi bunga ta'sir
 * qilmaydi (seriyani saqlash — kunlik xavfsizlik), lekin o'chirilgan bo'lsa jim. Reja eslatmasi o'zi 21:00 dan
 * keyin seriya haqida ketgan bo'lsa, servis bu slotni band qilib qo'yadi (bir gapni ikki marta aytmaymiz).
 */
export function decideRiskNudge(input: ReminderInput): Reminder | null {
  const now = input.now ?? new Date();
  const prefs = input.prefs || {};
  if (prefs.enabled === false) return null;
  if (!isRiskHour(now, input.timeZone)) return null;
  const today = localDateWithCutoff(now, input.timeZone);
  if (input.streak.lastDate === today) return null;
  if (prefs.riskSentOn === today) return null;
  const eff = effectiveStreak(input.streak, now, input.timeZone);
  if (!eff.atRisk || eff.streak < REMINDER_CONFIG.minStreakForNudge) return null;
  return {
    kind: 'risk',
    title: `🔥 Bugun hali mashq yo'q — ${eff.streak} kunlik seriyangiz kutmoqda`,
    body: 'Yarim tungacha bitta vazifa — 5 daqiqalik o‘yin ham yetadi.',
    url: '/app/games',
  };
}
