'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, ShieldCheck, Sun, Moon, Monitor, Flame, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';

// Ilgari mavjud emas edi — foydalanuvchi haqidagi ma'lumot va "Chiqish" faqat
// sidebar footer'ida bir necha piksel joyda edi. Endi mobil pastki tab bar
// (AppShell/navConfig.js) 5-elementi sifatida ("Profil") o'z sahifasiga ega —
// bu ham UI to'liqligi, ham bottom-nav'ning ishlashi uchun zarur edi.
const THEME_OPTIONS = [
  { value: 'light', label: "Yorug'", icon: Sun },
  { value: 'dark', label: 'Tungi', icon: Moon },
  { value: 'system', label: 'Tizim', icon: Monitor },
];

export default function ProfilPage() {
  const { displayName, username, phone, logout, chatRole, reviewStreak, token } = useApp();
  const { theme, setTheme } = useTheme();
  const [gami, setGami] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gamification/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => !cancelled && setGami(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-card">
        <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-xl font-bold flex-shrink-0">
          {displayName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-ink font-display truncate">{displayName}</h1>
          <p className="text-sm text-muted truncate">{username ? `@${username}` : phone}</p>
        </div>
        {!!reviewStreak && (
          <div className="ml-auto flex items-center gap-1.5 text-warning font-semibold text-sm flex-shrink-0">
            <Flame size={16} />
            {reviewStreak}
          </div>
        )}
      </div>

      {gami && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink">
              {gami.level.current.label} ({gami.level.current.key})
            </span>
            <Link href="/app/reyting" className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
              <Trophy size={13} /> {gami.xp} XP
            </Link>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden mb-1">
            <div className="h-full bg-accent rounded-full transition-[width]" style={{ width: `${gami.level.progress * 100}%` }} />
          </div>
          {gami.level.next && (
            <p className="text-[11px] text-muted mb-4">
              Keyingi daraja ({gami.level.next.key}) uchun {gami.level.next.minXp - gami.xp} XP kerak
            </p>
          )}
          {gami.badges.some((b) => b.earned) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {gami.badges
                .filter((b) => b.earned)
                .map((b) => (
                  <div
                    key={b.key}
                    title={b.label}
                    className="flex items-center gap-1.5 bg-accent-soft text-accent px-2.5 py-1.5 rounded-full text-xs font-medium"
                  >
                    <span className="emoji">{b.icon}</span> {b.label}
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2.5">Ko'rinish</h2>
        <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === opt.value ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-primary-soft/40'
              }`}
            >
              <opt.icon size={15} />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {chatRole === 'admin' && (
        <Link
          href="/admin"
          className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium transition-shadow text-accent font-medium text-sm"
        >
          <ShieldCheck size={18} />
          Admin panel
        </Link>
      )}

      <Button variant="secondary" onClick={logout} className="w-full">
        <LogOut size={16} />
        Chiqish
      </Button>
    </div>
  );
}
