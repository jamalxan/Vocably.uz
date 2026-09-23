'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ExamFontSize } from '../state/examStore';
import { useDialogFocus } from '../state/useDialogFocus';
import { EXAM_ICON_BTN } from './ExamHeader';

// TZ-vocably-v2.md §5.7 — Sozlamalar paneli:
//   Matn o'lchami:   [A-]  16px  [A+]        (16 / 18 / 20 / 22)
//   Yuqori kontrast: [  ○──]                 (off / on)
//   Taymer:          [──○  ]                 (ko'rsatish / yashirish)
// localStorage'da saqlanadi (examStore.ts o'zi qiladi) va keyingi urinishda tiklanadi.
const FONT_SIZES: ExamFontSize[] = [16, 18, 20, 22];

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  fontSize: ExamFontSize;
  onFontSizeChange: (size: ExamFontSize) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  timerHidden: boolean;
  onToggleTimerHidden: () => void;
}

export default function SettingsPanel({
  open,
  onClose,
  fontSize,
  onFontSizeChange,
  highContrast,
  onToggleHighContrast,
  timerHidden,
  onToggleTimerHidden,
}: SettingsPanelProps) {
  // §13 — "Butun imtihon sichqonchasiz o'tilishi kerak": QuestionSheet'da
  // allaqachon bor Escape-yopish naqshi shu yerda va HelpDialog'da yo'q edi
  // (faqat orqa fonga bosish orqali yopilardi) — endi izchil.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);
  const dialogRef = useDialogFocus<HTMLDivElement>(open);

  if (!open) return null;

  const sizeIdx = FONT_SIZES.indexOf(fontSize);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/20" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-settings-title"
        onClick={(e) => e.stopPropagation()}
        className="mt-14 mr-4 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-4.5rem)] overflow-y-auto rounded-lg border shadow-lg p-4 space-y-4"
        style={{ background: 'var(--exam-bg)', borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
      >
        <div className="flex items-center justify-between">
          <h2 id="exam-settings-title" className="text-sm font-semibold">Sozlamalar</h2>
          <button type="button" onClick={onClose} aria-label="Yopish" className={`${EXAM_ICON_BTN} w-11 h-11 -m-2.5`}>
            <X size={16} />
          </button>
        </div>

        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--exam-muted)' }}>
            Matn o'lchami
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFontSizeChange(FONT_SIZES[Math.max(0, sizeIdx - 1)])}
              disabled={sizeIdx <= 0}
              aria-label="Matnni kichraytirish"
              className="w-11 h-11 md:w-9 md:h-9 rounded border disabled:opacity-30 font-bold text-xs"
              style={{ borderColor: 'var(--exam-input-border)' }}
            >
              A-
            </button>
            <span className="flex-1 text-center text-sm tabular-nums">{fontSize}px</span>
            <button
              type="button"
              onClick={() => onFontSizeChange(FONT_SIZES[Math.min(FONT_SIZES.length - 1, sizeIdx + 1)])}
              disabled={sizeIdx >= FONT_SIZES.length - 1}
              aria-label="Matnni kattalashtirish"
              className="w-11 h-11 md:w-9 md:h-9 rounded border disabled:opacity-30 font-bold text-sm"
              style={{ borderColor: 'var(--exam-input-border)' }}
            >
              A+
            </button>
          </div>
        </div>

        <label className="flex items-center justify-between min-h-11 md:min-h-9 text-sm cursor-pointer">
          <span>Yuqori kontrast</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={onToggleHighContrast}
            className="w-5 h-5 accent-[var(--exam-accent)]"
          />
        </label>

        <label className="flex items-center justify-between min-h-11 md:min-h-9 text-sm cursor-pointer">
          <span>Taymerni yashirish</span>
          <input
            type="checkbox"
            checked={timerHidden}
            onChange={onToggleTimerHidden}
            className="w-5 h-5 accent-[var(--exam-accent)]"
          />
        </label>
      </div>
    </div>
  );
}
