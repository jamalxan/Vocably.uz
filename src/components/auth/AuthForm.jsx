'use client';
import { useState, useEffect, useRef, useId, cloneElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Loader2, Send, ShieldCheck, ArrowLeft,
  CheckCircle2, ExternalLink, Sparkles, Eye, EyeOff, KeyRound,
} from 'lucide-react';
import { normalizePhone } from '@/lib/phone';

// Tarmoq uzilishi yoki JSON bo'lmagan javob (502/HTML) foydalanuvchiga xom inglizcha xato bo'lib chiqmasin
const NETWORK_ERROR = "Server bilan aloqa yo'q, qayta urinib ko'ring";

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

const errorMessage = (err) => (err instanceof TypeError || !err?.message ? NETWORK_ERROR : err.message);

// Brauzerning inglizcha validatsiya pufakchasi o'rniga o'zbekcha xabarlar
function validatePhone(phone) {
  if (!phone.trim()) return 'Telefon raqamni kiriting';
  if (!normalizePhone(phone)) return "Telefon raqam noto'g'ri";
  return '';
}

function validatePassword(password) {
  if (!password) return 'Parolni kiriting';
  if (password.length < 6) return 'Parol kamida 6 belgidan iborat bo\'lishi kerak';
  return '';
}

// VOCABLY-TZ.md §3.1 (IA): T3 muammosi tuzatilgach ("Landing page yo'q, to'g'ridan-to'g'ri
// login") bu forma endi '/' emas, /kirish va /royxat sahifalarida yashaydi (src/app/kirish,
// src/app/royxat — ikkalasi ham shu komponentni turli `initialMode` bilan chaqiradi).
// Ichki holat faqat login<->forgot<->newPassword orasidagi bosqichlar uchun — login<->register
// almashishi endi haqiqiy navigatsiya (Link), shuning uchun manzil satri to'g'ri ko'rsatadi
// va orqaga tugmasi ishlaydi.
//
// register/forgot ichidagi bosqichlar: 'form' -> 'telegram' -> 'code' -> (forgot uchun) 'newPassword'
export default function AuthForm({ initialMode = 'login' }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [step, setStep] = useState('form');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [sessionToken, setSessionToken] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [botUsername, setBotUsername] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  // Hydration va token tekshiruvi tugamaguncha forma bosilmaydi
  const [ready, setReady] = useState(false);

  const pollRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/app');
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const resetFlow = (nextMode) => {
    clearInterval(pollRef.current);
    setMode(nextMode);
    setStep('form');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setCode('');
    setError('');
    setInfo('');
    setSessionToken('');
    setTelegramLink('');
  };

  const startPolling = (token) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/session-status?token=${token}`);
        const data = await readJson(res);
        if (data.status === 'code_sent') {
          clearInterval(pollRef.current);
          setStep('code');
          setInfo('Kod Telegram orqali yuborildi. Pastga kiriting.');
        } else if (data.status === 'expired') {
          clearInterval(pollRef.current);
          setStep('form');
          setInfo('');
          setError("Sessiya muddati tugadi. Iltimos, qaytadan boshlang.");
        }
      } catch {
        // keyingi urinishda davom etamiz
      }
    }, 2500);
  };

  const handleRegisterInit = async (e) => {
    e.preventDefault();
    setError('');
    const invalid = validatePhone(phone) || validatePassword(password);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setSessionToken(data.sessionToken);
      setTelegramLink(data.telegramLink);
      setBotUsername(data.botUsername);
      setStep('telegram');
      startPolling(data.sessionToken);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotInit = async (e) => {
    e.preventDefault();
    setError('');
    const invalid = validatePhone(phone);
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setSessionToken(data.sessionToken);
      setTelegramLink(data.telegramLink);
      setBotUsername(data.botUsername);
      setStep('telegram');
      startPolling(data.sessionToken);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('6 xonali kodni kiriting');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, code }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      if (mode === 'register') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.name || '');
        localStorage.setItem('phone', data.phone || phone);
        router.push('/app');
      } else {
        setStep('newPassword');
        setInfo('');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    const invalid = validatePassword(password);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, newPassword: password }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      resetFlow('login');
      setInfo("Parol muvaffaqiyatli yangilandi. Endi tizimga kiring.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const invalid = validatePhone(phone) || (!password ? 'Parolni kiriting' : '');
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.name || '');
      localStorage.setItem('phone', data.phone || phone);
      router.push('/app');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    login: 'Tizimga kirish',
    register: "Ro'yxatdan o'tish",
    forgot: 'Parolni tiklash',
  };

  const stepLabels = ['form', 'telegram', 'code', ...(mode === 'forgot' ? ['newPassword'] : [])];
  const stepIndexMap = { form: 0, telegram: 1, code: 2, newPassword: 3 };
  const showStepper = mode !== 'login';

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg flex items-center justify-center px-4 py-10 sm:py-14">
      {/* Fon: yumshoq gradient blob'lar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brend */}
        <Link href="/" className="flex flex-col items-center w-fit mx-auto mb-6 sm:mb-8 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-on-accent shadow-glow mb-4">
            <BookOpen size={26} />
          </div>
          <h1 className="font-luxury text-3xl font-bold text-ink tracking-tight">
            Voc<span className="text-accent">ably</span>
          </h1>
          <p className="text-xs text-muted mt-1">Ingliz tili yordamchisi</p>
        </Link>

        {/* Karta */}
        <div
          className={`bg-surface border border-border rounded-3xl shadow-card p-6 sm:p-8 transition-opacity ${ready ? '' : 'pointer-events-none opacity-60'}`}
          aria-busy={!ready}
        >
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-ink">{titleMap[mode]}</h2>
            {mode === 'login' && <p className="text-xs text-muted mt-1">Davom etish uchun tizimga kiring</p>}
            {mode === 'register' && step === 'form' && <p className="text-xs text-muted mt-1">Telefon raqamingiz Telegram orqali tasdiqlanadi</p>}
            {mode === 'forgot' && step === 'form' && <p className="text-xs text-muted mt-1">Parolni tiklash uchun raqamingizni kiriting</p>}
          </div>

          {showStepper && (
            <div className="flex items-center gap-1.5 mb-6">
              {stepLabels.map((label) => (
                <div
                  key={label}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    stepIndexMap[label] <= stepIndexMap[step] ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          )}

          {error && (
            <div role="alert" className="bg-danger-soft text-danger border border-danger/20 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {info && !error && (
            <div role="status" className="bg-success-soft text-success border border-success/20 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 size={15} className="flex-shrink-0" /> {info}
            </div>
          )}

          {/* ---------- LOGIN ---------- */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <Field label="Telefon raqam">
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Parol">
                <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} />
              </Field>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => resetFlow('forgot')}
                  className="text-xs text-accent hover:text-accent-hover font-medium py-3.5 -my-3.5 px-2 -mx-2"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <SubmitButton loading={loading}>Kirish</SubmitButton>
            </form>
          )}

          {/* ---------- REGISTER: form ---------- */}
          {mode === 'register' && step === 'form' && (
            <form onSubmit={handleRegisterInit} noValidate className="space-y-4">
              <Field label="Ismingiz (ixtiyoriy)">
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Masalan: Jamshid"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Telefon raqam">
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Parol">
                <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} minLength={6} autoComplete="new-password" />
              </Field>
              <Field label="Parolni tasdiqlang">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <SubmitButton loading={loading}>Davom etish</SubmitButton>
            </form>
          )}

          {/* ---------- FORGOT: form ---------- */}
          {mode === 'forgot' && step === 'form' && (
            <form onSubmit={handleForgotInit} noValidate className="space-y-4">
              <Field label="Telefon raqam">
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <SubmitButton loading={loading}>Kodni olish</SubmitButton>
            </form>
          )}

          {/* ---------- TELEGRAM: kutish bosqichi (register + forgot umumiy) ---------- */}
          {(mode === 'register' || mode === 'forgot') && step === 'telegram' && (
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary/15 flex items-center justify-center mb-4">
                <Send size={26} className="text-ink" />
              </div>
              <p className="text-sm text-ink font-medium mb-1.5">Telegram botga o'ting</p>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Pastdagi tugma orqali botni oching va telefon raqamingizni ulashing.
                Raqam siz kiritgan <span className="text-ink font-semibold">{phone}</span> bilan mos bo'lishi kerak.
                Tasdiqlangach, kod avtomatik shu yerga o'tkaziladi.
              </p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-3 rounded-xl text-sm transition-all shadow-glow"
              >
                @{botUsername} ni ochish <ExternalLink size={15} />
              </a>
              <div className="flex items-center gap-2 mt-5 text-xs text-muted">
                <Loader2 size={13} className="animate-spin" /> Tasdiqlanishi kutilmoqda...
              </div>
              <button
                type="button"
                onClick={() => { clearInterval(pollRef.current); setStep('form'); setError(''); setInfo(''); }}
                className="mt-2 min-h-11 px-3 text-xs text-muted hover:text-ink flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Orqaga
              </button>
            </div>
          )}

          {/* ---------- CODE: kod kiritish (register + forgot umumiy) ---------- */}
          {(mode === 'register' || mode === 'forgot') && step === 'code' && (
            <form onSubmit={handleVerifyCode} noValidate className="space-y-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center mb-3">
                  <ShieldCheck size={24} className="text-accent" />
                </div>
                <p className="text-xs text-muted">Telegram'da yuborilgan 6 xonali kodni kiriting</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
                aria-label="6 xonali tasdiqlash kodi"
                className={`${inputClass} text-center text-2xl tracking-[0.5em] indent-[0.5em] font-bold py-3`}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <SubmitButton loading={loading}>Tasdiqlash</SubmitButton>
              <button
                type="button"
                onClick={() => { setStep('telegram'); setError(''); setInfo(''); startPolling(sessionToken); }}
                className="w-full min-h-11 text-xs text-muted hover:text-ink flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Telegramga qaytish
              </button>
            </form>
          )}

          {/* ---------- FORGOT: yangi parol ---------- */}
          {mode === 'forgot' && step === 'newPassword' && (
            <form onSubmit={handleSetNewPassword} noValidate className="space-y-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-primary-soft border border-primary/15 flex items-center justify-center mb-3">
                  <KeyRound size={24} className="text-ink" />
                </div>
                <p className="text-xs text-muted">Raqam tasdiqlandi. Endi yangi parol o'rnating</p>
              </div>
              <Field label="Yangi parol">
                <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} minLength={6} autoComplete="new-password" />
              </Field>
              <Field label="Yangi parolni tasdiqlang">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <SubmitButton loading={loading}>Parolni saqlash</SubmitButton>
            </form>
          )}

          {/* Rejim almashtirish — login<->register endi haqiqiy sahifa (Link), URL to'g'ri
              ko'rsatadi. Faqat "forgot"dan chiqish ichki holat (u alohida route emas). */}
          {step === 'form' && (
            <p className="text-center text-xs text-muted mt-6">
              {mode === 'login' && (
                <>
                  Hisobingiz yo'qmi?{' '}
                  <Link href="/royxat" className="py-3 text-accent font-semibold hover:text-accent-hover">
                    Ro'yxatdan o'ting
                  </Link>
                </>
              )}
              {mode === 'register' && (
                <>
                  Hisobingiz bormi?{' '}
                  <Link href="/kirish" className="py-3 text-accent font-semibold hover:text-accent-hover">
                    Kirish oynasiga o'ting
                  </Link>
                </>
              )}
              {mode === 'forgot' && (
                <button type="button" onClick={() => resetFlow('login')} className="min-h-11 px-3 -my-3 text-accent font-semibold hover:text-accent-hover flex items-center gap-1 mx-auto">
                  <ArrowLeft size={12} /> Kirish oynasiga qaytish
                </button>
              )}
            </p>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted mt-6">
          <Sparkles size={12} /> Sun'iy intellekt asosida ishlaydi
        </p>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-base text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';

function Field({ label, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

function PasswordInput({ id, value, onChange, show, setShow, minLength = 6, autoComplete = 'current-password' }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${inputClass} pr-12`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Parolni yashirish' : "Parolni ko'rsatish"}
        aria-pressed={show}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 shadow-glow"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}
