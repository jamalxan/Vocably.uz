// Yutuqlar (TZ §17). Hodisaga asoslangan va bir marta beriladi (User.badges + XP idempotency kalit).
// Mavjud BADGE_DEFS kalitlari (words_100, streak_7, ...) saqlanadi — bu yerda YANGI yutuqlar qo'shiladi;
// src/lib/gamification.js ikkalasini birlashtiradi.
export interface AchievementStats {
  /** level >= 5 (intervalDays >= 21) bo'lgan so'zlar soni — eski mezon. */
  masteredWords?: number;
  /** Qo'shilgan jami so'zlar. */
  totalWords?: number;
  longestStreak?: number;
  listeningCorrect?: number;
  spellingCorrect?: number;
  gamesCompleted?: number;
  bossCompleted?: number;
  /** B2+ (academic/IELTS) darajali so'zlar. */
  ieltsWords?: number;
  /** Mastery >= 'advanced' so'zlar. */
  advancedWords?: number;
  hadPerfectSession?: boolean;
  bestMockBand?: number;
}

export interface AchievementDef {
  key: string;
  label: string;
  description: string;
  icon: string;
  check: (s: AchievementStats) => boolean;
}

const n = (v: number | undefined) => v || 0;

export const NEW_ACHIEVEMENT_DEFS: AchievementDef[] = [
  { key: 'first_word', label: "Birinchi so'z", description: "Birinchi so'zingizni qo'shdingiz", icon: '🌱', check: (s) => n(s.totalWords) >= 1 },
  { key: 'first_game', label: 'Birinchi o\'yin', description: "Birinchi lug'at o'yinini tugatdingiz", icon: '🎮', check: (s) => n(s.gamesCompleted) >= 1 },
  { key: 'games_25', label: "25 ta o'yin", description: "25 ta o'yinni tugatdingiz", icon: '🕹️', check: (s) => n(s.gamesCompleted) >= 25 },
  { key: 'streak_365', label: '365 kunlik afsona', description: 'Bir yil ketma-ket mashq qildingiz', icon: '🏅', check: (s) => n(s.longestStreak) >= 365 },
  { key: 'vocabulary_master', label: 'Vocabulary Master', description: "200 ta so'z 'ilg'or' darajaga yetdi", icon: '📚', check: (s) => n(s.advancedWords) >= 200 },
  { key: 'listening_master', label: 'Listening Master', description: "200 ta to'g'ri eshitib-tanish javobi", icon: '👂', check: (s) => n(s.listeningCorrect) >= 200 },
  { key: 'spelling_master', label: 'Spelling Master', description: "200 ta to'g'ri imlo javobi", icon: '✍️', check: (s) => n(s.spellingCorrect) >= 200 },
  { key: 'ielts_vocab_expert', label: 'IELTS Vocabulary Expert', description: "150 ta B2+ darajali so'z", icon: '🎓', check: (s) => n(s.ieltsWords) >= 150 },
  { key: 'boss_slayer', label: 'Boss Slayer', description: 'Vocabulary Boss sinovini tugatdingiz', icon: '👑', check: (s) => n(s.bossCompleted) >= 1 },
];

/** Hali olinmagan yutuqlardan statistika talabini bajarganlarini qaytaradi (sof funksiya). */
export function evaluateAchievements(stats: AchievementStats, earnedKeys: Iterable<string>): AchievementDef[] {
  const earned = new Set(earnedKeys);
  return NEW_ACHIEVEMENT_DEFS.filter((d) => !earned.has(d.key) && d.check(stats));
}
