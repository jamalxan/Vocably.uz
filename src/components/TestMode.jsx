'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { dueWordsInCategory } from '@/lib/srs';
import { levenshtein } from '@/lib/levenshtein';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 6.1.2 (VOCABLY-TZ.md) — aqlli distraktorlar: (1) bir xil pos+cefr, (2) shakli o'xshash
// (Levenshtein ≤3), (3) qolgani tasodifiy. Boyitilmagan so'zlarda pos/cefr yo'q — shu holda
// avtomatik (1)-bucket bo'sh qoladi, tasodifiy tanlovga tushadi (funksional darajada).
function pickDistractors(target, pool, count, getLabel) {
  const candidates = pool.filter((w) => w !== target && getLabel(w));
  const posCefr = candidates.filter(
    (w) => target.enrichment?.pos && w.enrichment?.pos === target.enrichment.pos && w.enrichment?.cefr === target.enrichment?.cefr
  );
  const spelling = candidates.filter((w) => levenshtein(w.word.toLowerCase(), target.word.toLowerCase()) <= 3);

  const chosen = [];
  const used = new Set();
  const take = (list, n) => {
    for (const w of shuffle(list)) {
      if (chosen.length >= count) break;
      if (used.has(w._id || w.word)) continue;
      used.add(w._id || w.word);
      chosen.push(w);
      if (--n <= 0) break;
    }
  };
  take(posCefr, Math.ceil(count * 0.6));
  take(spelling, Math.ceil(count * 0.2));
  take(candidates, count);
  return chosen.slice(0, count).map(getLabel);
}

// So'zdagi maxsus belgilar (masalan "e.g.", "(sth)") RegExp'ni buzmasligi uchun ekranlanadi.
function wordRegex(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

// 4 yo'nalish — faqat enrichment ma'lumoti bor so'zlarda ta'rif/cloze tanlanadi, aks holda
// EN→UZ / UZ→EN orasida tasodifiy tanlanadi (6.1.2).
function buildQuestion(words) {
  const target = words[Math.floor(Math.random() * words.length)];
  const availableDirections = ['en_uz', 'uz_en'];
  if (target.enrichment?.definitionEn) availableDirections.push('definition');
  const clozeSentence = target.enrichment?.examples?.[0]?.en;
  const clozeRe = clozeSentence ? wordRegex(target.word) : null;
  // Gapda so'zning aynan o'zi bo'lmasa (masalan faqat "runs"), bo'sh joy chiqmaydi — cloze berilmaydi.
  if (clozeRe && clozeRe.test(clozeSentence)) availableDirections.push('cloze');
  const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];

  if (direction === 'uz_en') {
    const correctAnswer = target.word;
    const distractors = pickDistractors(target, words, 3, (w) => w.word);
    return { target, direction, prompt: target.syns[0], correctAnswer, options: shuffle([correctAnswer, ...distractors]) };
  }
  if (direction === 'definition') {
    const correctAnswer = target.word;
    const distractors = pickDistractors(target, words, 3, (w) => w.word);
    return {
      target,
      direction,
      prompt: target.enrichment.definitionEn,
      correctAnswer,
      options: shuffle([correctAnswer, ...distractors]),
    };
  }
  if (direction === 'cloze') {
    const correctAnswer = target.word;
    const distractors = pickDistractors(target, words, 3, (w) => w.word);
    return {
      target,
      direction,
      prompt: clozeSentence.replace(clozeRe, '_____'),
      correctAnswer,
      options: shuffle([correctAnswer, ...distractors]),
    };
  }
  // en_uz — asl yo'nalish
  const correctAnswer = target.syns[0];
  const distractors = pickDistractors(target, words, 3, (w) => w.syns[0]);
  return { target, direction: 'en_uz', prompt: target.word, correctAnswer, options: shuffle([correctAnswer, ...distractors]) };
}

const DIRECTION_LABEL = {
  en_uz: 'Tarjimasini tanlang',
  uz_en: 'Inglizchasini tanlang',
  definition: "Ta'rifga mos so'zni tanlang",
  cloze: "Bo'sh joyga mos so'zni tanlang",
};

