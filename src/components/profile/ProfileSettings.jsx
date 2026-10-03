'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Eye, Globe, LogOut, Monitor, Moon, Send, ShieldCheck, Sun, Target, Users, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useT } from '@/context/LocaleContext';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Skeleton from '@/components/ui/Skeleton';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';
import { useBackClose } from '@/lib/useBackClose';

// Profil sahifasidagi "sozlama"ga o'xshash bo'limlar (IELTS tayyorgarlik, Telegram, Ko'rinish, Maxfiylik) bitta "Sozlamalar" oynasiga
// jamlandi — sahifa endi faqat profil, daraja va statistikani ko'rsatadi. Ma'lumotlar (/api/profile, /api/chat/settings) faqat oyna
// birinchi marta ochilganda yuklanadi (sahifa ochilishida ikkita so'rov kamaydi). Mobilda to'liq ekran varag'i; "orqaga" avval
// oynani yopadi (useBackClose). Matnlar i18n orqali (uz/ru) — src/lib/i18n/messages.

const VISIBILITY_OPTIONS = [
  { value: 'everyone', labelKey: 'settings.visEveryone' },
  { value: 'friends', labelKey: 'settings.visFriends' },
  { value: 'nobody', labelKey: 'settings.visNobody' },
];
const BAND_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const THEME_OPTIONS = [
  { value: 'light', labelKey: 'settings.themeLight', icon: Sun },
  { value: 'dark', labelKey: 'settings.themeDark', icon: Moon },
  { value: 'system', labelKey: 'settings.themeSystem', icon: Monitor },
];
const inputClass =
  'w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';
const sectionTitle = 'text-xs font-semibold uppercase tracking-wide text-muted mb-2.5 flex items-center gap-1.5';

