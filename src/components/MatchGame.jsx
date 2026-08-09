'use client';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import RangeSetupForm from './shared/RangeSetupForm';

export default function MatchGame() {
  const { activeCategory, activeCatIndex, categories, matchGameNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [rangeWords, setRangeWords] = useState([]);
  const [matchPairs, setMatchPairs] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);

  // "Juftlikni topish" nav tugmasi bosilganda (Sidebar orqali) oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchGameNonce, activeCatIndex]);

  const initMatchGame = useCallback(
    (words) => {
      if (words.length < 4) {
        setMatchPairs([]);
        return;
      }
      const count = Math.min(6, words.length);
      const chosen = [...words].sort(() => Math.random() - 0.5).slice(0, count);
      const cardList = [];
      chosen.forEach((w, i) => {
        cardList.push({ id: `w-${i}`, text: w.word, type: 'word', matchId: i });
        cardList.push({ id: `s-${i}`, text: w.syns[0], type: 'syn', matchId: i });
      });
      setMatchPairs(cardList.sort(() => Math.random() - 0.5));
      setSelectedCards([]);
      setMatchedIds([]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories]
  );

  const startMatchGame = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selected = all.slice(sliceFrom, sliceTo);
    if (selected.length < 4) return alert("Bu o'yin uchun tanlangan oraliqda kamida 4 ta so'z kerak.");

    setRangeWords(selected);
    initMatchGame(selected);
    setActive(true);
  };

  const handleMatchCardClick = (card) => {
    if (selectedCards.length === 2 || matchedIds.includes(card.matchId)) return;
    const currentSelected = [...selectedCards, card];
    setSelectedCards(currentSelected);

    if (currentSelected.length === 2) {
      const [first, second] = currentSelected;
      if (first.matchId === second.matchId && first.type !== second.type) {
        setMatchedIds((prev) => [...prev, first.matchId]);
        setSelectedCards([]);
      } else {
        setTimeout(() => setSelectedCards([]), 800);
      }
    }
  };

  if (!active) {
    return (
      <RangeSetupForm
        title="Juftlikni topish oraliqlari"
        range={range}
        onRangeChange={setRange}
        onSubmit={startMatchGame}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      {matchPairs.length === 0 ? (
        <p className="text-sm text-slate-400">Bu o'yin uchun kamida 4 ta so'z kerak.</p>
      ) : (
        <>
          <div className="flex justify-between items-center text-xs text-slate-400 w-full max-w-md mb-2.5">
            <span />
            <button onClick={() => setActive(false)} className="text-indigo-500 hover:text-indigo-700 font-semibold">
              Oraliqni o'zgartirish
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-md">
            {matchPairs.map((card) => {
              const isSelected = selectedCards.some((c) => c.id === card.id);
              const isMatched = matchedIds.includes(card.matchId);
              return (
                <div
                  key={card.id}
                  onClick={() => handleMatchCardClick(card)}
                  className={`h-20 sm:h-24 rounded-xl border flex items-center justify-center p-2.5 sm:p-3 text-center text-xs font-semibold cursor-pointer transition-all select-none ${
                    isMatched
                      ? 'border-green-100 bg-green-50 text-green-600 opacity-60 pointer-events-none'
                      : isSelected
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {card.text}
                </div>
              );
            })}
          </div>

          {matchPairs.length > 0 && matchedIds.length === matchPairs.length / 2 && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-bold text-sm mb-2">Barcha juftliklar topildi!</p>
              <button
                onClick={() => initMatchGame(rangeWords)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Yana o'ynash
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
