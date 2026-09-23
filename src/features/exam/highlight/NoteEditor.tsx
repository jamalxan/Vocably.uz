'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clampToViewport } from './HighlightMenu';

// TZ-vocably-v2.md §6.3 — "Eslatma: kichik popup, matn kiritiladi." `x`/`y`
// — ekran koordinatasi (HighlightMenu bilan bir xil pozitsiyalash yondashuvi).
export interface NoteEditorProps {
  x: number;
  y: number;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export default function NoteEditor({ x, y, initialNote, onSave, onClose }: NoteEditorProps) {
  const [text, setText] = useState(initialNote);
  const ref = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<Element | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    setPos(clampToViewport(x, y, el.offsetWidth, el.offsetHeight));
  }, [x, y]);

  useEffect(() => {
    if (!boxRef.current?.contains(document.activeElement)) returnFocusRef.current = document.activeElement;
    ref.current?.focus({ preventScroll: true });
  }, []);

  // Yopilganda fokus eslatma ochilgan joyga (odatda belgi — <mark>) qaytadi.
  const close = () => {
    const prev = returnFocusRef.current;
    if (prev instanceof HTMLElement && prev.isConnected && prev !== document.body) prev.focus({ preventScroll: true });
    onClose();
  };

  const save = () => {
    onSave(text.trim());
    close();
  };

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-label="Eslatma"
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 50,
        background: 'var(--exam-bg)',
        border: '1px solid var(--exam-chrome-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,.18)',
        borderRadius: 8,
        padding: 10,
        width: 240,
        maxWidth: 'calc(100vw - 16px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close();
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
        }}
        maxLength={500}
        rows={3}
        placeholder="Eslatma yozing..."
        aria-label="Eslatma matni"
        className="w-full text-base p-2 rounded outline-none resize-none focus-visible:shadow-[var(--exam-focus-ring)]"
        style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)', background: 'var(--exam-bg)' }}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={close}
          className="text-xs px-3 md:px-2 min-h-11 md:min-h-0 md:py-1 rounded focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ color: 'var(--exam-muted)' }}
        >
          Bekor qilish
        </button>
        <button
          type="button"
          onClick={save}
          className="text-xs px-3 md:px-2.5 min-h-11 md:min-h-0 md:py-1 rounded font-semibold text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ background: 'var(--exam-accent)' }}
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}
