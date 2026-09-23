'use client';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { SanitizedPassage, Highlight } from '@/lib/exam/types';
import ParagraphLabel from './ParagraphLabel';
import HighlightMenu from '../highlight/HighlightMenu';
import NoteEditor from '../highlight/NoteEditor';
import { computeOffsets } from '../highlight/highlightDom';

// TZ-vocably-v2.md §6.2 — "Yorliq faqat matching_headings yoki
// matching_information guruhi mavjud bo'lsa ko'rsatiladi." va "Sarlavha
// position: sticky; top: 0 ... scroll paytida qaysi passage ekanligi ko'rinib
// turadi."
const LABEL_TRIGGER_TYPES = new Set(['matching_headings', 'matching_information']);
const NO_HIGHLIGHTS: Highlight[] = [];

type MenuState =
  | { mode: 'select'; x: number; y: number; paragraphIndex: number; start: number; end: number }
  | { mode: 'mark'; x: number; y: number; highlightId: string; viaKeyboard?: boolean };

export interface PassagePaneProps {
  passage: SanitizedPassage;
  highlights: Highlight[];
  onAddHighlight: (paragraphIndex: number, start: number, end: number) => void;
  onRemoveHighlight: (highlightId: string) => void;
  onSetNote: (highlightId: string, note: string) => void;
}

// Joriy `window.getSelection()`ni belgilanadigan {paragraphIndex, start,
// end}ga o'giradi — o'ng-tugma menyusi VA Alt+H klaviatura yorlig'i
// IKKALASI ham shu bitta yo'ldan foydalanadi (pastga q.).
function resolveSelection(fallbackTarget: HTMLElement): { paragraphIndex: number; start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const paragraphEl = (range.startContainer.parentElement || fallbackTarget)?.closest<HTMLElement>('[data-paragraph-index]');
  if (!paragraphEl) return null;
  const offsets = computeOffsets(paragraphEl, range);
  if (!offsets) return null;
  return { paragraphIndex: Number(paragraphEl.dataset.paragraphIndex), start: offsets.start, end: offsets.end };
}

