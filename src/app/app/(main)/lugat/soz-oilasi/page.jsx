'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import EnrichmentEmptyState from '@/components/shared/EnrichmentEmptyState';
import SessionCompleteCard from '@/components/shared/SessionCompleteCard';
import { categoryKey, optionStateClass, OPTION_BUTTON_CLASS } from '@/lib/lugatQuiz';

const POS_LABEL = {
  noun: 'ot (noun)',
  verb: "fe'l (verb)",
  adjective: 'sifat (adjective)',
  adverb: 'ravish (adverb)',
  phrase: 'ibora (phrase)',
  idiom: 'idioma (idiom)',
  phrasal_verb: "fe'lli ibora (phrasal verb)",
};
const CORE_POS = ['noun', 'verb', 'adjective', 'adverb'];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// V3 "So'z oilasi daraxti" (VOCABLY-TZ.md 6.2) — resilient → resilience → resiliently:
// bitta o'zakdan 3-4 so'z, har birining turkumini aniqlash mashqi.
function buildQuestions(words) {
  const items = [];
  words
    .filter((w) => w.enrichment?.wordFamily?.length > 0)
    .forEach((w) => {
      w.enrichment.wordFamily.forEach((f) => {
        if (!f.form || !f.pos) return;
        const normalizedPos = f.pos.toLowerCase().trim();
        const options = new Set([normalizedPos, ...shuffle(CORE_POS)].slice(0, 4));
        while (options.size < 4) options.add(shuffle(Object.keys(POS_LABEL))[0]);
        items.push({ word: w, form: f.form, correctPos: normalizedPos, options: shuffle([...options]) });
      });
    });
  return shuffle(items);
}

export default function SozOilasiPage() {
  const { activeCategory, activeCatIndex } = useApp();
  // Kategoriya almashganda savollar yangi kategoriyadan qayta quriladi.
  return <SozOilasiQuiz key={categoryKey(activeCatIndex, activeCategory)} />;
}

function SozOilasiQuiz() {
  const { activeCategory } = useApp();
  const [questions] = useState(() => buildQuestions(activeCategory.words || []));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return <EnrichmentEmptyState field="so'z oilasi (word family)" />;

  const current = questions[idx];

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.correctPos) setScore((s) => s + 1);
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
        <p className="text-[11px] sm:text-xs text-muted text-center mb-1 break-words">{current.word.word} so'z oilasidan</p>
        <p className="text-xl font-bold text-ink font-word mb-1 text-center break-words">{current.form}</p>
        <p className="text-xs text-muted text-center mb-6">bu qanday so'z turkumi?</p>
        <div className="space-y-2 mb-4">
          {current.options.map((opt, i) => {
            const isCorrectOpt = opt === current.correctPos;
            const isSelected = selected === opt;
            const style = optionStateClass(!!selected, isCorrectOpt, isSelected);
            return (
              <button
                key={i}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`${OPTION_BUTTON_CLASS} ${style}`}
              >
                {POS_LABEL[opt] || opt}
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
