'use client';
import { useRef } from 'react';
import EditorToolbar from './EditorToolbar';
import WordCounter from './WordCounter';

// TZ-vocably-v2.md §8.2/§8.3 — Writing muharriri.
//   "Spellcheck qat'iy o'chirilgan — haqiqiy imtihonda yo'q. Bu kelishuvsiz talab."
//   "Grammarly kabi extension'lar data-gramm=false bilan bloklanadi."
//   "Task promptidan nusxa olish bloklanadi (onCopy → preventDefault chap panelda)"
//     — BU YERDA EMAS, TaskPane.tsx'da (chap panel); bu — o'ng panel (editor),
//     bu yerda copy/cut/paste ATAYLAB ISHLAYDI (foydalanuvchi o'z matnini
//     tahrirlaydi).
export interface EssayEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  wordCount: number;
  minWords: number;
}

export default function EssayEditor({ text, onTextChange, wordCount, minWords }: EssayEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applySelection = (nextValue: string, nextSelectionStart: number) => {
    onTextChange(nextValue);
    // Kursorni to'g'ri joyga qaytarish uchun — React controlled input bir
    // martalik render'dan keyin qiymatni almashtiradi, shuning uchun
    // selectionni keyingi tikda o'rnatamiz.
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.setSelectionRange(nextSelectionStart, nextSelectionStart);
    });
  };

  const handleCopy = async () => {
    const el = textareaRef.current;
    if (!el) return;
    const selected = text.slice(el.selectionStart, el.selectionEnd) || text;
    try {
      await navigator.clipboard.writeText(selected);
    } catch {
      // Clipboard ruxsati yo'q — Ctrl+C baribir ishlayveradi, bu tugma faqat qulaylik.
    }
  };

  const handleCut = async () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return handleCopy();
    const selected = text.slice(start, end);
    try {
      await navigator.clipboard.writeText(selected);
      applySelection(text.slice(0, start) + text.slice(end), start);
    } catch {
      // ruxsat yo'q — hech narsa o'chirmaymiz, faqat Ctrl+X'ga tayanamiz.
    }
  };

  const handlePaste = async () => {
    const el = textareaRef.current;
    if (!el) return;
    try {
      const clip = await navigator.clipboard.readText();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = text.slice(0, start) + clip + text.slice(end);
      applySelection(next, start + clip.length);
    } catch {
      // ruxsat yo'q — Ctrl+V baribir ishlayveradi.
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--exam-bg)' }}>
      <EditorToolbar onCut={handleCut} onCopy={handleCopy} onPaste={handlePaste} />
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        aria-label="Insho matni"
        className="flex-1 min-h-0 w-full resize-none outline-none focus-visible:shadow-[inset_var(--exam-focus-ring)]"
        style={{ padding: 20, fontSize: 16, lineHeight: 1.7, color: 'var(--exam-text)', background: 'transparent' }}
      />
      <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: 'var(--exam-chrome-border)' }}>
        <WordCounter wordCount={wordCount} minWords={minWords} />
      </div>
    </div>
  );
}
