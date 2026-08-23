'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, MessagesSquare, Flag, ScrollText, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const NAV = [
  { href: '/admin', label: 'Statistika', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/conversations', label: 'Suhbatlar', icon: MessagesSquare },
  { href: '/admin/reports', label: 'Reportlar', icon: Flag },
  { href: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
];

function NavLink({ item, pathname, onClick }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-racing-700/90 to-racing-600/70 text-alabaster-50 shadow-admin-glow'
          : 'text-alabaster-500 hover:text-alabaster-100 hover:bg-cherry-800/60'
      }`}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gold-400" />}
      <Icon size={17} strokeWidth={2} className={active ? 'text-alabaster-50' : 'text-alabaster-600 group-hover:text-racing-400'} />
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
    <div className="min-h-screen bg-coffee-900 text-alabaster-200 font-body relative overflow-hidden">
      {/* Maksimalizm — fonda chuqurlik beruvchi yumshoq qizil/oltin nurlanish, kontentga xalaqit bermaydi */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(1200px 600px at 15% -10%, rgba(221,2,0,0.16), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(201,150,43,0.10), transparent 60%)',
        }}
      />

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-gradient-to-b from-cherry-950 via-coffee-900 to-coffee-950 border-r border-cherry-800/60 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="px-6 pt-7 pb-6 border-b border-cherry-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-racing-500 to-racing-800 flex items-center justify-center shadow-admin-glow">
                <ShieldCheck size={20} className="text-alabaster-50" />
              </div>
              <div>
                <p className="font-luxury text-xl leading-none text-alabaster-50 tracking-wide">Vocably</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400 mt-1">Admin Suite</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 text-alabaster-500 hover:text-alabaster-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-cherry-800/50">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center text-xs font-bold">
              {adminName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-alabaster-600">Kirgan</p>
              <p className="text-sm font-semibold text-alabaster-100 truncate">@{adminName}</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-alabaster-500 hover:text-alabaster-100 hover:bg-cherry-800/50 transition-colors"
          >
            <LogOut size={15} /> Ilovaga qaytish
          </a>
        </div>
      </aside>

      <div className="lg:pl-72 relative">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-5 sm:px-8 py-5 bg-coffee-900/80 backdrop-blur-md border-b border-cherry-900/60">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-1 text-alabaster-400 hover:text-alabaster-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-luxury text-2xl sm:text-3xl text-alabaster-50 tracking-wide">{pageTitle}</h1>
        </header>

        <main className="px-5 sm:px-8 py-7 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
