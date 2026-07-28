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
  const { activeCategory, activeCatIndex, reviewWord } = useApp();
  const words = activeCategory.words || [];

  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const nextQuestion = useCallback(() => {
    if (words.length < 4) {
      setQuestion(null);
      return;
    }
    setQuestion(buildQuestion(words));
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  useEffect(() => {
    nextQuestion();
    setScore({ correct: 0, total: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatIndex]);

  const choose = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    if (question.target._id && activeCategory._id) {
      reviewWord(activeCategory._id, question.target._id, isCorrect);
    }
  };

  if (words.length < 4) {
    return <p className="text-sm text-slate-400 text-center">Test uchun kamida 4 ta so'z kerak.</p>;
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
          <button
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
