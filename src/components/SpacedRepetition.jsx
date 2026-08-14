'use client';
import { useState, useMemo } from 'react';
import { Volume2, Flame, Trophy, CalendarCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';

export default function SpacedRepetition() {
  const { categories, reviewWord, reviewStreak } = useApp();
  const [showAnswer, setShowAnswer] = useState(false);
  // A5/A13 (docs/AUDIT_FINDINGS.md): "Navbatda: N" bilan sarlavhadagi "Jami so'zlar" ziddiyatli
  // ko'rinardi. reviewedCount + qolgan dueWords.length'dan "X / Total" sessiya progressi
  // hisoblanadi — FlashcardMode/ListeningMode'dagi progress bilan bir xil uslub.
  const [reviewedCount, setReviewedCount] = useState(0);

  const dueWords = useMemo(() => {
    const now = Date.now();
    const list = [];
    categories.forEach((c) => {
      (c.words || []).forEach((w) => {
        const next = w.stats?.nextReview ? new Date(w.stats.nextReview).getTime() : 0;
        if (next <= now) list.push({ categoryId: c._id, categoryName: c.name, word: w });
      });
    });
    return list;
  }, [categories]);

  const masteredCount = useMemo(
    () => categories.reduce((sum, c) => sum + (c.words || []).filter((w) => (w.stats?.level || 0) >= 5).length, 0),
    [categories]
  );

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return categories.reduce(
      (sum, c) =>
        sum +
        (c.words || []).filter((w) => w.stats?.lastReviewed && String(w.stats.lastReviewed).slice(0, 10) === today)
          .length,
      0
    );
  }, [categories]);

  const current = dueWords[0];

  const answer = (correct) => {
    if (!current) return;
    reviewWord(current.categoryId, current.word._id, correct);
    setReviewedCount((n) => n + 1);
    setShowAnswer(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-white border border-slate-100 rounded-xl py-3 shadow-sm">
          <CalendarCheck className="mx-auto text-indigo-500 mb-1" size={16} />
          <p className="text-lg font-bold text-slate-800">{todayCount}</p>
          <p className="text-[10px] text-slate-400">Bugun ko'rildi</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl py-3 shadow-sm">
          <Flame className="mx-auto text-orange-500 mb-1" size={16} />
          <p className="text-lg font-bold text-slate-800">{reviewStreak}</p>
          <p className="text-[10px] text-slate-400">Kunlik ketma-ket</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl py-3 shadow-sm">
          <Trophy className="mx-auto text-amber-500 mb-1" size={16} />
          <p className="text-lg font-bold text-slate-800">{masteredCount}</p>
          <p className="text-[10px] text-slate-400">O'zlashtirilgan</p>
        </div>
      </div>

      {!current ? (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-slate-500">Bugungi takrorlash uchun so'z qolmadi!</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>{current.categoryName}</span>
            <span>
              {reviewedCount + 1} / {reviewedCount + dueWords.length}
            </span>
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full h-64 sm:h-72 bg-white rounded-2xl shadow-premium border border-slate-100 flex flex-col justify-center items-center p-6 sm:p-8 cursor-pointer relative select-none transition-transform hover:scale-[1.01]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(current.word.word);
              }}
              className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
              title="Talaffuzni eshitish"
            >
              <Volume2 size={16} />
            </button>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display text-center break-words">
              {current.word.word}
            </p>
            {showAnswer ? (
              <p className="text-lg sm:text-xl font-medium text-indigo-600 mt-6 text-center">
                {current.word.syns.join(', ')}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-6 font-semibold">Ko'rish uchun bosing</p>
            )}
          </div>

          {showAnswer && (
            <div className="flex gap-3 sm:gap-4 mt-6 w-full">
              <button
                onClick={() => answer(false)}
                className="flex-1 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                ❌ Bilmadim
              </button>
              <button
                onClick={() => answer(true)}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                ✅ Bildim
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
