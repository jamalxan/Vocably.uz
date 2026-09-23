'use client';
import Link from 'next/link';
import { Loader2, RotateCcw } from 'lucide-react';

// Bo'lim komponentlari uchun umumiy yuklanish / xatolik holatlari. Hammasi
// `[data-exam]` palitrasida (imtihon ekrani doim och rangda, §5.2).
export function ExamLoading({ label = 'Yuklanmoqda...' }: { label?: string }) {
  return (
    <div
      data-exam=""
      role="status"
      className="min-h-dvh flex items-center justify-center gap-2 px-6 text-sm"
      style={{ color: 'var(--exam-muted)' }}
    >
      <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      {label}
    </div>
  );
}

// Urinish umuman yuklanmagan holat (test yo'q) — sahifani qayta yuklash yoki chiqish.
export function ExamLoadError({ message, backHref = '/app/mashq' }: { message: string; backHref?: string }) {
  return (
    <div data-exam="" className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm" role="alert" style={{ color: 'var(--exam-danger)' }}>
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-lg text-sm font-semibold text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ background: 'var(--exam-accent)' }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Qayta urinish
        </button>
        <Link
          href={backHref}
          className="inline-flex items-center min-h-11 px-4 rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ border: '1px solid var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          Mashq bo&apos;limiga
        </Link>
      </div>
    </div>
  );
}

// Yakunlash (submit) xatosi — imtihon ekrani (va audio) o'chirilmaydi, faqat
// yuqorida qayta urinish tugmali ogohlantirish ko'rsatiladi.
export function SubmitErrorBanner({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying?: boolean }) {
  return (
    <div
      role="alert"
      className="fixed left-1/2 top-16 z-[75] -translate-x-1/2 w-[calc(100%-2rem)] max-w-md flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg"
      style={{ background: 'var(--exam-bg)', borderColor: 'var(--exam-danger)', color: 'var(--exam-text)' }}
    >
      <p className="flex-1 min-w-0 text-sm break-words" style={{ color: 'var(--exam-danger)' }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="flex-shrink-0 inline-flex items-center gap-1.5 min-h-11 md:min-h-9 px-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
        style={{ background: 'var(--exam-accent)' }}
      >
        {retrying ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
        Qayta urinish
      </button>
    </div>
  );
}
