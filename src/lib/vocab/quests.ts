// Kunlik / haftalik vazifalar (TZ §16). Progress SERVERda hodisalardan yig'iladi;
// mukofot (XP) idempotent — bir davr uchun bir marta (idempotency key: quest:<key>:<periodKey>).
import { localDateWithCutoff } from '../srs';
import { QUEST_REWARD_XP } from './config';
import { daysBetween } from './streak';

export type QuestPeriod = 'daily' | 'weekly';

export type QuestMetric =
  | 'new_words'
  | 'reviews'
  | 'games'
  | 'context_uses'
  | 'mastered_words'
  | 'weekly_accuracy'
  | 'boss_completed';

export interface QuestDef {
  key: string;
  period: QuestPeriod;
  title: string;
  description: string;
  metric: QuestMetric;
  target: number;
  rewardXp: number;
  /** Hodisalardan emas, davr sessiyalaridan hisoblanadi (masalan o'rtacha aniqlik). */
  derived?: boolean;
}

export const QUEST_DEFS: QuestDef[] = [
  { key: 'daily_learn_10', period: 'daily', title: "10 ta yangi so'z o'rganing", description: "Bugun 10 ta yangi so'z bilan tanishing", metric: 'new_words', target: 10, rewardXp: QUEST_REWARD_XP.daily },
  { key: 'daily_review_20', period: 'daily', title: "20 ta so'zni takrorlang", description: 'SRS navbatidagi 20 ta so\'zni takrorlang', metric: 'reviews', target: 20, rewardXp: QUEST_REWARD_XP.daily },
  { key: 'daily_games_2', period: 'daily', title: '2 ta o\'yin o\'ynang', description: "Istalgan 2 ta lug'at o'yinini tugating", metric: 'games', target: 2, rewardXp: QUEST_REWARD_XP.daily },
  { key: 'daily_context_3', period: 'daily', title: "3 ta so'zni gapda ishlating", description: 'Kontekst o\'yinlarida 3 ta so\'zni to\'g\'ri ishlating', metric: 'context_uses', target: 3, rewardXp: QUEST_REWARD_XP.daily },
  { key: 'weekly_master_50', period: 'weekly', title: "50 ta so'zni o'zlashtiring", description: "Bu hafta 50 ta so'z 'o'zlashtirilgan' holatiga yetsin", metric: 'mastered_words', target: 50, rewardXp: QUEST_REWARD_XP.weekly },
  { key: 'weekly_accuracy_90', period: 'weekly', title: "O'rtacha 90% aniqlik", description: "Kamida 5 ta o'yinda o'rtacha 90% aniqlikka erishing", metric: 'weekly_accuracy', target: 90, rewardXp: QUEST_REWARD_XP.weekly, derived: true },
  { key: 'weekly_games_10', period: 'weekly', title: '10 ta o\'yin tugating', description: "Bu hafta 10 ta o'yinni tugating", metric: 'games', target: 10, rewardXp: QUEST_REWARD_XP.weekly },
  { key: 'weekly_boss', period: 'weekly', title: 'Vocabulary Boss', description: 'Haftalik Vocabulary Boss sinovini tugating', metric: 'boss_completed', target: 1, rewardXp: QUEST_REWARD_XP.weekly },
];

export const MIN_GAMES_FOR_ACCURACY_QUEST = 5;

export function getQuestDef(key: string): QuestDef | undefined {
  return QUEST_DEFS.find((q) => q.key === key);
}

/** Davr kaliti: daily -> 'YYYY-MM-DD' (04:00 chegarali mahalliy sana), weekly -> 'YYYY-Www' (ISO hafta, dushanba boshlanadi). */
export function periodKey(period: QuestPeriod, now: Date, timeZone: string): string {
  const local = localDateWithCutoff(now, timeZone);
  if (period === 'daily') return local;
  return isoWeekKey(local);
}

/** 'YYYY-MM-DD' -> ISO hafta kaliti 'YYYY-Www'. */
export function isoWeekKey(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // dushanba = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // shu haftaning payshanbasi
  const weekYear = date.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}

/** Davr boshlanish sanasi ('YYYY-MM-DD') — haftalik uchun shu haftaning dushanbasi. */
export function periodStartDate(period: QuestPeriod, now: Date, timeZone: string): string {
  const local = localDateWithCutoff(now, timeZone);
  if (period === 'daily') return local;
  const [y, m, d] = local.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export interface QuestEvent {
  metric: QuestMetric;
  amount: number;
}

export type ProgressMap = Record<string, number>;

/** Hodisalarni progress xaritasiga qo'shadi (yangi obyekt qaytaradi). Derived vazifalar bu yerda yangilanmaydi. */
export function applyQuestEvents(progress: ProgressMap, defs: QuestDef[], events: QuestEvent[]): ProgressMap {
  const next: ProgressMap = { ...progress };
  for (const def of defs) {
    if (def.derived) continue;
    let add = 0;
    for (const ev of events) {
      if (ev.metric === def.metric && ev.amount > 0) add += ev.amount;
    }
    if (add > 0) next[def.key] = Math.min(def.target, (next[def.key] || 0) + add);
  }
  return next;
}

/** "O'rtacha X% aniqlik" — haftalik sessiyalar ro'yxatidan hisoblanadi. */
export function weeklyAccuracyProgress(sessions: Array<{ correctCount: number; wrongCount: number }>): number {
  if (sessions.length < MIN_GAMES_FOR_ACCURACY_QUEST) return 0;
  const accs = sessions
    .map((s) => {
      const t = s.correctCount + s.wrongCount;
      return t > 0 ? s.correctCount / t : null;
    })
    .filter((v): v is number => v != null);
  if (accs.length < MIN_GAMES_FOR_ACCURACY_QUEST) return 0;
  return Math.round((accs.reduce((a, b) => a + b, 0) / accs.length) * 100);
}

export interface QuestView {
  key: string;
  period: QuestPeriod;
  title: string;
  description: string;
  target: number;
  progress: number;
  done: boolean;
  rewardXp: number;
  /** 0..1 */
  ratio: number;
  claimed: boolean;
}

export function questView(def: QuestDef, progress: number, claimed: boolean): QuestView {
  const p = Math.max(0, Math.min(def.target, progress));
  return {
    key: def.key,
    period: def.period,
    title: def.title,
    description: def.description,
    target: def.target,
    progress: p,
    done: p >= def.target,
    rewardXp: def.rewardXp,
    ratio: def.target > 0 ? p / def.target : 0,
    claimed,
  };
}

/** Bugundan davr tugashigacha qolgan kunlar (haftalik uchun). */
export function daysLeftInPeriod(period: QuestPeriod, now: Date, timeZone: string): number {
  if (period === 'daily') return 0;
  const today = localDateWithCutoff(now, timeZone);
  const start = periodStartDate('weekly', now, timeZone);
  return 6 - daysBetween(start, today);
}
