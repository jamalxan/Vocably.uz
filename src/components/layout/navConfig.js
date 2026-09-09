// Yagona navigatsiya manbai — Sidebar (desktop), NavRail (planshet, 768-1279px)
// va BottomNav (mobil, <768px) shu ro'yxatlardan o'qiydi, hech biri o'zining
// alohida nusxasini saqlamaydi (eski Sidebar.jsx'dagi `navItems` bunday emas edi).
// VOCABLY-TZ.md 3.1 (IA) va 3.2 (navigatsiya modeli)ga mos, lekin hozircha faqat
// haqiqatan mavjud bo'limlar bilan cheklangan — Oqish/Tinglash/Gapirish/Yozish/
// Mock TZ'ning keyingi fazalarida (3-4-bosqich) qo'shiladi, o'shanda shu yerga
// yangi bo'lim sifatida qo'shiladi.
import {
  Home,
  Layers,
  Sparkles,
  Users,
  User,
  BookOpen,
  Edit3,
  Grid,
  ListChecks,
  Zap,
  Headphones,
  RotateCw,
  PenSquare,
  Link2,
  GitBranch,
  Rows,
  Lightbulb,
  Swords,
} from 'lucide-react';

// Pastki tab bar (mobil) va Sidebar/Rail'ning yuqori qismidagi asosiy 5 ta bo'lim.
export const PRIMARY_NAV = [
  { key: 'home', label: 'Bugun', href: '/app', icon: Home },
  { key: 'lugat', label: "Lug'at", href: '/app/lugat', icon: Layers, matchPrefix: true },
  { key: 'ai', label: 'AI', href: '/app/ai', icon: Sparkles },
  { key: 'dostlar', label: "Do'stlar", href: '/app/dostlar', icon: Users, matchPrefix: true, requiresChatAccess: true },
  { key: 'profil', label: 'Profil', href: '/app/profil', icon: User },
];

// Lug'at ichidagi 8 ta rejim — Lug'at'ning o'z sahifasida menyu sifatida,
// desktop Sidebar'da "LUG'AT" bo'limi ostida ro'yxat sifatida ko'rinadi.
export const LUGAT_MODES = [
  { key: 'jadval', label: "Jadval", href: '/app/lugat/jadval', icon: BookOpen, description: "So'zlar ro'yxati va boshqaruvi" },
  { key: 'takrorlash', label: 'Bugungi takrorlash', href: '/app/lugat/takrorlash', icon: RotateCw, description: "SRS navbati bo'yicha takrorlash" },
  { key: 'kartochka', label: 'Kartochka', href: '/app/lugat/kartochka', icon: Layers, description: 'Aylantirib yodlash' },
  { key: 'test', label: 'Test', href: '/app/lugat/test', icon: ListChecks, description: "Ko'p variantli savollar" },
  { key: 'yozish', label: 'Yozish testi', href: '/app/lugat/yozish', icon: Edit3, description: "So'zni yozib mashq qilish" },
  { key: 'juftlik', label: 'Juftlikni topish', href: '/app/lugat/juftlik', icon: Grid, description: "Xotira o'yini" },
  { key: 'tezkor', label: "Tezkor o'yin", href: '/app/lugat/tezkor', icon: Zap, description: 'Vaqt bilan tez javob' },
  { key: 'tinglab-yozish', label: 'Tinglab yozish', href: '/app/lugat/tinglab-yozish', icon: Headphones, description: 'Audio orqali yozish' },
  // VOCABLY-TZ.md 6.2 — yangi rejimlar. Barchasi AI-boyitilgan so'zlarga muhtoj
  // (EnrichmentEmptyState shu holatni ko'rsatadi).
  { key: 'cloze', label: "Kontekstda tanish", href: '/app/lugat/cloze', icon: PenSquare, description: "Jumladagi bo'sh joyni to'ldirish" },
  { key: 'kollokatsiya', label: 'Kollokatsiya', href: '/app/lugat/kollokatsiya', icon: Link2, description: "To'g'ri sherik so'zni tanlash" },
  { key: 'soz-oilasi', label: "So'z oilasi", href: '/app/lugat/soz-oilasi', icon: GitBranch, description: "Bir o'zakdan turkumlarni ajratish" },
  { key: 'jumla-qurish', label: 'Jumla quruvchi', href: '/app/lugat/jumla-qurish', icon: Rows, description: "So'zlardan jumla yig'ish" },
  { key: 'mnemonika', label: 'Mnemonika', href: '/app/lugat/mnemonika', icon: Lightbulb, description: "O'z eslab qolish usulingizni yozing" },
  { key: 'antonim', label: 'Antonim jangi', href: '/app/lugat/antonim', icon: Swords, description: "Qarama-qarshi so'zni tez topish" },
];

// href aynan yoki prefiks sifatida joriy pathname'ga mos keladimi.
export function isNavActive(item, pathname) {
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(item.href + '/');
  return pathname === item.href;
}
