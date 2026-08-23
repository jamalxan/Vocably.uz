'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Flame, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

const TIME_PER_QUESTION_MS = 8000;
const TICK_MS = 100;
const START_LIVES = 3;
const ADVANCE_DELAY_MS = 700;

function buildQuestion(words) {
  const idx = Math.floor(Math.random() * words.length);
  const target = words[idx];
  const correctAnswer = target.syns[0];
  const distractorPool = words
    .filter((_, i) => i !== idx)
    .map((w) => w.syns[0])
    .filter(Boolean);
  const distractors = [...distractorPool].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
  return { target, correctAnswer, options };
}

// "Tezkor o'yin" — TestMode bilan bir xil savol shakliga asoslanadi, lekin har savolga vaqt
// chegarasi, jonlar (lives) va ketma-ketlik (streak) bilan arkada o'yin hissi beradi.
export default function SpeedQuiz() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lives, setLives] = useState(START_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION_MS);
  const [finished, setFinished] = useState(false);

  const advanceTimeoutRef = useRef(null);

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  useEffect(() => () => clearTimeout(advanceTimeoutRef.current), []);

  const startGame = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selectedWords = all.slice(sliceFrom, sliceTo);
    if (selectedWords.length < 4) return alert("O'yin uchun tanlangan oraliqda kamida 4 ta so'z kerak.");

    setWords(selectedWords);
    setLives(START_LIVES);
    setStreak(0);
    setBestStreak(0);
    setScore({ correct: 0, total: 0 });
    setSelected(null);
    setFinished(false);
    setQuestion(buildQuestion(selectedWords));
    setActive(true);
  };

  const endGame = useCallback(() => {
    clearTimeout(advanceTimeoutRef.current);
    setFinished(true);
  }, []);

  const goNextQuestion = useCallback(
    (livesNow) => {
      if (livesNow <= 0) {
        endGame();
        return;
      }
      setSelected(null);
      setQuestion(buildQuestion(words));
    },
    [words, endGame]
  );

  const registerAnswer = useCallback(
    (isCorrect, chosenOption) => {
      setSelected(chosenOption ?? '__timeout__');
      setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

      if (question?.target?._id && activeCategory._id) {
        reviewWord(activeCategory._id, question.target._id, isCorrect);
      }

      let livesNow = lives;
      if (isCorrect) {
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
        livesNow = lives - 1;
        setLives(livesNow);
      }

      advanceTimeoutRef.current = setTimeout(() => goNextQuestion(livesNow), ADVANCE_DELAY_MS);
    },
    [question, activeCategory._id, reviewWord, lives, goNextQuestion]
  );

  const choose = (option) => {
    if (selected || !active || finished) return;
    registerAnswer(option === question.correctAnswer, option);
  };

  // Har savol uchun sanoqni boshqaradi; javob berilgach (selected o'zgarsa) yoki o'yin tugasa
  // darrov to'xtaydi — aks holda eski taymer fon rejimida ishlab, ikkinchi marta javob "yozib
  // qo'yishi" mumkin edi.
  useEffect(() => {
    if (!active || !question || selected || finished) return;
    setTimeLeft(TIME_PER_QUESTION_MS);
    const start = Date.now();
    const interval = setInterval(() => {
      const remaining = TIME_PER_QUESTION_MS - (Date.now() - start);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        registerAnswer(false, null);
      } else {
        setTimeLeft(remaining);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, active, selected, finished]);

  const restartGame = () => {
    setFinished(false);
    startGame();
  };

  const closeFinished = () => {
    setFinished(false);
    setActive(false);
  };

  if (!active) {
    return (
      <RangeSetupForm
        title="Tezkor o'yin oraliqlari"
        range={range}
        onRangeChange={setRange}
        onSubmit={startGame}
        buttonLabel="O'yinni boshlash"
      />
    );
  }

  if (!question) return null;

  const timePct = Math.max(0, Math.min(100, (timeLeft / TIME_PER_QUESTION_MS) * 100));

  return (
    <div className="flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title="O'yin tugadi!"
        score={score.correct}
        total={score.total}
        onRestart={restartGame}
        onClose={closeFinished}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs text-accent font-semibold mb-5">
          <Flame size={14} /> Eng uzun ketma-ketlik: {bestStreak}
        </div>
      </SessionCompleteCard>

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-3">
          <div className="flex items-center gap-1" aria-label={`${lives} ta jon qoldi`}>
            {Array.from({ length: START_LIVES }).map((_, i) => (
              <Heart
                key={i}
                size={14}
                className={i < lives ? 'text-accent fill-red-500' : 'text-on-primary fill-slate-200'}
              />
            ))}
          </div>
          <span className="flex items-center gap-1 font-semibold text-accent">
            <Zap size={13} /> {streak}x
          </span>
          <button onClick={() => setActive(false)} className="text-accent hover:text-accent-hover font-semibold">
            Oraliqni o'zgartirish
          </button>
        </div>

        <div className="h-1.5 bg-bg rounded-full overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
              timePct > 40 ? 'bg-accent' : timePct > 15 ? 'bg-accent-soft0' : 'bg-accent-soft0'
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        <p className="text-xl font-bold text-primary font-display mb-6 text-center break-words">
          {question.target.word}
        </p>

        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isCorrectOpt = opt === question.correctAnswer;
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
