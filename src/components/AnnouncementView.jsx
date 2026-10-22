'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Loader2, Megaphone } from 'lucide-react';
import { formatDateLocale } from '@/lib/uzDate';
import { useT } from '@/context/LocaleContext';

// In-app page for one announcement (reklama): text, media sent from the admin
// panel or the bot, and its URL buttons — what the Telegram message shows,
// for users who are not linked to the bot.
export default function AnnouncementView({ id }) {
  const { t, locale } = useT();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/announcements/${id}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) return setState(r.status === 404 ? 'missing' : 'error');
        setData(d.announcement);
        setState('ready');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const media = data?.media;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-5">
      <Link href="/app" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} aria-hidden="true" /> {t('an.back')}
      </Link>

      {state === 'loading' && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      )}
      {state === 'missing' && <p className="text-sm text-muted py-10 text-center">{t('an.missing')}</p>}
      {state === 'error' && <p className="text-sm text-danger py-10 text-center">{t('an.error')}</p>}

      {state === 'ready' && data && (
        <article className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          {media && (
            <div className="bg-bg">
              {media.kind === 'photo' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt={data.title} className="w-full max-h-[70vh] object-contain" />
              )}
              {media.kind === 'animation' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt={data.title} className="w-full max-h-[70vh] object-contain" />
              )}
              {(media.kind === 'video' || media.kind === 'video_note') && (
                <video src={media.url} controls playsInline className={`w-full max-h-[70vh] bg-black ${media.kind === 'video_note' ? 'max-w-xs mx-auto rounded-full aspect-square object-cover' : ''}`} />
              )}
              {(media.kind === 'audio' || media.kind === 'voice') && (
                <div className="p-4">
                  <audio src={media.url} controls className="w-full" />
                </div>
              )}
              {media.kind === 'document' && (
                <a href={media.url} download={media.fileName || true} className="flex items-center gap-3 p-4 text-sm text-accent font-semibold">
                  <Download size={18} aria-hidden="true" /> {media.fileName || t('an.download')}
                </a>
              )}
            </div>
          )}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Megaphone size={14} className="text-accent" aria-hidden="true" />
              {formatDateLocale(locale, data.createdAt, { year: true })}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink break-words">{data.title}</h1>
            {data.body && <p className="text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">{data.body}</p>}
            {data.buttons?.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                {data.buttons.map((b) => (
                  <a
                    key={b.url + b.text}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold"
                  >
                    {b.text} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
