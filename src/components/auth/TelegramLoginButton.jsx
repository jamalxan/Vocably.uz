'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';

// "Telegram orqali kirish" (TZ 2.0 §6.10.1). Our own button calls Telegram's JS API
// `Telegram.Login.auth({ bot_id, request_access })`: it opens Telegram's popup and hands back signed user
// data, which /api/auth/telegram verifies (HMAC with the bot token) before opening a session.
// Not the drop-in widget: its `data-onauth` callback is run through eval, which our CSP (rightly) blocks.
// Works only on the domain set for the bot in @BotFather (/setdomain).

const COPY = {
  uz: { or: 'yoki', button: 'Telegram orqali kirish', hint: "Parolsiz. Telefon bilan ochilgan hisobingiz shu Telegram'ga ulangan bo'lsa, o'sha hisob ochiladi.", busy: 'Kirilmoqda…', failed: "Telegram orqali kirib bo'lmadi", network: 'Internet aloqasini tekshiring', noScript: "Telegram yuklanmadi — sahifani yangilang", popupBlocked: "Brauzer Telegram oynasini ochmadi. Qalqib chiquvchi oynalarga ruxsat bering yoki telefon raqam va parol bilan kiring." },
  en: { or: 'or', button: 'Continue with Telegram', hint: "No password. If your phone account is linked to this Telegram, you'll land in that account.", busy: 'Signing in…', failed: 'Could not sign in with Telegram', network: 'Check your internet connection', noScript: 'Telegram did not load — refresh the page', popupBlocked: 'Your browser did not open the Telegram window. Allow pop-ups, or sign in with your phone number and password.' },
  ru: { or: 'или', button: 'Войти через Telegram', hint: 'Без пароля. Если ваш аккаунт с номером телефона привязан к этому Telegram, откроется он.', busy: 'Вход…', failed: 'Не удалось войти через Telegram', network: 'Проверьте подключение к интернету', noScript: 'Telegram не загрузился — обновите страницу', popupBlocked: 'Браузер не открыл окно Telegram. Разрешите всплывающие окна или войдите по номеру телефона и паролю.' },
};

const SCRIPT_ID = 'telegram-login-js';
const SCRIPT_SRC = 'https://telegram.org/js/telegram-widget.js?22';
const tgLogin = () => (typeof window !== 'undefined' ? window.Telegram?.Login : null);

export default function TelegramLoginButton({ bot, onSuccess }) {
  const c = useCopy(COPY);
  const { locale } = useT();
  const done = useRef(onSuccess);
  // Already loaded (e.g. came back from /register to /login) → ready from the first render.
  const [ready, setReady] = useState(() => !!tgLogin()?.auth);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    done.current = onSuccess;
  });

  useEffect(() => {
    if (!bot) return undefined;
    if (tgLogin()?.auth) return undefined;
    let s = document.getElementById(SCRIPT_ID);
    if (!s) {
      s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    const onLoad = () => setReady(!!tgLogin()?.auth);
    const onError = () => setError(c.noScript);
    s.addEventListener('load', onLoad);
    s.addEventListener('error', onError);
    return () => {
      s.removeEventListener('load', onLoad);
      s.removeEventListener('error', onError);
    };
    // c.noScript only matters for the message text; the script is loaded once per bot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot]);

  const signIn = (tgUser) => {
    if (!tgUser) {
      setBusy(false); // popup closed or access not given
      return;
    }
    fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tgUser) })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || c.failed);
        done.current?.(data);
      })
      .catch((err) => {
        setError(err instanceof TypeError ? c.network : err.message);
        setBusy(false);
      });
  };

  const open = () => {
    const api = tgLogin();
    if (!api?.auth) {
      setError(c.noScript);
      return;
    }
    setError('');
    setBusy(true);
    // Telegram's script opens its popup with window.open and, when the browser refuses (a popup blocker, many
    // in-app browsers), never calls back: the button would spin forever. Its popup handle is private, so that
    // one synchronous call is watched here.
    let blocked = false;
    const nativeOpen = window.open;
    window.open = (...args) => {
      const popup = nativeOpen.apply(window, args);
      blocked = !popup;
      return popup;
    };
    try {
      // Must run inside the click handler: the popup is opened synchronously.
      api.auth({ bot_id: bot.id, request_access: 'write', lang: locale }, signIn);
    } catch {
      blocked = true;
    } finally {
      window.open = nativeOpen;
    }
    if (blocked) {
      setBusy(false);
      setError(c.popupBlocked);
    }
  };

  if (!bot) return null;
  return (
    <div className="mt-6" data-testid="telegram-login">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted mb-4">
        <span className="h-px flex-1 bg-border" />
        {c.or}
        <span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={open}
        disabled={!ready || busy}
        className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-semibold text-sm disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2AABEE]"
      >
        {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {busy ? c.busy : c.button}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger text-center">
          {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-muted text-center leading-relaxed">{c.hint}</p>
    </div>
  );
}
