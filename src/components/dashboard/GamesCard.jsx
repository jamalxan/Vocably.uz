'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Gamepad2, ArrowRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { getGamificationProfile } from '@/components/games/api';
import { useT } from '@/context/LocaleContext';

// Dashboard'dagi "Lug'at o'yinlari" kartasi: daraja/XP, seriya va bugungi reja qisqacha + o'yinlar markaziga havola.
// Xato/o'chirilgan feature flag bo'lsa karta umuman ko'rinmaydi (dashboard'ni hech qachon buzmasligi kerak).
export default function GamesCard() {
  const { t, ts, numLocale } = useT();
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
            <Gamepad2 size={18} className="text-accent" aria-hidden="true" /> {t('dash.vocabGames')}
          </h3>
          <p className="text-sm text-muted mt-1">
            {t('hub.levelLine', { level: level.level, name: ts(level.name) })} · <span className="tabular-nums">{xp.toLocaleString(numLocale)}</span> XP
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-sm">
          <Flame size={18} className={streak?.streak > 0 ? 'text-warning' : 'text-muted'} aria-hidden="true" />
          <strong className="text-ink tabular-nums">{streak?.streak || 0}</strong>
          <span className="text-muted">{t('hub.streakDays')}</span>
        </p>
      </div>
      <p className="text-sm text-muted mt-3">
        {items.length > 0 ? t('dash.todayPlan', { items: items.map((i) => ts(i.label)).slice(0, 3).join(' · ') }) : t('dash.planDone')}
      </p>
      <p className="text-xs text-muted mt-1">{t('dash.dailyQuests', { a: dailyDone, b: dailyTotal })}</p>
      <Link href="/app/oyinlar" className={`${buttonClasses({ variant: 'primary', size: 'md' })} mt-4`}>
        {t('dash.gamesHub')} <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
