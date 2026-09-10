import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Volume2, ArrowLeft, Sparkles } from 'lucide-react';
import { SEO_WORDS, getSeoWord } from '@/lib/seoWords';
import SpeakWordButton from '@/components/landing/SpeakWordButton';

// VOCABLY-TZ.md §17.3 — ochiq, statik generatsiya qilinadigan so'z sahifalari
// (uzun-dumli qidiruv trafigi uchun). src/lib/seoWords.js'dagi izohga q.: bu
// himoyalangan /app/lugat/soz/[wordId] (foydalanuvchining shaxsiy so'zi) BILAN
// ALOQASI YO'Q — butunlay ochiq, statik, login talab qilmaydigan sahifa.
export function generateStaticParams() {
  return SEO_WORDS.map((w) => ({ word: w.slug }));
}

export function generateMetadata({ params }) {
  const w = getSeoWord(params.word);
  if (!w) return {};
  const title = `${w.word} — tarjimasi, talaffuzi, misollar | Vocably`;
  const description = `${w.word} so'zining o'zbekcha tarjimasi (${w.translations.join(', ')}), talaffuzi (${w.ipa}), ta'rifi va misol jumlalar. CEFR: ${w.cefr}.`;
  return {
    title,
    description,
    alternates: { canonical: `/lugat/${w.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vocably' }],
    },
  };
}

export default function SeoWordPage({ params }) {
  const w = getSeoWord(params.word);
  if (!w) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: w.word,
    description: w.definitionEn,
    inDefinedTermSet: 'https://vocably.uz/lugat',
  };

  return (
    <div className="min-h-dvh bg-bg">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/lugat" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
          <ArrowLeft size={15} /> Boshqa so'zlar
        </Link>
        <Link href="/" className="font-luxury text-lg font-bold text-ink">
          Voc<span className="text-accent">ably</span>
        </Link>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <div className="bg-surface border border-border rounded-3xl shadow-card p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-4xl font-bold text-ink font-word">{w.word}</h1>
              <p className="text-sm text-muted italic mt-1">{w.ipa}</p>
            </div>
            <SpeakWordButton word={w.word} />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-primary-soft text-ink">{w.pos}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-accent-soft text-accent">{w.cefr}</span>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Tarjima</p>
            <p className="text-base text-ink">{w.translations.join(', ')}</p>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Ta'rif</p>
            <p className="text-sm text-ink">{w.definitionEn}</p>
            <p className="text-sm text-muted mt-1">{w.definitionUz}</p>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Misollar</p>
            <div className="space-y-2">
              {w.examples.map((ex, i) => (
                <div key={i} className="bg-bg rounded-lg p-3 text-sm">
                  <p className="text-ink">{ex.en}</p>
                  <p className="text-muted mt-0.5">{ex.uz}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Kollokatsiya</p>
            <div className="flex flex-wrap gap-1.5">
              {w.collocations.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-primary-soft text-ink">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">So'z oilasi</p>
            <p className="text-sm text-ink">{w.wordFamily.map((f) => `${f.form} (${f.pos})`).join(' · ')}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Sinonimlar</p>
              <p className="text-sm text-ink">{w.synonymsEn.join(', ')}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Antonimlar</p>
              <p className="text-sm text-ink">{w.antonyms.join(', ')}</p>
            </div>
          </div>

          <div className="mt-4 bg-accent-soft rounded-lg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent mb-1">Mnemonika</p>
            <p className="text-sm text-ink">{w.mnemonicUz}</p>
          </div>
        </div>

        <div className="bg-primary text-on-primary rounded-3xl p-6 sm:p-8 text-center">
          <Sparkles size={22} className="mx-auto mb-3 text-accent" />
          <p className="font-display text-lg font-bold mb-1.5">
            "{w.word}" kabi yana {SEO_WORDS.length - 1}+ so'zni o'rganing
          </p>
          <p className="text-sm text-on-primary/70 mb-5">
            Vocably'da har bir so'z ilmiy asoslangan takrorlash tizimi (SRS) bilan yodda qoladi.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/demo" className="bg-on-primary/10 hover:bg-on-primary/15 text-on-primary font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Ro'yxatdan o'tmasdan sinash
            </Link>
            <Link href="/royxat" className="bg-accent hover:bg-accent-hover text-on-accent font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-glow">
              Bepul boshlash
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
