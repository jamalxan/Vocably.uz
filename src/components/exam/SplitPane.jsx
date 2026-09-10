'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

// Haqiqiy IELTS dasturidagi kabi — chap/o'ng panel orasida qo'lda torttiriladigan
// ajratkich (resizer). Mobilda panellar ustma-ust (flex-col) — ajratkich faqat
// md+ ekranlarda ishlaydi.
export default function SplitPane({ left, right, initialLeftPercent = 55 }) {
  const containerRef = useRef(null);
  const [leftPercent, setLeftPercent] = useState(initialLeftPercent);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPercent(Math.min(75, Math.max(25, pct)));
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row h-full min-h-0">
      <div className="overflow-y-auto md:h-full" style={{ width: '100%' }} data-pane="left">
        {left}
      </div>
      {/* Resizer — faqat desktop'da (md+), qo'lda tortiladi */}
      <div
        onMouseDown={onMouseDown}
        className="hidden md:flex w-2 flex-shrink-0 items-center justify-center cursor-col-resize group"
      >
        <div className="w-px h-full bg-border group-hover:bg-accent transition-colors" />
      </div>
      <div className="overflow-y-auto md:h-full border-t md:border-t-0 border-border" data-pane="right">
        {right}
      </div>
      <style jsx>{`
        @media (min-width: 768px) {
          [data-pane='left'] {
            width: ${leftPercent}%;
          }
          [data-pane='right'] {
            width: ${100 - leftPercent}%;
          }
        }
      `}</style>
    </div>
  );
}
