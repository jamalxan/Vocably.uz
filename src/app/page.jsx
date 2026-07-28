'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Loader2, Send, ShieldCheck, ArrowLeft,
  CheckCircle2, ExternalLink, Sparkles, Eye, EyeOff, KeyRound,
} from 'lucide-react';

// Ekranlar: 'login' | 'register' | 'forgot'
// register/forgot ichidagi bosqichlar: 'form' -> 'telegram' -> 'code' -> (forgot uchun) 'newPassword'

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
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

  const pollRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.push('/dashboard');
    }
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
        const data = await res.json();
        if (data.status === 'code_sent') {
          clearInterval(pollRef.current);
          setStep('code');
          setInfo('Kod Telegram orqali yuborildi. Pastga kiriting.');
        } else if (data.status === 'expired') {
          clearInterval(pollRef.current);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setSessionToken(data.sessionToken);
      setTelegramLink(data.telegramLink);
      setBotUsername(data.botUsername);
      setStep('telegram');
      startPolling(data.sessionToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotInit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setSessionToken(data.sessionToken);
      setTelegramLink(data.telegramLink);
      setBotUsername(data.botUsername);
      setStep('telegram');
      startPolling(data.sessionToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      if (mode === 'register') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.name || '');
        localStorage.setItem('phone', data.phone || phone);
        router.push('/dashboard');
      } else {
        setStep('newPassword');
        setInfo('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      resetFlow('login');
      setInfo("Parol muvaffaqiyatli yangilandi. Endi tizimga kiring.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.name || '');
      localStorage.setItem('phone', data.phone || phone);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    login: 'Tizimga kirish',
    register: "Ro'yxatdan o'tish",
    forgot: 'Parolni tiklash',
  };

  const stepLabels = ['info', 'telegram', 'code', ...(mode === 'forgot' ? ['newPassword'] : [])];
  const stepIndexMap = { form: 0, telegram: 1, code: 2, newPassword: 3 };
  const showStepper = mode !== 'login';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-4 py-10 sm:py-14">
      {/* Fon: yumshoq gradient blob'lar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:28px_28px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brend */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 mb-4">
            <BookOpen size={26} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            Sinonimlar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Shaxsiy ingliz tili lug'ati platformasi</p>
        </div>

        {/* Karta */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-white">{titleMap[mode]}</h2>
            {mode === 'login' && <p className="text-xs text-slate-400 mt-1">Davom etish uchun tizimga kiring</p>}
            {mode === 'register' && step === 'form' && <p className="text-xs text-slate-400 mt-1">Telefon raqamingiz Telegram orqali tasdiqlanadi</p>}
            {mode === 'forgot' && step === 'form' && <p className="text-xs text-slate-400 mt-1">Parolni tiklash uchun raqamingizni kiriting</p>}
          </div>

          {showStepper && (
            <div className="flex items-center gap-1.5 mb-6">
              {stepLabels.map((label) => (
                <div
                  key={label}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    stepIndexMap[label] <= stepIndexMap[step] ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-300 border border-red-500/20 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 size={15} className="flex-shrink-0" /> {info}
            </div>
          )}

          {/* ---------- LOGIN ---------- */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Telefon raqam">
                <input
                  type="tel"
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
                  className="text-xs text-indigo-300 hover:text-indigo-200 font-medium"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <SubmitButton loading={loading}>Kirish</SubmitButton>
            </form>
          )}

          {/* ---------- REGISTER: form ---------- */}
          {mode === 'register' && step === 'form' && (
            <form onSubmit={handleRegisterInit} className="space-y-4">
              <Field label="Ismingiz (ixtiyoriy)">
                <input
                  type="text"
                  placeholder="Masalan: Jamshid"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Telefon raqam">
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Parol">
                <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} minLength={6} />
              </Field>
              <Field label="Parolni tasdiqlang">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
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
            <form onSubmit={handleForgotInit} className="space-y-4">
              <Field label="Telefon raqam">
                <input
                  type="tel"
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
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
                <Send size={26} className="text-sky-400" />
              </div>
              <p className="text-sm text-slate-200 font-medium mb-1.5">Telegram botga o'ting</p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Pastdagi tugma orqali botni oching va telefon raqamingizni ulashing.
                Raqam siz kiritgan <span className="text-slate-200 font-semibold">{phone}</span> bilan mos bo'lishi kerak.
                Tasdiqlangach, kod avtomatik shu yerga o'tkaziladi.
              </p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-sky-900/30"
              >
                @{botUsername} ni ochish <ExternalLink size={15} />
              </a>
              <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                <Loader2 size={13} className="animate-spin" /> Tasdiqlanishi kutilmoqda...
              </div>
              <button
                type="button"
                onClick={() => { clearInterval(pollRef.current); setStep('form'); setError(''); }}
                className="mt-4 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Orqaga
              </button>
            </div>
          )}

          {/* ---------- CODE: kod kiritish (register + forgot umumiy) ---------- */}
          {(mode === 'register' || mode === 'forgot') && step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                  <ShieldCheck size={24} className="text-indigo-400" />
                </div>
                <p className="text-xs text-slate-400">Telegram'da yuborilgan 6 xonali kodni kiriting</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                placeholder="••••••"
                className={`${inputClass} text-center text-2xl tracking-[0.5em] font-bold py-3`}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <SubmitButton loading={loading}>Tasdiqlash</SubmitButton>
              <button
                type="button"
                onClick={() => { setStep('telegram'); setError(''); startPolling(sessionToken); }}
                className="w-full text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Telegramga qaytish
              </button>
            </form>
          )}

          {/* ---------- FORGOT: yangi parol ---------- */}
          {mode === 'forgot' && step === 'newPassword' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <KeyRound size={24} className="text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">Raqam tasdiqlandi. Endi yangi parol o'rnating</p>
              </div>
              <Field label="Yangi parol">
                <PasswordInput value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} minLength={6} />
              </Field>
              <Field label="Yangi parolni tasdiqlang">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <SubmitButton loading={loading}>Parolni saqlash</SubmitButton>
            </form>
          )}

          {/* Rejim almashtirish */}
          {step === 'form' && (
            <p className="text-center text-xs text-slate-400 mt-6">
              {mode === 'login' && (
                <>
                  Hisobingiz yo'qmi?{' '}
                  <button onClick={() => resetFlow('register')} className="text-indigo-300 font-semibold hover:text-indigo-200">
                    Ro'yxatdan o'ting
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  Hisobingiz bormi?{' '}
                  <button onClick={() => resetFlow('login')} className="text-indigo-300 font-semibold hover:text-indigo-200">
                    Kirish oynasiga o'ting
                  </button>
                </>
              )}
              {mode === 'forgot' && (
                <button onClick={() => resetFlow('login')} className="text-indigo-300 font-semibold hover:text-indigo-200 flex items-center gap-1 mx-auto">
                  <ArrowLeft size={12} /> Kirish oynasiga qaytish
                </button>
              )}
            </p>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-6">
          <Sparkles size={12} /> Gemini AI asosida ishlaydi
        </p>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400 focus:bg-white/[0.08] transition-colors';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, setShow, minLength = 6 }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        className={`${inputClass} pr-10`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        tabIndex={-1}
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
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/30"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}
