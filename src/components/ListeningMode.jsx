'use client';
import { useState, useEffect, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import { normalizeForCompare } from '@/lib/textCompare';
import { dueWordsInCategory } from '@/lib/srs';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

// 6.1.6 (VOCABLY-TZ.md) — darajali tinglab yozish. Daraja 4 ("shovqin fonida") BU YERDA YO'Q —
// brauzer TTS ovoz oqimiga real vaqtda shovqin qo'shish uchun Web Audio API orqali murakkab
// audio-routing kerak (TTS chiqishi to'g'ridan-to'g'ri buferga ega emas), bu FAZA doirasidan
// tashqari — real audio-fayl pipeline (T4) kelganda tabiiy yechiladi.
const LEVELS = [
  { key: 'word', label: "So'z", hint: "Eshitilgan so'zni yozing", rate: 0.9, needsExample: false },
  { key: 'sentence', label: 'Jumla', hint: 'Eshitilgan jumlani yozing', rate: 0.9, needsExample: true },
  { key: 'fast', label: "Tezlashtirilgan (1.25×)", hint: "Eshitilgan so'zni yozing", rate: 1.25, needsExample: false },
];

export default function ListeningMode() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [level, setLevel] = useState('word');
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const levelDef = LEVELS.find((l) => l.key === level) || LEVELS[0];

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda oraliq tanlashga qaytamiz.
  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const current = queue[idx];
  const target = levelDef.needsExample && current?.enrichment?.examples?.[0]?.en ? current.enrichment.examples[0].en : current?.word;

  useEffect(() => {
    if (current) speakText(target, { rate: levelDef.rate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const eligibleWords = (pool) => (levelDef.needsExample ? pool.filter((w) => w.enrichment?.examples?.[0]?.en) : pool);

  const beginSession = (selected) => {
    const eligible = eligibleWords(selected);
    if (eligible.length === 0) {
      return alert(
        levelDef.needsExample
          ? "Bu darajada faqat AI bilan boyitilgan (misol jumlasi bor) so'zlar ishlatiladi — bu oraliqda ular yo'q."
          : "Oraliq noto'g'ri"
      );
    }
    setWords(selected);
    setQueue([...eligible].sort(() => Math.random() - 0.5));
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    setFinished(false);
    setActive(true);
  };

  const startListening = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return alert("Avval so'z qo'shing");
    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    beginSession(all.slice(sliceFrom, sliceTo));
  };

  const isCorrect = !!current && normalizeForCompare(input) === normalizeForCompare(target);

  const check = () => {
    setChecked(true);
    if (isCorrect) setScore((s) => s + 1);
    if (current?._id && activeCategory._id) {
      reviewWord(activeCategory._id, current._id, isCorrect, { mode: 'listening' });
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
    setQueue([...eligibleWords(words)].sort(() => Math.random() - 0.5));
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
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md flex gap-2 p-1 bg-surface border border-border rounded-xl mb-4">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                level === l.key ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:bg-primary-soft/40'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <RangeSetupForm
          title="Tinglab yozish oraliqlari"
          range={range}
          onRangeChange={setRange}
          onSubmit={startListening}
          maxWords={activeCategory.words?.length || 0}
          onQuickStart={() => beginSession(dueWords)}
          quickStartCount={eligibleWords(dueWords).length}
        />
      </div>
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
            onClick={() => speakText(target, { rate: levelDef.rate })}
            className="w-16 h-16 rounded-full bg-accent-soft hover:bg-accent/20 text-accent flex items-center justify-center transition-colors"
            title="Qayta eshitish"
            aria-label="Qayta eshitish"
          >
            <Volume2 size={24} />
          </button>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-wider">{levelDef.hint}</p>
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
            To'g'ri javob: <span className="font-bold text-accent">{target}</span>
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
