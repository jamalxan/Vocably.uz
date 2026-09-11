'use client';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useExamStore } from '../state/examStore';
import ExamHeader from './ExamHeader';
import ExamFooterNav, { type QuestionGroupNav } from './ExamFooterNav';
import SettingsPanel from './SettingsPanel';
import HelpDialog from './HelpDialog';

// TZ-vocably-v2.md §2/§5 — bitta umumiy qobiq, barcha bo'lim modullari
// (Reading/Listening/Writing) shu ichiga joylashadi. §5.1 qoidasi: bu ekran
// ATAYLAB neytral (Deep Merlot faqat aksent) — dark mode YO'Q, premium bezak
// YO'Q, chunki maqsad haqiqiy IELTS CD interfeysiga o'rganish.
export interface ExamShellProps {
  candidateName: string;
  candidateId: string;
  showVolume?: boolean;
  volume?: number;
  onVolumeChange?: (v: number) => void;
  footerGroups?: QuestionGroupNav[];
  onSubmit?: () => void;
  submitLabel?: string;
  children: ReactNode;
}

interface ToastItem {
  id: number;
  message: string;
}

export default function ExamShell({
  candidateName,
  candidateId,
  showVolume,
  volume,
  onVolumeChange,
  footerGroups,
  onSubmit,
  submitLabel,
  children,
}: ExamShellProps) {
  const remainingSec = useExamStore((s) => s.remainingSec);
  const timerHidden = useExamStore((s) => s.timerHidden);
  const toggleTimerHidden = useExamStore((s) => s.toggleTimerHidden);
  const fontSize = useExamStore((s) => s.fontSize);
  const setFontSize = useExamStore((s) => s.setFontSize);
  const highContrast = useExamStore((s) => s.highContrast);
  const toggleHighContrast = useExamStore((s) => s.toggleHighContrast);
  const answers = useExamStore((s) => s.answers);
  const flagged = useExamStore((s) => s.flagged);
  const currentQuestion = useExamStore((s) => s.currentQuestion);
  const goToQuestion = useExamStore((s) => s.goToQuestion);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message: string) => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <div
      data-exam=""
      data-exam-contrast={highContrast ? 'high' : undefined}
      className="fixed inset-0 z-40 flex flex-col"
      style={{ fontSize: `${fontSize}px` }}
    >
      <ExamHeader
        candidateName={candidateName}
        candidateId={candidateId}
        remainingSec={remainingSec}
        timerHidden={timerHidden}
        onToggleTimerHidden={toggleTimerHidden}
        onThresholdCrossed={pushToast}
        showVolume={showVolume}
        volume={volume}
        onVolumeChange={onVolumeChange}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

      {footerGroups && footerGroups.length > 0 && (
        <ExamFooterNav
          groups={footerGroups}
          answers={answers}
          flagged={flagged}
          currentQuestion={currentQuestion}
          onGoTo={goToQuestion}
          onSubmit={() => onSubmit?.()}
          submitLabel={submitLabel}
        />
      )}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={toggleHighContrast}
        timerHidden={timerHidden}
        onToggleTimerHidden={toggleTimerHidden}
      />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* §5.4 taymer ogohlantirishlari — aria-live ExamTimer ichida, bu yerda
          faqat vizual banner. */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white"
            style={{ background: 'var(--exam-text)' }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
