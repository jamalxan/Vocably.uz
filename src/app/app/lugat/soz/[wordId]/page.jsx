'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

// So'z sahifasi ("deep dive") — VOCABLY-TZ.md §3.1 IA'dagi /lugat/soz/[id]. So'z
// alohida so'rov bilan emas, allaqachon yuklangan `categories`dan (AppContext)
// topiladi — dashboard ochilganda bir marta yuklanadi, shuning uchun bu yerda
// qo'shimcha so'rov shart emas.
export default function SozPage() {
  const { wordId } = useParams();
  const router = useRouter();
  const { categories, enrichWord } = useApp();
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState('');

  const found = useMemo(() => {
    for (const c of categories) {
      const w = (c.words || []).find((x) => x._id === wordId);
      if (w) return { category: c, word: w };
    }
    return null;
  }, [categories, wordId]);

  const handleEnrich = async () => {
    if (!found) return;
    setEnriching(true);
    setError('');
    const res = await enrichWord(found.category._id, found.word._id);
    if (res.error) setError(res.error);
    setEnriching(false);
  };

  if (!found) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-muted mb-4">So'z topilmadi.</p>
        <Button variant="secondary" onClick={() => router.push('/app/lugat/jadval')}>
          Jadvalga qaytish
        </Button>
      </div>
    );
  }

  const { word, category } = found;
  const e = word.enrichment || {};
  const hasEnrichment = !!e.aiEnrichedAt;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <IconButton icon={ArrowLeft} label="Orqaga" variant="ghost" onClick={() => router.back()} />
        <span className="text-xs text-muted">{category.name}</span>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-card p-6 sm:p-8 mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink font-word">{word.word}</h1>
            {word.pronunciation && <p className="text-sm text-muted italic mt-1">{word.pronunciation}</p>}
          </div>
          <IconButton icon={Volume2} label="Talaffuzni eshitish" variant="accent" onClick={() => speakText(word.word)} />
        </div>

        {(e.pos || e.cefr || e.register) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {e.pos && <Badge tone="neutral">{e.pos}</Badge>}
            {e.cefr && <Badge tone="accent">{e.cefr}</Badge>}
            {e.register && <Badge tone="info">{e.register}</Badge>}
          </div>
        )}

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Tarjima</p>
          <p className="text-base text-ink">{word.syns.join(', ')}</p>
        </div>

        {e.definitionEn && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Ta'rif</p>
            <p className="text-sm text-ink">{e.definitionEn}</p>
            {e.definitionUz && <p className="text-sm text-muted mt-1">{e.definitionUz}</p>}
          </div>
        )}

        {e.examples?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Misollar</p>
            <div className="space-y-2">
              {e.examples.map((ex, i) => (
                <div key={i} className="bg-bg rounded-lg p-3 text-sm">
                  <p className="text-ink">{ex.en}</p>
                  <p className="text-muted mt-0.5">{ex.uz}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {e.collocations?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Kollokatsiya</p>
            <div className="flex flex-wrap gap-1.5">
              {e.collocations.map((c, i) => (
                <Badge key={i} tone="neutral">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {e.wordFamily?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">So'z oilasi</p>
            <p className="text-sm text-ink">{e.wordFamily.map((f) => `${f.form} (${f.pos})`).join(' · ')}</p>
          </div>
        )}

        {(e.synonymsEn?.length > 0 || e.antonyms?.length > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {e.synonymsEn?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Sinonimlar</p>
                <p className="text-sm text-ink">{e.synonymsEn.join(', ')}</p>
              </div>
            )}
            {e.antonyms?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Antonimlar</p>
                <p className="text-sm text-ink">{e.antonyms.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {e.mnemonicUz && (
          <div className="mt-4 bg-accent-soft rounded-lg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent mb-1">Mnemonika</p>
            <p className="text-sm text-ink">{e.mnemonicUz}</p>
          </div>
        )}

        {e.commonMistakes?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5">Ko'p uchraydigan xatolar</p>
            <ul className="text-sm text-ink list-disc list-inside space-y-0.5">
              {e.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger font-medium mb-3">{error}</p>}

      <Button onClick={handleEnrich} disabled={enriching} className="w-full">
        {enriching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {enriching ? 'Boyitilmoqda...' : hasEnrichment ? 'Qayta boyitish (AI)' : "AI bilan boyitish"}
      </Button>
    </div>
  );
}
