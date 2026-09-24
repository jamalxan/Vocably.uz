'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Activity, GraduationCap, Users, MessagesSquare, Flag, ScrollText, LogOut, ShieldCheck, Menu, X, Megaphone, BookOpen, Library, ClipboardCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const NAV = [
  { href: '/admin', label: 'Statistika', icon: BarChart3, exact: true },
  { href: '/admin/activity', label: 'Faollik', icon: Activity },
  { href: '/admin/learning', label: "O'quv analitikasi", icon: GraduationCap },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/conversations', label: 'Suhbatlar', icon: MessagesSquare },
  { href: '/admin/reports', label: 'Reportlar', icon: Flag },
  { href: '/admin/announcements', label: "E'lonlar", icon: Megaphone },
  // 2026-09-24 — AI chat (kontent agenti) endi kontent yuklashning ASOSIY
  // yo'li: admin faylni chatga tashlaydi, agent uni bo'limlarga ajratib
  // joylashtiradi. Shuning uchun ro'yxatda kontent bo'limlaridan OLDIN
  // turadi va nomi "AI sozlamalari" emas ("sozlamalar" endi o'sha
  // ekranning ichidagi bitta tab, asosiy narsa emas).
  { href: '/admin/content/ai', label: 'AI chat', icon: Sparkles },
  { href: '/admin/exam-tests', label: 'IELTS testlar', icon: BookOpen },
  { href: '/admin/content/books', label: 'Kontent studiyasi', icon: Library },
  { href: '/admin/content/review', label: 'Tekshiruv navbati', icon: ClipboardCheck },
  { href: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
];

// xl (1280px) dan pastda sidebar drawer bo'ladi — planshetda kontent to'liq kenglikda.
const DESKTOP_QUERY = '(min-width: 1280px)';

function NavLink({ item, pathname, onClick }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-accent text-on-accent shadow-glow' : 'text-on-primary/60 hover:text-on-primary hover:bg-primary-hover'
      }`}
    >
      <Icon size={17} strokeWidth={2} />
      <span>{item.label}</span>
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

  const pageTitle = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label || 'Admin';

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

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overscroll-contain">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} />
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
          <h1 title={pageTitle} className="font-luxury text-2xl sm:text-3xl text-ink tracking-wide min-w-0 truncate">{pageTitle}</h1>
        </header>

        <main className="px-5 sm:px-8 py-7 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
