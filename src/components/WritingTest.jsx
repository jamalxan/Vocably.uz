'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import { normalizeForCompare } from '@/lib/textCompare';
import { levenshtein } from '@/lib/levenshtein';
import { dueWordsInCategory } from '@/lib/srs';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';

// 6.1.3 (VOCABLY-TZ.md) — qisman kredit: har bir javob eng yaqin to'g'ri variantga
// Levenshtein masofasi bo'yicha solishtiriladi. 0 — aniq to'g'ri, 1 — "deyarli"
// (bitta harf xato — Hard bahosi + tuzatish ko'rsatiladi), 2+ — noto'g'ri (Again).
function closestMatch(input, candidates) {
  const norm = normalizeForCompare(input);
  let best = { distance: Infinity, match: candidates[0] || '' };
  for (const c of candidates) {
    const d = levenshtein(norm, normalizeForCompare(c));
    if (d < best.distance) best = { distance: d, match: c };
  }
  return best;
}

export default function WritingTest() {
  const { activeCategory, activeCatIndex, reviewWord, writeResetNonce } = useApp();

  const [writeRange, setWriteRange] = useState({ from: 1, to: 10 });
  const [writeActive, setWriteActive] = useState(false);
  const [writeWords, setWriteWords] = useState([]);
  const [writeCurIdx, setWriteCurIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [writeScore, setWriteScore] = useState(0);
  const [writeChecked, setWriteChecked] = useState(false);
  const [writeFinished, setWriteFinished] = useState(false);
  // Har bir blank uchun { distance, match } — 6.1.3 qisman kredit ko'rsatish uchun.
  const [matchResults, setMatchResults] = useState([]);
  const answerInputRefs = useRef([]);
  const submitRef = useRef(null);
  const [setupError, setSetupError] = useState('');

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda testni to'xtatamiz (avvalgi xatti-harakat).
  useEffect(() => {
    setWriteActive(false);
  }, [activeCatIndex, writeResetNonce]);

  // Har savolda fokus birinchi inputga, tekshirilgach "Keyingi savol" tugmasiga o'tadi —
  // mobil klaviatura yopilib qolmaydi, Enter bilan davom etish mumkin.
  useEffect(() => {
    if (!writeActive || writeFinished) return;
    if (writeChecked) submitRef.current?.focus();
    else answerInputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeActive, writeCurIdx, writeChecked]);

  const beginSession = (selected) => {
    if (selected.length === 0) return setSetupError("Oraliq noto'g'ri");
    setSetupError('');
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setWriteWords(shuffled);
    setWriteCurIdx(0);
    setWriteScore(0);
    setWriteChecked(false);
    setMatchResults([]);
    setUserAnswers(Array(shuffled[0]?.syns.length || 1).fill(''));
    setWriteFinished(false);
    setWriteActive(true);
  };

  const startWriteTest = (e) => {
    e?.preventDefault();
    const words = activeCategory.words || [];
    if (words.length === 0) return setSetupError("Avval so'z qo'shing");
    const sliceFrom = Math.max(1, writeRange.from) - 1;
    const sliceTo = Math.min(words.length, writeRange.to);
    beginSession(words.slice(sliceFrom, sliceTo));
  };

  const checkWriteAnswer = () => {
    const current = writeWords[writeCurIdx];
    const correctSyns = current.syns;
    const results = userAnswers.map((ans) => closestMatch(ans, correctSyns));
    setMatchResults(results);

    const maxDistance = Math.max(0, ...results.map((r) => r.distance));
    const lengthOk = userAnswers.length === correctSyns.length;
    // rating: 0 xato + to'g'ri son → Bildim(3); 1 harfgacha xato → Qiynaldim(2);
    // 2+ xato yoki son mos kelmasa → Bilmadim(1). 6.1.3'dagi jadvalga mos.
    const rating = !lengthOk || maxDistance >= 2 ? 1 : maxDistance === 1 ? 2 : 3;
    const isAllCorrect = rating === 3;

    if (isAllCorrect) setWriteScore((prev) => prev + 1);
    setWriteChecked(true);
    if (current._id && activeCategory._id) {
      reviewWord(activeCategory._id, current._id, isAllCorrect, { rating, mode: 'typing' });
    }
  };

  // Enter (yoki tugma) bir xil ishlaydi: avval tekshiradi, keyin keyingi so'zga o'tadi.
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!writeChecked) checkWriteAnswer();
    else nextWriteQuestion();
  };

  // Bir nechta sinonim inputi bo'lganda Enter navbatdagi bo'sh qatorga o'tkazadi;
  // faqat oxirgi qatorda Enter bosilsa javob tekshiriladi/keyingi savolga o'tiladi.
  const handleAnswerInputKeyDown = (e, idx) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (idx < userAnswers.length - 1) {
      answerInputRefs.current[idx + 1]?.focus();
    } else {
      handleAnswerSubmit(e);
    }
  };

  const nextWriteQuestion = () => {
    if (writeCurIdx + 1 < writeWords.length) {
      const nextIdx = writeCurIdx + 1;
      setWriteCurIdx(nextIdx);
      setWriteChecked(false);
      setMatchResults([]);
      setUserAnswers(Array(writeWords[nextIdx]?.syns.length || 1).fill(''));
    } else {
      setWriteFinished(true);
    }
  };

  const restartWriteRound = () => beginSession(writeWords);

  const closeWriteFinished = () => {
    setWriteFinished(false);
    setWriteActive(false);
  };

  return (
    <div className="flex flex-col items-center">
      <SessionCompleteCard
        open={writeFinished}
        title="Yozish testi tugadi!"
        score={writeScore}
        total={writeWords.length}
        onRestart={restartWriteRound}
        onClose={closeWriteFinished}
      />
      {!writeActive ? (
        <RangeSetupForm
          title="So'zlarni yozib sinash oraliqlari"
          range={writeRange}
          onRangeChange={(r) => {
            setWriteRange(r);
            setSetupError('');
          }}
          onSubmit={startWriteTest}
          error={setupError}
          buttonLabel="Testni boshlash"
          maxWords={activeCategory.words?.length || 0}
          onQuickStart={() => beginSession(dueWords)}
          quickStartCount={dueWords.length}
        />
      ) : (
        <form
          onSubmit={handleAnswerSubmit}
          className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex justify-between items-center text-xs text-muted mb-4">
            <span>
              {writeCurIdx + 1} / {writeWords.length}
            </span>
            <span>To'g'ri: {writeScore}</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="min-w-0 text-xl sm:text-2xl font-bold text-ink font-word break-words">
              {writeWords[writeCurIdx]?.word}
            </span>
            <button
              type="button"
              onClick={() => speakText(writeWords[writeCurIdx]?.word)}
              aria-label="Talaffuzni eshitish"
              title="Talaffuzni eshitish"
              className="inline-flex items-center justify-center w-11 h-11 md:w-8 md:h-8 bg-accent-soft hover:bg-accent/20 rounded-lg text-accent transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {userAnswers.map((ans, idx) => {
              // 6.1.3 — qisman kredit: 0 masofa = to'g'ri, 1 = "deyarli" (bitta harf xato,
              // tuzatish ko'rsatiladi), 2+ = xato.
              const result = matchResults[idx];
              const tone =
                !writeChecked || !result
                  ? null
                  : result.distance === 0
                    ? 'exact'
                    : result.distance === 1
                      ? 'near'
                      : 'wrong';
              return (
                <div key={idx}>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-muted w-6">{idx + 1}</span>
                    <input
                      type="text"
                      ref={(el) => (answerInputRefs.current[idx] = el)}
                      disabled={writeChecked}
                      placeholder="Sinonim..."
                      aria-label={`Sinonim ${idx + 1}`}
                      value={ans}
                      onChange={(e) => {
                        const temp = [...userAnswers];
                        temp[idx] = e.target.value;
                        setUserAnswers(temp);
                      }}
                      onKeyDown={(e) => handleAnswerInputKeyDown(e, idx)}
                      className={`flex-1 min-w-0 px-3 py-2 border rounded-lg text-base md:text-sm outline-none placeholder:text-muted ${
                        tone === 'exact'
                          ? 'border-success/40 bg-success-soft text-success'
                          : tone === 'near'
                            ? 'border-warning/40 bg-warning-soft text-warning'
                            : tone === 'wrong'
                              ? 'border-danger/40 bg-danger-soft text-danger'
                              : 'bg-bg text-ink border-border focus:border-accent'
                      }`}
                    />
                  </div>
                  {tone === 'near' && (
                    <p className="text-[11px] text-warning mt-1 ml-8 break-words">
                      Deyarli! <span className="line-through opacity-70">{ans}</span> → <span className="font-semibold">{result.match}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {writeChecked && (
            <div className="bg-bg border border-border rounded-lg p-3 text-xs mb-4">
              <span className="font-semibold text-muted block mb-1">To'g'ri javoblar:</span>
              <span className="font-bold text-accent text-sm">{writeWords[writeCurIdx].syns.join(', ')}</span>
            </div>
          )}

          <button
            ref={submitRef}
            type="submit"
            className="w-full min-h-11 bg-accent hover:bg-accent-hover text-on-accent font-semibold py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {writeChecked ? 'Keyingi savol →' : 'Tekshirish'}
          </button>
        </form>
      )}
    </div>
  );
}
