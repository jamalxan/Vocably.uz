'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookText, Sparkles } from 'lucide-react';
import Button, { buttonClasses } from '@/components/ui/Button';
import { splitByWords } from '@/lib/vocab/highlight';
import { generateStory } from './api';

// AI mini hikoya (TZ §27.3): o'rganilayotgan (avvalo zaif) so'zlardan qisqa matn — so'zlar kontekstda yodlanadi.
// Premium; backend kvota va limitni o'zi tekshiradi, bu yerda faqat sababini ko'rsatamiz.
export default function StoryCard() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { message, upgrade }

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setStory(await generateStory());
    } catch (e) {
      setError({ message: e.message || 'Xatolik yuz berdi', upgrade: e.status === 403 });
    } finally {
      setLoading(false);
    }
  };

  const parts = story ? splitByWords(story.story, [...(story.usedWords || []), ...(story.words || []).map((w) => w.word)]) : [];

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 shadow-card" aria-labelledby="story-title">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          <BookText size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="story-title" className="text-sm font-semibold text-ink">
            AI hikoya
          </h2>
          <p className="text-xs text-muted mt-0.5">Zaif so&apos;zlaringizdan qisqa hikoya — kontekstda yodlash osonroq.</p>
        </div>
        <Button onClick={run} disabled={loading} size="md">
          <Sparkles size={16} aria-hidden="true" /> {loading ? 'Yozilmoqda...' : story ? 'Yangisi' : 'Hikoya yaratish'}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-4 text-sm text-danger flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          {error.upgrade && (
            <Link href="/narxlar" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              Tariflar
            </Link>
          )}
        </div>
      )}

      {story && (
        <article className="mt-4 border-t border-border pt-4" aria-live="polite">
          <h3 className="font-display text-base font-bold text-ink mb-2">{story.title}</h3>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {parts.map((p, i) =>
              p.hit ? (
                <mark key={i} className="bg-accent-soft text-accent rounded px-0.5 font-medium">
                  {p.text}
                </mark>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </p>
          {story.summaryUz && <p className="text-xs text-muted mt-3">{story.summaryUz}</p>}
          {story.question && (
            <p className="text-sm text-ink mt-3">
              <span className="font-semibold">Savol: </span>
              {story.question}
            </p>
          )}
          {story.missingWords?.length > 0 && <p className="text-xs text-warning mt-3">Hikoyada ishlatilmagan so&apos;zlar: {story.missingWords.join(', ')}</p>}
          <p className="text-[11px] text-muted mt-3">{story.fallback ? "AI hozir band — so'zlaringizning o'z misol gaplari ko'rsatildi." : 'AI tomonidan yaratilgan — xato bo‘lishi mumkin.'}</p>
        </article>
      )}
    </section>
  );
}
