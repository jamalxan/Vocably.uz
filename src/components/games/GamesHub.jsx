'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  CloudRain,
  Crown,
  Ear,
  Flame,
  Gamepad2,
  Grid,
  Headphones,
  GalleryHorizontal,
  Image as ImageIcon,
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
import StatTile from '@/components/ui/StatTile';
import CoachCard from './CoachCard';
import CefrPathCard from './CefrPathCard';
import DiagnosticCard from './DiagnosticCard';
import ReminderSettings from './ReminderSettings';
import StoryCard from './StoryCard';
import { useT } from '@/context/LocaleContext';
import { getGames, getGamificationProfile, savePlanMinutes } from './api';

const ICONS = { Link2, ListChecks, PenSquare, Ear, Headphones, CloudRain, Grid, Rows, Zap, BookOpen, Swords, Crown, Image: ImageIcon, Images: GalleryHorizontal };
const PLAN_ICON = { review: ListChecks, weak: Target, new: Sparkles, game: Gamepad2, listening: Ear, writing: PenSquare, speaking: Headphones };
const MINUTE_OPTIONS = [5, 10, 20, 30, 45];
const STATUS_KEYS = ['new', 'learning', 'familiar', 'strong', 'advanced', 'mastered'];

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

// Bitta vazifa qatori: holat ikonkasi (chizilgan, unicode "✓" emas), sarlavha,
// progress va mukofot chipi. Bajarilgan qator success tusida, lekin ro'yxatdan
// yo'qolmaydi — foydalanuvchi nimaga erishganini ko'rib turadi.
function QuestRow({ quest }) {
  const { t, ts } = useT();
  const title = ts(quest.title);
  const pct = Math.round(Math.max(0, Math.min(1, quest.ratio)) * 100);
  return (
    <li className={`flex items-start gap-3 py-3 ${quest.done ? '' : ''}`}>
      <span className={`mt-0.5 flex-shrink-0 ${quest.done ? 'text-success' : 'text-muted'}`} aria-hidden="true">
        {quest.done ? <CheckCircle2 size={20} /> : <Circle size={20} strokeWidth={1.75} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-medium leading-snug ${quest.done ? 'text-muted line-through decoration-success/60' : 'text-ink'}`}>
            {quest.done && <span className="sr-only">{t('dash.done')}: </span>}
            {title}
          </p>
          {quest.rewardXp ? (
            <span
              className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                quest.done ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent'
              }`}
            >
              +{quest.rewardXp} XP
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1">
            <ProgressBar value={quest.ratio} tone={quest.done ? 'bg-success' : 'bg-accent'} label={`${title}: ${quest.progress}/${quest.target}`} />
          </div>
          <span className={`text-xs tabular-nums whitespace-nowrap w-12 text-right ${quest.done ? 'text-success font-semibold' : 'text-muted'}`}>
            {quest.progress}/{quest.target}
          </span>
        </div>
        <span className="sr-only">{pct}%</span>
      </div>
    </li>
  );
}

