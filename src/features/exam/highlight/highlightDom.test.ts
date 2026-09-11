// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { computeOffsets, applyHighlights, HIGHLIGHT_MARK_ATTR } from './highlightDom';

function makeContainer(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

function rangeFor(container: HTMLElement, matchText: string): Range {
  const idx = (container.textContent || '').indexOf(matchText);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node: Node | null;
  const range = document.createRange();
  let startSet = false;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length || 0;
    if (!startSet && idx >= offset && idx < offset + len) {
      range.setStart(node, idx - offset);
      startSet = true;
    }
    const endIdx = idx + matchText.length;
    if (endIdx >= offset && endIdx <= offset + len) {
      range.setEnd(node, endIdx - offset);
      break;
    }
    offset += len;
  }
  return range;
}

describe('computeOffsets', () => {
  it('computes plain-text offsets within a single text node', () => {
    const el = makeContainer('The quick brown fox');
    const range = rangeFor(el, 'quick');
    expect(computeOffsets(el, range)).toEqual({ start: 4, end: 9 });
  });

  it('computes cumulative offsets across inline tags (em/strong)', () => {
    const el = makeContainer('The <em>quick</em> brown fox');
    // textContent = "The quick brown fox" — offsets ignore markup, just like §6.3 intends.
    const range = rangeFor(el, 'brown');
    expect(computeOffsets(el, range)).toEqual({ start: 10, end: 15 });
  });
});

describe('applyHighlights', () => {
  it('wraps the highlighted substring in a <mark> with the highlight id', () => {
    const el = makeContainer('The quick brown fox');
    applyHighlights(el, [{ id: 'h1', startOffset: 4, endOffset: 9 }]);
    const mark = el.querySelector(`mark[${HIGHLIGHT_MARK_ATTR}="h1"]`);
    expect(mark?.textContent).toBe('quick');
    expect(el.textContent).toBe('The quick brown fox');
  });

  it('wraps a highlight that spans across an inline tag boundary', () => {
    const el = makeContainer('The <em>quick</em> brown fox');
    // "quick brown" spans from inside <em> across into the plain text after it.
    applyHighlights(el, [{ id: 'h1', startOffset: 4, endOffset: 15 }]);
    const marks = el.querySelectorAll(`mark[${HIGHLIGHT_MARK_ATTR}="h1"]`);
    expect(Array.from(marks).map((m) => m.textContent).join('')).toBe('quick brown');
    expect(el.textContent).toBe('The quick brown fox');
  });

  it('applies multiple non-overlapping highlights independently', () => {
    const el = makeContainer('The quick brown fox jumps');
    applyHighlights(el, [
      { id: 'h1', startOffset: 4, endOffset: 9 }, // quick
      { id: 'h2', startOffset: 16, endOffset: 19 }, // fox
    ]);
    expect(el.querySelector(`mark[${HIGHLIGHT_MARK_ATTR}="h1"]`)?.textContent).toBe('quick');
    expect(el.querySelector(`mark[${HIGHLIGHT_MARK_ATTR}="h2"]`)?.textContent).toBe('fox');
    expect(el.textContent).toBe('The quick brown fox jumps');
  });

  it('re-applying with a shorter list removes highlights no longer present', () => {
    const el = makeContainer('The quick brown fox');
    applyHighlights(el, [{ id: 'h1', startOffset: 4, endOffset: 9 }]);
    applyHighlights(el, []);
    expect(el.querySelector('mark')).toBeNull();
    expect(el.textContent).toBe('The quick brown fox');
  });

  it('sets the mark title to the note when present', () => {
    const el = makeContainer('The quick brown fox');
    applyHighlights(el, [{ id: 'h1', startOffset: 4, endOffset: 9, note: 'my note' }]);
    const mark = el.querySelector(`mark[${HIGHLIGHT_MARK_ATTR}="h1"]`) as HTMLElement;
    expect(mark.title).toBe('my note');
  });
});
