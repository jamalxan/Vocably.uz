// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { rangeToSpan, spanToRange, normalizeSpans, subtractSpan } from './textOffsets';

function fixture() {
  const root = document.createElement('div');
  root.innerHTML = '<p>Complete the <b>notes</b> below.</p><p>Write <input /> ONE WORD only.</p>';
  document.body.appendChild(root);
  return root;
}

describe('textOffsets', () => {
  it('round-trips a selection across elements', () => {
    const root = fixture();
    const range = document.createRange();
    const the = root.querySelector('p')!.firstChild as Text; // "Complete the "
    const notes = root.querySelector('b')!.firstChild as Text;
    range.setStart(the, 9);
    range.setEnd(notes, 5);
    const span = rangeToSpan(root, range)!;
    expect(span).toEqual({ start: 9, end: 18 });
    expect(spanToRange(root, span)!.toString()).toBe('the notes');
  });

  it('ignores a range outside the root', () => {
    const root = fixture();
    const other = document.createElement('p');
    other.textContent = 'elsewhere';
    document.body.appendChild(other);
    const r = document.createRange();
    r.selectNodeContents(other);
    expect(rangeToSpan(root, r)).toBeNull();
  });

  it('merges overlaps and subtracts a cut', () => {
    expect(normalizeSpans([{ start: 5, end: 9 }, { start: 0, end: 3 }, { start: 8, end: 12 }])).toEqual([
      { start: 0, end: 3 },
      { start: 5, end: 12 },
    ]);
    expect(subtractSpan([{ start: 0, end: 10 }], { start: 3, end: 5 })).toEqual([
      { start: 0, end: 3 },
      { start: 5, end: 10 },
    ]);
  });
});
