// Navigatsiya yorliqlari inglizcha (2026-09-29, foydalanuvchi so'rovi) — URL'lar o'zgarmagan.
// Yagona navigatsiya manbai — Sidebar (desktop), NavRail (planshet, 768-1279px)
// va BottomNav (mobil, <768px) shu ro'yxatlardan o'qiydi, hech biri o'zining
// alohida nusxasini saqlamaydi (eski Sidebar.jsx'dagi `navItems` bunday emas edi).
// VOCABLY-TZ.md 3.1 (IA) va 3.2 (navigatsiya modeli). FAZA 3 bilan Oqish/Tinglash/
// Gapirish/Yozish qo'shildi — desktop sidebar'da (joy ko'p) ular alohida bo'lim,
// lekin mobil pastki tab-bar 5 ta joydan ortig'ini sig'dira olmaydi (TZ 3.2'ning
// o'zi ham shu sabab "Mashq" degan YAGONA umbrella tab taklif qilgan edi) — shuning
// uchun SIDEBAR_NAV (to'liq) va BOTTOM_NAV (5 ta, "Mashq" barcha ko'nikmalarni
// birlashtiradi) endi ATAYLAB IKKI XIL ro'yxat.
import {
  Home,
  Layers,
  Sparkles,
  Users,
  User,
  BookOpen,
  BookOpenText,
  Edit3,
  Grid,
  ListChecks,
  Zap,
  Headphones,
  Ear,
  Mic,
  PenLine,
  Dumbbell,
  RotateCw,
  PenSquare,
  Link2,
  GitBranch,
  Rows,
  Lightbulb,
  Swords,
  Target,
  Trophy,
  GraduationCap,
  BookX,
  Gamepad2,
  Crosshair,
  BookMarked,
} from 'lucide-react';

// Ko'nikma bo'limlari — /app/practice menyusida va desktop sidebar'da ishlatiladi.
export const SKILL_SECTIONS = [
  { key: 'lugat', label: 'Vocabulary', href: '/app/vocabulary', icon: Layers, matchPrefix: true, description: "So'z boyligi va SRS takrorlash" },
  { key: 'oyinlar', label: 'Games', href: '/app/games', icon: Gamepad2, matchPrefix: true, description: "Lug'at o'yinlari, kunlik reja va vazifalar" },
  { key: 'oqish', label: 'Reading', href: '/app/reading', icon: BookOpenText, matchPrefix: true, description: 'Reading — matn va tushunish savollari' },
  { key: 'tinglash', label: 'Listening', href: '/app/listening', icon: Ear, matchPrefix: true, description: 'Listening — audio va tushunish savollari' },
  { key: 'gapirish', label: 'Speaking', href: '/app/speaking', icon: Mic, matchPrefix: true, description: 'Speaking — ovozli javob va AI baho' },
  { key: 'yozish-skill', label: 'Writing', href: '/app/writing', icon: PenLine, matchPrefix: true, description: 'Writing — insho va AI baho' },
  { key: 'mock', label: 'Mock exam', href: '/app/mock', icon: Target, matchPrefix: true, description: "To'liq 4 bo'limli sinov imtihoni" },
  { key: 'xatolar', label: 'Mistakes', href: '/app/mistakes', icon: BookX, matchPrefix: true, description: "Xatolar daftari — xato javoblar va ulardagi so'zlarni takrorlash" },
];

// Desktop sidebar / planshet rail — joy yetarli, hammasi alohida ko'rinadi.
export const SIDEBAR_NAV = [
  { key: 'home', label: 'Today', href: '/app', icon: Home },
  ...SKILL_SECTIONS,
  // "AI" ATAYLAB yo'q — o'ng-pastdagi suzuvchi AI tugmasi (AppShell) yetarli,
  // ikkalasi bir vaqtda bo'lishi ortiqcha edi (2026-09-10 foydalanuvchi so'rovi).
  { key: 'reyting', label: 'Leaderboard', href: '/app/leaderboard', icon: Trophy },
  { key: 'dostlar', label: 'Friends', href: '/app/friends', icon: Users, matchPrefix: true, requiresChatAccess: true },
  // TCH-01/02 — faqat role === 'teacher' bo'lgan foydalanuvchilarga ko'rinadi
  // (AppShell.jsx'dagi `chatRole` filtri). Mobil pastki tab-bar'ga ATAYLAB
  // qo'shilmadi — u qat'iy 5 joy bilan cheklangan (pastdagi BOTTOM_NAV izohi).
  { key: 'teacher', label: 'Teacher panel', href: '/teacher', icon: GraduationCap, matchPrefix: true, requiresTeacherRole: true },
  { key: 'profil', label: 'Profile', href: '/app/profile', icon: User },
];

