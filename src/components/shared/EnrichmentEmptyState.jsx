'use client';
import Link from 'next/link';
import { useT } from '@/context/LocaleContext';
import { Sparkles } from 'lucide-react';

// V1/V2/V3/V5/V6/V8 (VOCABLY-TZ.md 6.2) — yangi rejimlarning barchasi so'zning
// AI-boyitilgan maydonlariga (misol, kollokatsiya, so'z oilasi, antonim...) muhtoj.
// D7 (1.1-bo'lim: "Bo'sh holatlar ishlanmagan") xatosini shu yerda TAKRORLAMASLIK
// uchun — bo'sh bo'lganda aniq tushuntirish + to'g'ridan-to'g'ri boyitish sahifasiga
// havola beriladi, shunchaki "so'z yo'q" deb qo'yilmaydi.
export default function EnrichmentEmptyState({ field = 'kerakli ma\'lumot' }) {
  const { t, ts } = useT();
  const [pre, post] = t('en.text', { field: '\u0000' }).split('\u0000');
  return (
    <div className="w-full max-w-md mx-auto text-center py-12 px-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
        <Sparkles size={24} />
      </div>
      <h3 className="font-bold text-ink font-display mb-1.5">{t('en.title')}</h3>
      <p className="text-sm text-muted mb-5">
        {pre.replace(/<b>$/, '')}<strong>{ts(field)}</strong>{post.replace(/^<\/b>/, '')}
      </p>
      <Link
        href="/app/lugat/jadval"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-glow"
      >
        <Sparkles size={15} />
        {t('en.cta')}
      </Link>
    </div>
  );
}
