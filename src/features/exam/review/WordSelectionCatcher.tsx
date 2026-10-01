'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import AddWordModal from './AddWordModal';
import WordPopupCard, { type IndexWord } from './WordPopupCard';
import { buildFormIndex, normalizeToken, tokenize } from '@/lib/vocab/wordForms';

// TZ §22 — Reading/Listening natija ekranidagi matn interaktiv: so'zni bosish (yoki ikki marta bosish/belgilash)
// ta'rif, tarjima, talaffuz, misol, "Lug'atga qo'shish" va "Takrorlash"ni ko'rsatadi. Foydalanuvchining o'z lug'atidagi
// so'zlar matnda belgilanadi (zaif so'zlar alohida rang bilan). Imtihon DAVOMIDA emas, faqat natija ko'rib chiqishda
// (haqiqiy IELTS'da lug'at taqiqlangan, shuning uchun PassagePane'ga ulanmagan).
//
// Belgilash CSS Custom Highlight API orqali — DOM o'zgartirilmaydi (React bilan to'qnashmaydi, matn tanlovi buzilmaydi).
// Brauzer qo'llamasa — belgilash yo'q, popup esa baribir ishlaydi.
const WORD_RE = /^[A-Za-z][A-Za-z'-]{1,39}$/;
const MAX_RANGES = 4000;
const INTERACTIVE = 'button,a,input,textarea,select,label,[role="button"],[role="dialog"]';

type HighlightRegistry = { set: (name: string, h: unknown) => void; delete: (name: string) => void };
const getRegistry = (): HighlightRegistry | null => {
  const css = (typeof CSS !== 'undefined' ? CSS : undefined) as unknown as { highlights?: HighlightRegistry } | undefined;
  return css?.highlights && typeof (window as any).Highlight === 'function' ? css.highlights : null;
};

/** Bosilgan nuqtadagi so'zni qamrab oluvchi Range (yoki null). */
function wordRangeAtPoint(x: number, y: number): Range | null {
  let node: Node | null = null;
  let offset = 0;
  const doc = document as any;
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos) {
      node = pos.offsetNode;
      offset = pos.offset;
    }
  } else if (doc.caretRangeFromPoint) {
    const r = doc.caretRangeFromPoint(x, y);
    if (r) {
      node = r.startContainer;
      offset = r.startOffset;
    }
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent || '';
  const isWordChar = (c: string) => /[A-Za-z'-]/.test(c);
  let start = Math.min(offset, text.length);
  let end = start;
  while (start > 0 && isWordChar(text[start - 1])) start--;
  while (end < text.length && isWordChar(text[end])) end++;
  if (end - start < 2) return null;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range;
}

interface CardState {
  surface: string;
  context: string;
  x: number;
  y: number;
}

export default function WordSelectionCatcher({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<IndexWord[] | null>(null);
  const [card, setCard] = useState<CardState | null>(null);
  const [modalWord, setModalWord] = useState<{ word: string; context: string } | null>(null);

  const formIndex = useMemo(() => (words ? buildFormIndex(words) : null), [words]);

  const loadIndex = useCallback(() => {
    fetch('/api/vocabulary/reading-index', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && Array.isArray(d.words) && setWords(d.words))
      .catch(() => {}); // indeks bo'lmasa ham popup (kutubxona/AI) ishlaydi
  }, []);

  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  // --- matnda lug'at so'zlarini belgilash ---
  useEffect(() => {
    const container = containerRef.current;
    const registry = getRegistry();
    if (!container || !registry || !formIndex) return undefined;
    const HighlightCtor = (window as any).Highlight;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const apply = () => {
      const weak: Range[] = [];
      const known: Range[] = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const p = n.parentElement;
          if (!p || p.closest('script,style,input,textarea,select,[role="dialog"]')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      for (let n = walker.nextNode(); n && weak.length + known.length < MAX_RANGES; n = walker.nextNode()) {
        const text = n.textContent || '';
        if (text.length < 2) continue;
        for (const t of tokenize(text)) {
          const hit = formIndex.get(normalizeToken(t.token));
          if (!hit) continue;
          const r = document.createRange();
          r.setStart(n, t.start);
          r.setEnd(n, t.end);
          (hit.weak ? weak : known).push(r);
        }
      }
      registry.set('vocab-weak', new HighlightCtor(...weak));
      registry.set('vocab-known', new HighlightCtor(...known));
    };

    apply();
    // Bo'lim almashganda (Reading/Listening/Writing) kontent o'zgaradi — qayta chizamiz (debounce).
    const mo = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(apply, 150);
    });
    mo.observe(container, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      if (timer) clearTimeout(timer);
      registry.delete('vocab-weak');
      registry.delete('vocab-known');
    };
  }, [formIndex]);

  // --- so'z tanlanganda (ikki marta bosish / belgilash) karta ochiladi ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onSelectionChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return; // karta tanlov tozalanganda yopilmaydi (tashqariga bosish/Esc)
        const text = sel.toString().trim();
        const anchor = sel.anchorNode;
        if (!WORD_RE.test(text) || !anchor || !containerRef.current?.contains(anchor)) return;
        if (anchor.parentElement?.closest('[role="dialog"]')) return;
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setCard({ surface: text, context: (anchor.textContent || '').slice(0, 300), x: rect.left + rect.width / 2, y: rect.top });
      }, 120);
    };
    const hide = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[role="dialog"]')) return;
      setCard(null);
    };
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, []);

  // Bitta bosish — so'zni tanlaydi (selectionchange kartani ochadi). Tugma/havola/maydonlar e'tiborsiz.
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(INTERACTIVE)) return;
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed) return; // allaqachon matn tanlangan (ikki marta bosish/drag)
    const range = wordRangeAtPoint(e.clientX, e.clientY);
    if (!range || !containerRef.current?.contains(range.startContainer)) return;
    if (!WORD_RE.test(range.toString())) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const owned = card && formIndex ? formIndex.get(normalizeToken(card.surface)) || null : null;

  const closeCard = useCallback(() => {
    setCard(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return (
    <div ref={containerRef} className="relative" onClick={handleClick}>
      {children}

      {card && (
        <WordPopupCard
          key={card.surface + card.x + card.y}
          surface={card.surface}
          owned={owned}
          x={card.x}
          y={card.y}
          onClose={closeCard}
          onChanged={loadIndex}
          onOpenAddModal={() => {
            setModalWord({ word: card.surface, context: card.context });
            closeCard();
          }}
        />
      )}

      {modalWord && (
        <AddWordModal
          word={modalWord.word}
          context={modalWord.context}
          onAdded={() => {
            loadIndex();
            fetch('/api/vocabulary/signal', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: 'reading', items: [{ word: modalWord.word, added: true }] }),
            }).catch(() => {});
          }}
          onClose={() => setModalWord(null)}
        />
      )}
    </div>
  );
}
