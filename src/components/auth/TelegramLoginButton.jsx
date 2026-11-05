'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';

// Telegram Login Widget (TZ 2.0 §6.10.1). Telegram's own script draws the button in an iframe and calls
// our global callback with signed data; /api/auth/telegram checks the signature and sets the session.
// Works only on the domain set for the bot in @BotFather (/setdomain) — elsewhere Telegram shows
// "Bot domain invalid", so on localhost this button is decoration.

const COPY = {
  uz: { or: 'yoki', hint: "Parolsiz. Telefon bilan ochilgan hisobingiz shu Telegram'ga ulangan bo'lsa, o'sha hisob ochiladi.", busy: 'Kirilmoqda…', failed: "Telegram orqali kirib bo'lmadi", network: "Internet aloqasini tekshiring" },
  en: { or: 'or', hint: "No password. If your phone account is linked to this Telegram, you'll land in that account.", busy: 'Signing in…', failed: 'Could not sign in with Telegram', network: 'Check your internet connection' },
};

const CALLBACK = '__vocablyTelegramAuth';

export default function TelegramLoginButton({ bot, onSuccess }) {
  const c = useCopy(COPY);
  const holder = useRef(null);
  const done = useRef(onSuccess);
  const copy = useRef(c);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    done.current = onSuccess;
    copy.current = c;
  });

  useEffect(() => {
    const el = holder.current;
    if (!bot || !el) return undefined;
    window[CALLBACK] = async (tgUser) => {
      if (!tgUser) return; // user closed the popup
      setBusy(true);
      setError('');
      try {
        const res = await fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tgUser) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || copy.current.failed);
        done.current?.(data);
      } catch (err) {
        setError(err instanceof TypeError ? copy.current.network : err.message);
        setBusy(false);
      }
    };
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', bot);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '12');
    s.setAttribute('data-userpic', 'false');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-onauth', `${CALLBACK}(user)`);
    el.appendChild(s);
    return () => {
      el.replaceChildren();
      delete window[CALLBACK];
    };
  }, [bot]);

  if (!bot) return null;
  return (
    <div className="mt-6" data-testid="telegram-login">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted mb-4">
        <span className="h-px flex-1 bg-border" />
        {c.or}
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={holder} className="flex justify-center min-h-10" aria-hidden={busy} />
      {busy && (
        <p role="status" className="mt-2 text-xs text-muted flex items-center justify-center gap-1.5">
          <Loader2 size={12} className="animate-spin" aria-hidden="true" /> {c.busy}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger text-center">
          {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-muted text-center leading-relaxed">{c.hint}</p>
    </div>
  );
}
