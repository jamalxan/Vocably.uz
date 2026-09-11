'use client';
import { Volume2, Settings, HelpCircle, Monitor } from 'lucide-react';
import ExamTimer from './ExamTimer';

// TZ-vocably-v2.md §5.4 — ExamHeader (balandligi 56px).
// ┌──────────────────────────────────────────────────────────────────┐
// │ 👤 Ism · ID 0012345 │  ⏱ 42:17  │ 🔊──── ⚙ ? 🖥 │
// └──────────────────────────────────────────────────────────────────┘
//   chap (nom + ID)              markaz (taymer)    o'ng (boshqaruv)
export interface ExamHeaderProps {
  candidateName: string;
  candidateId: string;
  remainingSec: number;
  timerHidden: boolean;
  onToggleTimerHidden: () => void;
  onThresholdCrossed?: (message: string) => void;
  showVolume?: boolean;
  volume?: number;
  onVolumeChange?: (v: number) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export default function ExamHeader({
  candidateName,
  candidateId,
  remainingSec,
  timerHidden,
  onToggleTimerHidden,
  onThresholdCrossed,
  showVolume = false,
  volume = 1,
  onVolumeChange,
  onOpenSettings,
  onOpenHelp,
}: ExamHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 h-14 flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b"
      style={{ background: 'var(--exam-chrome)', borderColor: 'var(--exam-chrome-border)' }}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2 text-[13px]" style={{ color: 'var(--exam-muted)' }}>
        <span className="truncate font-medium" style={{ color: 'var(--exam-text)' }}>
          {candidateName}
        </span>
        <span className="hidden sm:inline">· ID {candidateId}</span>
      </div>

      <div className="flex-shrink-0">
        <ExamTimer remainingSec={remainingSec} hidden={timerHidden} onThresholdCrossed={onThresholdCrossed} />
      </div>

      <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
        {showVolume && (
          <div className="hidden sm:flex items-center gap-1.5" style={{ color: 'var(--exam-muted)' }}>
            <Volume2 size={16} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange?.(Number(e.target.value))}
              className="w-20 accent-[var(--exam-accent)]"
              aria-label="Ovoz balandligi"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Sozlamalar"
          title="Sozlamalar"
          className="p-2 rounded-lg hover:bg-black/5"
          style={{ color: 'var(--exam-muted)' }}
        >
          <Settings size={18} />
        </button>
        <button
          type="button"
          onClick={onOpenHelp}
          aria-label="Yordam"
          title="Yordam"
          className="p-2 rounded-lg hover:bg-black/5"
          style={{ color: 'var(--exam-muted)' }}
        >
          <HelpCircle size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleTimerHidden}
          aria-label={timerHidden ? 'Taymerni ko’rsatish' : 'Taymerni yashirish'}
          title={timerHidden ? "Taymerni ko'rsatish" : 'Taymerni yashirish'}
          className="p-2 rounded-lg hover:bg-black/5"
          style={{ color: 'var(--exam-muted)' }}
        >
          <Monitor size={18} />
        </button>
      </div>
    </header>
  );
}
