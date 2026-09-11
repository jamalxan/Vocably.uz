'use client';
import { useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';

// TZ-vocably-v2.md §D3 (BUG-011) — "Test tuz" endi oddiy matn emas: AI generate_quiz
// funksiyasini chaqiradi (src/lib/aiTools.js), server buni [[QUIZ]] markeri bilan
// oqimga qo'shadi (route.js), AiChat.jsx ajratib oladi — bu komponent natijani
// interaktiv (bosib javob beriladigan, darhol tekshiriladigan) kartaga aylantiradi.
export default function QuizCard({ quizAction }) {
  const questions = quizAction?.questions || [];
  const [answers, setAnswers] = useState({}); // { [qIndex]: selectedOption }

  if (questions.length === 0) return null;

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
  const allAnswered = answeredCount === questions.length;

  const selectOption = (qIndex, option) => {
    if (answers[qIndex] != null) return; // birinchi tanlovdan keyin qulflanadi
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const reset = () => setAnswers({});

  return (
    <div className="mt-2 w-full max-w-md border border-border rounded-2xl bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg border-b border-border">
        <p className="text-xs font-bold text-ink uppercase tracking-wide">Test — {questions.length} ta savol</p>
        {allAnswered && (
          <span className="text-xs font-semibold text-accent">
            {correctCount}/{questions.length} to'g'ri
          </span>
        )}
      </div>

      <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
        {questions.map((q, qIndex) => {
          const selected = answers[qIndex];
          const isAnswered = selected != null;
          return (
            <div key={qIndex} className="px-4 py-3">
              <p className="text-sm font-semibold text-ink mb-2">
                {qIndex + 1}. {q.prompt}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt) => {
                  const isCorrectOpt = opt === q.answer;
                  const isSelectedOpt = opt === selected;
                  let tone = 'border-border hover:border-accent/40 text-ink';
                  if (isAnswered && isCorrectOpt) tone = 'border-success bg-success-soft text-success';
                  else if (isAnswered && isSelectedOpt && !isCorrectOpt) tone = 'border-danger bg-danger-soft text-danger';

                  return (
                    <button
                      key={opt}
                      onClick={() => selectOption(qIndex, opt)}
                      disabled={isAnswered}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm text-left transition-colors disabled:cursor-default ${tone}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrectOpt && <Check size={14} className="flex-shrink-0" />}
                      {isAnswered && isSelectedOpt && !isCorrectOpt && <X size={14} className="flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {isAnswered && q.explanation && (
                <p className="mt-2 text-xs text-muted bg-bg rounded-lg px-3 py-2">{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <div className="px-4 py-2.5 border-t border-border">
          <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
            <RotateCcw size={12} /> Qaytadan boshlash
          </button>
        </div>
      )}
    </div>
  );
}
