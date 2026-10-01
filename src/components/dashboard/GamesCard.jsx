'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Gamepad2, ArrowRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { getGamificationProfile } from '@/components/games/api';

// Dashboard'dagi "Lug'at o'yinlari" kartasi: daraja/XP, seriya va bugungi reja qisqacha + o'yinlar markaziga havola.
// Xato/o'chirilgan feature flag bo'lsa karta umuman ko'rinmaydi (dashboard'ni hech qachon buzmasligi kerak).
export default function GamesCard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getGamificationProfile()
      .then((p) => !ctrl.signal.aborted && setProfile(p))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (!profile) return null;
  const { level, xp, streak, plan, quests } = profile;
  const items = plan?.plan?.items || [];
  const dailyDone = (quests?.daily || []).filter((q) => q.done).length;
  const dailyTotal = (quests?.daily || []).length;

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="dash-games">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="dash-games" className="text-base font-bold text-ink font-display flex items-center gap-2">
            <Gamepad2 size={18} className="text-accent" aria-hidden="true" /> Lug'at o'yinlari
          </h3>
          <p className="text-sm text-muted mt-1">
            {level.level}-daraja · {level.name} · <span className="tabular-nums">{xp.toLocaleString('uz-UZ')}</span> XP
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-sm">
          <Flame size={18} className={streak?.streak > 0 ? 'text-warning' : 'text-muted'} aria-hidden="true" />
          <strong className="text-ink tabular-nums">{streak?.streak || 0}</strong>
          <span className="text-muted">kunlik seriya</span>
        </p>
      </div>
      <p className="text-sm text-muted mt-3">
        {items.length > 0
          ? `Bugungi reja: ${items.map((i) => i.label).slice(0, 3).join(' · ')}`
          : 'Bugungi reja bajarilgan yoki hozircha bo\'sh.'}
      </p>
      <p className="text-xs text-muted mt-1">
        Kunlik vazifalar: {dailyDone}/{dailyTotal}
      </p>
      <Link href="/app/oyinlar" className={`${buttonClasses({ variant: 'primary', size: 'md' })} mt-4`}>
        O'yinlar markazi <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
