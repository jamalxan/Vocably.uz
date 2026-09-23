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

// Popover tugmasining taxminiy yarim kengligi + chekka oralig'i (ekrandan chiqib ketmasin).
const POPOVER_HALF_WIDTH = 90;

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
      const centerX = rect.left + rect.width / 2;
      const x = Math.min(Math.max(centerX, POPOVER_HALF_WIDTH), window.innerWidth - POPOVER_HALF_WIDTH);
      setPopover({ word: text, context, x, y: rect.top });
    };
    // Scroll/resize'da tugma eski joyida osilib qolmasin — yashiriladi (capture: ichki scroll ham).
    const hide = () => setPopover(null);
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, []);

  const openModal = () => {
    if (!popover) return;
    setModalWord({ word: popover.word, context: popover.context });
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={containerRef} className="relative">
      {children}

      {popover && (
        <button
          type="button"
          style={{ position: 'fixed', left: popover.x, top: Math.max(popover.y - 50, 4), transform: 'translateX(-50%)' }}
          onMouseDown={(e) => e.preventDefault()}
          // Teginishda tanlov yo'qolib, tugma click'dan oldin unmount bo'lmasligi uchun pointerdown'da ochiladi.
          onPointerDown={(e) => {
            e.preventDefault();
            openModal();
          }}
          onClick={openModal}
          className="z-40 flex items-center gap-1.5 min-h-10 px-3 py-2 bg-accent hover:bg-accent-hover text-on-accent text-sm font-semibold rounded-lg shadow-card whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Plus size={14} aria-hidden="true" /> Lug&apos;atga qo&apos;shish
        </button>
      )}

      {modalWord && (
        <AddWordModal word={modalWord.word} context={modalWord.context} onClose={() => setModalWord(null)} />
      )}
    </div>
  );
}
