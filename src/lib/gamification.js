// VOCABLY-TZ.md §13 (Motivatsiya va gamifikatsiya). Streak allaqachon bor edi
// (src/lib/srs.ts:computeStreakUpdate) — bu yerda XP, darajalar va yutuqlar.
import { XpEvent } from '@/lib/models';

// "Har amal XP beradi: takrorlash 1, to'g'ri javob 2, yangi so'z 5, mock 100."
// Takrorlash HAR DOIM 1 beradi (urinish uchun), + to'g'ri bo'lsa yana 2 —
// demak to'g'ri javob = 3, xato = 1.
export const XP = {
  REVIEW_ATTEMPT: 1,
  REVIEW_CORRECT_BONUS: 2,
  NEW_WORD: 5,
  MOCK_COMPLETE: 100,
};

export function xpForReview(isCorrect) {
  return XP.REVIEW_ATTEMPT + (isCorrect ? XP.REVIEW_CORRECT_BONUS : 0);
}

// CEFR nomlangan darajalar — chegaralar o'sib boruvchi egri chiziq bo'yicha
// (har keyingi daraja oldingisidan ancha ko'proq mashq talab qiladi, haqiqiy
// til o'rganishdagi kabi). Bu ballash tizimi hali kalibrlanmagan — TZ o'zi ham
// buni FAZA 5'da "bajariladigan" deb belgilagan, aniq sonlar keyinchalik
// foydalanuvchi ma'lumoti asosida sozlanishi mumkin.
export const LEVELS = [
  { key: 'A1', label: 'Boshlang\'ich', minXp: 0 },
  { key: 'A2', label: 'Elementar', minXp: 300 },
  { key: 'B1', label: "O'rta", minXp: 900 },
  { key: 'B2', label: "O'rtadan yuqori", minXp: 2200 },
  { key: 'C1', label: 'Yuqori', minXp: 4500 },
  { key: 'C2', label: 'Mukammal', minXp: 8000 },
];

/** Joriy daraja + keyingisigacha progress (0..1, oxirgi darajada 1). */
export function levelForXp(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = next ? Math.min(1, (xp - current.minXp) / (next.minXp - current.minXp)) : 1;
  return { current, next, progress, xp };
}

// Yutuqlar — VOCABLY-TZ.md §13 ro'yxatidan asosiylari. `check(stats)` — true
// qaytarsa yutuq beriladi. "Kechqurun boyqushi" (vaqt-asosli) va real-vaqtli
// "duel" kabi ijtimoiy/vaqt signallariga bog'liq yutuqlar kiritilmadi — ular
// alohida infratuzilma (real-vaqt hodisa kuzatuvi) talab qiladi.
export const BADGE_DEFS = [
  { key: 'words_100', label: "Birinchi 100 so'z", icon: '💯', check: (s) => s.masteredWords >= 100 },
  { key: 'words_500', label: "500 so'z ustasi", icon: '🏆', check: (s) => s.masteredWords >= 500 },
  { key: 'words_1000', label: "1000 so'z chempioni", icon: '👑', check: (s) => s.masteredWords >= 1000 },
  { key: 'streak_7', label: '7 kunlik olov', icon: '🔥', check: (s) => s.longestStreak >= 7 },
  { key: 'streak_30', label: '30 kunlik sodiqlik', icon: '⚡', check: (s) => s.longestStreak >= 30 },
  { key: 'streak_100', label: '100 kunlik afsona', icon: '🌟', check: (s) => s.longestStreak >= 100 },
  { key: 'mock_band_7', label: 'Mock 7.0+', icon: '🎯', check: (s) => (s.bestMockBand || 0) >= 7 },
  { key: 'perfect_session', label: 'Mukammal sessiya', icon: '✨', check: (s) => s.hadPerfectSession },
];

/** `user` — Mongoose User hujjati (chaqiruvchi keyin `user.save()` qiladi).
 * XpEvent'ni DARHOL yozadi (audit — save()ga bog'liq emas). */
export async function awardXp(user, amount, reason) {
  if (!amount) return;
  user.xp = (user.xp || 0) + amount;
  await XpEvent.create({ userId: user._id, amount, reason });
}

/** Berilgan statistika asosida hali olinmagan yutuqlarni User.badges'ga qo'shadi
 * (mutatsiya — save() chaqiruvchida). Yangi olingan yutuqlar ro'yxatini qaytaradi
 * (client'da "Yangi yutuq!" bildirishnomasi uchun). */
export function checkAndAwardBadges(user, stats) {
  const existing = new Set((user.badges || []).map((b) => b.key));
  const earned = [];
  for (const def of BADGE_DEFS) {
    if (existing.has(def.key)) continue;
    if (def.check(stats)) {
      user.badges.push({ key: def.key, earnedAt: new Date() });
      earned.push(def);
    }
  }
  return earned;
}

/** So'z statistikasini (mastered so'zlar soni) User hujjatidan hisoblaydi —
 * badge tekshiruvi uchun. `level >= 5` — src/lib/srs.ts:levelFromIntervalDays
 * bilan bir xil "o'zlashtirilgan" mezoni. */
export function countMasteredWords(user) {
  let count = 0;
  for (const cat of user.categories) {
    for (const w of cat.words) {
      if ((w.stats?.level || 0) >= 5) count += 1;
    }
  }
  return count;
}
