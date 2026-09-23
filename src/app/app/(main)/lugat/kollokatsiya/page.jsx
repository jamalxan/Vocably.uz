'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';
import { categoryKey, escapeRegExp, optionStateClass, OPTION_BUTTON_CLASS } from '@/lib/lugatQuiz';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// V2 "Kollokatsiya quruvchi" (VOCABLY-TZ.md 6.2) — "highly ___", "___ economy" kabi
// naqshdan to'g'ri sherik so'zni tanlash. Lexical chunking — nutq ravonligining asosi.
function buildQuestions(words) {
  const enriched = words.filter((w) => w.enrichment?.collocations?.[0]);
  return shuffle(enriched)
    .map((w) => {
      const re = new RegExp(`\\b${escapeRegExp(w.word)}\\b`, 'i');
      // So'z kollokatsiyada aynan uchramasa (masalan, tuslangan shakl) — javob ochiq ko'rinmasin.
      const matching = w.enrichment.collocations.filter((c) => re.test(c));
      if (matching.length === 0) return null;
      const collocation = matching[Math.floor(Math.random() * matching.length)];
      const blanked = collocation.replace(re, '___');
      const distractorPool = [...new Set(enriched.filter((x) => x !== w).map((x) => x.word))].filter((d) => d !== w.word);
      const distractors = shuffle(distractorPool).slice(0, 3);
      return { word: w, prompt: blanked, correctAnswer: w.word, options: shuffle([w.word, ...distractors]) };
    })
    .filter(Boolean);
}

export default function KollokatsiyaPage() {
  const { activeCategory, activeCatIndex } = useApp();
  // Kategoriya almashganda savollar yangi kategoriyadan qayta quriladi.
  return <KollokatsiyaQuiz key={categoryKey(activeCatIndex, activeCategory)} />;
}

function KollokatsiyaQuiz() {
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
    <div className="flex flex-col items-center">
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
            const style = optionStateClass(!!selected, isCorrectOpt, isSelected);
            return (
              <button
                key={i}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`${OPTION_BUTTON_CLASS} ${style}`}
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