// Mobil pastki tab bar — 5 ta joy (TZ 3.2). "Mashq" barcha ko'nikma bo'limlarini
// (Lug'at/Oqish/Tinglash/Gapirish/Yozish) birlashtiradi — shu tugma ustida
// faollik BIRON-BIR ko'nikma yo'lida ekanida yonadi (`matchAny`).
export const BOTTOM_NAV = [
  { key: 'home', label: 'Today', href: '/app', icon: Home },
  {
    key: 'mashq',
    label: 'Practice',
    href: '/app/practice',
    icon: Dumbbell,
    matchPrefix: true,
    matchAny: SKILL_SECTIONS.map((s) => s.href),
  },
  { key: 'ai', label: 'AI', href: '/app/ai', icon: Sparkles },
  { key: 'dostlar', label: 'Friends', href: '/app/friends', icon: Users, matchPrefix: true, requiresChatAccess: true },
  { key: 'profil', label: 'Profile', href: '/app/profile', icon: User },
];

// Lug'at ichidagi rejimlar — Lug'at'ning o'z sahifasida menyu sifatida (group: 'study' = faqat shu
// bo'limda bor o'rganish usullari, 'drill' = ballsiz tez mashqlar; XP'li ko'rinishi /app/games'da),
// desktop Sidebar'da "LUG'AT" bo'limi ostida ro'yxat sifatida ko'rinadi.
export const LUGAT_MODES = [
  { key: 'jadval', label: 'Word list', group: 'study', href: '/app/vocabulary/words', icon: BookOpen, description: "So'zlar ro'yxati va boshqaruvi" },
  { key: 'takrorlash', label: 'Daily review', group: 'study', href: '/app/vocabulary/review', icon: RotateCw, description: "SRS navbati bo'yicha takrorlash" },
  { key: 'kartochka', label: 'Flashcards', group: 'study', href: '/app/vocabulary/flashcards', icon: Layers, description: 'Aylantirib yodlash' },
  { key: 'test', label: 'Quiz', group: 'drill', href: '/app/vocabulary/quiz', icon: ListChecks, description: "Ko'p variantli savollar" },
  { key: 'yozish', label: 'Spelling', group: 'drill', href: '/app/vocabulary/spelling', icon: Edit3, description: "So'zni yozib mashq qilish" },
  { key: 'juftlik', label: 'Match pairs', group: 'drill', href: '/app/vocabulary/match', icon: Grid, description: "Xotira o'yini" },
  { key: 'tezkor', label: 'Speed round', group: 'drill', href: '/app/vocabulary/speed', icon: Zap, description: 'Vaqt bilan tez javob' },
  { key: 'tinglab-yozish', label: 'Dictation', group: 'drill', href: '/app/vocabulary/dictation', icon: Headphones, description: 'Audio orqali yozish' },
  { key: 'cloze', label: 'In context', group: 'drill', href: '/app/vocabulary/context', icon: PenSquare, description: "Jumladagi bo'sh joyni to'ldirish" },
  { key: 'kollokatsiya', label: 'Collocations', group: 'drill', href: '/app/vocabulary/collocations', icon: Link2, description: "To'g'ri sherik so'zni tanlash" },
  { key: 'soz-oilasi', label: 'Word family', group: 'drill', href: '/app/vocabulary/word-family', icon: GitBranch, description: "Bir o'zakdan turkumlarni ajratish" },
  { key: 'jumla-qurish', label: 'Sentence builder', group: 'drill', href: '/app/vocabulary/sentence-builder', icon: Rows, description: "So'zlardan jumla yig'ish" },
  { key: 'mnemonika', label: 'Mnemonics', group: 'study', href: '/app/vocabulary/mnemonics', icon: Lightbulb, description: "O'z eslab qolish usulingizni yozing" },
  { key: 'antonim', label: 'Antonym battle', group: 'drill', href: '/app/vocabulary/antonyms', icon: Swords, description: "Qarama-qarshi so'zni tez topish" },
  { key: 'zaif-sozlar', label: 'Weak words', group: 'study', href: '/app/vocabulary/weak-words', icon: Crosshair, description: "Xato qilingan so'zlar va sabablari" },
  { key: 'kutubxona', label: 'Library', group: 'study', href: '/app/vocabulary/library', icon: BookMarked, description: "Tekshirilgan so'zlar to'plami — lug'atga qo'shing" },
];

// href aynan yoki prefiks sifatida (yoki matchAny ro'yxatidagilardan biri prefiks
// sifatida) joriy pathname'ga mos keladimi.
export function isNavActive(item, pathname) {
  if (item.matchAny) return item.matchAny.some((href) => pathname === href || pathname.startsWith(href + '/'));
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(item.href + '/');
  return pathname === item.href;
}
