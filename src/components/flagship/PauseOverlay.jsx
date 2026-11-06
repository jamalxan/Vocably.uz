'use client';
import { Loader2, Play, Square, WifiOff } from 'lucide-react';

// Pause / finishing overlay of the typing games. It covers the whole stage. While paused it is a
// modal dialog: focus starts on Resume and Tab / Shift+Tab cycle inside it, so keyboard focus never
// lands on the covered game or on the page behind the stage.

/** Keeps Tab / Shift+Tab inside the dialog (wraps from the last button to the first and back). */
export function trapTab(e) {
  if (e.key !== 'Tab') return;
  const items = Array.from(e.currentTarget.querySelectorAll('button:not([disabled])'));
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey ? active === first || !items.includes(active) : active === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}

const BUTTON = 'min-h-12 px-6 rounded-2xl inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a18]';

export default function PauseOverlay({ idPrefix, finishing, offline, c, onResume, onEnd }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#070a18]/95 backdrop-blur-sm px-6">
      {finishing ? (
        <Loader2 className="w-8 h-8 animate-spin text-white" aria-label={c.loading} />
      ) : (
        <div className="w-full max-w-xs text-center" role="dialog" aria-modal="true" aria-labelledby={`${idPrefix}-pause-h`} onKeyDown={trapTab}>
          {offline && <WifiOff className="mx-auto mb-2 text-amber-300" size={28} aria-hidden="true" />}
          <p id={`${idPrefix}-pause-h`} className="text-xl font-bold">{c.paused}</p>
          {offline && <p className="mt-2 text-sm text-white/75">{c.offlinePause}</p>}
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={onResume} autoFocus className={`${BUTTON} font-bold bg-accent text-on-accent`}>
              <Play size={18} aria-hidden="true" /> {c.resume}
            </button>
            <button type="button" onClick={onEnd} className={`${BUTTON} font-semibold border border-white/25 hover:border-white/50`}>
              <Square size={15} aria-hidden="true" /> {c.endRound}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
