'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, Sun, Moon, Monitor, Flame, Trophy, Target, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

// H-1 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H) — "Oxirgi marta ko'rilgan"/onlayn
// holatini kim ko'rishi. `/api/chat/settings` bilan mos qiymatlar (src/lib/models.js
// User.lastSeenVisibility).
const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Hamma' },
  { value: 'friends', label: "Suhbatlashganlar" },
  { value: 'nobody', label: 'Hech kim' },
];

// EDU-01a (VOCABLY_TZ_FINAL...2026-09-20.md §11 "Onboarding") — target band
// 5.0-9.0, 0.5 qadam bilan (TZ shakli).
const BAND_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const inputClass =
  'w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';

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
  const { displayName, username, phone, logout, reviewStreak, chatAccess } = useApp();
  const { theme, setTheme } = useTheme();
  const [gami, setGami] = useState(null);
  const [gamiFailed, setGamiFailed] = useState(false);

  // H-1 — faqat chatAccess bo'lgan foydalanuvchida ma'noli (Do'stlar bo'limi
  // umuman yashirin bo'lganlarda bu sozlama hech narsaga ta'sir qilmaydi).
  const [lastSeenVisibility, setLastSeenVisibility] = useState('everyone');
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityError, setVisibilityError] = useState(false);

  useEffect(() => {
    if (!chatAccess) {
      setVisibilityLoading(false);
      return;
    }
    let cancelled = false;
    fetch('/api/chat/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.lastSeenVisibility) setLastSeenVisibility(data.lastSeenVisibility);
      })
      .catch(() => {})
      .finally(() => !cancelled && setVisibilityLoading(false));
    return () => {
      cancelled = true;
    };
  }, [chatAccess]);

  const saveVisibility = async (value) => {
    const prev = lastSeenVisibility;
    setLastSeenVisibility(value);
    setVisibilitySaving(true);
    setVisibilityError(false);
    try {
      const res = await fetch('/api/chat/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastSeenVisibility: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLastSeenVisibility(prev);
      setVisibilityError(true);
    } finally {
      setVisibilitySaving(false);
    }
  };

  // EDU-01a — Onboarding/IELTS profil maydonlari. Sahifaning qolgan qismi
  // hech qanday tahrirlash routega ega emas edi (faqat mavzu/chiqish) —
  // shuning uchun bu yerda alohida, o'z holatiga ega kichik forma.
  const [prepLoading, setPrepLoading] = useState(true);
  const [prepFailed, setPrepFailed] = useState(false);
  const [prep, setPrep] = useState({
    targetBand: '',
    examType: '',
    examDate: '',
    currentLevel: '',
    dailyStudyMinutes: '',
  });
  const [prepSaving, setPrepSaving] = useState(false);
  const [prepSaved, setPrepSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setPrep({
          targetBand: data.targetBand ?? '',
          examType: data.examType ?? '',
          examDate: data.examDate ? data.examDate.slice(0, 10) : '',
          currentLevel: data.currentLevel ?? '',
          dailyStudyMinutes: data.dailyStudyMinutes ?? '',
        });
      })
      .catch(() => !cancelled && setPrepFailed(true))
      .finally(() => !cancelled && setPrepLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const savePrep = async (e) => {
    e.preventDefault();
    setPrepSaving(true);
    setPrepSaved(false);
    setPrepFailed(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBand: prep.targetBand === '' ? null : Number(prep.targetBand),
          examType: prep.examType === '' ? null : prep.examType,
          examDate: prep.examDate === '' ? null : prep.examDate,
          currentLevel: prep.currentLevel === '' ? null : prep.currentLevel,
          dailyStudyMinutes: prep.dailyStudyMinutes === '' ? null : Number(prep.dailyStudyMinutes),
        }),
      });
      if (!res.ok) throw new Error();
      setPrepSaved(true);
    } catch {
      setPrepFailed(true);
    } finally {
      setPrepSaving(false);
    }
  };

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
          <Target size={13} /> IELTS tayyorgarlik
        </h2>
        {prepLoading ? (
          <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ) : (
          <form onSubmit={savePrep} className="bg-surface border border-border rounded-2xl shadow-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-muted mb-1.5">Target band</span>
                <select
                  className={inputClass}
                  value={prep.targetBand}
                  onChange={(e) => setPrep((p) => ({ ...p, targetBand: e.target.value }))}
                >
                  <option value="">O'rnatilmagan</option>
                  {BAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-muted mb-1.5">Imtihon turi</span>
                <select
                  className={inputClass}
                  value={prep.examType}
                  onChange={(e) => setPrep((p) => ({ ...p, examType: e.target.value }))}
                >
                  <option value="">Tanlanmagan</option>
                  <option value="academic">Academic</option>
                  <option value="general">General Training</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-muted mb-1.5">Imtihon sanasi</span>
                <input
                  type="date"
                  className={inputClass}
                  value={prep.examDate}
                  onChange={(e) => setPrep((p) => ({ ...p, examDate: e.target.value }))}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-muted mb-1.5">Joriy daraja</span>
                <select
                  className={inputClass}
                  value={prep.currentLevel}
                  onChange={(e) => setPrep((p) => ({ ...p, currentLevel: e.target.value }))}
                >
                  <option value="">Tanlanmagan</option>
                  <option value="beginner">Boshlang'ich</option>
                  <option value="intermediate">O'rta</option>
                  <option value="advanced">Yuqori</option>
                </select>
              </label>

              <label className="block col-span-2">
                <span className="block text-xs font-medium text-muted mb-1.5">Kunlik mashg'ulot (daqiqa)</span>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  placeholder="masalan, 30"
                  className={inputClass}
                  value={prep.dailyStudyMinutes}
                  onChange={(e) => setPrep((p) => ({ ...p, dailyStudyMinutes: e.target.value }))}
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={prepSaving}>
                {prepSaving ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
              {prepSaved && <span className="text-xs text-accent font-medium">Saqlandi</span>}
              {prepFailed && <span className="text-xs text-danger font-medium">Saqlanmadi, qayta urinib ko'ring</span>}
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2.5">Ko'rinish</h2>
        <div role="group" aria-label="Mavzu" className="flex gap-2 p-1 bg-surface border border-border rounded-xl">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              aria-pressed={theme === opt.value}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                theme === opt.value ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
              }`}
            >
              <opt.icon size={15} />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {chatAccess && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 flex items-center gap-1.5">
            <Eye size={13} /> Maxfiylik (Do'stlar)
          </h2>
          <div className="bg-surface border border-border rounded-2xl shadow-card p-5">
            <p className="text-sm text-ink font-medium mb-1">Oxirgi marta ko'rilgan / onlayn holatini kim ko'radi</p>
            <p className="text-xs text-muted mb-3">
              "Suhbatlashganlar" — sizga xabar yozgan yoki siz yozgan foydalanuvchilar.
            </p>
            {visibilityLoading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <div role="group" aria-label="Ko'rinish" className="flex flex-col sm:flex-row gap-2 p-1 bg-bg rounded-xl">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => saveVisibility(opt.value)}
                    disabled={visibilitySaving}
                    aria-pressed={lastSeenVisibility === opt.value}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      lastSeenVisibility === opt.value ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {visibilityError && <p className="text-xs text-danger font-medium mt-2">Saqlanmadi, qayta urinib ko'ring</p>}
          </div>
        </section>
      )}

      <Button variant="secondary" onClick={logout} className="w-full">
        <LogOut size={16} />
        Chiqish
      </Button>
    </div>
  );
}
