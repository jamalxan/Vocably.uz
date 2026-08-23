'use client';
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

export default function ListeningMode() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const current = queue[idx];

  useEffect(() => {
    if (current) speakText(current.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const startListening = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selected = all.slice(sliceFrom, sliceTo);
    if (selected.length === 0) return alert("Oraliq noto'g'ri");

    setWords(selected);
    setQueue([...selected].sort(() => Math.random() - 0.5));
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    setActive(true);
  };

  const isCorrect = !!current && input.trim().toLowerCase() === current.word.toLowerCase();

  const check = () => {
    setChecked(true);
    if (isCorrect) setScore((s) => s + 1);
    if (current?._id && activeCategory._id) {
      reviewWord(activeCategory._id, current._id, isCorrect);
    }
  };

  const next = () => {
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setInput('');
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  const restartRound = () => {
    setFinished(false);
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    setQueue([...words].sort(() => Math.random() - 0.5));
  };

  const closeFinished = () => {
    setFinished(false);
    setActive(false);
  };

  // Enter (yoki tugma) bir xil ishlaydi: avval tekshiradi, keyin keyingi so'zga o'tadi.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checked) check();
    else next();
  };

  if (!active) {
    return (
      <RangeSetupForm
        title="Tinglab yozish oraliqlari"
        range={range}
        onRangeChange={setRange}
        onSubmit={startListening}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title="Tinglab yozish tugadi!"
        score={score}
        total={queue.length}
        onRestart={restartRound}
        onClose={closeFinished}
      />
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>
            {idx + 1} / {queue.length}
          </span>
          <span>To'g'ri: {score}</span>
          <button type="button" onClick={() => setActive(false)} className="text-accent hover:text-accent-hover font-semibold">
            Oraliqni o'zgartirish
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => speakText(current.word)}
            className="w-16 h-16 rounded-full bg-accent-soft hover:bg-accent/20 text-accent flex items-center justify-center transition-colors"
            title="Qayta eshitish"
          >
            <Volume2 size={24} />
          </button>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-wider">Eshitilgan so'zni yozing</p>
        </div>

        <input
          type="text"
          disabled={checked}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Eshitgan so'zingizni yozing..."
          className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4 ${
            checked
              ? isCorrect
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-red-300 bg-accent-soft text-red-700'
              : 'focus:border-accent'
          }`}
        />

        {checked && !isCorrect && (
          <p className="text-xs text-muted mb-4">
            To'g'ri javob: <span className="font-bold text-accent">{current.word}</span>
          </p>
        )}

        {!checked ? (
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Tekshirish
          </button>
        ) : (
          <button
            type="submit"
            autoFocus
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Keyingi →
          </button>
        )}
      </form>
    </div>
  );
}
