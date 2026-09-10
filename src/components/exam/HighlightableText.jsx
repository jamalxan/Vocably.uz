'use client';
import { useState, useRef, useEffect } from 'react';
import { Highlighter, Trash2 } from 'lucide-react';

// Haqiqiy IELTS dasturidagi kabi — matnni belgilab (highlight) qoldirish va
// unga eslatma (note) yozish. Offset emas, aynan MATNNING O'ZI saqlanadi
// (lib/models.js'dagi izohga qarang) — shu matnni shu blok ichida qidirib,
// <mark> bilan o'raymiz. Bir nechta highlight bir-biriga ustma-ust tushmasin
// deb, joylashuvi bo'yicha tartiblab, kesishganlarini o'tkazib yuboramiz.
export default function HighlightableText({ text, highlights, section, onAdd, onRemove, onNote, className = '' }) {
  const containerRef = useRef(null);
  const [selToolbar, setSelToolbar] = useState(null); // {x, y, text}
  const [notePopover, setNotePopover] = useState(null); // {highlight, x, y}
  const [noteDraft, setNoteDraft] = useState('');

  const relevant = (highlights || []).filter((h) => h.section === section);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (selToolbar && !e.target.closest('[data-highlight-toolbar]')) setSelToolbar(null);
      if (notePopover && !e.target.closest('[data-note-popover]') && !e.target.closest('[data-highlight-mark]')) {
        setNotePopover(null);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [selToolbar, notePopover]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const raw = sel?.toString().trim();
    if (!raw || raw.length < 2 || !containerRef.current) {
      return;
    }
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;
    const rect = range.getBoundingClientRect();
    setNotePopover(null);
    setSelToolbar({ x: rect.left + rect.width / 2, y: rect.top, text: raw });
  };

  const applyHighlight = () => {
    if (!selToolbar) return;
    onAdd(selToolbar.text);
    window.getSelection()?.removeAllRanges();
    setSelToolbar(null);
  };

  const openNote = (h, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setNoteDraft(h.note || '');
    setNotePopover({ highlight: h, x: rect.left, y: rect.bottom });
  };

  const saveNote = () => {
    if (!notePopover) return;
    onNote(notePopover.highlight._id, noteDraft);
    setNotePopover(null);
  };

  // `text`ni highlight'lar bo'yicha segmentlarga bo'lamiz.
  const segments = [];
  const matches = [];
  for (const h of relevant) {
    const idx = text.indexOf(h.text);
    if (idx === -1) continue;
    matches.push({ start: idx, end: idx + h.text.length, h });
  }
  matches.sort((a, b) => a.start - b.start);
  let cursor = 0;
  const accepted = [];
  for (const m of matches) {
    if (m.start < cursor) continue; // kesishgan — o'tkazib yuboramiz
    accepted.push(m);
    cursor = m.end;
  }
  cursor = 0;
  for (const m of accepted) {
    if (m.start > cursor) segments.push({ plain: text.slice(cursor, m.start) });
    segments.push({ h: m.h, plain: text.slice(m.start, m.end) });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ plain: text.slice(cursor) });
  if (segments.length === 0) segments.push({ plain: text });

  return (
    <span ref={containerRef} onMouseUp={handleMouseUp} className={className}>
      {segments.map((s, i) =>
        s.h ? (
          <mark
            key={i}
            data-highlight-mark
            onClick={(e) => openNote(s.h, e)}
            title={s.h.note ? `Eslatma: ${s.h.note}` : 'Eslatma qo\'shish uchun bosing'}
            className="bg-warning/40 hover:bg-warning/60 cursor-pointer rounded-sm transition-colors"
          >
            {s.plain}
          </mark>
        ) : (
          <span key={i}>{s.plain}</span>
        )
      )}

      {selToolbar && (
        <div
          data-highlight-toolbar
          style={{ position: 'fixed', left: selToolbar.x, top: selToolbar.y - 44, transform: 'translateX(-50%)' }}
          className="z-50 flex items-center gap-1 bg-primary text-on-primary rounded-lg shadow-lg px-1 py-1"
        >
          <button
            type="button"
            onClick={applyHighlight}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-primary-hover text-xs font-medium"
          >
            <Highlighter size={13} /> Belgilash
          </button>
        </div>
      )}

      {notePopover && (
        <div
          data-note-popover
          style={{ position: 'fixed', left: notePopover.x, top: notePopover.y + 6 }}
          className="z-50 w-64 bg-surface border border-border rounded-xl shadow-lg p-3"
        >
          <p className="text-[11px] text-muted mb-1.5 line-clamp-2">"{notePopover.highlight.text}"</p>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Eslatma yozing..."
            rows={2}
            className="w-full px-2.5 py-1.5 bg-bg text-ink border border-border rounded-lg text-xs outline-none focus:border-accent resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onRemove(notePopover.highlight._id);
                setNotePopover(null);
              }}
              className="flex items-center gap-1 text-[11px] text-danger hover:underline"
            >
              <Trash2 size={12} /> O'chirish
            </button>
            <button
              type="button"
              onClick={saveNote}
              className="px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded-md text-[11px] font-semibold"
            >
              Saqlash
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
