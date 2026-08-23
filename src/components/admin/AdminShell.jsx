'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, MessagesSquare, Flag, ScrollText, LogOut, ShieldCheck, Menu, X, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const NAV = [
  { href: '/admin', label: 'Statistika', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/conversations', label: 'Suhbatlar', icon: MessagesSquare },
  { href: '/admin/reports', label: 'Reportlar', icon: Flag },
  { href: '/admin/announcements', label: "E'lonlar", icon: Megaphone },
  { href: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
];

function NavLink({ item, pathname, onClick }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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

  const pageTitle = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label || 'Admin';

  return (
    <div className="flex min-h-screen bg-bg text-primary font-body relative">
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 md:hidden" />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 md:inset-y-auto md:top-0 left-0 z-50 w-72 shrink-0 h-screen flex flex-col bg-primary transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="px-6 pt-7 pb-6 border-b border-on-primary/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shadow-glow">
                <ShieldCheck size={20} className="text-on-accent" />
              </div>
              <div>
                <p className="font-luxury text-xl leading-none text-on-primary tracking-wide">Vocably</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent mt-1">Admin Suite</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-on-primary/60 hover:text-on-primary">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        <div className="mt-auto px-4 py-5 border-t border-on-primary/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center text-xs font-bold">
              {adminName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-on-primary/50">Kirgan</p>
              <p className="text-sm font-semibold text-on-primary truncate">@{adminName}</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-on-primary/60 hover:text-on-primary hover:bg-primary-hover transition-colors"
          >
            <LogOut size={15} /> Ilovaga qaytish
          </a>
        </div>
      </aside>

      <div className="flex-1 min-w-0 relative z-10">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-5 sm:px-8 py-5 bg-bg/90 backdrop-blur-md border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-1 text-muted hover:text-primary rounded-lg"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-luxury text-2xl sm:text-3xl text-primary tracking-wide">{pageTitle}</h1>
        </header>

        <main className="px-5 sm:px-8 py-7 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
