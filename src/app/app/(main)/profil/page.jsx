'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, Flame, Trophy, BarChart3, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useT } from '@/context/LocaleContext';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Skeleton from '@/components/ui/Skeleton';
import MyProfilePhoto from '@/components/avatar/MyProfilePhoto';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileSettings from '@/components/profile/ProfileSettings';

// Profil sahifasi: foydalanuvchi, daraja/XP/nishonlar va statistika. Sozlama xarakteridagi bo'limlar (IELTS tayyorgarlik, Telegram,
// ko'rinish/mavzu, maxfiylik) "Sozlamalar" oynasiga ko'chirildi (components/profile/ProfileSettings.jsx) — sahifa qisqa, tez ochiladi
// va sozlamalar faqat kerak bo'lganda yuklanadi. Mobil pastki tab bar (AppShell/navConfig.js) 5-elementi sifatida ("Profil") o'z
// sahifasiga ega.
export default function ProfilPage() {
  const { displayName, chatUsername, phone, logout, reviewStreak } = useApp();
  const { t } = useT();
  const [gami, setGami] = useState(null);
  const [gamiFailed, setGamiFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // MUHIM: `res.ok` tekshirilmasa, xato javobi ({error: '...'}, level/xp/badges'siz)
    // to'g'ridan-to'g'ri gami'ga o'rnatilib, pastdagi gami.level.current kabi
    // o'qishlar "Cannot read properties of undefined" bilan BUTUN sahifani
    // qulatib qo'yardi (2026-09-10'da QA bypass orqali topilgan haqiqiy bug —
    // dark-mode'ga aloqasi yo'q).
    fetch('/api/gamification/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) setGami(data);
        else setGamiFailed(true);
      })
      .catch(() => !cancelled && setGamiFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl shadow-card">
        <MyProfilePhoto size={72} />
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-ink font-display truncate">{displayName}</h1>
          <p className="text-sm text-muted truncate">{chatUsername ? `@${chatUsername}` : phone}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {!!reviewStreak && (
            <div className="flex items-center gap-1.5 text-warning font-semibold text-sm" title="Kunlik seriya">
              <Flame size={16} />
              {reviewStreak}
            </div>
          )}
          <IconButton icon={Settings} label={t('settings.title')} onClick={() => setSettingsOpen(true)} aria-haspopup="dialog" />
        </div>
      </div>

      {/* Yuklanish paytida joy band qilinadi — pastdagi bo'limlar sakramasin. */}
      {!gami && !gamiFailed && (
        <div aria-hidden="true" className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
      )}
      {gamiFailed && <p className="text-xs text-muted">Statistika yuklanmadi.</p>}

      {gami && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink">
              {gami.level.current.label} ({gami.level.current.key})
            </span>
            <Link href="/app/reyting" className="flex items-center gap-1 min-h-11 md:min-h-0 text-xs text-accent font-semibold hover:underline">
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
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 flex items-center gap-1.5">
          <BarChart3 size={13} /> Statistika
        </h2>
        <ProfileStats />
      </section>

      <Button variant="secondary" onClick={logout} className="w-full">
        <LogOut size={16} />
        Chiqish
      </Button>

      <ProfileSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
