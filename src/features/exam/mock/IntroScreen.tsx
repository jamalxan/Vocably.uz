'use client';
import Link from 'next/link';
import { Headphones, BookOpen, PenLine, AlertTriangle, Loader2, Monitor, RotateCcw, ArrowLeft } from 'lucide-react';
import type { ActiveMockInfo, TestPreview } from '../state/attemptsApi';
import { useIsMobile } from '../state/useIsMobile';

// TZ-vocably-v2.md §9.2 — Mock intro ekrani. "Bu yerda premium dizayn qiling"
// (§9.2 sarlavhasi) — imtihon HALI boshlanmagan, shuning uchun §5.1 qoidasi
// bo'yicha ilovaning o'z (Deep Merlot) uslubida, `[data-exam]` ICHIDA EMAS.
export interface IntroScreenProps {
  test: TestPreview;
  onStart: (fresh?: boolean) => void;
  starting?: boolean;
  // VOCABLY-TZ.md §1.1/"Attempt boshqaruvi" auditi — bo'lmasa yo'q (yangi mock),
  // bor bo'lsa foydalanuvchiga aniq tanlov ko'rsatiladi: "Davom ettirish" yoki
  // eskisini bekor qilib chinakam yangi tasodifiy test bilan boshlash.
  resumeInfo?: ActiveMockInfo | null;
  // Boshlashda xato bo'lsa — intro o'rnida qoladi, tugmalar qayta urinish uchun ishlaydi.
  error?: string;
}

const SECTION_LABEL_UZ: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing' };

function formatMinutes(sec: number): number {
  return Math.round(sec / 60);
}

export default function IntroScreen({ test, onStart, starting, resumeInfo, error }: IntroScreenProps) {
  const { listening, reading, writing } = test.sections;
  const totalSec = (listening?.durationSec || 0) + (reading?.durationSec || 0) + (writing?.durationSec || 0);
  const totalMin = formatMinutes(totalSec);
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 z-40 bg-bg overflow-y-auto">
      {/* min-h-full + my-auto: karta ekrandan baland bo'lsa tepasi kesilmaydi, scroll qilinadi. */}
      <div className="min-h-full flex flex-col items-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md mb-2">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-medium text-muted hover:text-ink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={16} /> Bosh sahifa
          </Link>
        </div>
        <div className="my-auto w-full max-w-md bg-surface rounded-2xl shadow-card border border-border p-6 sm:p-8">
          {/* TZ §12.3 — "Mock rejimi telefonda: ruxsat bering, lekin ogohlantiring...
              Bloklamang; Uzbekistonda ko'p foydalanuvchi faqat telefonda." */}
          {isMobile && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2.5 bg-warning-soft rounded-lg text-xs text-ink">
              <Monitor size={15} className="flex-shrink-0 mt-0.5 text-warning" />
              Eng yaxshi tajriba uchun kompyuterdan foydalaning — mock imtihon telefonda ham ishlaydi, lekin split-ekran o'rniga tab rejimida.
            </div>
          )}

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

          {resumeInfo && (
            <div className="mt-5 flex items-start gap-2 px-3 py-2.5 bg-warning-soft rounded-lg text-xs text-ink">
              <RotateCcw size={15} className="flex-shrink-0 mt-0.5 text-warning" />
              Sizda tugallanmagan mock urinish bor ({SECTION_LABEL_UZ[resumeInfo.currentSection] || resumeInfo.currentSection} bo'limida). Davom ettirasizmi yoki yangi tasodifiy test bilan qaytadan boshlaysizmi?
            </div>
          )}

          {error && (
            <p role="alert" className="mt-5 px-3 py-2.5 rounded-lg bg-danger-soft text-danger text-xs font-medium">
              {error}
            </p>
          )}

          <button
            onClick={() => onStart(false)}
            disabled={starting}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:hover:bg-accent text-on-accent font-semibold rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {starting && <Loader2 size={16} className="animate-spin" />}
            {error ? 'Qayta urinish' : resumeInfo ? 'Davom ettirish' : 'Imtihonni boshlash'}
          </button>

          {resumeInfo && (
            <button
              onClick={() => onStart(true)}
              disabled={starting}
              className="mt-2.5 w-full min-h-11 flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-bg disabled:opacity-60 text-muted hover:text-ink font-medium rounded-lg text-xs transition-colors border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Yangi tasodifiy mock boshlash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
