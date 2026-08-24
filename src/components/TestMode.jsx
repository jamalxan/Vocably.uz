'use client';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import RangeSetupForm from './shared/RangeSetupForm';

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
  // score.total darhol javob berilganda oshadi (natija hisoblash uchun), lekin ekrandagi
  // "Savol N" sarlavhasi hali joriy savol ko'rinib turgan payt oldinga chopib ketmasligi
  // kerak — shuning uchun alohida hisoblagich, faqat "Keyingi savol" bosilganda oshadi.
  const [questionIndex, setQuestionIndex] = useState(1);

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
    setQuestionIndex((n) => n + 1);
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
    setQuestionIndex(1);
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
      <RangeSetupForm
        title="Test oraliqlari"
        range={range}
        onRangeChange={setRange}
        onSubmit={startTest}
        maxWords={activeCategory.words?.length || 0}
      />
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>Savol {questionIndex}</span>
          <span>
            To'g'ri: {score.correct}/{score.total}
          </span>
          <button onClick={() => setActive(false)} className="text-accent hover:text-accent-hover font-semibold">
            Oraliqni o'zgartirish
          </button>
        </div>
        <p className="text-xl font-bold text-primary font-word mb-6 text-center break-words">
          {question.target.word}
        </p>
        <div className="space-y-2 mb-4">
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
        {selected && (
          // autoFocus — javob tanlangach Enter darrov keyingi savolga o'tkazadi
          <button
            autoFocus
            onClick={nextQuestion}
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Keyingi savol →
          </button>
        )}
      </div>
    </div>
  );
}
