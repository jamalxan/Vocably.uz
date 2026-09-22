'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useExamStore } from '../state/examStore';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, submitAttempt, gradeWriting } from '../state/attemptsApi';
import TaskPane from './TaskPane';
import EssayEditor from './EssayEditor';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';

// VOCABLY_TZ_FINAL...2026-09-20.md "Writing" §"Exam UI": "note area
// practice'da" — bu komponentning yagona haqiqiy yangi qismi (qolgani
// WritingSection.tsx bilan bir xil TaskPane/EssayEditor/submit+gradeWriting
// oqimini qayta ishlatadi, faqat ExamShell/taymer/mock-tartib YO'Q). Qoralama
// ATAYLAB serverga YOZILMAYDI — faqat localStorage (bir qurilmada saqlanadi,
// attemptId bo'yicha kalitlangan) — bu backend schema/autosave infratuzilmasi
// qo'shishni talab qilmaydigan, past xavfli yechim (`examStore.ts`dagi
// `readStored`/`writeStored` bilan bir xil naqsh).
function notesStorageKey(attemptId: string): string {
  return `exam.practice.notes.${attemptId}`;
}

function readNotes(attemptId: string): { task1: string; task2: string } {
  if (typeof window === 'undefined') return { task1: '', task2: '' };
  try {
    const raw = localStorage.getItem(notesStorageKey(attemptId));
    if (!raw) return { task1: '', task2: '' };
    const parsed = JSON.parse(raw);
    return { task1: String(parsed?.task1 || ''), task2: String(parsed?.task2 || '') };
  } catch {
    return { task1: '', task2: '' };
  }
}

function writeNotes(attemptId: string, notes: { task1: string; task2: string }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(notesStorageKey(attemptId), JSON.stringify(notes));
  } catch {
    // Xususiy rejim yoki kvota to'lgan — jimgina o'tkazib yuboramiz, qoralama shu sessiyada ishlayveradi.
  }
}

export interface WritingPracticeSectionProps {
  attemptId: string;
  onSubmitted: (result: AttemptResult | null) => void;
}

export default function WritingPracticeSection({ attemptId, onSubmitted }: WritingPracticeSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<{ task1: string; task2: string }>({ task1: '', task2: '' });

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const essays = useExamStore((s) => s.essays);
  const activeWritingTask = useExamStore((s) => s.activeWritingTask);
  const setActiveWritingTask = useExamStore((s) => s.setActiveWritingTask);
  const setEssayText = useExamStore((s) => s.setEssayText);

  useAutosave(attemptId);

  useEffect(() => {
    setNotes(readNotes(attemptId));
  }, [attemptId]);

  const updateNote = useCallback(
    (task: 1 | 2, text: string) => {
      setNotes((prev) => {
        const next = { ...prev, [`task${task}`]: text };
        writeNotes(attemptId, next);
        return next;
      });
    },
    [attemptId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAttempt(attemptId);
        if (cancelled) return;
        if (data.attempt.status !== 'in_progress') {
          onSubmitted(data.attempt.result);
          return;
        }
        setTest(data.test);
        init({
          attemptId,
          mode: 'practice',
          section: 'writing',
          answers: data.attempt.answers,
          flagged: data.attempt.flagged,
          currentQuestion: 0,
          endsAt: new Date(data.endsAt).getTime(),
          serverNow: new Date(data.serverNow).getTime(),
          essays: data.attempt.essays,
        });
      } catch {
        if (!cancelled) setLoadError("Urinishni yuklab bo'lmadi.");
      }
    })();
    return () => {
      cancelled = true;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // §8.5 — submit'dan keyin DARHOL grade-writing (WritingSection.tsx bilan
  // bir xil naqsh — AI vaqtincha ishlamasa ham submit natijasi saqlangan bo'ladi).
  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await useExamStore.getState().syncNow();
      const { result: submitResult } = await submitAttempt(attemptId);
      try {
        const { result: gradedResult } = await gradeWriting(attemptId);
        onSubmitted(gradedResult);
      } catch {
        onSubmitted(submitResult);
      }
    } catch {
      setLoadError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
      setSubmitting(false);
    }
  }, [attemptId, submitting, onSubmitted]);

  if (loadError) {
    return <div className="p-8 text-center text-sm text-danger">{loadError}</div>;
  }
  if (!test?.sections.writing) {
    return <div className="p-8 text-center text-sm text-muted">Yuklanmoqda...</div>;
  }

  const [task1, task2] = test.sections.writing.tasks;
  const activeTask = activeWritingTask === 1 ? task1 : task2;
  const activeEssay = activeWritingTask === 1 ? essays.task1 : essays.task2;
  const activeNote = activeWritingTask === 1 ? notes.task1 : notes.task2;

  return (
    <div data-exam="" className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Writing — mashq</p>
          <p className="text-sm text-muted mt-0.5">Vaqt cheklanmagan — qoralama yozib olishingiz mumkin</p>
        </div>
        <button
          type="button"
          onClick={doSubmit}
          disabled={submitting}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Yakunlash
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2].map((n) => {
          const isActive = activeWritingTask === n;
          const wc = n === 1 ? essays.task1.wordCount : essays.task2.wordCount;
          const min = n === 1 ? task1.minWords : task2.minWords;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setActiveWritingTask(n as 1 | 2)}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
              style={{
                background: isActive ? 'var(--exam-accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--exam-text)',
                border: isActive ? 'none' : '1px solid var(--exam-chrome-border)',
              }}
            >
              Task {n}
              {wc >= min && <Check size={14} />}
            </button>
          );
        })}
      </div>

      <TaskPane task={activeTask} />

      <div className="h-[45vh] rounded-xl border overflow-hidden" style={{ borderColor: 'var(--exam-chrome-border)' }}>
        <EssayEditor
          text={activeEssay.text}
          onTextChange={(text) => setEssayText(activeWritingTask, text)}
          wordCount={activeEssay.wordCount}
          minWords={activeTask.minWords}
        />
      </div>

      <details className="border rounded-xl p-3" style={{ borderColor: 'var(--exam-chrome-border)' }}>
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--exam-muted)' }}>
          Qoralama — faqat shu qurilmada saqlanadi, serverga yuborilmaydi
        </summary>
        <textarea
          value={activeNote}
          onChange={(e) => updateNote(activeWritingTask, e.target.value)}
          placeholder="Reja, kalit so'zlar, argumentlar..."
          className="w-full mt-2 resize-y min-h-[100px] outline-none text-sm"
          style={{ color: 'var(--exam-text)', background: 'transparent' }}
        />
      </details>
    </div>
  );
}
