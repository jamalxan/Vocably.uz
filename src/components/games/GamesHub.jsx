'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  CloudRain,
  Crown,
  Ear,
  Flame,
  Gamepad2,
  Grid,
  Headphones,
  Link2,
  ListChecks,
  Lock,
  PenSquare,
  Rows,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button, { buttonClasses } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import CoachCard from './CoachCard';
import DiagnosticCard from './DiagnosticCard';
import { getGames, getGamificationProfile, savePlanMinutes } from './api';

const ICONS = { Link2, ListChecks, PenSquare, Ear, Headphones, CloudRain, Grid, Rows, Zap, BookOpen, Swords, Crown };
const PLAN_ICON = { review: ListChecks, weak: Target, new: Sparkles, game: Gamepad2, listening: Ear, writing: PenSquare, speaking: Headphones };
const MINUTE_OPTIONS = [5, 10, 20, 30, 45];
const STATUS_LABELS = { new: 'Yangi', learning: "O'rganilmoqda", familiar: 'Tanish', strong: 'Kuchli', advanced: "Ilg'or", mastered: "O'zlashtirilgan" };

function ProgressBar({ value, tone = 'bg-accent', label }) {
  return (
    <div
      className="h-2 rounded-full bg-bg-sunken overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label={label}
    >
      <div className={`h-full ${tone} motion-safe:transition-[width] duration-500`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </div>
  );
}

function QuestRow({ quest }) {
  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className={`text-sm font-medium ${quest.done ? 'text-success' : 'text-ink'}`}>
          {quest.done && <span aria-hidden="true">✓ </span>}
          {quest.title}
        </p>
        <span className="text-xs text-muted tabular-nums whitespace-nowrap">
          {quest.progress}/{quest.target}
          {quest.rewardXp ? ` · +${quest.rewardXp} XP` : ''}
        </span>
      </div>
      <ProgressBar value={quest.ratio} tone={quest.done ? 'bg-success' : 'bg-accent'} label={quest.title} />
    </li>
  );
}

