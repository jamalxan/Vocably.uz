// O'yin uchun so'zlarni tanlash — ustuvorlik balli (TZ §7.5): muddati o'tgan davomiylik,
// xatolar soni, mastery zaifligi, IELTS ahamiyati, yaqinda qilingan xatolar, retention xavfi.
import type { GameWord } from './games';
import { sample, shuffle, type Rand } from './rng';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SelectableWord extends GameWord {
  nextReview?: Date | string | null;
  srsState?: string;
  lapses?: number;
  reps?: number;
  /** 0..100 */
  mastery?: number;
  /** 0..100 (yuqori = zaifroq) */
  weakness?: number;
  isLeech?: boolean;
  /** 0..1 */
  ieltsRelevance?: number;
}

export type SelectionMode = 'mixed' | 'review' | 'weak' | 'new';

export function isDue(w: SelectableWord, now: Date = new Date()): boolean {
  if ((w.srsState || 'new') === 'new' && !(w.reps || 0)) return false;
  const next = w.nextReview ? new Date(w.nextReview).getTime() : 0;
  return next <= now.getTime();
}

export function isNewWord(w: SelectableWord): boolean {
  return (w.srsState || 'new') === 'new' && !(w.reps || 0);
}

export function overdueDays(w: SelectableWord, now: Date = new Date()): number {
  if (!w.nextReview) return 0;
  const d = (now.getTime() - new Date(w.nextReview).getTime()) / DAY_MS;
  return d > 0 ? d : 0;
}

/** Yuqori = birinchi navbatda takrorlash kerak. */
export function priorityScore(w: SelectableWord, now: Date = new Date()): number {
  const overdue = isNewWord(w) ? 0 : Math.min(30, overdueDays(w, now)) * 2;
  const weak = (w.weakness || 0) * 0.6;
  const masteryGap = (100 - (w.mastery || 0)) * 0.15;
  const fails = Math.min(10, w.lapses || 0) * 3;
  const ielts = (w.ieltsRelevance || 0) * 10;
  const leech = w.isLeech ? 15 : 0;
  // Yangi so'z — o'rtacha ustuvorlik (muddati o'tganlar va zaiflardan keyin).
  const newBoost = isNewWord(w) ? 8 : 0;
  return overdue + weak + masteryGap + fails + ielts + leech + newBoost;
}

export interface Selection {
  selected: SelectableWord[];
  /** Qolgan so'zlar — distraktor sifatida ishlatiladi. */
  distractors: SelectableWord[];
}

export function selectWordsForGame(words: SelectableWord[], n: number, mode: SelectionMode, rand: Rand, now: Date = new Date()): Selection {
  const all = words.filter((w) => w.word && w.wordId);
  if (all.length <= n) return { selected: shuffle(all, rand), distractors: [] };

  let candidates = all;
  if (mode === 'review') {
    const due = all.filter((w) => isDue(w, now));
    candidates = due.length >= Math.min(n, 4) ? due : all;
  } else if (mode === 'weak') {
    const weak = all.filter((w) => (w.weakness || 0) >= 40 || w.isLeech);
    candidates = weak.length >= Math.min(n, 4) ? weak : all;
  } else if (mode === 'new') {
    const fresh = all.filter(isNewWord);
    candidates = fresh.length >= Math.min(n, 4) ? fresh : all;
  }

  const ranked = candidates.slice().sort((a, b) => priorityScore(b, now) - priorityScore(a, now));
  let selected: SelectableWord[];
  if (mode === 'mixed') {
    const top = ranked.slice(0, Math.ceil(n * 0.5));
    const topIds = new Set(top.map((w) => w.wordId));
    const learning = sample(
      all.filter((w) => !topIds.has(w.wordId) && (w.mastery || 0) < 80),
      Math.ceil(n * 0.3),
      rand
    );
    selected = [...top, ...learning];
    const have = new Set(selected.map((w) => w.wordId));
    const rest = all.filter((w) => !have.has(w.wordId));
    selected = [...selected, ...sample(rest, n - selected.length, rand)];
  } else {
    // ustuvorlik bo'yicha yuqori n tasi, lekin biroz tasodifiylik qo'shamiz (har safar bir xil bo'lmasin)
    const head = ranked.slice(0, Math.min(ranked.length, n * 2));
    selected = sample(head, n, rand);
    if (selected.length < n) {
      const have = new Set(selected.map((w) => w.wordId));
      selected = [...selected, ...sample(all.filter((w) => !have.has(w.wordId)), n - selected.length, rand)];
    }
  }
  selected = shuffle(selected.slice(0, n), rand);
  const chosen = new Set(selected.map((w) => w.wordId));
  return { selected, distractors: all.filter((w) => !chosen.has(w.wordId)) };
}
