'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { normalizeForCompare } from '@/lib/textCompare';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';

// V1 "Kontekstda tanish" (VOCABLY-TZ.md 6.2) — haqiqiy jumladan so'z olib tashlanadi,
// foydalanuvchi to'ldiradi. Kontekstli o'rganish izolyatsiyalangandan 2× samarali (izoh).
function buildQueue(words) {
  return [...words]
    .filter((w) => w.enrichment?.examples?.[0]?.en)
    .sort(() => Math.random() - 0.5)
    .map((w) => {
      const sentence = w.enrichment.examples[0].en;
      const re = new RegExp(`\\b${w.word}\\b`, 'i');
      return { word: w, blanked: sentence.replace(re, '_____'), answer: w.word };
    });
}

export default function ClozePage() {
  const { activeCategory, reviewWord } = useApp();
  const [queue] = useState(() => buildQueue(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = queue[idx];
  const isCorrect = useMemo(() => !!current && normalizeForCompare(input) === normalizeForCompare(current.answer), [current, input]);

  if (queue.length === 0) return <EnrichmentEmptyState field="kamida bitta misol jumla" />;

  const check = () => {
    setChecked(true);
    if (isCorrect) setScore((s) => s + 1);
    if (current.word._id && activeCategory._id) {
      reviewWord(activeCategory._id, current.word._id, isCorrect, { mode: 'cloze' });
    }
  };

  const next = () => {
    if (idx + 1 < queue.length) {
      setIdx((i) => i + 1);
      setInput('');
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checked) check();
    else next();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <SessionCompleteCard
        open={finished}
        title="Yakunlandi!"
        score={score}
        total={queue.length}
        onClose={() => setFinished(false)}
        onRestart={() => {
          setIdx(0);
          setInput('');
          setChecked(false);
          setScore(0);
          setFinished(false);
        }}
      />
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>{idx + 1} / {queue.length}</span>
          <span>To'g'ri: {score}</span>
        </div>
        <p className="text-base sm:text-lg text-ink text-center leading-relaxed mb-6">{current.blanked}</p>
        <input
          type="text"
          autoFocus
          disabled={checked}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Yetishmayotgan so'zni yozing..."
          className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4 text-center font-word ${
            checked
              ? isCorrect
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-red-300 bg-accent-soft text-red-700'
              : 'border-border focus:border-accent'
          }`}
        />
        {checked && !isCorrect && (
          <p className="text-xs text-muted mb-4 text-center">
            To'g'ri javob: <span className="font-bold text-accent">{current.answer}</span>
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {checked ? 'Keyingi →' : 'Tekshirish'}
        </button>
      </form>
    </div>
  );
}
