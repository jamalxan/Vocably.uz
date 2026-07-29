'use client';
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';

export default function ListeningMode() {
  const { activeCategory, activeCatIndex, reviewWord } = useApp();
  const words = activeCategory.words || [];

  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setQueue([...words].sort(() => Math.random() - 0.5));
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatIndex]);

  const current = queue[idx];

  useEffect(() => {
    if (current) speakText(current.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

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
      alert(`Tugadi! Natija: ${score}/${queue.length}`);
      setIdx(0);
      setInput('');
      setChecked(false);
      setScore(0);
      setQueue([...words].sort(() => Math.random() - 0.5));
    }
  };

  if (words.length === 0) {
    return <p className="text-sm text-slate-400 text-center">Bu kategoriyada so'zlar yo'q.</p>;
  }
  if (!current) return null;

  // Enter (yoki tugma) bir xil ishlaydi: avval tekshiradi, keyin keyingi so'zga o'tadi.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checked) check();
    else next();
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
          <span>
            {idx + 1} / {queue.length}
          </span>
          <span>To'g'ri: {score}</span>
        </div>

        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => speakText(current.word)}
            className="w-16 h-16 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors"
            title="Qayta eshitish"
          >
            <Volume2 size={24} />
          </button>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">Eshitilgan so'zni yozing</p>
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
                : 'border-red-300 bg-red-50 text-red-700'
              : 'focus:border-indigo-500'
          }`}
        />

        {checked && !isCorrect && (
          <p className="text-xs text-slate-500 mb-4">
            To'g'ri javob: <span className="font-bold text-indigo-600">{current.word}</span>
          </p>
        )}

        {!checked ? (
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
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
