'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';

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
    const distractorPool = enriched.filter((x) => x !== w).flatMap((x) => x.enrichment.antonyms.concat(x.word));
    const distractors = shuffle(distractorPool).slice(0, 3);
    return { word: w, correctAnswer, options: shuffle([correctAnswer, ...distractors]) };
  });
}

export default function AntonimPage() {
  const { activeCategory, reviewWord } = useApp();
  const [questions] = useState(() => buildQuestions(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_MS);
  const [finished, setFinished] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current, finished]);

  if (questions.length === 0) return <EnrichmentEmptyState field="kamida bitta antonim" />;

  const timePct = Math.max(0, Math.min(100, (timeLeft / TIME_MS) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title="Jang tugadi!"
        score={score}
        total={questions.length}
        onClose={() => setFinished(false)}
        onRestart={() => {
          setIdx(0);
          setSelected(null);
          setScore(0);
          setFinished(false);
        }}
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
        <p className="text-[10px] text-muted text-center uppercase tracking-wide mb-1">Qarama-qarshisini toping</p>
        <p className="text-xl font-bold text-ink font-word mb-6 text-center break-words">{current.word.word}</p>
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const isCorrectOpt = opt === current.correctAnswer;
            const isSelected = selected === opt;
            let style = 'border-border hover:border-accent/30';
            if (selected) {
              if (isCorrectOpt) style = 'border-green-300 bg-green-50 text-green-700';
              else if (isSelected) style = 'border-red-300 bg-accent-soft text-red-700';
            }
            return (
              <button
                key={i}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`w-full text-left px-4 py-2.5 border rounded-lg text-sm transition-colors ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
