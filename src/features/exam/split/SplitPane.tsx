'use client';
import { useRef, useState, type ReactNode } from 'react';
import Divider from './Divider';

// TZ-vocably-v2.md §6.1/§8.1 — Reading va Writing bo'limlarida ishlatiladigan
// sudraladigan ikki panelli joylashuv. Balandlik `100%` (ota elementdan meros) —
// TZ CSS namunasidagi `calc(100vh - 120px)` o'rniga, chunki ExamShell allaqachon
// header/footer balandligini flex layout bilan hisobga oladi (TZ o'zi qattiq
// piksel emas, moslashuvchan ota konteyner nazarda tutgan — 120px faqat o'sha
// paytdagi header+footer yig'indisiga taxminiy mos edi).
// §12.1/§12.2 — <768px'da bu split-pane "Tab rejimi"ga (Matn/Savollar
// segmented control) almashishi kerak. Bu komponent hozircha buni QILMAYDI —
// mobil moslashuv TZ'ning o'z fazalashida Faza 4 ("Sayqal", §19 item 20) ishi,
// ataylab keyinga qoldirilgan, unutilgani uchun emas.
export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  ratio: number;
  onRatioChange: (ratio: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  // Reading/Writing Task panellari o'qish uchun padding+o'z scroll kerak
  // (standart). Writing muharriri panelida esa (§8.2 "panel to'liq
  // balandligi") tashqi padding/scroll KERAK EMAS — EssayEditor o'zi to'liq
  // balandlikni egallaydi va faqat textarea scroll qiladi (qo'sh scrollbar
  // bo'lmasin uchun).
  rightPadded?: boolean;
}

export default function SplitPane({ left, right, ratio, onRatioChange, leftLabel, rightLabel, rightPadded = true }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      ref={containerRef}
      className="h-full min-w-0"
      // Grid + `fr` — 6px ustun DOIM qattiq, qolgan joy ikkala panel orasida
      // aynan `ratio` nisbatida taqsimlanadi. Foizli flex-width ishlatilsa
      // (chap+o'ng = 100%), 6px ajratgichga joy qolmay konteynerdan toshib
      // ketardi — shuning uchun TZ'ning o'zi ham CSS Grid tavsiya qiladi (§6.1).
      style={{ display: 'grid', gridTemplateColumns: `${ratio}fr 6px ${1 - ratio}fr` }}
    >
      <section
        aria-label={leftLabel}
        className="h-full min-w-0 overflow-y-auto overscroll-contain px-6 sm:px-7 py-6"
        style={{ pointerEvents: dragging ? 'none' : 'auto' }}
      >
        {left}
      </section>

      <Divider ratio={ratio} onRatioChange={onRatioChange} containerRef={containerRef} onDragStateChange={setDragging} />

      <section
        aria-label={rightLabel}
        className={`h-full min-w-0 ${rightPadded ? 'overflow-y-auto overscroll-contain px-6 sm:px-7 py-6' : 'overflow-hidden'}`}
        style={{ pointerEvents: dragging ? 'none' : 'auto' }}
      >
        {right}
      </section>
    </div>
  );
}
