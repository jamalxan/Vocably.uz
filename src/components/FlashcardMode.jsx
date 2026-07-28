'use client';
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';

export default function FlashcardMode() {
  const { activeCategory, activeCatIndex, categories } = useApp();
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Kategoriya almashganda kartochkani boshidan boshlaymiz.
  useEffect(() => {
    setCardIndex(0);
    setShowAnswer(false);
  }, [activeCatIndex]);

  // So'zlar soni o'zgarganda (masalan o'chirilganda) kartochka indexini to'g'irlash.
  useEffect(() => {
    const len = activeCategory.words?.length || 0;
    if (cardIndex >= len) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, activeCatIndex]);

  return (
    <div className="flex flex-col items-center">
      {activeCategory.words?.length > 0 ? (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>
              {cardIndex + 1} / {activeCategory.words.length}
            </span>
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full h-64 sm:h-72 bg-white rounded-2xl shadow-premium border border-slate-100 flex flex-col justify-center items-center p-6 sm:p-8 cursor-pointer relative select-none transition-transform hover:scale-[1.01]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(activeCategory.words[cardIndex]?.word);
              }}
              className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
              title="Talaffuzni eshitish"
            >
              <Volume2 size={16} />
            </button>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display text-center break-words">
              {activeCategory.words[cardIndex]?.word}
            </p>

            {showAnswer ? (
              <p className="text-lg sm:text-xl font-medium text-indigo-600 mt-6 text-center">
                {activeCategory.words[cardIndex]?.syns.join(', ')}
              </p>
            ) : (
              <p className="text-xs text-slate-300 mt-6 uppercase tracking-wider font-semibold">
                Ko'rish uchun bosing
              </p>
            )}
          </div>

          <div className="flex gap-3 sm:gap-4 mt-6 w-full">
            <button
              onClick={() => {
                setCardIndex((cardIndex - 1 + activeCategory.words.length) % activeCategory.words.length);
                setShowAnswer(false);
              }}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Oldingi
            </button>
            <button
              onClick={() => {
                setCardIndex((cardIndex + 1) % activeCategory.words.length);
                setShowAnswer(false);
              }}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Keyingi
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Bu kategoriyada so'zlar yo'q. Jadval bo'limidan qo'shing.</p>
      )}
    </div>
  );
}