export default function PassagePane({ passage, highlights, onAddHighlight, onRemoveHighlight, onSetNote }: PassagePaneProps) {
  const showLabels = passage.questionGroups.some((g) => LABEL_TRIGGER_TYPES.has(g.type));
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [noteEditor, setNoteEditor] = useState<{ x: number; y: number; highlightId: string } | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  // Paragraf bo'yicha barqaror massivlar — har render'da yangi `filter()` massivi
  // ParagraphLabel'da DOM'ni qayta o'rab, foydalanuvchining matn tanlovini o'chirardi.
  const highlightsByParagraph = useMemo(() => {
    const map = new Map<number, Highlight[]>();
    for (const h of highlights) {
      if (h.passageOrder !== passage.order) continue;
      const list = map.get(h.paragraphIndex);
      if (list) list.push(h);
      else map.set(h.paragraphIndex, [h]);
    }
    return map;
  }, [highlights, passage.order]);

  // Sensorli ekranlarda mouseup/contextmenu ishonchli kelmaydi — uzoq bosib
  // tanlangan matn `selectionchange` orqali aniqlanib, menyu tanlov ostida ochiladi.
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return undefined;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onSelectionChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const article = articleRef.current;
        const sel = window.getSelection();
        if (!article || !sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!article.contains(range.commonAncestorContainer)) return;
        const resolved = resolveSelection(article);
        if (!resolved) return;
        const rect = range.getBoundingClientRect();
        setMenu({ mode: 'select', x: rect.left, y: rect.bottom + 8, ...resolved });
      }, 400);
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // TZ §6.3 — "O'ng tugma → kontekst menyusi... faqat passage paneli ichida
  // bloklanadi." Ikki holat bor: mavjud belgi (<mark>) ustida — olib
  // tashlash/eslatma; yoki yangi tanlangan matn ustida — belgilash. Aks holda
  // hech narsa ko'rsatilmaydi, faqat brauzer menyusi bloklanadi.
  const handleContextMenu = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const markEl = target.closest<HTMLElement>('mark[data-highlight-id]');
    if (markEl) {
      const highlightId = markEl.getAttribute('data-highlight-id');
      if (highlightId) setMenu({ mode: 'mark', x: e.clientX, y: e.clientY, highlightId });
      return;
    }

    const resolved = resolveSelection(target);
    if (resolved) {
      setMenu({ mode: 'select', x: e.clientX, y: e.clientY, ...resolved });
      return;
    }
    setMenu(null);
  };

  // VOCABLY-TZ.md §5 item 6 — "mouseup VA contextmenu (preventDefault)
  // hodisalarida... popover chiqsin." O'ng-tugma ixtiyoriy qulaylik, lekin
  // asosiy oqim — oddiy chap tugma bilan tanlab, qo'yib yuborish (Kindle/
  // Google Docs uslubi): shunda foydalanuvchi o'ng-tugma menyusi qayerda
  // ekanini bilishi shart emas. Mavjud `<mark>` ustida oddiy bosish (drag'siz)
  // tanlovni yig'ib qo'yadi (`resolveSelection` `null` qaytaradi) — mark
  // boshqaruvi hamon faqat o'ng-tugma yoki Enter (keyboard) orqali.
  const handleMouseUp = (e: MouseEvent<HTMLElement>) => {
    const resolved = resolveSelection(e.target as HTMLElement);
    if (resolved) setMenu({ mode: 'select', x: e.clientX, y: e.clientY, ...resolved });
  };

  // TZ §13 — "Butun imtihon sichqonchasiz o'tilishi kerak." O'ng-tugma —
  // sichqonchaga xos amal, shuning uchun `Alt+H` — mavjud tanlovni
  // (brauzerning o'z klaviatura-orqali-tanlash imkoniyati, masalan Firefox'ning
  // "caret browsing"/F7 rejimi, yoki oddiy Shift+strelka) darhol belgilaydi —
  // menyu ochmasdan, alohida tasdiqlashsiz (menyu faqat sichqoncha uchun
  // qulaylik, klaviatura yo'li esa to'g'ridan-to'g'ri amal).
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
      const resolved = resolveSelection(e.target as HTMLElement);
      if (resolved) {
        e.preventDefault();
        onAddHighlight(resolved.paragraphIndex, resolved.start, resolved.end);
      }
    }
  };

  // Sensorli ekranda o'ng tugma yo'q — mavjud belgiga tegish uning menyusini ochadi.
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const markEl = (e.target as HTMLElement).closest<HTMLElement>('mark[data-highlight-id]');
    const highlightId = markEl?.getAttribute('data-highlight-id');
    if (!markEl || !highlightId) return;
    const rect = markEl.getBoundingClientRect();
    setMenu({ mode: 'mark', x: rect.left, y: rect.bottom + 4, highlightId });
  };

  return (
    <article
      ref={articleRef}
      onContextMenu={handleContextMenu}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {/* Manfiy offsetlar panel paddingiga mos: MobileTabs (<768) px-4 sm:px-6 py-4, SplitPane px-7 py-6. */}
      <div
        className="sticky -top-4 md:-top-6 -mx-4 sm:-mx-6 md:-mx-7 px-4 sm:px-6 md:px-7 pt-4 md:pt-6 pb-3 mb-4 z-10"
        style={{ background: 'var(--exam-bg)' }}
      >
        <h1 className="text-[1.25em] font-bold leading-[1.3]" style={{ color: 'var(--exam-text)' }}>
          {passage.title}
        </h1>
        {passage.subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--exam-muted)' }}>
            {passage.subtitle}
          </p>
        )}
      </div>
      {/* VOCABLY-TZ.md §1.6 — matn o'lchami: ATAYLAB qat'iy `text-[16px]` YO'Q,
          shrift ExamShell ildizidagi `fontSize` inline style'idan meros
          bo'ladi (sozlama shu yerga to'g'ridan-to'g'ri ta'sir qilishi uchun). */}
      <div className="space-y-4 leading-[1.75]" style={{ color: 'var(--exam-text)' }}>
        {passage.paragraphs.map((p, i) => (
          <ParagraphLabel
            key={i}
            label={showLabels ? p.label : undefined}
            html={p.html}
            paragraphIndex={i}
            highlights={highlightsByParagraph.get(i) || NO_HIGHLIGHTS}
            onActivateHighlight={(highlightId, rect) =>
              setMenu({ mode: 'mark', x: rect.left, y: rect.bottom + 4, highlightId, viaKeyboard: true })
            }
          />
        ))}
      </div>

      {menu && menu.mode === 'select' && (
        <HighlightMenu
          x={menu.x}
          y={menu.y}
          mode="select"
          onClose={() => setMenu(null)}
          onHighlight={() => {
            onAddHighlight(menu.paragraphIndex, menu.start, menu.end);
            // Tanlov tozalanadi — aks holda menyu (mouseup/selectionchange) qayta ochiladi.
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
      {menu && menu.mode === 'mark' && (
        <HighlightMenu
          x={menu.x}
          y={menu.y}
          mode="mark"
          autoFocus={menu.viaKeyboard}
          onClose={() => setMenu(null)}
          onRemove={() => onRemoveHighlight(menu.highlightId)}
          onAddNote={() => setNoteEditor({ x: menu.x, y: menu.y, highlightId: menu.highlightId })}
        />
      )}
      {noteEditor && (
        <NoteEditor
          x={noteEditor.x}
          y={noteEditor.y}
          initialNote={highlights.find((h) => h.id === noteEditor.highlightId)?.note || ''}
          onSave={(note) => onSetNote(noteEditor.highlightId, note)}
          onClose={() => setNoteEditor(null)}
        />
      )}
    </article>
  );
}
