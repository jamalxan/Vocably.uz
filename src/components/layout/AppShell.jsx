'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Monitor, ChevronRight, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import IconButton from '@/components/ui/IconButton';
import NotificationBell from '@/components/NotificationBell';
import AiPanel from './AiPanel';
import { SIDEBAR_NAV, BOTTOM_NAV, LUGAT_MODES, isNavActive } from './navConfig';

// AppShell — VOCABLY-TZ.md 3.2 (navigatsiya modeli) va R1 (planshet layout yo'q)
// muammosini yopadi: UCHTA holat, hammasi shu bitta komponentda, JS breakpoint
// aniqlash EMAS — faqat Tailwind responsive klasslar orqali (SSR'da hech qanday
// "flash of wrong layout" bo'lmasligi uchun):
//   <768px   — pastki tab bar (5 element), hamburger yo'q (TZ 3.2: "olib tashlanadi")
//   768-1279 — 72px ikonka rail, hover'da vaqtinchalik kengayadi (overlay, layout
//              siljimaydi — rail `fixed`, shuning uchun kengayish content ustidan o'tadi)
//   1280+    — to'liq sidebar (260px), Lug'at bo'limi ichki 8 rejimni ko'rsatadi
// Bitta manba: navConfig.js — ilgari Sidebar.jsx'da qattiq yozilgan `navItems`
// endi shu uch holatning barchasida qayta ishlatiladi. Barcha ichki havolalar
// next/link — oddiy <a> to'liq sahifa qayta yuklanishiga (va shu bilan
// AppProvider/socket ulanishlarining qayta ishga tushishiga) olib kelardi.
export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, logout, chatAccess, token } = useApp();

  const visibleSidebarNav = SIDEBAR_NAV.filter((item) => !item.requiresChatAccess || chatAccess);
  const visibleBottomNav = BOTTOM_NAV.filter((item) => !item.requiresChatAccess || chatAccess);
  const onLugat = pathname.startsWith('/app/lugat');

  // Lug'at submenu ATAYLAB alohida holatga ega (faqat marshrutdan kelib
  // chiqmaydi) — 2026-09-10 so'rovi: "ustiga bosilganda kengayadi, yana ustiga
  // bosilsa yopiladi". Boshqa joydan /app/lugat'ga o'tilganda avtomatik ochiladi
  // (quyidagi effekt), lekin Lug'at allaqachon faol bo'lganda tugma navigatsiya
  // qilmaydi — faqat ochiq/yopiqni almashtiradi.
  const [lugatOpen, setLugatOpen] = useState(onLugat);
  useEffect(() => {
    if (onLugat) setLugatOpen(true);
  }, [onLugat]);

  return (
    <div className="min-h-dvh bg-bg bg-grain">
      {/* ============ DESKTOP — to'liq sidebar (1280px+) ============ */}
      {/* TZ §B5 item 3 — tekis bordo o'rniga yuqoridan pastga gradient + o'ng
          qirrada nozik accent chizig'i (premium his). */}
      <aside
        className="hidden xl:flex fixed inset-y-0 left-0 z-30 w-64 flex-col text-on-primary border-r border-accent/20"
        style={{ background: 'linear-gradient(160deg, #4A1226, #2A0C18)' }}
      >
        <div className="p-5 overflow-y-auto flex-1">
          <Link href="/app" className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-on-accent font-bold text-lg font-display shadow-glow flex-shrink-0">
              V
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-on-primary tracking-wide font-luxury leading-tight">
                Voc<span className="text-accent">ably</span>
              </h1>
              <p className="text-[10px] text-on-primary/50 leading-tight">Ingliz tili yordamchisi</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {visibleSidebarNav.map((item) => {
              const active = isNavActive(item, pathname);
              return (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    className={navItemClass(active)}
                    onClick={(e) => {
                      // Lug'at allaqachon faol bo'lsa, bosish faqat ochiq/yopiqni
                      // almashtiradi — qayta navigatsiya qilmaydi.
                      if (item.key === 'lugat' && onLugat) {
                        e.preventDefault();
                        setLugatOpen((o) => !o);
                      }
                    }}
                  >
                    <item.icon size={16} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.key === 'lugat' && (
                      <ChevronRight size={14} className={`transition-transform ${onLugat && lugatOpen ? 'rotate-90' : ''}`} />
                    )}
                  </Link>
                  {item.key === 'lugat' && onLugat && lugatOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l border-on-primary/10 space-y-0.5">
                      {LUGAT_MODES.map((mode) => (
                        <Link key={mode.key} href={mode.href} className={navItemClass(pathname === mode.href, true)}>
                          <mode.icon size={14} />
                          <span className="flex-1 text-left truncate">{mode.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          </nav>
        </div>

        <div className="p-4 border-t border-on-primary/10 flex items-center justify-between">
          <Link href="/app/profil" className="flex items-center gap-2.5 truncate pr-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="truncate">
              <p className="text-[10px] text-on-primary/50">Profil</p>
              <p className="text-sm font-semibold text-on-primary truncate">{displayName}</p>
            </div>
          </Link>
          <IconButton icon={LogOut} label="Chiqish" variant="ghost-on-primary" onClick={logout} />
        </div>
      </aside>

      {/* ============ PLANSHET — 72px ikonka rail, hover'da kengayadi (768-1279px) ============ */}
      <aside
        className="hidden md:flex xl:hidden group fixed inset-y-0 left-0 z-30 w-[72px] hover:w-64 flex-col text-on-primary border-r border-accent/20 transition-[width] duration-200 ease-out overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #4A1226, #2A0C18)' }}
      >
        <div className="p-3 flex-1 overflow-y-auto">
          <Link href="/app" className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-on-accent font-bold text-lg font-display shadow-glow flex-shrink-0">
              V
            </div>
            <span className="text-lg font-bold text-on-primary font-luxury opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Voc<span className="text-accent">ably</span>
            </span>
          </Link>
          <nav className="space-y-1">
            {visibleSidebarNav.map((item) => {
              const active = isNavActive(item, pathname);
              return (
                <Link key={item.key} href={item.href} className={navItemClass(active)} title={item.label}>
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={logout} className="m-3 p-2.5 rounded-lg text-on-primary/60 hover:text-accent hover:bg-primary-hover transition-colors flex items-center gap-3 flex-shrink-0" title="Chiqish" aria-label="Chiqish">
          <LogOut size={16} className="flex-shrink-0" />
        </button>
      </aside>

      {/* ============ MOBIL — pastki tab bar (<768px) ============ */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-primary text-on-primary flex items-stretch border-t border-on-primary/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {visibleBottomNav.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[44px] text-[11px] font-medium transition-colors ${
                active ? 'text-accent' : 'text-on-primary/55'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ============ Kontent ============ */}
      <div className="md:pl-[72px] xl:pl-64 pb-16 md:pb-0 h-dvh flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-end gap-2 px-4 sm:px-6 py-3 bg-bg/90 backdrop-blur-md border-b border-border">
          <ThemeToggle />
          <NotificationBell token={token} onOpenFriends={() => router.push('/app/dostlar')} />
        </header>
        {/* TZ-vocably-v2.md BUG-023 (2026-09-12 haqiqiy brauzerda qayta topildi va
            tuzatildi): yuqoridagi konteyner ILGARI `min-h-dvh` edi — bu FAQAT pastki
            chegara, "max" emas, shuning uchun /app/dostlar kabi ko'p xabarli sahifada
            konteynerning haqiqiy balandligi kontent bo'yicha ~4000px'gacha o'sib
            ketardi. `main`ning `flex-1 min-h-0` zanjiri ishlashi uchun bu ota
            konteynerning ANIQ (min emas) balandligi bo'lishi SHART — aks holda
            "qolgan bo'sh joy"ni hisoblab bo'lmaydi va `main` ham xuddi shunday
            cho'zilib ketadi: ConversationView'ning `overflow-y-auto` xabarlar
            ro'yxati hech qachon o'z ichida scroll bo'lmaydi, buning o'rniga BUTUN
            SAHIFA scroll bo'ladi va chat header (avatar/onlayn/tugmalar) ekrandan
            tashqariga chiqib ketadi — aynan shu bug foydalanuvchi tomonidan
            "chat dizayni yana buzilgan" deb topildi. `h-dvh` (aniq balandlik,
            overflow:visible bilan) muammoni tuzatadi HAM oddiy sahifalarning butun
            oyna darajasidagi scroll'ini buzmaydi — overflow visible bo'lgani uchun
            uzun kontent baribir konteyner chegarasidan "toshib" ketaveradi va
            hujjat odatdagidek scroll bo'ladi, faqat endi flex-1 zanjiri uchun ham
            haqiqiy asos bor. Https://vocably.uz'da jonli DOM orqali tasdiqlangan. */}
        <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      </div>
      <AiPanel />
    </div>
  );
}

function navItemClass(active, compact = false) {
  return `w-full flex items-center gap-3 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'} rounded-xl transition-all duration-200 ${
    active ? 'bg-accent text-on-accent font-medium shadow-glow' : 'hover:bg-primary-hover text-on-primary/60 hover:text-on-primary'
  }`;
}

const THEME_ICON = { system: Monitor, light: Sun, dark: Moon };
const THEME_OPTIONS = [
  { value: 'light', label: "Yorug'", icon: Sun },
  { value: 'dark', label: 'Tungi', icon: Moon },
  { value: 'system', label: 'Tizim', icon: Monitor },
];

// TZ-vocably-v2.md BUG-004: avval bitta ikonka tugma edi, bosilganda uchta
// holat orasida yashirin tartibda sikllanardi — foydalanuvchi nima
// bo'layotganini bilmasdi. Endi uchta aniq nomlangan variant bilan dropdown.
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const Icon = THEME_ICON[theme];

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <IconButton icon={Icon} label="Mavzuni tanlash" onClick={() => setOpen((v) => !v)} />
      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-40 bg-surface-2 border border-border rounded-xl shadow-premium overflow-hidden py-1">
          {THEME_OPTIONS.map(({ value, label, icon: OptIcon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                theme === value ? 'text-accent font-semibold bg-accent-soft' : 'text-ink hover:bg-bg-sunken'
              }`}
            >
              <OptIcon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
