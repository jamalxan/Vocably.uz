'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Activity, GraduationCap, Users, MessagesSquare, Flag, ScrollText, LogOut, ShieldCheck, Menu, X, Megaphone, BookOpen, Library, ClipboardCheck, Sparkles, Sticker, Wallet, Gauge } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { registerChatsTap } from '@/lib/adminHiddenChats';

// Grouped so the 13 screens read as four jobs instead of one long list.
// Content comes first among the working groups' order of daily use:
// uploading via the AI agent is the main way content gets in.
const NAV_GROUPS = [
  {
    label: 'Umumiy',
    items: [
      { href: '/admin', label: 'Statistika', icon: BarChart3, exact: true },
      { href: '/admin/activity', label: 'Faollik', icon: Activity },
      { href: '/admin/learning', label: "O'quv analitikasi", icon: GraduationCap },
    ],
  },
  {
    label: 'Kontent',
    items: [
      { href: '/admin/content/ai', label: 'Kontent yuklash (AI)', icon: Sparkles },
      { href: '/admin/exam-tests', label: 'IELTS testlar', icon: BookOpen },
      { href: '/admin/content/review', label: 'Tekshiruv navbati', icon: ClipboardCheck },
      { href: '/admin/content/quality', label: 'Kontent sifati', icon: Gauge },
      { href: '/admin/content/books', label: 'Kitoblar (fon ishlovi)', icon: Library },
    ],
  },
  {
    label: 'Foydalanuvchilar',
    items: [
      { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
      { href: '/admin/payments', label: "To'lovlar", icon: Wallet, badgeKey: 'payments' },
      // `/admin/c/<id>` — bitta suhbatning to'g'ridan-to'g'ri havolasi, ham shu bo'limga tegishli.
      { href: '/admin/conversations', label: 'Suhbatlar', icon: MessagesSquare, also: ['/admin/c/'], secretTap: true },
      { href: '/admin/reports', label: 'Reportlar', icon: Flag },
    ],
  },
  {
    label: 'Aloqa va tizim',
    items: [
      { href: '/admin/announcements', label: "E'lonlar", icon: Megaphone },
      { href: '/admin/stickers', label: 'Stikerlar', icon: Sticker },
      { href: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
    ],
  },
];
const NAV = NAV_GROUPS.flatMap((g) => g.items);

// xl (1280px) dan pastda sidebar drawer bo'ladi — planshetda kontent to'liq kenglikda.
const DESKTOP_QUERY = '(min-width: 1280px)';

function isActive(item, pathname) {
  if (item.exact) return pathname === item.href;
  return pathname.startsWith(item.href) || (item.also || []).some((p) => pathname.startsWith(p));
}

function NavLink({ item, pathname, onClick, badge }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={() => {
        // "Suhbatlar" 5 marta tez bosilsa — yashirin "Umumiy suhbatlar" ochiladi/yopiladi.
        if (item.secretTap) registerChatsTap();
        onClick?.();
      }}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-accent text-on-accent shadow-glow' : 'text-on-primary/60 hover:text-on-primary hover:bg-primary-hover'
      }`}
    >
      <Icon size={17} strokeWidth={2} />
      <span>{item.label}</span>
      {badge > 0 && (
        <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-warning text-white text-[11px] font-bold grid place-items-center" aria-label={`${badge} ta kutilmoqda`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { adminName } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const wasOpen = useRef(false);

  const activeItem = NAV.find((n) => isActive(n, pathname));

  // Pending payment receipts — shown as a badge so none waits unnoticed.
  const [badges, setBadges] = useState({});
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch('/api/admin/payments?status=pending')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => !cancelled && d && setBadges({ payments: d.pendingCount || 0 }))
        .catch(() => {});
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pathname]);
  const pageTitle = activeItem?.label || 'Admin';

  // Drawer ochiq: Escape yopadi, fokus ichkariga o'tadi, fon scroll bo'lmaydi.
  useEffect(() => {
    if (!mobileOpen) {
      if (wasOpen.current) openBtnRef.current?.focus();
      wasOpen.current = false;
      return undefined;
    }
    wasOpen.current = true;
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onMq = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    mq.addEventListener?.('change', onMq);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener?.('change', onMq);
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-dvh bg-bg text-ink font-body relative">
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 xl:hidden" />
      )}

      <aside
        id="admin-nav-drawer"
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? 'true' : undefined}
        aria-label="Admin menyusi"
        className={`fixed xl:sticky inset-y-0 xl:inset-y-auto xl:top-0 left-0 z-50 w-72 max-w-[85vw] shrink-0 h-dvh flex flex-col bg-primary transform transition-[transform,visibility] duration-300 motion-reduce:transition-none ${
          mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        } xl:visible xl:translate-x-0`}
      >
        <div className="px-6 pt-7 pb-6 border-b border-on-primary/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shadow-glow">
                <ShieldCheck size={20} className="text-on-accent" />
              </div>
              <div>
                <p className="font-luxury text-xl leading-none text-on-primary tracking-wide">Vocably</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-accent mt-1">Admin Suite</p>
              </div>
            </div>
            <button
              ref={closeBtnRef}
              onClick={() => setMobileOpen(false)}
              aria-label="Menyuni yopish"
              className="xl:hidden min-w-11 min-h-11 -mr-2 flex items-center justify-center rounded-lg text-on-primary/60 hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto overscroll-contain">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary/40">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    badge={item.badgeKey ? badges[item.badgeKey] : 0}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border-t border-on-primary/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center text-xs font-bold">
              {adminName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-on-primary/50">Kirgan</p>
              <p className="text-sm font-semibold text-on-primary truncate">@{adminName}</p>
            </div>
          </div>
          <Link
            href="/app"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-on-primary/60 hover:text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <LogOut size={15} /> Ilovaga qaytish
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 relative z-10">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-5 sm:px-8 py-4 sm:py-5 bg-bg/90 backdrop-blur-md border-b border-border">
          <button
            ref={openBtnRef}
            onClick={() => setMobileOpen(true)}
            aria-label="Menyuni ochish"
            aria-expanded={mobileOpen}
            aria-controls="admin-nav-drawer"
            className="xl:hidden min-w-11 min-h-11 -ml-2.5 flex items-center justify-center text-muted hover:text-ink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Menu size={20} />
          </button>
          <h1
            title={pageTitle}
            // Mobil: menyu har bosishda yopiladi, shuning uchun sarlavhani 5 marta bosish ham ishlaydi.
            onClick={activeItem?.secretTap ? registerChatsTap : undefined}
            className="font-luxury text-2xl sm:text-3xl text-ink tracking-wide min-w-0 truncate select-none"
          >
            {pageTitle}
          </h1>
        </header>

        <main className="px-5 sm:px-8 py-7 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
