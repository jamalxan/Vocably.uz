'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// V2 "Kollokatsiya quruvchi" (VOCABLY-TZ.md 6.2) — "highly ___", "___ economy" kabi
// naqshdan to'g'ri sherik so'zni tanlash. Lexical chunking — nutq ravonligining asosi.
function buildQuestions(words) {
  const enriched = words.filter((w) => w.enrichment?.collocations?.[0]);
  return shuffle(enriched).map((w) => {
    const collocation = w.enrichment.collocations[Math.floor(Math.random() * w.enrichment.collocations.length)];
    const re = new RegExp(`\\b${w.word}\\b`, 'i');
    const blanked = collocation.replace(re, '___');
    const distractorPool = enriched.filter((x) => x !== w).map((x) => x.word);
    const distractors = shuffle(distractorPool).slice(0, 3);
    return { word: w, prompt: blanked, correctAnswer: w.word, options: shuffle([w.word, ...distractors]) };
  });
}

export default function KollokatsiyaPage() {
  const { activeCategory, reviewWord } = useApp();
  const [questions] = useState(() => buildQuestions(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return <EnrichmentEmptyState field="kamida bitta kollokatsiya" />;

  const current = questions[idx];

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === current.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);
    if (current.word._id && activeCategory._id) {
      reviewWord(activeCategory._id, current.word._id, isCorrect, { mode: 'quiz' });
    }
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
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
        total={questions.length}
        onClose={() => setFinished(false)}
        onRestart={() => {
          setIdx(0);
          setSelected(null);
          setScore(0);
          setFinished(false);
        }}
      />
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>{idx + 1} / {questions.length}</span>
          <span>To'g'ri: {score}</span>
        </div>
        <p className="text-xl font-bold text-ink font-word mb-6 text-center break-words">{current.prompt}</p>
        <div className="space-y-2 mb-4">
          {current.options.map((opt, i) => {
            const isCorrectOpt = opt === current.correctAnswer;
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
          <button
            autoFocus
            onClick={next}
            className="w-full bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Keyingi →
          </button>
        )}
      </div>
    </div>
  );
}
