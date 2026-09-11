'use client';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
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

type MenuState =
  | { mode: 'select'; x: number; y: number; paragraphIndex: number; start: number; end: number }
  | { mode: 'mark'; x: number; y: number; highlightId: string };

export interface PassagePaneProps {
  passage: SanitizedPassage;
  highlights: Highlight[];
  onAddHighlight: (paragraphIndex: number, start: number, end: number) => void;
  onRemoveHighlight: (highlightId: string) => void;
  onSetNote: (highlightId: string, note: string) => void;
}

export default function PassagePane({ passage, highlights, onAddHighlight, onRemoveHighlight, onSetNote }: PassagePaneProps) {
  const showLabels = passage.questionGroups.some((g) => LABEL_TRIGGER_TYPES.has(g.type));
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [noteEditor, setNoteEditor] = useState<{ x: number; y: number; highlightId: string } | null>(null);

  // Joriy `window.getSelection()`ni belgilanadigan {paragraphIndex, start,
  // end}ga o'giradi — o'ng-tugma menyusi VA Alt+H klaviatura yorlig'i
  // IKKALASI ham shu bitta yo'ldan foydalanadi (pastga q.).
  const resolveSelection = (fallbackTarget: HTMLElement): { paragraphIndex: number; start: number; end: number } | null => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const paragraphEl = (range.startContainer.parentElement || fallbackTarget)?.closest<HTMLElement>('[data-paragraph-index]');
    if (!paragraphEl) return null;
    const offsets = computeOffsets(paragraphEl, range);
    if (!offsets) return null;
    return { paragraphIndex: Number(paragraphEl.dataset.paragraphIndex), start: offsets.start, end: offsets.end };
  };

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

  return (
    <article onContextMenu={handleContextMenu} onKeyDown={handleKeyDown}>
      <div
        className="sticky -top-6 sm:-top-6 -mx-6 sm:-mx-7 px-6 sm:px-7 pt-6 pb-3 mb-4 z-10"
        style={{ background: 'var(--exam-bg)' }}
      >
        <h1 className="text-[20px] font-bold leading-[1.3]" style={{ color: 'var(--exam-text)' }}>
          {passage.title}
        </h1>
        {passage.subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--exam-muted)' }}>
            {passage.subtitle}
          </p>
        )}
      </div>
      <div className="space-y-4 text-[16px] leading-[1.75]" style={{ color: 'var(--exam-text)' }}>
        {passage.paragraphs.map((p, i) => (
          <ParagraphLabel
            key={i}
            label={showLabels ? p.label : undefined}
            html={p.html}
            paragraphIndex={i}
            highlights={highlights.filter((h) => h.passageOrder === passage.order && h.paragraphIndex === i)}
            onActivateHighlight={(highlightId, rect) =>
              setMenu({ mode: 'mark', x: rect.left, y: rect.bottom + 4, highlightId })
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
          onHighlight={() => onAddHighlight(menu.paragraphIndex, menu.start, menu.end)}
        />
      )}
      {menu && menu.mode === 'mark' && (
        <HighlightMenu
          x={menu.x}
          y={menu.y}
          mode="mark"
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
