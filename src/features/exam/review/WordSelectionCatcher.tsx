'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AddWordModal from './AddWordModal';

// TZ-vocably-v2.md §11.3 — "Matnda uchragan qiyin so'zlarni ajratib,
// 'Lug'atga qo'shish' tugmasi". SODDALASHTIRISH: TZ so'zlarni AVTOMATIK
// "qiyin" deb belgilab ajratishni nazarda tutadi (masalan CEFR darajasi
// bo'yicha) — bu yerda buning o'rniga foydalanuvchining o'zi matndan
// (passage/transkript, review ekranida) istalgan so'zni TANLAYDI (ikki
// marta bosish yoki belgilash), shunda tanlov ustida "+ Lug'atga qo'shish"
// tugmasi chiqadi. Natija — bir xil imkoniyat, kamroq murakkablik (CEFR
// tahlili/pre-highlighting kerak emas), va foydalanuvchi nazorati ko'proq
// (faqat AI "qiyin" deb hisoblagan so'zlar bilan cheklanmaydi).
const WORD_RE = /^[A-Za-z][A-Za-z'-]{1,39}$/;

export default function WordSelectionCatcher({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{ word: string; context: string; x: number; y: number } | null>(null);
  const [modalWord, setModalWord] = useState<{ word: string; context: string } | null>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPopover(null);
        return;
      }
      const text = sel.toString().trim();
      if (!WORD_RE.test(text)) {
        setPopover(null);
        return;
      }
      const anchor = sel.anchorNode;
      if (!anchor || !containerRef.current?.contains(anchor)) {
        setPopover(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      const context = (anchor.textContent || '').slice(0, 300);
      setPopover({ word: text, context, x: rect.left + rect.width / 2, y: rect.top });
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {popover && (
        <button
          style={{ position: 'fixed', left: popover.x, top: Math.max(popover.y - 38, 4), transform: 'translateX(-50%)' }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setModalWord({ word: popover.word, context: popover.context });
            setPopover(null);
            window.getSelection()?.removeAllRanges();
          }}
          className="z-40 flex items-center gap-1 px-2.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-card"
        >
          <Plus size={12} /> Lug&apos;atga qo&apos;shish
        </button>
      )}

      {modalWord && (
        <AddWordModal word={modalWord.word} context={modalWord.context} onClose={() => setModalWord(null)} />
      )}
    </div>
  );
}
