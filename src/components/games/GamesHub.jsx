'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Award,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronDown,
  Circle,
  Mic,
  Ear,
  Flame,
  Gamepad2,
  Globe2,
  Headphones,
  ListChecks,
  Lock,
  PenSquare,
  Play,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
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
import { GAME_ICONS, skillTone } from './gameVisuals';

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
    <li className="flex items-start gap-3 py-3">
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

// --- 3D (flagship) o'yinlar: har biri o'z sahnasining rangida, CSS bilan chizilgan "kadr" bilan
// (rasm yuklanmaydi). Ranglar o'yin sahnalari bilan bir oila: runTheme.js (coral), tunnel (lagoon),
// defense (violet), orbit (deep space). Matn doim to'q fonda oq — tema (yorug'/qorong'i) ta'sir qilmaydi.
const FLAGSHIP_KEYS = ['vocably_run', 'word_orbit', 'word_tunnel', 'word_defense'];

function RunArt() {
  return (
    <>
      <span
        className="absolute left-1/2 top-[18%] h-24 w-24 -translate-x-1/2 rounded-full"
        style={{ background: 'linear-gradient(180deg, #ffd27a, #e0566a)', boxShadow: '0 0 48px #ff6f8680' }}
      />
      <span className="absolute inset-x-0 top-[58%] h-px" style={{ background: '#ff6f86', boxShadow: '0 0 12px #ff6f86' }} />
      <span
        className="absolute inset-x-[-50%] bottom-0 h-[42%] origin-bottom"
        style={{
          transform: 'perspective(120px) rotateX(60deg)',
          backgroundImage: 'linear-gradient(#e0566a 1px, transparent 1px), linear-gradient(90deg, #e0566a 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
    </>
  );
}

function TunnelArt() {
  return (
    <>
      {[96, 74, 54, 36, 20].map((s, i) => (
        <span
          key={s}
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ width: `${s}%`, aspectRatio: '1', borderColor: i % 2 ? '#26b3d6' : '#cff6ff', opacity: 0.2 + i * 0.16, boxShadow: i === 4 ? '0 0 24px #43d6ff' : 'none' }}
        />
      ))}
      <span className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 font-display text-sm font-bold tracking-[0.3em] text-white/90">
        W_RD
      </span>
    </>
  );
}

