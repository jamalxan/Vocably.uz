'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';
import { categoryKey, optionStateClass, OPTION_BUTTON_CLASS } from '@/lib/lugatQuiz';

const TIME_MS = 5000;
const TICK_MS = 100;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// V8 "Antonim jangi" (VOCABLY-TZ.md 6.2) — so'z beriladi, qarama-qarshisini 5 soniyada
// topish. Semantik tarmoqni mustahkamlaydi.
function buildQuestions(words) {
  const enriched = words.filter((w) => w.enrichment?.antonyms?.[0]);
  return shuffle(enriched).map((w) => {
    const correctAnswer = w.enrichment.antonyms[0];
    // Takrorlar, to'g'ri javob va savol so'zining o'zi variantlarga tushmasin.
    const distractorPool = [
      ...new Set(enriched.filter((x) => x !== w).flatMap((x) => x.enrichment.antonyms.concat(x.word))),
    ].filter((d) => d !== correctAnswer && d !== w.word);
    const distractors = shuffle(distractorPool).slice(0, 3);
    return { word: w, correctAnswer, options: shuffle([correctAnswer, ...distractors]) };
  });
}

export default function AntonimPage() {
  const { activeCategory, activeCatIndex } = useApp();
  // Kategoriya almashganda savollar yangi kategoriyadan qayta quriladi.
  return <AntonimQuiz key={categoryKey(activeCatIndex, activeCategory)} />;
}

function AntonimQuiz() {
  const { activeCategory, reviewWord } = useApp();
  const [questions] = useState(() => buildQuestions(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_MS);
  const [finished, setFinished] = useState(false);
  const [resultClosed, setResultClosed] = useState(false);
  const advanceRef = useRef(null);

  const current = questions[idx];

  const choose = useCallback(
    (opt) => {
      if (selected || !current) return;
      setSelected(opt ?? '__timeout__');
      const isCorrect = opt === current.correctAnswer;
      if (isCorrect) setScore((s) => s + 1);
      if (current.word._id && activeCategory._id) {
        reviewWord(activeCategory._id, current.word._id, isCorrect, { mode: 'quiz' });
      }
      clearTimeout(advanceRef.current);
      advanceRef.current = setTimeout(() => {
        setIdx((i) => {
          if (i + 1 >= questions.length) {
            setFinished(true);
            return i;
          }
          setSelected(null);
          return i + 1;
        });
      }, 600);
    },
    [selected, current, activeCategory._id, reviewWord, questions.length]
  );

  useEffect(() => () => clearTimeout(advanceRef.current), []);

  useEffect(() => {
    if (!current || selected || finished) return undefined;
    setTimeLeft(TIME_MS);
    const start = Date.now();
    const interval = setInterval(() => {
      const remaining = TIME_MS - (Date.now() - start);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        choose(null);
      } else {
        setTimeLeft(remaining);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
    // `selected` ham kuzatiladi — javob berilgach taymer to'xtaydi (eski choose(null) chaqirilmasin).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current, finished, selected]);

  if (questions.length === 0) return <EnrichmentEmptyState field="kamida bitta antonim" />;

  const timePct = Math.max(0, Math.min(100, (timeLeft / TIME_MS) * 100));

  const restart = () => {
    clearTimeout(advanceRef.current);
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setResultClosed(false);
  };

  return (
    <div className="flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title="Jang tugadi!"
        score={score}
        total={questions.length}
        onClose={() => {
          setFinished(false);
          setResultClosed(true);
        }}
        onRestart={restart}
      />
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-3">
          <span>{idx + 1} / {questions.length}</span>
          <span>To'g'ri: {score}</span>
        </div>
        <div className="h-1.5 bg-bg rounded-full overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${timePct}%` }}
          />
        </div>
        <p className="text-[11px] sm:text-xs text-muted text-center uppercase tracking-wide mb-1">Qarama-qarshisini toping</p>
        <p className="text-xl font-bold text-ink font-word mb-6 text-center break-words">{current.word.word}</p>
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const isCorrectOpt = opt === current.correctAnswer;
            const isSelected = selected === opt;
            const style = optionStateClass(!!selected, isCorrectOpt, isSelected);
            return (
              <button
                key={i}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`${OPTION_BUTTON_CLASS} ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {resultClosed && (
          <button
            type="button"
            autoFocus
            onClick={restart}
            className="w-full mt-4 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Qayta boshlash
          </button>
        )}
      </div>
    </div>
  );
}
