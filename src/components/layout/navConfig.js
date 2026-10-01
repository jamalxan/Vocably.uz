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

// Ko'nikma bo'limlari — /app/mashq menyusida va desktop sidebar'da ishlatiladi.
export const SKILL_SECTIONS = [
  { key: 'lugat', label: 'Vocabulary', href: '/app/lugat', icon: Layers, matchPrefix: true, description: "So'z boyligi va SRS takrorlash" },
  { key: 'oyinlar', label: 'Games', href: '/app/oyinlar', icon: Gamepad2, matchPrefix: true, description: "Lug'at o'yinlari, kunlik reja va vazifalar" },
  { key: 'oqish', label: 'Reading', href: '/app/oqish', icon: BookOpenText, matchPrefix: true, description: 'Reading — matn va tushunish savollari' },
  { key: 'tinglash', label: 'Listening', href: '/app/tinglash', icon: Ear, matchPrefix: true, description: 'Listening — audio va tushunish savollari' },
  { key: 'gapirish', label: 'Speaking', href: '/app/gapirish', icon: Mic, matchPrefix: true, description: 'Speaking — ovozli javob va AI baho' },
  { key: 'yozish-skill', label: 'Writing', href: '/app/yozish', icon: PenLine, matchPrefix: true, description: 'Writing — insho va AI baho' },
  { key: 'mock', label: 'Mock exam', href: '/app/mock', icon: Target, matchPrefix: true, description: "To'liq 4 bo'limli sinov imtihoni" },
  { key: 'xatolar', label: 'Mistakes', href: '/app/xatolar', icon: BookX, matchPrefix: true, description: "Xatolar daftari — xato javoblar va ulardagi so'zlarni takrorlash" },
];

// Desktop sidebar / planshet rail — joy yetarli, hammasi alohida ko'rinadi.
export const SIDEBAR_NAV = [
  { key: 'home', label: 'Today', href: '/app', icon: Home },
  ...SKILL_SECTIONS,
  // "AI" ATAYLAB yo'q — o'ng-pastdagi suzuvchi AI tugmasi (AppShell) yetarli,
  // ikkalasi bir vaqtda bo'lishi ortiqcha edi (2026-09-10 foydalanuvchi so'rovi).
  { key: 'reyting', label: 'Leaderboard', href: '/app/reyting', icon: Trophy },
  { key: 'dostlar', label: 'Friends', href: '/app/dostlar', icon: Users, matchPrefix: true, requiresChatAccess: true },
  // TCH-01/02 — faqat role === 'teacher' bo'lgan foydalanuvchilarga ko'rinadi
  // (AppShell.jsx'dagi `chatRole` filtri). Mobil pastki tab-bar'ga ATAYLAB
  // qo'shilmadi — u qat'iy 5 joy bilan cheklangan (pastdagi BOTTOM_NAV izohi).
  { key: 'teacher', label: 'Teacher panel', href: '/teacher', icon: GraduationCap, matchPrefix: true, requiresTeacherRole: true },
  { key: 'profil', label: 'Profile', href: '/app/profil', icon: User },
];

// Mobil pastki tab bar — 5 ta joy (TZ 3.2). "Mashq" barcha ko'nikma bo'limlarini
// (Lug'at/Oqish/Tinglash/Gapirish/Yozish) birlashtiradi — shu tugma ustida
// faollik BIRON-BIR ko'nikma yo'lida ekanida yonadi (`matchAny`).
export const BOTTOM_NAV = [
  { key: 'home', label: 'Today', href: '/app', icon: Home },
  {
    key: 'mashq',
    label: 'Practice',
    href: '/app/mashq',
    icon: Dumbbell,
    matchPrefix: true,
    matchAny: SKILL_SECTIONS.map((s) => s.href),
  },
  { key: 'ai', label: 'AI', href: '/app/ai', icon: Sparkles },
  { key: 'dostlar', label: 'Friends', href: '/app/dostlar', icon: Users, matchPrefix: true, requiresChatAccess: true },
  { key: 'profil', label: 'Profile', href: '/app/profil', icon: User },
];

// Lug'at ichidagi rejimlar — Lug'at'ning o'z sahifasida menyu sifatida,
// desktop Sidebar'da "LUG'AT" bo'limi ostida ro'yxat sifatida ko'rinadi.
export const LUGAT_MODES = [
  { key: 'jadval', label: 'Word list', href: '/app/lugat/jadval', icon: BookOpen, description: "So'zlar ro'yxati va boshqaruvi" },
  { key: 'takrorlash', label: 'Daily review', href: '/app/lugat/takrorlash', icon: RotateCw, description: "SRS navbati bo'yicha takrorlash" },
  { key: 'kartochka', label: 'Flashcards', href: '/app/lugat/kartochka', icon: Layers, description: 'Aylantirib yodlash' },
  { key: 'test', label: 'Quiz', href: '/app/lugat/test', icon: ListChecks, description: "Ko'p variantli savollar" },
  { key: 'yozish', label: 'Spelling', href: '/app/lugat/yozish', icon: Edit3, description: "So'zni yozib mashq qilish" },
  { key: 'juftlik', label: 'Match pairs', href: '/app/lugat/juftlik', icon: Grid, description: "Xotira o'yini" },
  { key: 'tezkor', label: 'Speed round', href: '/app/lugat/tezkor', icon: Zap, description: 'Vaqt bilan tez javob' },
  { key: 'tinglab-yozish', label: 'Dictation', href: '/app/lugat/tinglab-yozish', icon: Headphones, description: 'Audio orqali yozish' },
  { key: 'cloze', label: 'In context', href: '/app/lugat/cloze', icon: PenSquare, description: "Jumladagi bo'sh joyni to'ldirish" },
  { key: 'kollokatsiya', label: 'Collocations', href: '/app/lugat/kollokatsiya', icon: Link2, description: "To'g'ri sherik so'zni tanlash" },
  { key: 'soz-oilasi', label: 'Word family', href: '/app/lugat/soz-oilasi', icon: GitBranch, description: "Bir o'zakdan turkumlarni ajratish" },
  { key: 'jumla-qurish', label: 'Sentence builder', href: '/app/lugat/jumla-qurish', icon: Rows, description: "So'zlardan jumla yig'ish" },
  { key: 'mnemonika', label: 'Mnemonics', href: '/app/lugat/mnemonika', icon: Lightbulb, description: "O'z eslab qolish usulingizni yozing" },
  { key: 'antonim', label: 'Antonym battle', href: '/app/lugat/antonim', icon: Swords, description: "Qarama-qarshi so'zni tez topish" },
  { key: 'zaif-sozlar', label: 'Weak words', href: '/app/lugat/zaif-sozlar', icon: Crosshair, description: "Xato qilingan so'zlar va sabablari" },
  { key: 'kutubxona', label: 'Library', href: '/app/lugat/kutubxona', icon: BookMarked, description: "Tekshirilgan so'zlar to'plami — lug'atga qo'shing" },
];

// href aynan yoki prefiks sifatida (yoki matchAny ro'yxatidagilardan biri prefiks
// sifatida) joriy pathname'ga mos keladimi.
export function isNavActive(item, pathname) {
  if (item.matchAny) return item.matchAny.some((href) => pathname === href || pathname.startsWith(href + '/'));
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(item.href + '/');
  return pathname === item.href;
}
