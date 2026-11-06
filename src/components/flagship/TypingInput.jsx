'use client';
import { CornerDownLeft } from 'lucide-react';
import { TYPED_MAX } from '@/lib/flagship/typing';

// The one text field of the typing games. A real <input> so phone keyboards work (no keydown
// tricks): Enter / the keyboard's "Go" key submits the form, Space is a character (phrasal verbs).
// The submit button never takes focus, so the on-screen keyboard stays open between words. Paste and
// drop are blocked: it is a typing game (and pasting a revealed answer would skip the practice).

export default function TypingInput({ inputRef, value, onChange, onSubmit, onKeyDown, disabled, label, submitLabel, placeholder, tone = 'idle', SubmitIcon = CornerDownLeft }) {
  const ring = tone === 'ok' ? 'border-emerald-400 ring-2 ring-emerald-400/40' : tone === 'bad' ? 'border-rose-400 ring-2 ring-rose-400/40' : 'border-white/25 focus-within:border-white/70';
  return (
    <form
      className="flex items-stretch gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <label className={`flex-1 min-w-0 rounded-2xl border-2 bg-white/10 transition-colors ${ring}`}>
        <span className="sr-only">{label}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, TYPED_MAX))}
          onKeyDown={onKeyDown}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          disabled={disabled}
          type="text"
          inputMode="text"
          enterKeyHint="go"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={TYPED_MAX}
          placeholder={placeholder}
          className="w-full min-h-14 bg-transparent px-4 text-xl font-bold font-word text-white placeholder:text-white/40 placeholder:font-normal placeholder:text-base outline-none disabled:opacity-50"
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        aria-label={submitLabel}
        onPointerDown={(e) => e.preventDefault()}
        className="shrink-0 min-h-14 min-w-14 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center hover:bg-accent-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <SubmitIcon size={22} aria-hidden="true" />
      </button>
    </form>
  );
}

/**
 * Stage-level mousedown guard: a tap on the scene, the HUD or the prompt must not take focus from
 * the text field (that would close the phone keyboard mid-round). The field, its label and the
 * pause dialog keep their default behaviour; buttons fire their click either way.
 */
export function keepTypingFocus(e) {
  if (e.target.closest?.('input, label, [role="dialog"]')) return;
  e.preventDefault();
}

/**
 * Letter boxes for easy/medium questions: the length (and on easy the first letter) of the answer.
 * `compact` (short screens, e.g. a phone with the keyboard open) shows the same hint as one line of text.
 */
export function LetterSlots({ slots, typed, label, compact = false }) {
  if (!slots) return null;
  if (compact) return <p className="mt-0.5 text-[11px] font-semibold text-[#0b1020]/70">{label}</p>;
  const chars = Array.from(typed || '');
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-1" role="img" aria-label={label}>
      {Array.from({ length: slots.length }, (_, i) => {
        const ch = chars[i];
        const hinted = !ch && i === 0 && slots.first;
        return (
          <span
            key={i}
            className={`w-6 h-8 sm:w-7 sm:h-9 rounded-md border-b-[3px] grid place-items-center text-base sm:text-lg font-bold font-word uppercase ${ch ? 'border-accent text-[#0b1020]' : 'border-[#0b1020]/50 text-[#0b1020]/60'}`}
            aria-hidden="true"
          >
            {ch && ch !== ' ' ? ch : hinted ? slots.first : ch === ' ' ? '·' : ''}
          </span>
        );
      })}
      {chars.length > slots.length && <span className="self-end text-xs font-bold text-rose-600" aria-hidden="true">+{chars.length - slots.length}</span>}
    </div>
  );
}
