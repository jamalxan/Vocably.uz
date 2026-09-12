'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// V5 "Jumla quruvchi" (VOCABLY-TZ.md 6.2) — berilgan so'zlardan to'g'ri jumla yig'ish
// (drag & drop o'rniga bosib-joylashtirish — mobilda ham bir xil ishonchli ishlaydi).
// Produktiv bilim (recognition ≠ production).
function buildQueue(words) {
  return shuffle(
    words
      .filter((w) => w.enrichment?.examples?.[0]?.en)
      .map((w) => {
        const sentence = w.enrichment.examples[0].en.trim();
        const tokens = sentence.split(/\s+/);
        return { word: w, sentence, tokens: shuffle(tokens.map((t, i) => ({ id: i, text: t }))) };
      })
  );
}

export default function JumlaQurishPage() {
  const { activeCategory, reviewWord } = useApp();
  const [queue] = useState(() => buildQueue(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [bank, setBank] = useState(queue[0]?.tokens || []);
  const [checked, setChecked] = useState(null); // null | true | false
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (queue.length === 0) return <EnrichmentEmptyState field="kamida bitta misol jumla" />;

  const current = queue[idx];

  const place = (token) => {
    if (checked !== null) return;
    setPlaced((p) => [...p, token]);
    setBank((b) => b.filter((t) => t.id !== token.id));
  };
  const unplace = (token) => {
    if (checked !== null) return;
    setBank((b) => [...b, token]);
    setPlaced((p) => p.filter((t) => t.id !== token.id));
  };
  const reset = () => {
    setBank(current.tokens);
    setPlaced([]);
    setChecked(null);
  };

  const check = () => {
    const built = placed.map((t) => t.text).join(' ');
    const isCorrect = built === current.sentence;
    setChecked(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    if (current.word._id && activeCategory._id) {
      reviewWord(activeCategory._id, current.word._id, isCorrect, { mode: 'quiz' });
    }
  };

  const next = () => {
    if (idx + 1 < queue.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setBank(queue[nextIdx].tokens);
      setPlaced([]);
      setChecked(null);
    } else {
      setFinished(true);
    }
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
          setBank(queue[0]?.tokens || []);
          setPlaced([]);
          setChecked(null);
          setScore(0);
          setFinished(false);
        }}
      />
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>{idx + 1} / {queue.length}</span>
          <span>To'g'ri: {score}</span>
        </div>
        <p className="text-[10px] text-muted text-center mb-2 uppercase tracking-wide">
          "{current.word.word}" so'zi bilan jumla yig'ing
        </p>

        <div
          className={`min-h-[64px] border-2 border-dashed rounded-xl p-3 flex flex-wrap gap-2 mb-3 ${
            checked === true ? 'border-green-300 bg-green-50' : checked === false ? 'border-red-300 bg-accent-soft' : 'border-border'
          }`}
        >
          {placed.length === 0 && <span className="text-xs text-muted">So'zlarni pastdan bosib joylashtiring...</span>}
          {placed.map((t) => (
            <button
              key={t.id}
              onClick={() => unplace(t)}
              disabled={checked !== null}
              className="px-2.5 py-1.5 bg-accent text-on-accent rounded-lg text-sm font-medium"
            >
              {t.text}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5 min-h-[40px]">
          {bank.map((t) => (
            <button
              key={t.id}
              onClick={() => place(t)}
              className="px-2.5 py-1.5 bg-bg border border-border hover:border-accent/40 rounded-lg text-sm font-medium text-ink"
            >
              {t.text}
            </button>
          ))}
        </div>

        {checked === false && (
          <p className="text-xs text-muted mb-4 text-center">
            To'g'ri: <span className="font-semibold text-accent">{current.sentence}</span>
          </p>
        )}

        <div className="flex gap-2">
          {checked === null && (
            <button
              onClick={reset}
              className="px-3.5 py-2.5 bg-surface hover:bg-bg border border-border text-muted rounded-lg text-sm"
              aria-label="Qayta boshlash"
            >
              <RotateCcw size={16} />
            </button>
          )}
          {checked === null ? (
            <button
              onClick={check}
              disabled={bank.length > 0}
              className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Tekshirish
            </button>
          ) : (
            <button
              autoFocus
              onClick={next}
              className="flex-1 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Keyingi →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
