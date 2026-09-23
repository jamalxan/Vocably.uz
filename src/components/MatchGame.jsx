'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import { dueWordsInCategory } from '@/lib/srs';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

// 6.1.4 (VOCABLY-TZ.md) — 5 xil juftlik turi. Har so'z uchun mavjud enrichment
// ma'lumotiga qarab tasodifiy tanlanadi (bo'lmasa — tarjima yoki audio, ikkalasi ham
// har doim mavjud). Aralash turlar bitta seansda birga chiqishi mumkin — bu qasddan,
// har xillik uchun.
function pickPairType(w) {
  const available = ['translation', 'audio'];
  if (w.enrichment?.definitionEn) available.push('definition');
  if (w.enrichment?.collocations?.[0]) available.push('collocation');
  if (w.enrichment?.antonyms?.[0]) available.push('antonym');
  return available[Math.floor(Math.random() * available.length)];
}

function partnerText(w, type) {
  if (type === 'definition') return w.enrichment.definitionEn;
  if (type === 'collocation') return w.enrichment.collocations[0];
  if (type === 'antonym') return w.enrichment.antonyms[0];
  return w.syns[0]; // translation
}

export default function MatchGame() {
  const { activeCategory, activeCatIndex, categories, matchGameNonce, reviewWord } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [rangeWords, setRangeWords] = useState([]);
  const [matchPairs, setMatchPairs] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [rounds, setRounds] = useState(0);
  const [complete, setComplete] = useState(false);
  const [setupError, setSetupError] = useState('');

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

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
        const type = pickPairType(w);
        cardList.push({ id: `w-${i}`, text: w.word, kind: 'word', matchId: i, wordId: w._id });
        if (type === 'audio') {
          cardList.push({ id: `a-${i}`, kind: 'audio', matchId: i, audioText: w.word });
        } else {
          cardList.push({ id: `s-${i}`, text: partnerText(w, type), kind: 'partner', matchId: i });
        }
      });
      setMatchPairs(cardList.sort(() => Math.random() - 0.5));
      setSelectedCards([]);
      setMatchedIds([]);
      setRounds((n) => n + 1);
      setComplete(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories]
  );

  const startMatchGame = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return setSetupError("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selected = all.slice(sliceFrom, sliceTo);
    if (selected.length < 4) return setSetupError("Bu o'yin uchun tanlangan oraliqda kamida 4 ta so'z kerak.");

    setSetupError('');
    setRangeWords(selected);
    initMatchGame(selected);
    setActive(true);
  };

  const startDueQueue = () => {
    if (dueWords.length < 4) return setSetupError("Bugungi navbatda kamida 4 ta so'z kerak.");
    setSetupError('');
    setRangeWords(dueWords);
    initMatchGame(dueWords);
    setActive(true);
  };

  const handleMatchCardClick = (card) => {
    if (card.kind === 'audio') speakText(card.audioText);
    // Bir kartani ikki marta bosish xato juftlik hisoblanmasin.
    if (selectedCards.length === 2 || matchedIds.includes(card.matchId) || selectedCards.some((c) => c.id === card.id)) {
      return;
    }
    const currentSelected = [...selectedCards, card];
    setSelectedCards(currentSelected);

    if (currentSelected.length === 2) {
      const [first, second] = currentSelected;
      if (first.matchId === second.matchId && first.kind !== second.kind) {
        setMatchedIds((prev) => {
          const next = [...prev, first.matchId];
          if (next.length === matchPairs.length / 2) setComplete(true);
          return next;
        });
        const wordCard = first.kind === 'word' ? first : second;
        if (wordCard.wordId && activeCategory._id) {
          reviewWord(activeCategory._id, wordCard.wordId, true, { rating: 3, mode: 'matching' });
        }
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
        onRangeChange={(r) => {
          setRange(r);
          setSetupError('');
        }}
        onSubmit={startMatchGame}
        error={setupError}
        maxWords={activeCategory.words?.length || 0}
        onQuickStart={startDueQueue}
        quickStartCount={dueWords.length}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      {matchPairs.length === 0 ? (
        <p className="text-sm text-muted">Bu o'yin uchun kamida 4 ta so'z kerak.</p>
      ) : (
        <>
          <div className="flex justify-between items-center text-xs text-muted w-full max-w-md mb-2.5">
            <span>
              {matchedIds.length} / {matchPairs.length / 2} juftlik
            </span>
            <button
              onClick={() => setActive(false)}
              className="inline-flex items-center min-h-11 -my-3.5 md:min-h-0 md:my-0 text-accent hover:text-accent-hover font-semibold"
            >
              Oraliqni o'zgartirish
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-md">
            {matchPairs.map((card) => {
              const isSelected = selectedCards.some((c) => c.id === card.id);
              const isMatched = matchedIds.includes(card.matchId);
              return (
                <button
                  type="button"
                  key={card.id}
                  onClick={() => handleMatchCardClick(card)}
                  disabled={isMatched}
                  aria-pressed={isSelected}
                  aria-label={card.kind === 'audio' ? 'Talaffuzni eshitish' : undefined}
                  className={`min-h-20 sm:min-h-24 min-w-0 rounded-xl border flex items-center justify-center p-2.5 sm:p-3 text-center text-xs font-semibold cursor-pointer transition-all motion-reduce:transition-none select-none [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isMatched
                      ? 'border-success/20 bg-success-soft text-success opacity-60 pointer-events-none'
                      : isSelected
                      ? 'border-accent bg-accent-soft text-accent ring-2 ring-accent/20'
                      : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-3 text-ink'
                  }`}
                >
                  {card.kind === 'audio' ? <Volume2 size={22} aria-hidden="true" /> : card.text}
                </button>
              );
            })}
          </div>

          <SessionCompleteCard
            key={rounds}
            open={complete}
            title="Barcha juftliklar topildi!"
            score={matchPairs.length / 2}
            total={matchPairs.length / 2}
            onClose={() => setActive(false)}
            onRestart={() => initMatchGame(rangeWords)}
          />
        </>
      )}
    </div>
  );
}