export default function ProfileSettings({ open, onClose }) {
  const { chatAccess, logout } = useApp();
  const { t, locale, setLocale } = useT();
  const [confirmAll, setConfirmAll] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const titleId = useId();
  const closeRef = useRef(null);
  const dialogRef = useDialogFocus(open, closeRef);
  useBackClose(open, onClose);

  // ---- Telegram kunlik mashq + IELTS tayyorgarlik (/api/profile)
  const [tg, setTg] = useState(null); // { linked, daily }
  const [prepLoading, setPrepLoading] = useState(true);
  const [prepFailed, setPrepFailed] = useState(false);
  const [prep, setPrep] = useState({ targetBand: '', examType: '', examDate: '', currentLevel: '', dailyStudyMinutes: '' });
  const [prepSaving, setPrepSaving] = useState(false);
  const [prepSaved, setPrepSaved] = useState(false);

  // ---- Maxfiylik (/api/chat/settings) — faqat Do'stlar bo'limi ochiq foydalanuvchida ma'noli
  const [lastSeenVisibility, setLastSeenVisibility] = useState('everyone');
  const [photoVisibility, setPhotoVisibility] = useState('everyone');
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityError, setVisibilityError] = useState(false);

  // ---- Sinf takliflari (/api/classroom-invites) — o'qituvchi roziligimizsiz qo'sha olmaydi
  const [invites, setInvites] = useState([]);
  const [inviteBusy, setInviteBusy] = useState(false);
  const answerInvite = async (id, accept) => {
    setInviteBusy(true);
    try {
      const res = await fetch(`/api/classroom-invites/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      });
      if (res.ok || res.status === 404) setInvites((list) => list.filter((i) => i.id !== id));
    } catch {
      /* tarmoq xatosi: taklif ro'yxatda qoladi, qayta urinish mumkin */
    } finally {
      setInviteBusy(false);
    }
  };

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!open || loadedRef.current) return undefined;
    loadedRef.current = true;
    let cancelled = false;
    fetch('/api/classroom-invites')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => !cancelled && data?.invites && setInvites(data.invites))
      .catch(() => {});
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
        setTg({ linked: !!data.telegramLinked, daily: data.tgDailyPractice !== false });
      })
      .catch(() => !cancelled && setPrepFailed(true))
      .finally(() => !cancelled && setPrepLoading(false));

    if (chatAccess) {
      fetch('/api/chat/settings')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled) return;
          if (data?.lastSeenVisibility) setLastSeenVisibility(data.lastSeenVisibility);
          if (data?.photoVisibility) setPhotoVisibility(data.photoVisibility);
        })
        .catch(() => {})
        .finally(() => !cancelled && setVisibilityLoading(false));
    } else {
      setVisibilityLoading(false);
    }
    return () => {
      cancelled = true;
      loadedRef.current = false; // oyna yopilib qayta ochilganda (yoki StrictMode) yangidan yuklanadi
    };
  }, [open, chatAccess]);

  // Ochiq paytda orqadagi sahifa scroll bo'lmasin; Escape — yopish.
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const toggleTgDaily = async () => {
    if (!tg) return;
    const next = !tg.daily;
    setTg({ ...tg, daily: next });
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tgDailyPractice: next }),
    }).catch(() => null);
    if (!res?.ok) setTg((cur) => ({ ...cur, daily: !next }));
  };

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

  // `field` — 'lastSeenVisibility' yoki 'photoVisibility' (ikkalasi ham /api/chat/settings).
  const saveVisibility = async (value, field = 'lastSeenVisibility') => {
    const [prev, setter] =
      field === 'photoVisibility' ? [photoVisibility, setPhotoVisibility] : [lastSeenVisibility, setLastSeenVisibility];
    setter(value);
    setVisibilitySaving(true);
    setVisibilityError(false);
    try {
      const res = await fetch('/api/chat/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setter(prev);
      setVisibilityError(true);
    } finally {
      setVisibilitySaving(false);
    }
  };

  const signOutEverywhere = async () => {
    setSigningOut(true);
    // Server barcha sessiyalarni bekor qiladi; so'rov muvaffaqiyatsiz bo'lsa ham mahalliy chiqish baribir bajariladi.
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allDevices: true }),
    }).catch(() => {});
    logout();
  };

  if (!open) return null;

  const segmented = (options, current, onPick, label) => (
    <div role="group" aria-label={label} className="flex flex-col sm:flex-row gap-2 p-1 bg-bg rounded-xl">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onPick(opt.value)}
          disabled={visibilitySaving}
          aria-pressed={current === opt.value}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            current === opt.value ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
          }`}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-bg w-full sm:max-w-xl h-[92dvh] sm:h-auto sm:max-h-[88dvh] rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl flex flex-col outline-none pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <h2 id={titleId} className="text-lg font-bold text-ink font-display">
            {t('settings.title')}
          </h2>
          <IconButton ref={closeRef} icon={X} label={t('settings.close')} onClick={onClose} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-7">
          <section>
            <h3 className={sectionTitle}>
              <Globe size={13} aria-hidden="true" /> {t('lang.title')}
            </h3>
            <div role="group" aria-label={t('lang.title')} className="flex gap-2 p-1 bg-surface border border-border rounded-xl">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  lang={l}
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    locale === l ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">{t('lang.hint')}</p>
          </section>

          {invites.length > 0 && (
            <section>
              <h3 className={sectionTitle}>
                <Users size={13} aria-hidden="true" /> {t('settings.invites')}
              </h3>
              <ul className="space-y-3">
                {invites.map((inv) => (
                  <li key={inv.id} className="bg-surface border border-border rounded-2xl shadow-card p-4">
                    <p className="text-sm text-ink mb-3">{t('settings.inviteText', { teacher: inv.teacher, name: inv.name })}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => answerInvite(inv.id, true)} disabled={inviteBusy}>
                        {t('settings.inviteAccept')}
                      </Button>
                      <Button variant="ghost" onClick={() => answerInvite(inv.id, false)} disabled={inviteBusy}>
                        {t('settings.inviteDecline')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className={sectionTitle}>
              <Target size={13} aria-hidden="true" /> {t('settings.prep')}
            </h3>
            {prepLoading ? (
              <div className="space-y-2" aria-hidden="true">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ) : (
              <form onSubmit={savePrep} className="bg-surface border border-border rounded-2xl shadow-card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-muted mb-1.5">{t('settings.targetBand')}</span>
                    <select className={inputClass} value={prep.targetBand} onChange={(e) => setPrep((p) => ({ ...p, targetBand: e.target.value }))}>
                      <option value="">{t('settings.notSet')}</option>
                      {BAND_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted mb-1.5">{t('settings.examType')}</span>
                    <select className={inputClass} value={prep.examType} onChange={(e) => setPrep((p) => ({ ...p, examType: e.target.value }))}>
                      <option value="">{t('settings.notChosen')}</option>
                      <option value="academic">Academic</option>
                      <option value="general">General Training</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted mb-1.5">{t('settings.examDate')}</span>
                    <input type="date" className={inputClass} value={prep.examDate} onChange={(e) => setPrep((p) => ({ ...p, examDate: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-muted mb-1.5">{t('settings.level')}</span>
                    <select className={inputClass} value={prep.currentLevel} onChange={(e) => setPrep((p) => ({ ...p, currentLevel: e.target.value }))}>
                      <option value="">{t('settings.notChosen')}</option>
                      <option value="beginner">{t('settings.levelBeginner')}</option>
                      <option value="intermediate">{t('settings.levelIntermediate')}</option>
                      <option value="advanced">{t('settings.levelAdvanced')}</option>
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="block text-xs font-medium text-muted mb-1.5">{t('settings.dailyMinutes')}</span>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      placeholder={t('settings.dailyMinutesPlaceholder')}
                      className={inputClass}
                      value={prep.dailyStudyMinutes}
                      onChange={(e) => setPrep((p) => ({ ...p, dailyStudyMinutes: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={prepSaving}>
                    {prepSaving ? t('settings.saving') : t('settings.save')}
                  </Button>
                  {prepSaved && <span className="text-xs text-accent font-medium">{t('settings.saved')}</span>}
                  {prepFailed && <span className="text-xs text-danger font-medium">{t('settings.saveFailed')}</span>}
                </div>
              </form>
            )}
          </section>

          <section>
            <h3 className={sectionTitle}>
              <Send size={13} aria-hidden="true" /> {t('settings.telegram')}
            </h3>
            <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-2xl shadow-card">
              <Send size={18} className="text-accent flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t('settings.tgDaily')}</p>
                <p className="text-xs text-muted">{tg?.linked ? t('settings.tgDailyOn') : t('settings.tgNotLinked')}</p>
              </div>
              {tg?.linked && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={tg.daily}
                  aria-label={t('settings.tgToggle')}
                  onClick={toggleTgDaily}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${tg.daily ? 'bg-accent' : 'bg-border'}`}
                >
                  <span className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-transform ${tg.daily ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>{t('settings.appearance')}</h3>
            <div role="group" aria-label={t('settings.theme')} className="flex gap-2 p-1 bg-surface border border-border rounded-xl">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  aria-pressed={theme === opt.value}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    theme === opt.value ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-bg-sunken'
                  }`}
                >
                  <opt.icon size={15} aria-hidden="true" />
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>
              <ShieldCheck size={13} aria-hidden="true" /> {t('settings.security')}
            </h3>
            <div className="bg-surface border border-border rounded-2xl shadow-card p-5">
              <p className="text-sm text-ink font-medium mb-1">{t('settings.signOutAll')}</p>
              <p className="text-xs text-muted mb-3">{t('settings.signOutAllHint')}</p>
              {confirmAll ? (
                <div className="flex items-center gap-2">
                  <Button variant="danger" onClick={signOutEverywhere} disabled={signingOut}>
                    {signingOut ? t('settings.working') : t('settings.signOutAllConfirm')}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmAll(false)} disabled={signingOut}>
                    {t('settings.cancel')}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmAll(true)}>
                  <LogOut size={16} aria-hidden="true" /> {t('settings.signOutAll')}
                </Button>
              )}
            </div>
          </section>

          {chatAccess && (
            <section>
              <h3 className={sectionTitle}>
                <Eye size={13} aria-hidden="true" /> {t('settings.privacy')}
              </h3>
              <div className="bg-surface border border-border rounded-2xl shadow-card p-5">
                <p className="text-sm text-ink font-medium mb-1">{t('settings.lastSeenWho')}</p>
                <p className="text-xs text-muted mb-3">{t('settings.lastSeenHint')}</p>
                {visibilityLoading ? <Skeleton className="h-11 w-full rounded-xl" /> : segmented(VISIBILITY_OPTIONS, lastSeenVisibility, (v) => saveVisibility(v), t('settings.visibilityAria'))}
                <p className="text-sm text-ink font-medium mt-5 mb-1">{t('settings.photoWho')}</p>
                <p className="text-xs text-muted mb-3">{t('settings.photoHint')}</p>
                {visibilityLoading ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                ) : (
                  segmented(VISIBILITY_OPTIONS, photoVisibility, (v) => saveVisibility(v, 'photoVisibility'), t('settings.photoVisibilityAria'))
                )}
                {visibilityError && <p className="text-xs text-danger font-medium mt-2">{t('settings.saveFailed')}</p>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
