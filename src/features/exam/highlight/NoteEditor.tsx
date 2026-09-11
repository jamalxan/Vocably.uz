'use client';
import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const save = () => {
    onSave(text.trim());
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 50,
        background: 'var(--exam-bg)',
        border: '1px solid var(--exam-chrome-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,.18)',
        borderRadius: 8,
        padding: 10,
        width: 240,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
        }}
        maxLength={500}
        rows={3}
        placeholder="Eslatma yozing..."
        className="w-full text-sm p-2 rounded outline-none resize-none"
        style={{ border: '1px solid var(--exam-input-border)', color: 'var(--exam-text)', background: 'var(--exam-bg)' }}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--exam-muted)' }}>
          Bekor qilish
        </button>
        <button
          onClick={save}
          className="text-xs px-2.5 py-1 rounded font-semibold text-white"
          style={{ background: 'var(--exam-accent)' }}
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}