function GameCard({ game }) {
  const Icon = ICONS[game.icon] || Gamepad2;
  const disabled = !game.unlocked || !game.available;
  const reason = !game.unlocked ? game.lockedReason : game.unavailableReason;
  const body = (
    <>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled ? 'bg-bg-sunken text-muted' : 'bg-accent-soft text-accent'}`}>
          {!game.unlocked ? <Lock size={18} aria-hidden="true" /> : <Icon size={20} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-ink">{game.title}</p>
            {game.recommended && <Badge tone="accent">Siz uchun</Badge>}
            {game.priority === 'P2' && <Badge tone="warning">Premium</Badge>}
          </div>
          <p className="text-xs text-muted mt-0.5">{game.description}</p>
          {reason && <p className="text-[11px] text-warning mt-1.5">{reason}</p>}
        </div>
      </div>
    </>
  );
  const cls = `block p-4 bg-surface border border-border rounded-2xl shadow-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
    game.unlocked && game.available ? 'hover:shadow-premium motion-safe:hover:-translate-y-0.5' : game.unlocked ? 'opacity-70' : 'opacity-80'
  }`;
  // Yopiq o'yinlar ham sahifaga olib boradi (u yerda sabab va /narxlar havolasi ko'rsatiladi).
  return (
    <Link href={`/app/oyinlar/${game.key}`} className={cls} aria-label={`${game.title}${reason ? ` — ${reason}` : ''}`}>
      {body}
    </Link>
  );
}

export default function GamesHub() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingMinutes, setSavingMinutes] = useState(false);

  const load = useCallback(async (minutes) => {
    setLoading(true);
    setError('');
    try {
      const [p, g] = await Promise.all([getGamificationProfile(), getGames()]);
      setProfile(p);
      setGames(g);
    } catch (err) {
      setError(err.code === 'feature_disabled' ? "Lug'at o'yinlari hozircha sizga ochiq emas." : err.message || 'Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeMinutes = async (m) => {
    setSavingMinutes(true);
    try {
      await savePlanMinutes(m);
      await load();
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik');
    } finally {
      setSavingMinutes(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div role="alert" className="bg-danger-soft text-danger border border-danger/30 rounded-2xl p-5 text-sm">
        <p className="mb-3">{error}</p>
        <Button size="sm" onClick={() => load()}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  const { level, xp, streak, plan, overview, quests, badges } = profile;
  const firstItem = plan?.plan?.items?.[0];
  const earned = (badges || []).filter((b) => b.earned);
  const streakDays = streak?.streak || 0;

  return (
    <div className="grid gap-6">
      <CoachCard />
      <DiagnosticCard />
      {/* --- Hero --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-labelledby="hub-hero">
        <h1 id="hub-hero" className="text-2xl font-bold text-ink font-display mb-4">
          Lug'at sayohatingiz
        </h1>
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-ink">
                {level.level}-daraja · {level.name}
              </p>
              <p className="text-xs text-muted tabular-nums">
                {xp.toLocaleString('uz-UZ')} XP{level.nextLevelXp != null ? ` · keyingigacha ${level.xpToNext.toLocaleString('uz-UZ')}` : ''}
              </p>
            </div>
            <ProgressBar value={level.progress} label="Daraja progressi" />
          </div>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5 text-sm" title={streak?.atRisk ? 'Bugun mashq qilsangiz seriya davom etadi' : ''}>
              <Flame size={20} className={streakDays > 0 ? 'text-warning' : 'text-muted'} aria-hidden="true" />
              <strong className="text-ink text-lg tabular-nums">{streakDays}</strong>
              <span className="text-muted">kunlik seriya</span>
            </p>
            {streak?.freezes > 0 && (
              <p className="flex items-center gap-1 text-xs text-info" title="Bir kunni o'tkazib yuborsangiz seriya saqlanadi">
                <Snowflake size={14} aria-hidden="true" /> {streak.freezes}
              </p>
            )}
          </div>
        </div>
        {streak?.atRisk && (
          <p className="mt-3 text-xs text-muted">Bugun qisqa mashq qilsangiz, seriyangiz davom etadi — bir daqiqa ham yetadi.</p>
        )}
        {streak?.brokenPreview && <p className="mt-3 text-xs text-muted">Yangi seriyani bugundan boshlaymiz — har bir kun hisobga olinadi.</p>}

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Jami so'zlar", value: overview.total },
            { label: "O'zlashtirilgan", value: overview.mastered },
            { label: "O'rganilmoqda", value: overview.learning },
            { label: "Zaif so'zlar", value: overview.weak, href: '/app/lugat/zaif-sozlar' },
          ].map((s) => (
            <div key={s.label} className="bg-bg-sunken rounded-xl px-4 py-3">
              <dd className="text-xl font-bold text-ink font-display tabular-nums">{s.value}</dd>
              <dt className="text-xs text-muted">
                {s.href ? (
                  <Link href={s.href} className="hover:text-ink underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
                    {s.label}
                  </Link>
                ) : (
                  s.label
                )}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* --- Bugungi reja --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-labelledby="hub-plan">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="hub-plan" className="text-lg font-bold text-ink font-display">
            Bugungi reja
          </h2>
          <div role="group" aria-label="Kunlik vaqt" className="inline-flex rounded-xl border border-border overflow-hidden">
            {MINUTE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                disabled={savingMinutes}
                aria-pressed={plan?.plan?.minutes === m}
                onClick={() => changeMinutes(m)}
                className={`px-3 py-2 min-h-11 md:min-h-0 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                  plan?.plan?.minutes === m ? 'bg-accent-soft text-accent-hover' : 'bg-surface text-muted hover:bg-bg-sunken'
                }`}
              >
                {m === 45 ? '45+' : m} daq
              </button>
            ))}
          </div>
        </div>
        {plan?.plan?.items?.length ? (
          <>
            <ul className="grid gap-2 mb-4">
              {plan.plan.items.map((item, i) => {
                const Icon = PLAN_ICON[item.type] || Star;
                return (
                  <li key={`${item.type}-${i}`}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-xl border border-border hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-ink">{item.label}</span>
                        {item.reason && <span className="block text-xs text-muted">{item.reason}</span>}
                      </span>
                      <span className="text-xs text-muted tabular-nums whitespace-nowrap">~{item.minutes} daq</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Button size="lg" onClick={() => firstItem && router.push(firstItem.href)} className="w-full sm:w-auto">
              BUGUNGI REJANI BOSHLASH
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            Bugungi reja bo'sh — hammasi bajarilgan yoki hali so'z qo'shilmagan.{' '}
            <Link href="/app/lugat/jadval" className="text-accent hover:underline">
              So'z qo'shish
            </Link>
          </p>
        )}
      </section>

      {/* --- Vazifalar --- */}
      <section className="grid md:grid-cols-2 gap-4" aria-label="Vazifalar">
        {[
          { title: 'Kunlik vazifalar', list: quests.daily },
          { title: 'Haftalik vazifalar', list: quests.weekly },
        ].map((block) => (
          <div key={block.title} className="bg-surface border border-border rounded-2xl p-5 shadow-card">
            <h2 className="text-base font-bold text-ink font-display mb-1">{block.title}</h2>
            <ul className="divide-y divide-border">
              {block.list.map((q) => (
                <QuestRow key={q.key} quest={q} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* --- O'yinlar --- */}
      <section aria-labelledby="hub-games">
        <div className="flex items-center justify-between mb-3">
          <h2 id="hub-games" className="text-lg font-bold text-ink font-display">
            O'yinlar
          </h2>
          {games?.dailyLimit != null && (
            <span className="text-xs text-muted">
              Bugun {games.sessionsToday}/{games.dailyLimit}
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(games?.games || []).map((g) => (
            <GameCard key={g.key} game={g} />
          ))}
        </div>
      </section>

      {/* --- Yutuqlar --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="hub-ach">
        <div className="flex items-center justify-between mb-3">
          <h2 id="hub-ach" className="text-base font-bold text-ink font-display flex items-center gap-2">
            <Award size={18} aria-hidden="true" /> Yutuqlar
          </h2>
          <span className="text-xs text-muted">
            {earned.length}/{badges.length}
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b.key}
              title={b.description || b.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
                b.earned ? 'border-accent/40 bg-accent-soft text-accent-hover font-semibold' : 'border-border text-muted opacity-70'
              }`}
            >
              <span aria-hidden="true">{b.icon}</span>
              {b.label}
              {!b.earned && <span className="sr-only"> (hali olinmagan)</span>}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/app/reyting" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            <Trophy size={14} aria-hidden="true" /> Reyting
          </Link>
          <Link href="/app/lugat/zaif-sozlar" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            <Target size={14} aria-hidden="true" /> Zaif so'zlar
          </Link>
        </div>
      </section>

      {/* --- Lug'at holati (mastery bosqichlari) --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="hub-mastery">
        <h2 id="hub-mastery" className="text-base font-bold text-ink font-display mb-3">
          O'zlashtirish bosqichlari
        </h2>
        <ul className="grid gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const n = overview.byStatus?.[key] || 0;
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-muted">{label}</span>
                <div className="flex-1">
                  <ProgressBar value={overview.total ? n / overview.total : 0} label={label} tone={key === 'mastered' ? 'bg-success' : 'bg-accent'} />
                </div>
                <span className="w-10 text-right tabular-nums text-ink">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
