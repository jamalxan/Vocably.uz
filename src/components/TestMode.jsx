'use client';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

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

export default function TestMode() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const nextQuestion = useCallback(() => {
    if (words.length < 4) {
      setQuestion(null);
      return;
    }
    setQuestion(buildQuestion(words));
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  const startTest = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selectedWords = all.slice(sliceFrom, sliceTo);
    if (selectedWords.length < 4) return alert("Test uchun tanlangan oraliqda kamida 4 ta so'z kerak.");

    setWords(selectedWords);
    setQuestion(buildQuestion(selectedWords));
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setActive(true);
  };

  const choose = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    if (question.target._id && activeCategory._id) {
      reviewWord(activeCategory._id, question.target._id, isCorrect);
    }
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center">
        <form
          onSubmit={startTest}
          className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 mb-4 font-display">Test oraliqlari</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 w-12">Dan:</span>
              <input
                type="number"
                min={1}
                value={range.from}
                onChange={(e) => setRange({ ...range, from: parseInt(e.target.value) || 1 })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 w-12">Gacha:</span>
              <input
                type="number"
                min={1}
                value={range.to}
                onChange={(e) => setRange({ ...range, to: parseInt(e.target.value) || 1 })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Boshlash
          </button>
        </form>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
          <span>Savol {score.total + 1}</span>
          <span>
            To'g'ri: {score.correct}/{score.total}
          </span>
          <button onClick={() => setActive(false)} className="text-indigo-500 hover:text-indigo-700 font-semibold">
            Oraliqni o'zgartirish
          </button>
        </div>
        <p className="text-xl font-bold text-slate-800 font-display mb-6 text-center break-words">
          {question.target.word}
        </p>
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const isCorrectOpt = opt === question.correctAnswer;
            const isSelected = selected === opt;
            let style = 'border-slate-200 hover:border-indigo-300';
            if (selected) {
              if (isCorrectOpt) style = 'border-green-300 bg-green-50 text-green-700';
              else if (isSelected) style = 'border-red-300 bg-red-50 text-red-700';
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
        {selected && (
          // autoFocus — javob tanlangach Enter darrov keyingi savolga o'tkazadi
          <button
            autoFocus
            onClick={nextQuestion}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Keyingi savol →
          </button>
        )}
      </div>
    </div>
  );
}
