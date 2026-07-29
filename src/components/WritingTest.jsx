'use client';
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';

export default function WritingTest() {
  const { activeCategory, activeCatIndex, writeResetNonce } = useApp();

  const [writeRange, setWriteRange] = useState({ from: 1, to: 10 });
  const [writeActive, setWriteActive] = useState(false);
  const [writeWords, setWriteWords] = useState([]);
  const [writeCurIdx, setWriteCurIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [writeScore, setWriteScore] = useState(0);
  const [writeChecked, setWriteChecked] = useState(false);

  // Kategoriya almashganda yoki boshqa nav bo'limi bosilganda testni to'xtatamiz (avvalgi xatti-harakat).
  useEffect(() => {
    setWriteActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const startWriteTest = (e) => {
    e?.preventDefault();
    const words = activeCategory.words || [];
    if (words.length === 0) return alert("Avval so'z qo'shing");

    const sliceFrom = Math.max(1, writeRange.from) - 1;
    const sliceTo = Math.min(words.length, writeRange.to);
    const selected = words.slice(sliceFrom, sliceTo);
    if (selected.length === 0) return alert("Oraliq noto'g'ri");

    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setWriteWords(shuffled);
    setWriteCurIdx(0);
    setWriteScore(0);
    setWriteChecked(false);
    setUserAnswers(Array(shuffled[0]?.syns.length || 1).fill(''));
    setWriteActive(true);
  };

  const checkWriteAnswer = () => {
    const current = writeWords[writeCurIdx];
    const correctSyns = current.syns.map((s) => s.toLowerCase());
    let isAllCorrect = userAnswers.length === correctSyns.length;

    userAnswers.forEach((ans) => {
      if (!correctSyns.includes(ans.trim().toLowerCase())) {
        isAllCorrect = false;
      }
    });

    if (isAllCorrect) setWriteScore((prev) => prev + 1);
    setWriteChecked(true);
  };

  // Enter (yoki tugma) bir xil ishlaydi: avval tekshiradi, keyin keyingi so'zga o'tadi.
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!writeChecked) checkWriteAnswer();
    else nextWriteQuestion();
  };

  const nextWriteQuestion = () => {
    if (writeCurIdx + 1 < writeWords.length) {
      const nextIdx = writeCurIdx + 1;
      setWriteCurIdx(nextIdx);
      setWriteChecked(false);
      setUserAnswers(Array(writeWords[nextIdx]?.syns.length || 1).fill(''));
    } else {
      alert(`Test yakunlandi! Natijangiz: ${writeScore}/${writeWords.length}`);
      setWriteActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!writeActive ? (
        <form
          onSubmit={startWriteTest}
          className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 mb-4 font-display">So'zlarni yozib sinash oraliqlari</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 w-12">Dan:</span>
              <input
                type="number"
                min={1}
                value={writeRange.from}
                onChange={(e) => setWriteRange({ ...writeRange, from: parseInt(e.target.value) || 1 })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 w-12">Gacha:</span>
              <input
                type="number"
                min={1}
                value={writeRange.to}
                onChange={(e) => setWriteRange({ ...writeRange, to: parseInt(e.target.value) || 1 })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Testni boshlash
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleAnswerSubmit}
          className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
            <span>
              {writeCurIdx + 1} / {writeWords.length}
            </span>
            <span>To'g'ri: {writeScore}</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl sm:text-2xl font-bold text-slate-800 font-display break-words">
              {writeWords[writeCurIdx]?.word}
            </span>
            <button
              type="button"
              onClick={() => speakText(writeWords[writeCurIdx]?.word)}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-600 transition-colors flex-shrink-0"
            >
              <Volume2 size={14} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {userAnswers.map((ans, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 w-6">{idx + 1}</span>
                <input
                  type="text"
                  disabled={writeChecked}
                  placeholder="Sinonim..."
                  value={ans}
                  onChange={(e) => {
                    const temp = [...userAnswers];
                    temp[idx] = e.target.value;
                    setUserAnswers(temp);
                  }}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none ${
                    writeChecked
                      ? writeWords[writeCurIdx].syns.map((s) => s.toLowerCase()).includes(ans.trim().toLowerCase())
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : 'focus:border-indigo-500'
                  }`}
                />
              </div>
            ))}
          </div>

          {writeChecked && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs mb-4">
              <span className="font-semibold text-slate-500 block mb-1">To'g'ri javoblar:</span>
              <span className="font-bold text-indigo-600 text-sm">{writeWords[writeCurIdx].syns.join(', ')}</span>
            </div>
          )}

          {!writeChecked ? (
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
              Keyingi savol →
            </button>
          )}
        </form>
      )}
    </div>
  );
}
