'use client';
import { Headphones, BookOpen, PenLine, AlertTriangle, Loader2 } from 'lucide-react';
import type { TestPreview } from '../state/attemptsApi';

// TZ-vocably-v2.md §9.2 — Mock intro ekrani. "Bu yerda premium dizayn qiling"
// (§9.2 sarlavhasi) — imtihon HALI boshlanmagan, shuning uchun §5.1 qoidasi
// bo'yicha ilovaning o'z (Deep Merlot) uslubida, `[data-exam]` ICHIDA EMAS.
export interface IntroScreenProps {
  test: TestPreview;
  onStart: () => void;
  starting?: boolean;
}

function formatMinutes(sec: number): number {
  return Math.round(sec / 60);
}

export default function IntroScreen({ test, onStart, starting }: IntroScreenProps) {
  const { listening, reading, writing } = test.sections;
  const totalSec = (listening?.durationSec || 0) + (reading?.durationSec || 0) + (writing?.durationSec || 0);
  const totalMin = formatMinutes(totalSec);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bg px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-card border border-border p-6 sm:p-8">
        <h1 className="text-lg font-bold text-ink font-display">{test.title}</h1>
        <p className="text-xs uppercase tracking-wide text-muted mt-1">{test.module === 'academic' ? 'Academic' : 'General Training'}</p>

        <div className="mt-5 space-y-2.5">
          {listening && (
            <div className="flex items-center gap-3 text-sm">
              <Headphones size={16} className="text-accent flex-shrink-0" />
              <span className="text-ink">Listening</span>
              <span className="ml-auto text-muted tabular-nums">
                {formatMinutes(listening.durationSec)} daq · {listening.questionCount} savol
              </span>
            </div>
          )}
          {reading && (
            <div className="flex items-center gap-3 text-sm">
              <BookOpen size={16} className="text-accent flex-shrink-0" />
              <span className="text-ink">Reading</span>
              <span className="ml-auto text-muted tabular-nums">
                {formatMinutes(reading.durationSec)} daq · {reading.questionCount} savol
              </span>
            </div>
          )}
          {writing && (
            <div className="flex items-center gap-3 text-sm">
              <PenLine size={16} className="text-accent flex-shrink-0" />
              <span className="text-ink">Writing</span>
              <span className="ml-auto text-muted tabular-nums">
                {formatMinutes(writing.durationSec)} daq · {writing.taskCount} task
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm font-semibold">
          <span className="text-ink">Jami</span>
          <span className="text-ink tabular-nums">
            {Math.floor(totalMin / 60)} soat {totalMin % 60} daqiqa
          </span>
        </div>

        <div className="mt-5 space-y-1.5">
          {[
            "Boshlangandan keyin taymer to'xtamaydi.",
            "Bo'limlar orasida orqaga qaytib bo'lmaydi.",
            'Naushnik tayyorlang.',
          ].map((warning) => (
            <p key={warning} className="flex items-start gap-2 text-xs text-muted">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-warning" />
              {warning}
            </p>
          ))}
        </div>

        <button
          onClick={onStart}
          disabled={starting}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {starting && <Loader2 size={16} className="animate-spin" />}
          Imtihonni boshlash
        </button>
      </div>
    </div>
  );
}