// Kunlik/haftalik blok: sarlavha + "bajarildi/jami" + to'plangan XP xulosasi.
function QuestBlock({ title, hint, list }) {
  const { t } = useT();
  const done = list.filter((q) => q.done).length;
  const earnedXp = list.filter((q) => q.done).reduce((s, q) => s + (q.rewardXp || 0), 0);
  const totalXp = list.reduce((s, q) => s + (q.rewardXp || 0), 0);
  const allDone = list.length > 0 && done === list.length;
  return (
    <div className={`bg-surface border rounded-2xl p-5 shadow-card ${allDone ? 'border-success/40' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-ink font-display">{title}</h2>
          <p className="text-xs text-muted mt-0.5">{hint}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display text-xl font-bold text-ink tabular-nums leading-none">
            {done}
            <span className="text-sm text-muted font-semibold">/{list.length}</span>
          </p>
          <p className="text-[11px] text-muted tabular-nums mt-1">
            {earnedXp}/{totalXp} XP
          </p>
        </div>
      </div>
      <div className="h-1 rounded-full bg-bg-sunken overflow-hidden mt-3 mb-1" aria-hidden="true">
        <div className={`h-full ${allDone ? 'bg-success' : 'bg-accent'} motion-safe:transition-[width] duration-500`} style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
      </div>
      <ul className="divide-y divide-border/70">
        {list.map((q) => (
          <QuestRow key={q.key} quest={q} />
        ))}
      </ul>
      {allDone && (
        <p className="mt-3 text-xs font-semibold text-success flex items-center gap-1.5">
          <CheckCircle2 size={14} aria-hidden="true" /> {t('coach.allDone')}
        </p>
      )}
    </div>
  );
}

function GameCard({ game }) {
  const { t, ts } = useT();
  const Icon = ICONS[game.icon] || Gamepad2;
  const disabled = !game.unlocked || !game.available;
  const reason = ts(!game.unlocked ? game.lockedReason : game.unavailableReason);
  const body = (
    <>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled ? 'bg-bg-sunken text-muted' : 'bg-accent-soft text-accent'}`}>
          {!game.unlocked ? <Lock size={18} aria-hidden="true" /> : <Icon size={20} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-ink">{ts(game.title)}</p>
            {game.recommended && <Badge tone="accent">{t('hub.forYou')}</Badge>}
            {game.priority === 'P2' && <Badge tone="warning">Premium</Badge>}
          </div>
          <p className="text-xs text-muted mt-0.5">{ts(game.description)}</p>
          {reason && <p className="text-[11px] text-warning mt-1.5">{reason}</p>}
        </div>
      </div>
    </>
  );
  const cls = `block p-4 bg-surface border border-border rounded-2xl shadow-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
    game.unlocked && game.available ? 'hover:shadow-premium motion-safe:hover:-translate-y-0.5' : game.unlocked ? 'opacity-70' : 'opacity-80'
  }`;
  // Yopiq o'yinlar ham sahifaga olib boradi (u yerda sabab va /pricing havolasi ko'rsatiladi).
  return (
    <Link href={`/app/games/${game.key}`} className={cls} aria-label={`${ts(game.title)}${reason ? ` — ${reason}` : ''}`}>
      {body}
    </Link>
  );
}

export default function GamesHub() {
  const router = useRouter();
  const { t, ts, numLocale } = useT();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingMinutes, setSavingMinutes] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [p, g] = await Promise.all([getGamificationProfile(), getGames()]);
      setProfile(p);
      setGames(g);
    } catch (err) {
      setError(err.code === 'feature_disabled' ? t('hub.featureDisabled') : err.message || t('hub.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Qayta yuklash (qo'lda): avval yuklanish holati yoqiladi.
  const load = () => {
    setLoading(true);
    setError('');
    return fetchAll();
  };

  // Til (t) o'zgarsa qayta yuklanadi â€” yuklanish holati render vaqtida yoqiladi.
  const [prevFetch, setPrevFetch] = useState(() => fetchAll);
  if (prevFetch !== fetchAll) {
    setPrevFetch(() => fetchAll);
    setLoading(true);
    setError('');
  }

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
  }, [fetchAll]);

  const changeMinutes = async (m) => {
    setSavingMinutes(true);
    try {
      await savePlanMinutes(m);
      await load();
    } catch (err) {
      setError(err.message || t('hub.saveError'));
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
          {t('hub.retry')}
        </Button>
      </div>
    );
  }

  const { level, xp, streak, plan, overview, quests, badges } = profile;
  const firstItem = plan?.items?.[0];
  const earned = (badges || []).filter((b) => b.earned);
  const streakDays = streak?.streak || 0;

  return (
    <div className="grid gap-6">
      <CoachCard />
      <DiagnosticCard />
      <StoryCard />
      {/* --- Hero --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-labelledby="hub-hero">
        <h1 id="hub-hero" className="text-2xl font-bold text-ink font-display mb-4">
          {t('hub.title')}
        </h1>
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-ink">{t('hub.levelLine', { level: level.level, name: ts(level.name) })}</p>
              <p className="text-xs text-muted tabular-nums">
                {xp.toLocaleString(numLocale)} XP{level.nextLevelXp != null ? ` · ${t('hub.toNext', { n: level.xpToNext.toLocaleString(numLocale) })}` : ''}
              </p>
            </div>
            <ProgressBar value={level.progress} label={t('hub.levelProgress')} />
          </div>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5 text-sm" title={streak?.atRisk ? t('hub.streakRiskTitle') : ''}>
              <Flame size={20} className={streakDays > 0 ? 'text-warning' : 'text-muted'} aria-hidden="true" />
              <strong className="text-ink text-lg tabular-nums">{streakDays}</strong>
              <span className="text-muted">{t('hub.streakDays')}</span>
            </p>
            {streak?.freezes > 0 && (
              <p className="flex items-center gap-1 text-xs text-info" title={t('hub.freezeTitle')}>
                <Snowflake size={14} aria-hidden="true" /> {streak.freezes}
              </p>
            )}
          </div>
        </div>
        {streak?.atRisk && (
          <p className="mt-3 text-xs text-muted">{t('hub.streakRisk')}</p>
        )}
        {streak?.brokenPreview && <p className="mt-3 text-xs text-muted">{t('hub.streakBroken')}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5" data-tabular>
          <StatTile tone="sunken" icon={BookOpen} label={t('hub.statTotal')} value={overview.total} />
          <StatTile tone="sunken" icon={Trophy} label={t('hub.statMastered')} value={overview.mastered} sub={overview.total ? `${Math.round((overview.mastered / overview.total) * 100)}%` : null} />
          <StatTile tone="sunken" icon={Sparkles} label={t('hub.statLearning')} value={overview.learning} />
          <StatTile tone="sunken" icon={Target} label={t('hub.statWeak')} value={overview.weak} href="/app/vocabulary/weak-words" />
        </div>
      </section>

      <CefrPathCard cefrPath={profile.cefrPath} ieltsPath={profile.ieltsPath} targetBand={profile.targetBand} />

      {/* --- Bugungi reja --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card" aria-labelledby="hub-plan">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="hub-plan" className="text-lg font-bold text-ink font-display">
            {t('hub.plan')}
          </h2>
          {/* Mobilda to'liq kenglik, har tugma teng — "5 daq" ikki qatorga bo'linmaydi. */}
          <div role="group" aria-label={t('hub.dailyTime')} className="flex w-full sm:w-auto rounded-xl border border-border bg-bg-sunken/60 p-0.5 gap-0.5">
            {MINUTE_OPTIONS.map((m) => {
              const active = plan?.minutes === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={savingMinutes}
                  aria-pressed={active}
                  onClick={() => changeMinutes(m)}
                  className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-2 min-h-11 md:min-h-0 rounded-[9px] text-xs font-semibold whitespace-nowrap tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 ${
                    active ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  {t('hub.minShort', { n: m === 45 ? '45+' : m })}
                </button>
              );
            })}
          </div>
        </div>
        {plan?.items?.length ? (
          <>
            <ul className="grid gap-2 mb-4">
              {plan.items.map((item, i) => {
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
                        <span className="block text-sm font-medium text-ink">{ts(item.label)}</span>
                        {item.reason && <span className="block text-xs text-muted">{ts(item.reason)}</span>}
                      </span>
                      <span className="text-xs text-muted tabular-nums whitespace-nowrap">~{t('hub.minShort', { n: item.minutes })}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Button size="lg" onClick={() => firstItem && router.push(firstItem.href)} className="w-full sm:w-auto">
              {t('hub.startPlan')}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            {t('hub.planEmpty')}{' '}
            <Link href="/app/vocabulary/words" className="text-accent hover:underline">
              {t('hub.addWords')}
            </Link>
          </p>
        )}
      </section>

      {/* --- Vazifalar --- */}
      <section className="grid md:grid-cols-2 gap-4" aria-label={t('hub.quests')}>
        <QuestBlock title={t('hub.questsDaily')} hint={t('hub.questsDailyHint')} list={quests.daily} />
        <QuestBlock title={t('hub.questsWeekly')} hint={t('hub.questsWeeklyHint')} list={quests.weekly} />
      </section>

      {/* --- O'yinlar --- */}
      <section aria-labelledby="hub-games">
        <div className="flex items-center justify-between mb-3">
          <h2 id="hub-games" className="text-lg font-bold text-ink font-display">
            {t('hub.games')}
          </h2>
          {games?.dailyLimit != null && (
            <span className="text-xs text-muted">{t('hub.todayCount', { a: games.sessionsToday, b: games.dailyLimit })}</span>
          )}
        </div>
        {/* Vocabulary World (3D hub) — portallar shu ro'yxatdagi o'yinlarga olib boradi */}
        {/* Brend yuzasi (--color-primary — ikkala temada ham to'q), AppShell sidebar'i bilan bir
            oilada. Avvalgi neon-navy banner sahifadagi yagona "begona" rang bloki edi. */}
        <div className="mb-4 p-5 rounded-2xl bg-primary text-on-primary border border-accent/25 shadow-premium relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(120% 140% at 100% 0%, rgb(var(--color-accent) / .35), transparent 55%), linear-gradient(160deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))' }}
            aria-hidden="true"
          />
          <Gamepad2 size={120} strokeWidth={1} className="absolute -right-4 -bottom-8 text-on-primary/10 pointer-events-none" aria-hidden="true" />
          <div className="relative z-10 min-w-0">
            <Badge tone="accent" className="mb-2">{t('world.bannerBadge')}</Badge>
            <h3 className="text-xl font-bold font-display text-on-primary">Vocabulary World 3D</h3>
            <p className="text-xs text-on-primary/75 max-w-md mt-1 leading-relaxed">{t('world.bannerBody')}</p>
          </div>
          <Link
            href="/app/vocabulary-world"
            className={`${buttonClasses({ variant: 'primary', size: 'md' })} relative z-10 flex-shrink-0 focus-visible:ring-offset-primary`}
          >
            <Gamepad2 size={18} aria-hidden="true" />
            {t('world.bannerCta')}
          </Link>
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
            <Award size={18} aria-hidden="true" /> {t('hub.achievements')}
          </h2>
          <span className="text-xs text-muted">
            {earned.length}/{badges.length}
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b.key}
              title={ts(b.description || b.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
                b.earned ? 'border-accent/40 bg-accent-soft text-accent-hover font-semibold' : 'border-border text-muted opacity-70'
              }`}
            >
              <span aria-hidden="true">{b.icon}</span>
              {ts(b.label)}
              {!b.earned && <span className="sr-only">{t('hub.notEarned')}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/app/leaderboard" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            <Trophy size={14} aria-hidden="true" /> {t('hub.leaderboard')}
          </Link>
          <Link href="/app/vocabulary/weak-words" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            <Target size={14} aria-hidden="true" /> {t('hub.statWeak')}
          </Link>
        </div>
      </section>

      {/* --- Lug'at holati (mastery bosqichlari) --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="hub-mastery">
        <h2 id="hub-mastery" className="text-base font-bold text-ink font-display mb-3">
          {t('hub.masteryStages')}
        </h2>
        <ul className="grid gap-2">
          {STATUS_KEYS.map((key) => {
            const label = t(`hub.status.${key}`);
            const n = overview.byStatus?.[key] || 0;
            const pct = overview.total ? Math.round((n / overview.total) * 100) : 0;
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-muted truncate" title={label}>{label}</span>
                <div className="flex-1">
                  <ProgressBar value={overview.total ? n / overview.total : 0} label={`${label}: ${n}`} tone={key === 'mastered' ? 'bg-success' : 'bg-accent'} />
                </div>
                <span className="w-9 text-right tabular-nums text-ink font-semibold">{n}</span>
                <span className="w-10 text-right tabular-nums text-xs text-muted">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </section>

      <ReminderSettings />
    </div>
  );
}