function DefenseArt() {
  return (
    <>
      <span
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(#ff944026 1px, transparent 1px), linear-gradient(90deg, #ff944026 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      />
      <span className="absolute left-1/2 top-[58%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-md border-2" style={{ borderColor: '#fff0a6', boxShadow: '0 0 28px #ff9f4a' }} />
      <span className="absolute left-1/2 top-[58%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ borderColor: '#ff9f4a80' }} />
      {[
        [14, 24],
        [82, 30],
        [26, 84],
        [76, 80],
        [52, 14],
      ].map(([x, y]) => (
        <span key={`${x}-${y}`} className="absolute h-2 w-2 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: '#5cc7ff', boxShadow: '0 0 10px #5cc7ff' }} />
      ))}
    </>
  );
}

function OrbitArt() {
  return (
    <>
      {[
        [12, 20],
        [30, 70],
        [58, 12],
        [84, 34],
        [72, 78],
        [44, 40],
      ].map(([x, y]) => (
        <span key={`${x}-${y}`} className="absolute h-[3px] w-[3px] rounded-full bg-white/80" style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
      <span className="absolute left-1/2 top-[54%] h-28 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed" style={{ borderColor: '#7dd3fc66', transform: 'translate(-50%, -50%) rotate(-14deg)' }} />
      <span className="absolute left-[22%] top-[40%] h-9 w-9 rounded-full" style={{ background: 'radial-gradient(circle at 32% 30%, #ffd7a8, #f97362 55%, #7a2a3a)', boxShadow: '0 0 22px #f9736280' }} />
      <span className="absolute left-[47%] top-[30%] h-12 w-12 rounded-full" style={{ background: 'radial-gradient(circle at 32% 30%, #d6f6ff, #38bdf8 55%, #1e3a8a)', boxShadow: '0 0 26px #38bdf880' }} />
      <span className="absolute left-[70%] top-[52%] h-7 w-7 rounded-full" style={{ background: 'radial-gradient(circle at 32% 30%, #ede9fe, #a78bfa 55%, #3b2a7a)', boxShadow: '0 0 20px #a78bfa80' }} />
    </>
  );
}

const FLAGSHIP_ART = {
  vocably_run: { bg: 'linear-gradient(180deg, #0b1020 0%, #26163f 40%, #3d1d4c 58%, #0a0d1f 58%)', Art: RunArt, accent: '#ff7d92' },
  word_tunnel: { bg: 'radial-gradient(circle at 50% 56%, #43d6ff40 0%, #0b2747 38%, #07111f 72%)', Art: TunnelArt, accent: '#5fdcff' },
  word_defense: { bg: 'radial-gradient(circle at 50% 58%, #ff9f4a33 0%, #3a1530 42%, #130b1c 76%)', Art: DefenseArt, accent: '#ffa95c' },
  word_orbit: { bg: 'radial-gradient(circle at 50% 40%, #1b2a6b 0%, #0b1030 46%, #050716 80%)', Art: OrbitArt, accent: '#7dd3fc' },
};

function FeaturedGameCard({ game }) {
  const { t, ts } = useT();
  const { bg, Art, accent } = FLAGSHIP_ART[game.key];
  const reason = ts(!game.unlocked ? game.lockedReason : game.unavailableReason);
  return (
    <Link
      href={`/app/games/${game.key}`}
      aria-label={`${ts(game.title)}${reason ? ` — ${reason}` : ''}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d1124] text-white shadow-premium motion-safe:transition-transform duration-300 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="relative h-36 overflow-hidden sm:h-40" style={{ background: bg }} aria-hidden="true">
        <Art />
        <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0d1124] to-transparent" />
        <span
          className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur"
          style={{ color: accent }}
        >
          <Box size={12} /> 3D
        </span>
      </div>
      {game.recommended && (
        <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#0d1124]">{t('hub.forYou')}</span>
      )}
      <div className="relative flex flex-1 flex-col gap-3 p-5 pt-2">
        <div>
          <h3 className="font-display text-xl font-bold leading-tight">{ts(game.title)}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/75">{ts(game.description)}</p>
        </div>
        {reason && <p className="text-xs text-amber-200">{reason}</p>}
        <span
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0d1124] motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
          style={{ background: accent }}
        >
          <Play size={15} aria-hidden="true" fill="currentColor" /> {t('hub.play')}
        </span>
      </div>
    </Link>
  );
}

function GameCard({ game }) {
  const { t, ts } = useT();
  const Icon = GAME_ICONS[game.icon] || Gamepad2;
  const disabled = !game.unlocked || !game.available;
  const reason = ts(!game.unlocked ? game.lockedReason : game.unavailableReason);
  const n = game.questionCount?.medium;
  const tone = disabled ? 'bg-bg-sunken text-muted' : skillTone(game.skill);
  // Yopiq o'yinlar ham sahifaga olib boradi (u yerda sabab va /pricing havolasi ko'rsatiladi).
  return (
    <Link
      href={`/app/games/${game.key}`}
      aria-label={`${ts(game.title)}${reason ? ` — ${reason}` : ''}`}
      className={`group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
        disabled ? 'opacity-75' : 'hover:border-accent/40 hover:shadow-premium motion-safe:hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="flex flex-wrap justify-end gap-1.5">
          {game.recommended && <Badge tone="accent">{t('hub.forYou')}</Badge>}
          {!game.unlocked && (
            <Badge tone="warning">
              <Lock size={11} aria-hidden="true" className="mr-1 inline" />
              {game.minTier === 'premium' ? 'Premium' : 'Standard'}
            </Badge>
          )}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-bold leading-snug text-ink">{ts(game.title)}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{ts(game.description)}</p>
        {game.unlocked && reason && <p className="mt-2 text-[11px] text-warning">{reason}</p>}
      </div>
      <div className="flex items-center justify-between border-t border-border/70 pt-3 text-[11px] font-semibold text-muted">
        <span className="tabular-nums">
          {t(`hub.skill.${game.skill}`)}
          {n ? ` · ${t('hub.questionsN', { n })}` : ''}
        </span>
        <ArrowRight size={14} aria-hidden="true" className="text-accent motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ExtraModeCard({ href, icon: Icon, title, body, testId }) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:border-accent/40 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-primary text-on-primary">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-bold text-ink">{title}</span>
        <span className="block text-xs text-muted">{body}</span>
      </span>
      <ArrowRight size={16} aria-hidden="true" className="flex-shrink-0 text-accent motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
    </Link>
  );
}

function SectionHeading({ id, title, hint, right }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 id={id} className="font-display text-lg font-bold text-ink">
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      {right}
    </div>
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

  // Til (t) o'zgarsa qayta yuklanadi — yuklanish holati render vaqtida yoqiladi.
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
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
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
  const locked = (badges || []).filter((b) => !b.earned);
  const streakDays = streak?.streak || 0;
  const allGames = games?.games || [];
  const featured = FLAGSHIP_KEYS.map((k) => allGames.find((g) => g.key === k)).filter(Boolean);
  const classic = allGames.filter((g) => !FLAGSHIP_KEYS.includes(g.key));

  return (
    <div className="grid gap-8">
      {/* --- Sarlavha: daraja, XP va seriya bir qatorda (avval 4 ta katta blok edi) --- */}
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6" aria-labelledby="hub-hero">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 id="hub-hero" className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {t('hub.title')}
            </h1>
            <p className="mt-1 text-sm font-semibold text-ink">{t('hub.levelLine', { level: level.level, name: ts(level.name) })}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${streakDays > 0 ? 'bg-warning-soft text-warning' : 'bg-bg-sunken text-muted'}`}
              title={streak?.atRisk ? t('hub.streakRiskTitle') : ''}
            >
              <Flame size={16} aria-hidden="true" /> {streakDays}
              <span className="font-medium">{t('hub.streakDays')}</span>
            </span>
            {streak?.freezes > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-1.5 text-xs font-bold text-info" title={t('hub.freezeTitle')}>
                <Snowflake size={14} aria-hidden="true" /> {streak.freezes}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs text-muted tabular-nums">
            <span>{xp.toLocaleString(numLocale)} XP</span>
            {level.nextLevelXp != null && <span>{t('hub.toNext', { n: level.xpToNext.toLocaleString(numLocale) })}</span>}
          </div>
          <ProgressBar value={level.progress} label={t('hub.levelProgress')} />
        </div>
        {streak?.atRisk && <p className="mt-3 text-xs text-muted">{t('hub.streakRisk')}</p>}
        {streak?.brokenPreview && <p className="mt-3 text-xs text-muted">{t('hub.streakBroken')}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" data-tabular>
          <StatTile tone="sunken" icon={BookOpen} label={t('hub.statTotal')} value={overview.total} />
          <StatTile tone="sunken" icon={Trophy} label={t('hub.statMastered')} value={overview.mastered} sub={overview.total ? `${Math.round((overview.mastered / overview.total) * 100)}%` : null} />
          <StatTile tone="sunken" icon={Sparkles} label={t('hub.statLearning')} value={overview.learning} />
          <StatTile tone="sunken" icon={Target} label={t('hub.statWeak')} value={overview.weak} href="/app/vocabulary/weak-words" />
        </div>
      </section>

      <CoachCard />

      {/* --- 3D o'yinlar: sahifaning asosiy maqsadi, endi birinchi ekranda --- */}
      {featured.length > 0 && (
        <section aria-labelledby="hub-featured">
          <SectionHeading
            id="hub-featured"
            title={t('hub.featuredTitle')}
            hint={t('hub.featuredHint')}
            right={
              games?.dailyLimit != null ? (
                <span className="text-xs font-semibold text-muted tabular-nums">{t('hub.todayCount', { a: games.sessionsToday, b: games.dailyLimit })}</span>
              ) : null
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((g) => (
              <FeaturedGameCard key={g.key} game={g} />
            ))}
          </div>
        </section>
      )}

      {/* --- Klassik o'yinlar va boshqa rejimlar --- */}
      <section aria-labelledby="hub-games">
        <SectionHeading id="hub-games" title={t('hub.classicTitle')} hint={t('hub.classicHint')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classic.map((g) => (
            <GameCard key={g.key} game={g} />
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {/* Vocabulary World (3D hub) — portallar shu ro'yxatdagi o'yinlarga olib boradi */}
          <ExtraModeCard href="/app/vocabulary-world" icon={Globe2} title="Vocabulary World 3D" body={t('hub.worldShort')} />
          <ExtraModeCard href="/app/duel" icon={Swords} title={t('hub.duelTitle')} body={t('hub.duelBody')} testId="hub-duel" />
          <ExtraModeCard href="/games/speak" icon={Mic} title={t('hub.speakTitle')} body={t('hub.speakBody')} />
        </div>
      </section>

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
            <ul className="grid gap-2 mb-4 sm:grid-cols-2">
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

      <DiagnosticCard />
      <StoryCard />
      <CefrPathCard cefrPath={profile.cefrPath} ieltsPath={profile.ieltsPath} targetBand={profile.targetBand} />

      {/* --- Yutuqlar: olinganlari ko'rinadi, yopiqlari yig'ilgan (avval 16 ta kulrang chip edi) --- */}
      <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="hub-ach">
        <div className="flex items-center justify-between mb-3">
          <h2 id="hub-ach" className="text-base font-bold text-ink font-display flex items-center gap-2">
            <Award size={18} aria-hidden="true" /> {t('hub.achievements')}
          </h2>
          <span className="text-xs text-muted tabular-nums">
            {earned.length}/{badges.length}
          </span>
        </div>
        {earned.length ? (
          <ul className="flex flex-wrap gap-2">
            {earned.map((b) => (
              <li
                key={b.key}
                title={ts(b.description || b.label)}
                className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-hover"
              >
                <span aria-hidden="true">{b.icon}</span>
                {ts(b.label)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t('hub.achNone')}</p>
        )}
        {locked.length > 0 && (
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-lg text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {t('hub.achLocked', { n: locked.length })}
              <ChevronDown size={14} aria-hidden="true" className="motion-safe:transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 flex flex-wrap gap-2">
              {locked.map((b) => (
                <li key={b.key} title={ts(b.description || b.label)} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted">
                  <span aria-hidden="true" className="grayscale">
                    {b.icon}
                  </span>
                  {ts(b.label)}
                  <span className="sr-only">{t('hub.notEarned')}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
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