export default function TestMode() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questionIndex, setQuestionIndex] = useState(1);
  const [questionStartedAt, setQuestionStartedAt] = useState(0);
  const [complete, setComplete] = useState(false);
  const [setupError, setSetupError] = useState('');
  const SESSION_LENGTH = 10;

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const nextQuestion = useCallback(() => {
    if (words.length < 4) return;
    if (questionIndex >= SESSION_LENGTH) {
      setComplete(true);
      return;
    }
    setQuestion(buildQuestion(words));
    setSelected(null);
    setQuestionIndex((n) => n + 1);
    setQuestionStartedAt(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, questionIndex]);

  const beginSession = (selectedWords) => {
    if (selectedWords.length < 4) return setSetupError("Test uchun tanlangan oraliqda kamida 4 ta so'z kerak.");
    setSetupError('');
    setWords(selectedWords);
    setQuestion(buildQuestion(selectedWords));
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setQuestionIndex(1);
    setQuestionStartedAt(Date.now());
    setComplete(false);
    setActive(true);
  };

  const startTest = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    if (all.length === 0) return setSetupError("Avval so'z qo'shing");
    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    beginSession(all.slice(sliceFrom, sliceTo));
  };

  const choose = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    const responseMs = Date.now() - questionStartedAt;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    if (question.target._id && activeCategory._id) {
      reviewWord(activeCategory._id, question.target._id, isCorrect, { responseMs, mode: 'quiz' });
    }
  };

  if (!active) {
    return (
      <RangeSetupForm
        title="Test oraliqlari"
        range={range}
        onRangeChange={(r) => {
          setRange(r);
          setSetupError('');
        }}
        onSubmit={startTest}
        error={setupError}
        maxWords={activeCategory.words?.length || 0}
        onQuickStart={() => beginSession(dueWords)}
        quickStartCount={dueWords.length}
      />
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span>
            Savol {questionIndex}/{SESSION_LENGTH}
          </span>
          <span>
            To'g'ri: {score.correct}/{score.total}
          </span>
          <button
            onClick={() => setActive(false)}
            className="inline-flex items-center min-h-11 -my-3.5 md:min-h-0 md:my-0 text-accent hover:text-accent-hover font-semibold"
          >
            Oraliqni o'zgartirish
          </button>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent text-center mb-2">
          {DIRECTION_LABEL[question.direction]}
        </p>
        <p
          className={`font-bold text-ink mb-6 text-center break-words ${
            question.direction === 'definition' || question.direction === 'cloze' ? 'text-base' : 'text-xl font-word'
          }`}
        >
          {question.prompt}
        </p>
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const isCorrectOpt = opt === question.correctAnswer;
            const isSelected = selected === opt;
            let style = 'border-border hover:border-accent/30';
            if (selected) {
              if (isCorrectOpt) style = 'border-success/40 bg-success-soft text-success';
              else if (isSelected) style = 'border-danger/40 bg-danger-soft text-danger';
            }
            const showCorrect = selected && isCorrectOpt;
            const showWrong = selected && isSelected && !isCorrectOpt;
            return (
              <button
                key={i}
                onClick={() => choose(opt)}
                disabled={!!selected}
                className={`w-full min-h-11 flex items-center gap-2 text-left px-4 py-2.5 border rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${style}`}
              >
                <span className="flex-1 min-w-0 break-words">{opt}</span>
                {showCorrect && (
                  <>
                    <Check size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span className="sr-only">To'g'ri javob</span>
                  </>
                )}
                {showWrong && (
                  <>
                    <X size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span className="sr-only">Noto'g'ri</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        {selected && (
          // autoFocus — javob tanlangach Enter darrov keyingi savolga o'tkazadi
          <button
            autoFocus
            onClick={nextQuestion}
            className="w-full min-h-11 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {questionIndex >= SESSION_LENGTH ? 'Yakunlash' : 'Keyingi savol →'}
          </button>
        )}
      </div>

      <SessionCompleteCard
        open={complete}
        title="Test yakunlandi!"
        score={score.correct}
        total={score.total}
        onClose={() => setActive(false)}
        onRestart={() => beginSession(words)}
      />
    </div>
  );
}
