'use client';
import { Mic, MicOff, Loader2, RotateCcw } from 'lucide-react';

// VOCABLY_TZ_FINAL...2026-09-20.md task item 4 — "Basic device/mic check
// before Speaking mock". Ilgari mikrofon ruxsati FAQAT birinchi yozib olish
// bosilganda so'ralardi (RecordingPane.tsx#startRecording) — foydalanuvchi
// butun Speaking oqimini (savollar, cue card) ko'rib chiqqandan KEYIN, birinchi
// "Yozishni boshlash" bosganda kutilmaganda "ruxsat yo'q" bilan to'qnashardi.
// Bu ekran ATAYLAB MINIMAL — waveform/level-meter YO'Q (task talabi), faqat
// ruxsat gate: SpeakingSection shu holat 'ok' bo'lmaguncha savol/recording
// UI'ni umuman mount qilmaydi.
export type MicCheckStatus = 'checking' | 'ok' | 'denied';

export interface MicCheckProps {
  status: MicCheckStatus;
  onRetry: () => void;
}

export default function MicCheck({ status, onRetry }: MicCheckProps) {
  return (
    <div data-exam="" className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: status === 'denied' ? 'var(--exam-danger-soft, rgba(220,38,38,0.1))' : 'var(--exam-answered-bg)',
          color: status === 'denied' ? 'var(--exam-danger)' : 'var(--exam-answered)',
        }}
      >
        {status === 'checking' && <Loader2 size={28} className="animate-spin" aria-hidden="true" />}
        {status === 'ok' && <Mic size={28} aria-hidden="true" />}
        {status === 'denied' && <MicOff size={28} aria-hidden="true" />}
      </div>

      {status === 'checking' && (
        <p className="text-sm" role="status" style={{ color: 'var(--exam-muted)' }}>
          Mikrofon tekshirilmoqda...
        </p>
      )}

      {status === 'ok' && (
        <p className="text-sm font-semibold" role="status" style={{ color: 'var(--exam-text)' }}>
          Mikrofon aniqlandi ✓
        </p>
      )}

      {status === 'denied' && (
        <>
          <p className="text-sm font-semibold" role="alert" style={{ color: 'var(--exam-danger)' }}>
            Mikrofonga ruxsat kerak
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--exam-muted)' }}>
            Speaking bo&apos;limi uchun mikrofon ruxsati zarur. Manzil satridagi qulf belgisini bosib ruxsat bering, so&apos;ng qayta urinib ko&apos;ring.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-lg text-sm font-semibold text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
            style={{ background: 'var(--exam-accent)' }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Qayta urinish
          </button>
        </>
      )}
    </div>
  );
}
