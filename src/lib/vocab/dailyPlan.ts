// Kunlik individual reja (TZ §19, §47). Tartib: 1) muddati o'tgan takrorlash, 2) yuqori xavfli zaif so'zlar,
// 3) yangi so'zlar, 4) o'yin bilan mustahkamlash, 5) kontekst mashqi, 6) ko'nikmalar bilan integratsiya.
// Foydalanuvchi tanlagan vaqtga (5/10/20/30/45+ daqiqa) qarab reja qisqaradi yoki kengayadi.
import { PLAN_COST_MIN, PLAN_TIME_OPTIONS } from './config';
import { GAME_SKILL, type SkillProfile } from './weakness';

export type PlanItemType = 'review' | 'weak' | 'new' | 'game' | 'listening' | 'writing' | 'speaking';

export interface PlanItem {
  type: PlanItemType;
  label: string;
  count: number;
  minutes: number;
  href: string;
  /** game uchun o'yin kaliti */
  gameKey?: string;
  reason?: string;
}

export interface DailyPlanInput {
  minutes: number;
  dueCount: number;
  overdueCount: number;
  weakCount: number;
  newAvailable: number;
  /** Bugungi yangi so'z limiti qoldig'i (tarifga qarab), null = cheksiz. */
  newWordsRemaining?: number | null;
  profile?: SkillProfile | null;
  availableGames: string[];
  /** Bugun allaqachon bajarilganlar (plan "qoldiq"ni ko'rsatadi). */
  done?: { reviews?: number; newWords?: number; games?: number };
}

export interface DailyPlan {
  minutes: number;
  items: PlanItem[];
  totalMinutes: number;
  summary: { review: number; weak: number; newWords: number; games: number; listening: number; writing: number; speaking: number };
}

export function normalizeMinutes(m: number | null | undefined): number {
  const v = Number(m);
  if (!isFinite(v) || v <= 0) return 10;
  const opts = PLAN_TIME_OPTIONS as readonly number[];
  // eng yaqin (past tomonga) variant
  let chosen = opts[0];
  for (const o of opts) if (v >= o) chosen = o;
  return chosen;
}

/** Profilga qarab zaif ko'nikmaga mos o'yinni birinchi qo'yadi. */
export function rankGames(available: string[], profile?: SkillProfile | null): string[] {
  const weight = (g: string) => {
    const skill = GAME_SKILL[g];
    const level = skill && profile ? profile[skill]?.level : 'unknown';
    return level === 'weak' ? 0 : level === 'medium' ? 1 : level === 'unknown' ? 1 : 2;
  };
  return available.slice().sort((a, b) => weight(a) - weight(b));
}

export function buildDailyPlan(input: DailyPlanInput): DailyPlan {
  const minutes = normalizeMinutes(input.minutes);
  let budget = minutes;
  const items: PlanItem[] = [];
  const cost = PLAN_COST_MIN;
  const doneReviews = input.done?.reviews || 0;
  const doneGames = input.done?.games || 0;

  const push = (item: PlanItem) => {
    items.push(item);
    budget -= item.minutes;
  };

  // 1) muddati o'tgan / due takrorlash — byudjetning 45% igacha
  const dueLeft = Math.max(0, input.dueCount - doneReviews);
  if (dueLeft > 0) {
    const maxByBudget = Math.floor((minutes * 0.45) / cost.reviewWord);
    const count = Math.max(1, Math.min(dueLeft, maxByBudget || 1));
    push({
      type: 'review',
      label: `${count} ta so'zni takrorlang`,
      count,
      minutes: Math.ceil(count * cost.reviewWord),
      href: '/app/lugat/takrorlash',
      reason: input.overdueCount > 0 ? `${input.overdueCount} ta so'zning muddati o'tgan` : 'SRS navbati',
    });
  }

  // 2) zaif so'zlar — o'yin orqali
  if (input.weakCount > 0 && budget >= cost.game) {
    push({
      type: 'weak',
      label: `Zaif so'zlar (${input.weakCount} ta) bilan mashq`,
      count: Math.min(input.weakCount, 10),
      minutes: cost.game,
      href: '/app/lugat/zaif-sozlar',
      reason: "Xato qilingan so'zlarni mustahkamlash",
    });
  }

  // 3) yangi so'zlar
  const newCap = input.newWordsRemaining == null ? Infinity : Math.max(0, input.newWordsRemaining);
  const newTarget = Math.min(input.newAvailable, newCap, minutes >= 30 ? 10 : minutes >= 20 ? 8 : minutes >= 10 ? 5 : 3);
  if (newTarget > 0 && budget >= newTarget * cost.newWord) {
    push({
      type: 'new',
      label: `${newTarget} ta yangi so'z`,
      count: newTarget,
      minutes: Math.ceil(newTarget * cost.newWord),
      href: '/app/lugat/kartochka',
      reason: "Yangi so'zlar bilan tanishing",
    });
  }

  // 4) o'yinlar — qolgan byudjetga qarab (kamida 1 ta, agar vaqt bo'lsa)
  const games = rankGames(input.availableGames, input.profile);
  const gamesWanted = minutes >= 30 ? 3 : minutes >= 20 ? 2 : 1;
  const gamesToDo = Math.max(0, gamesWanted - doneGames);
  for (let i = 0; i < gamesToDo && i < games.length && budget >= cost.game; i++) {
    const key = games[i];
    push({
      type: 'game',
      label: 'O\'yin bilan mustahkamlash',
      count: 1,
      minutes: cost.game,
      href: `/app/oyinlar/${key}`,
      gameKey: key,
      reason: GAME_SKILL[key] && input.profile?.[GAME_SKILL[key]]?.level === 'weak' ? "Zaif ko'nikmangiz" : undefined,
    });
  }

  // 5-6) ko'nikmalar integratsiyasi — faqat yetarli vaqt bo'lsa
  if (minutes >= 20 && budget >= cost.listening) {
    push({ type: 'listening', label: '1 ta tinglash mashqi', count: 1, minutes: cost.listening, href: '/app/tinglash', reason: "Eshitib tanishni mustahkamlash" });
  }
  if (minutes >= 30 && budget >= cost.writing) {
    push({ type: 'writing', label: '1 ta yozish mashqi', count: 1, minutes: cost.writing, href: '/app/yozish', reason: "Yangi so'zlarni yozuvda ishlating" });
  }
  if (minutes >= 45 && budget >= cost.speaking) {
    push({ type: 'speaking', label: '1 ta gapirish mashqi', count: 1, minutes: cost.speaking, href: '/app/gapirish', reason: "So'zlarni og'zaki ishlating" });
  }

  const sum = (t: PlanItemType) => items.filter((i) => i.type === t).reduce((s, i) => s + i.count, 0);
  return {
    minutes,
    items,
    totalMinutes: items.reduce((s, i) => s + i.minutes, 0),
    summary: {
      review: sum('review'),
      weak: sum('weak'),
      newWords: sum('new'),
      games: sum('game'),
      listening: sum('listening'),
      writing: sum('writing'),
      speaking: sum('speaking'),
    },
  };
}
