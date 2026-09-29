'use client';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Highlighter, Eraser } from 'lucide-react';
import { normalizeSpans, rangeToSpan, spanToRange, subtractSpan, type TextSpan } from './textOffsets';

// Highlighting for any React-rendered exam text (Listening questions, the
// Reading question panel, the mock). The Reading passage keeps its own
// server-synced <mark> highlighter (PassagePane); here the text belongs to
// React components with inputs inside, so nothing is wrapped: marks are
// painted with the CSS Custom Highlight API (`::highlight(exam-mark)` in
// globals.css) and stored as character offsets per attempt in localStorage.
//
// Select text → "Highlight". Tap/click a marked word → "Remove". Browsers
// without the API (older Firefox) simply don't show the toolbar.

const REGISTRY = new Map<string, Range[]>();
const HIGHLIGHT_NAME = 'exam-mark';

type HighlightCtor = new (...ranges: Range[]) => unknown;
function highlightApi(): { registry: Map<string, unknown>; Ctor: HighlightCtor } | null {
  if (typeof window === 'undefined') return null;
  const css = (window as unknown as { CSS?: { highlights?: Map<string, unknown> } }).CSS;
  const Ctor = (window as unknown as { Highlight?: HighlightCtor }).Highlight;
  if (!css?.highlights || !Ctor) return null;
  return { registry: css.highlights, Ctor };
}

function repaint() {
  const api = highlightApi();
  if (!api) return;
  const all = Array.from(REGISTRY.values()).flat();
  if (all.length) api.registry.set(HIGHLIGHT_NAME, new api.Ctor(...all));
  else api.registry.delete(HIGHLIGHT_NAME);
}

function load(key: string): TextSpan[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => Number.isFinite(s?.start) && Number.isFinite(s?.end)) : [];
  } catch {
    return [];
  }
}

function caretPoint(x: number, y: number): { node: Node; offset: number } | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (doc.caretPositionFromPoint) {
    const p = doc.caretPositionFromPoint(x, y);
    return p ? { node: p.offsetNode, offset: p.offset } : null;
  }
  const r = doc.caretRangeFromPoint?.(x, y);
  return r ? { node: r.startContainer, offset: r.startOffset } : null;
}

type Toolbar = { x: number; y: number; kind: 'add'; span: TextSpan; overlaps: boolean } | { x: number; y: number; kind: 'remove'; span: TextSpan };

export interface TextMarkerProps {
  /** Persistence scope, e.g. `${attemptId}:listening-q`. */
  storageKey: string;
  className?: string;
  children: ReactNode;
}

export default function TextMarker({ storageKey, className, children }: TextMarkerProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [spans, setSpans] = useState<TextSpan[]>([]);
  const [toolbar, setToolbar] = useState<Toolbar | null>(null);
  const supported = useRef(false);
  const key = `vocably_marks_${storageKey}`;

  useEffect(() => {
    supported.current = !!highlightApi();
    setSpans(load(key));
  }, [key]);

  // Paint (and re-paint when React replaces text nodes underneath).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !supported.current) return undefined;
    const paint = () => {
      REGISTRY.set(id, spans.map((s) => spanToRange(root, s)).filter((r): r is Range => !!r));
      repaint();
    };
    paint();
    const mo = new MutationObserver(paint);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      mo.disconnect();
      REGISTRY.delete(id);
      repaint();
    };
  }, [spans, id]);

  const save = useCallback(
    (next: TextSpan[]) => {
      const clean = normalizeSpans(next);
      setSpans(clean);
      try {
        localStorage.setItem(key, JSON.stringify(clean));
      } catch {}
    },
    [key]
  );

  const inspectSelection = useCallback(
    (clientX?: number, clientY?: number) => {
      const root = rootRef.current;
      if (!root || !supported.current) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const span = rangeToSpan(root, range);
        if (!span) return;
        const rect = range.getBoundingClientRect();
        const overlaps = spans.some((s) => s.start < span.end && s.end > span.start);
        setToolbar({ kind: 'add', span, overlaps, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
        return;
      }
      // Collapsed: a click on an existing mark offers to remove it.
      if (clientX == null || clientY == null) return;
      const p = caretPoint(clientX, clientY);
      if (!p || !root.contains(p.node)) return;
      const upTo = document.createRange();
      upTo.setStart(root, 0);
      upTo.setEnd(p.node, p.offset);
      const pos = rangeToSpan(root, upTo)?.end ?? null;
      const hit = pos != null ? spans.find((s) => pos >= s.start && pos <= s.end) : undefined;
      if (hit) setToolbar({ kind: 'remove', span: hit, x: clientX, y: clientY + 14 });
    },
    [spans]
  );

  // Touch: long-press selections don't fire a reliable mouseup.
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return undefined;
    let t: ReturnType<typeof setTimeout> | null = null;
    const onSel = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        const sel = window.getSelection();
        const root = rootRef.current;
        if (sel && !sel.isCollapsed && sel.rangeCount && root?.contains(sel.getRangeAt(0).commonAncestorContainer)) inspectSelection();
      }, 400);
    };
    document.addEventListener('selectionchange', onSel);
    return () => {
      document.removeEventListener('selectionchange', onSel);
      if (t) clearTimeout(t);
    };
  }, [inspectSelection]);

  useEffect(() => {
    if (!toolbar) return undefined;
    const close = () => setToolbar(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-text-marker-toolbar]')) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown, true);
    // Any scroll moves the text away from the fixed toolbar.
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('scroll', close, true);
    };
  }, [toolbar]);

  const btn =
    'inline-flex items-center gap-1.5 px-3 min-h-9 rounded-lg text-xs font-semibold focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]';

  return (
    <div
      ref={rootRef}
      data-text-marker=""
      className={className}
      onMouseUp={(e) => {
        if ((e.target as HTMLElement).closest('input, textarea, select, button')) return;
        inspectSelection(e.clientX, e.clientY);
      }}
    >
      {children}
      {toolbar && (
        <div
          data-text-marker-toolbar=""
          role="toolbar"
          aria-label="Highlight"
          className="fixed z-[80] -translate-x-1/2 flex items-center gap-1 p-1 rounded-xl shadow-lg"
          style={{
            left: Math.min(Math.max(toolbar.x, 90), window.innerWidth - 90),
            top: Math.min(toolbar.y, window.innerHeight - 56),
            background: 'var(--exam-text, #1f1f1f)',
            color: 'var(--exam-bg, #fff)',
          }}
        >
          {toolbar.kind === 'add' ? (
            <>
              <button
                type="button"
                className={btn}
                onClick={() => {
                  save([...spans, toolbar.span]);
                  window.getSelection()?.removeAllRanges();
                  setToolbar(null);
                }}
              >
                <Highlighter size={14} aria-hidden="true" /> Highlight
              </button>
              {toolbar.overlaps && (
                <button
                  type="button"
                  className={btn}
                  onClick={() => {
                    save(subtractSpan(spans, toolbar.span));
                    window.getSelection()?.removeAllRanges();
                    setToolbar(null);
                  }}
                >
                  <Eraser size={14} aria-hidden="true" /> Clear
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className={btn}
              onClick={() => {
                save(spans.filter((s) => s !== toolbar.span));
                setToolbar(null);
              }}
            >
              <Eraser size={14} aria-hidden="true" /> Remove highlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}
