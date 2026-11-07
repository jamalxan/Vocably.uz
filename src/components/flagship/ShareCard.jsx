'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, Share2, Link2, Check } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import useCopy from '@/components/landing/useCopy';
import { cardModel, renderCardBlob } from '@/lib/flagship/shareCard';

// 9:16 result card (TZ 2.0 §7): preview + download + native share sheet with the image
// (Instagram/Telegram stories on phones). Rendered on the device; nothing is uploaded.

const COPY = {
  uz: { title: 'Natija kartasi (9:16)', download: 'Yuklab olish', share: 'Ulashish', copy: 'Havolani nusxalash', copied: 'Nusxalandi', alt: 'Natija kartasi', failed: "Kartani yaratib bo'lmadi" },
  en: { title: 'Result card (9:16)', download: 'Download', share: 'Share', copy: 'Copy link', copied: 'Copied', alt: 'Result card', failed: 'Could not create the card' },
  ru: { title: 'Карточка результата (9:16)', download: 'Скачать', share: 'Поделиться', copy: 'Копировать ссылку', copied: 'Скопировано', alt: 'Карточка результата', failed: 'Не удалось создать карточку' },
};

export default function ShareCard({ game, result }) {
  const { locale } = useT();
  const c = useCopy(COPY);
  const model = useMemo(() => cardModel(game, result, locale), [game, result, locale]);
  const [card, setCard] = useState(null); // { url, file }
  const [failed, setFailed] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let url = '';
    let cancelled = false;
    renderCardBlob(model)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        const file = new File([blob], model.fileName, { type: 'image/png' });
        setCard({ url, file });
        setCanShareFile(!!navigator.canShare?.({ files: [file] }));
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [model]);

  const link = `https://www.${model.url}`;
  const share = async () => {
    try {
      if (canShareFile) await navigator.share({ files: [card.file], title: model.title, text: `${model.cta} ${link}` });
      else await navigator.share({ title: model.title, text: model.cta, url: link });
    } catch { /* user closed the sheet */ }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };
  const hasShare = typeof navigator !== 'undefined' && !!navigator.share;

  if (failed) return <p className="mt-6 text-xs text-muted">{c.failed}</p>;

  return (
    <section aria-label={c.title} className="mt-6 flex gap-4 items-center rounded-2xl border border-border bg-bg p-3">
      <div className="w-24 shrink-0 aspect-[9/16] rounded-xl overflow-hidden bg-[#0b1020]">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, nothing to optimise */}
        {card && <img src={card.url} alt={c.alt} className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 grid gap-2">
        <p className="text-xs font-semibold text-ink">{c.title}</p>
        <a
          href={card?.url}
          download={model.fileName}
          aria-disabled={!card}
          className={`min-h-11 rounded-xl bg-accent text-on-accent text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover ${card ? '' : 'pointer-events-none opacity-50'}`}
        >
          <Download size={16} aria-hidden="true" /> {c.download}
        </a>
        {hasShare ? (
          <button type="button" onClick={share} disabled={!card} className="min-h-11 rounded-xl border border-border bg-surface text-ink text-sm font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40 disabled:opacity-50">
            <Share2 size={16} aria-hidden="true" /> {c.share}
          </button>
        ) : (
          <button type="button" onClick={copyLink} className="min-h-11 rounded-xl border border-border bg-surface text-ink text-sm font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40">
            {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />} {copied ? c.copied : c.copy}
          </button>
        )}
      </div>
    </section>
  );
}
