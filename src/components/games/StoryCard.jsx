'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookText, Sparkles } from 'lucide-react';
import Button, { buttonClasses } from '@/components/ui/Button';
import { useT } from '@/context/LocaleContext';
import { splitByWords } from '@/lib/vocab/highlight';
import { generateStory } from './api';

// AI mini hikoya (TZ §27.3): o'rganilayotgan (avvalo zaif) so'zlardan qisqa matn — so'zlar kontekstda yodlanadi.
// Premium; backend kvota va limitni o'zi tekshiradi, bu yerda faqat sababini ko'rsatamiz (server xabari — o'zbekcha).
export default function StoryCard() {
  const { t } = useT();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { message, upgrade }

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setStory(await generateStory());
    } catch (e) {
      setError({ message: e.message || t('story.error'), upgrade: e.status === 403 });
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
            {t('story.title')}
          </h2>
          <p className="text-xs text-muted mt-0.5">{t('story.intro')}</p>
        </div>
        <Button onClick={run} disabled={loading} size="md">
          <Sparkles size={16} aria-hidden="true" /> {loading ? t('story.writing') : story ? t('story.another') : t('story.create')}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-4 text-sm text-danger flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          {error.upgrade && (
            <Link href="/narxlar" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              {t('story.plans')}
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
              <span className="font-semibold">{t('story.question')}</span>
              {story.question}
            </p>
          )}
          {story.missingWords?.length > 0 && <p className="text-xs text-warning mt-3">{t('story.missing', { words: story.missingWords.join(', ') })}</p>}
          <p className="text-[11px] text-muted mt-3">{story.fallback ? t('story.fallback') : t('story.aiNote')}</p>
        </article>
      )}
    </section>
  );
}
