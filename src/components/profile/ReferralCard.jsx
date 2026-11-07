'use client';
import { useEffect, useState } from 'react';
import { Gift, Copy, Send, Loader2, Users } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { referralShareUrl } from '@/lib/referral';

// "Do'stlarni taklif qilish" (TZ 2.0 §10 growth 3): my code + link, Telegram share, what it earned.
const COPY = {
  uz: {
    title: "Do'stlarni taklif qiling",
    body: "Har bir do'stingiz uchun — ikkalangizga ham {n} kun Premium.",
    code: 'Sizning kodingiz',
    copy: 'Havolani nusxalash',
    copied: 'Nusxalandi',
    share: 'Telegram’da ulashish',
    shareText: "Vocably'da ingliz tilini men bilan o'rgan — bu havola orqali kirsang, ikkalamizga {n} kun Premium.",
    invited: '{n} ta do‘st qo‘shildi',
    earned: '{n} kun Premium olindi',
    recent: 'Oxirgi takliflar',
    capped: 'oylik chegara',
    error: "Yuklab bo'lmadi",
  },
  en: {
    title: 'Invite friends',
    body: 'For every friend who joins, you both get {n} days of Premium.',
    code: 'Your code',
    copy: 'Copy link',
    copied: 'Copied',
    share: 'Share on Telegram',
    shareText: 'Learn English with me on Vocably — join through this link and we both get {n} days of Premium.',
    invited: '{n} friends joined',
    earned: '{n} days of Premium earned',
    recent: 'Recent invites',
    capped: 'monthly cap',
    error: 'Could not load',
  },
  ru: {
    title: 'Пригласите друзей',
    body: 'За каждого друга, который присоединится, вы оба получите {n} дн. Premium.',
    code: 'Ваш код',
    copy: 'Скопировать ссылку',
    copied: 'Скопировано',
    share: 'Поделиться в Telegram',
    shareText: 'Учи английский со мной в Vocably — зарегистрируйся по этой ссылке, и мы оба получим {n} дн. Premium.',
    invited: 'Присоединилось друзей: {n}',
    earned: 'Получено дней Premium: {n}',
    recent: 'Последние приглашения',
    capped: 'месячный лимит',
    error: 'Не удалось загрузить',
  },
};
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

export default function ReferralCard() {
  const c = useCopy(COPY);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let on = true;
    fetch('/api/referral', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((j) => on && setData(j))
      .catch(() => on && setFailed(true));
    return () => {
      on = false;
    };
  }, []);

  const base = typeof window !== 'undefined' ? window.location.origin : 'https://vocably.uz';
  const link = data ? `${base}/start?ref=${data.code}` : '';
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => setCopied(true)).catch(() => {});
  };

  return (
    <section className="rounded-2xl border border-accent/30 bg-accent-soft p-4 sm:p-5" aria-labelledby="ref-h" data-testid="referral-card">
      <h2 id="ref-h" className="text-xs font-semibold uppercase tracking-wide text-accent mb-1 flex items-center gap-1.5">
        <Gift size={13} aria-hidden="true" /> {c.title}
      </h2>
      <p className="text-sm text-ink">{fill(c.body, { n: data?.days ?? 7 })}</p>
      {failed ? (
        <p className="text-xs text-muted mt-2">{c.error}</p>
      ) : !data ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted mt-3" aria-hidden="true" />
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{c.code}</span>
            <code className="rounded-lg bg-surface border border-border px-2.5 py-1 text-sm font-bold tracking-wider text-ink" data-testid="referral-code">
              {data.code}
            </code>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:border-accent/40">
              <Copy size={15} aria-hidden="true" /> {copied ? c.copied : c.copy}
            </button>
            <a
              href={referralShareUrl(data.code, base, fill(c.shareText, { n: data.days }))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2AABEE] text-white px-3.5 py-2 text-sm font-semibold hover:opacity-90"
            >
              <Send size={15} aria-hidden="true" /> {c.share}
            </a>
          </div>
          <p className="mt-3 text-xs text-muted flex items-center gap-1.5 tabular-nums" data-testid="referral-stats">
            <Users size={13} aria-hidden="true" /> {fill(c.invited, { n: data.invited })} · {fill(c.earned, { n: data.rewardedDays })}
          </p>
          {data.recent.length > 0 && (
            <ul className="mt-2 text-xs text-muted space-y-0.5">
              {data.recent.slice(0, 5).map((r, i) => (
                <li key={i}>
                  {r.name || '—'}
                  {!r.rewarded && <span className="ml-1 opacity-70">({c.capped})</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
