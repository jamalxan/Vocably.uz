'use client';
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import RangeSetupForm from './shared/RangeSetupForm';

export default function FlashcardMode() {
  const { activeCategory, activeCatIndex, categories, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  // So'zlar soni o'zgarganda (masalan o'chirilganda) kartochka indexini to'g'irlash.
  useEffect(() => {
    const len = words.length;
    if (cardIndex >= len) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const startFlashcards = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selected = all.slice(sliceFrom, sliceTo);
    if (selected.length === 0) return alert("Oraliq noto'g'ri");

    setWords(selected);
    setCardIndex(0);
    setShowAnswer(false);
    setActive(true);
  };

  if (!active) {
    return (
      <RangeSetupForm
        title="Kartochka oraliqlari"
        range={range}
        onRangeChange={setRange}
        onSubmit={startFlashcards}
        maxWords={activeCategory.words?.length || 0}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      {words.length > 0 ? (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center text-xs text-muted mb-2">
            <span>
              {cardIndex + 1} / {words.length}
            </span>
            <button onClick={() => setActive(false)} className="text-accent hover:text-accent-hover font-semibold">
              Oraliqni o'zgartirish
            </button>
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full h-64 sm:h-72 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8 cursor-pointer relative select-none transition-transform hover:scale-[1.01]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(words[cardIndex]?.word);
              }}
              className="absolute top-4 right-4 p-2 bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors"
              title="Talaffuzni eshitish"
            >
              <Volume2 size={16} />
            </button>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-display text-center break-words">
              {words[cardIndex]?.word}
            </p>
            {words[cardIndex]?.pronunciation && (
              <p className="text-sm text-muted italic mt-1">{words[cardIndex].pronunciation}</p>
            )}

            {showAnswer ? (
              <p className="text-lg sm:text-xl font-medium text-accent mt-6 text-center">
                {words[cardIndex]?.syns.join(', ')}
              </p>
            ) : (
              <p className="text-xs text-muted mt-6 font-semibold">
                Ko'rish uchun bosing
              </p>
            )}
          </div>

          <div className="flex gap-3 sm:gap-4 mt-6 w-full">
            <button
              onClick={() => {
                setCardIndex((cardIndex - 1 + words.length) % words.length);
                setShowAnswer(false);
              }}
              className="flex-1 py-3 bg-surface border border-border text-muted rounded-xl font-medium text-sm hover:bg-bg transition-colors"
            >
              Oldingi
            </button>
            <button
              onClick={() => {
                setCardIndex((cardIndex + 1) % words.length);
                setShowAnswer(false);
              }}
              className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Keyingi
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Bu kategoriyada so'zlar yo'q. Jadval bo'limidan qo'shing.</p>
      )}
    </div>
  );
}
