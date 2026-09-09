'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Heart, Flame, Zap, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { dueWordsInCategory } from '@/lib/srs';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

const START_TIME_MS = 8000;
const MIN_TIME_MS = 3000;
const TIME_STEP_MS = 300; // har savoldan keyin shuncha tezlashadi (6.1.5: "tezlik oshib boradi")
const TICK_MS = 100;
const START_LIVES = 3;
const ADVANCE_DELAY_MS = 700;
const BEST_SCORE_KEY_PREFIX = 'vocably-speedquiz-best-';

// 6.1.5 — 3 ta ketma-ket to'g'ri javobdan keyin ball 2×, 6 tadan keyin 3× (kombo tizimi).
function comboMultiplier(streak) {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function readBestScore(categoryId) {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY_PREFIX + categoryId)) || 0;
  } catch {
    return 0;
  }
}

function writeBestScore(categoryId, points) {
  try {
    localStorage.setItem(BEST_SCORE_KEY_PREFIX + categoryId, String(points));
  } catch {
    // localStorage yopiq bo'lsa ham o'yin davom etadi — shaxsiy rekord shu sessiyada saqlanmaydi
  }
}

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
  const [questionStartedAt, setQuestionStartedAt] = useState(0);
  const [selected, setSelected] = useState(null);
  const [lives, setLives] = useState(START_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  // 6.1.5 kombo tizimi — har to'g'ri javob 10 ball, streak≥3 →2×, streak≥6 →3×.
  const [points, setPoints] = useState(0);
  const [bestPoints, setBestPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_TIME_MS);
  const [finished, setFinished] = useState(false);

  const advanceTimeoutRef = useRef(null);
  const timePerQuestion = Math.max(MIN_TIME_MS, START_TIME_MS - score.total * TIME_STEP_MS);

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  useEffect(() => () => clearTimeout(advanceTimeoutRef.current), []);

  const beginSession = (selectedWords) => {
    if (selectedWords.length < 4) return alert("O'yin uchun tanlangan oraliqda kamida 4 ta so'z kerak.");
    setWords(selectedWords);
    setLives(START_LIVES);
    setStreak(0);
    setBestStreak(0);
    setScore({ correct: 0, total: 0 });
    setPoints(0);
    setBestPoints(readBestScore(activeCategory._id));
    setSelected(null);
    setFinished(false);
    setQuestion(buildQuestion(selectedWords));
    setQuestionStartedAt(Date.now());
    setActive(true);
  };

  const startGame = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");
    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    beginSession(all.slice(sliceFrom, sliceTo));
  };

  const endGame = useCallback(() => {
    clearTimeout(advanceTimeoutRef.current);
    setFinished(true);
    setPoints((p) => {
      if (p > readBestScore(activeCategory._id)) writeBestScore(activeCategory._id, p);
      return p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory._id]);

  const goNextQuestion = useCallback(
    (livesNow) => {
      if (livesNow <= 0) {
        endGame();
        return;
      }
      setSelected(null);
      setQuestion(buildQuestion(words));
      setQuestionStartedAt(Date.now());
    },
    [words, endGame]
  );

  const registerAnswer = useCallback(
    (isCorrect, chosenOption) => {
      setSelected(chosenOption ?? '__timeout__');
      setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

      if (question?.target?._id && activeCategory._id) {
        const responseMs = Date.now() - questionStartedAt;
        // MUHIM (6.1.5): rating aniq berilmaydi — server ratingFromOutcome() orqali hisoblaydi,
        // u hech qachon 4 (Juda oson) qaytarmaydi (maks. 3) — "tezlik ≠ chuqur bilim" TZ qoidasi
        // shu tufayli avtomatik ta'minlanadi, alohida cheklov yozish shart emas.
        reviewWord(activeCategory._id, question.target._id, isCorrect, { responseMs, mode: 'speed' });
      }

      let livesNow = lives;
      if (isCorrect) {
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          setPoints((p) => p + 10 * comboMultiplier(next));
          return next;
        });
      } else {
        setStreak(0);
        livesNow = lives - 1;
        setLives(livesNow);
      }

      advanceTimeoutRef.current = setTimeout(() => goNextQuestion(livesNow), ADVANCE_DELAY_MS);
    },
    [question, activeCategory._id, reviewWord, lives, goNextQuestion, questionStartedAt]
  );

  const choose = (option) => {
    if (selected || !active || finished) return;
    registerAnswer(option === question.correctAnswer, option);
  };

  // Har savol uchun sanoqni boshqaradi; javob berilgach (selected o'zgarsa) yoki o'yin tugasa
  // darrov to'xtaydi — aks holda eski taymer fon rejimida ishlab, ikkinchi marta javob "yozib
  // qo'yishi" mumkin edi.
  //
  // MUHIM: avval "start = Date.now()" bitta marta yozib olinib, har tikda "timePerQuestion -
  // (Date.now() - start)" hisoblanardi. Brauzer tab fon rejimida (foydalanuvchi boshqa oyna/
  // tab'ga o'tsa) setInterval'ni cheklaydi yoki butunlay to'xtatadi — lekin Date.now() farqi
  // haqiqiy (soat bo'yicha) vaqtni ko'rsataveradi. Natijada tab qayta faollashganda "remaining"
  // darrov manfiy chiqib, bir nechta savol ketma-ket "vaqt tugadi" deb belgilanardi — foydalanuvchi
  // to'g'ri javob bergan bo'lsa ham, yuraklar bir zumda tugab qolardi (aynan xabar qilingan xato).
  // Tuzatish: fon rejimidagi vaqtni HISOBLAMASLIK — har tikda faqat OLDINGI tikdan beri o'tgan
  // vaqt qo'shiladi, va tab yashirin bo'lgan payt bu farq 0 deb olinadi.
  useEffect(() => {
    if (!active || !question || selected || finished) return;
    setTimeLeft(timePerQuestion);
    let remaining = timePerQuestion;
    let lastTick = Date.now();

    // Tab yashirin↔ko'rinadigan holatga o'tgan zahoti "lastTick"ni yangilaymiz — shunda
    // setInterval qayta faollashgach kelgan birinchi tik ham noto'g'ri katta farqni
    // hisoblamaydi (brauzer intervalni yashirin paytda "navbatga qo'yib", ko'rinadigan
    // bo'lgach bittalab bajarishi mumkin — shu holatda ham himoyalaydi).
    const resync = () => {
      lastTick = Date.now();
    };
    document.addEventListener('visibilitychange', resync);

    const interval = setInterval(() => {
      const now = Date.now();
      if (!document.hidden) remaining -= now - lastTick;
      lastTick = now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        registerAnswer(false, null);
      } else {
        setTimeLeft(remaining);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', resync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, active, selected, finished]);

  const restartGame = () => {
    setFinished(false);
    beginSession(words);
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
        maxWords={activeCategory.words?.length || 0}
        onQuickStart={() => beginSession(dueWords)}
        quickStartCount={dueWords.length}
      />
    );
  }

  if (!question) return null;

  const timePct = Math.max(0, Math.min(100, (timeLeft / timePerQuestion) * 100));
  const isNewBest = finished && points > bestPoints;

  return (
    <div className="flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title={isNewBest ? 'Yangi rekord!' : "O'yin tugadi!"}
        score={score.correct}
        total={score.total}
        onRestart={restartGame}
        onClose={closeFinished}
      >
        <div className="flex flex-col items-center gap-1.5 text-xs mb-5">
          <div className={`flex items-center gap-1.5 font-bold text-base ${isNewBest ? 'text-warning' : 'text-accent'}`}>
            <Trophy size={16} /> {points} ball {isNewBest && '🎉'}
          </div>
          <p className="text-muted">Shaxsiy rekord: {Math.max(points, bestPoints)}</p>
          <div className="flex items-center gap-1.5 text-accent font-semibold">
            <Flame size={14} /> Eng uzun ketma-ketlik: {bestStreak}
          </div>
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
          <span className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-semibold text-accent">
              <Zap size={13} /> {streak}x{comboMultiplier(streak) > 1 && ` (${comboMultiplier(streak)}× ball)`}
            </span>
            <span className="font-bold text-primary">{points}</span>
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

        <p className="text-xl font-bold text-primary font-word mb-6 text-center break-words">
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
