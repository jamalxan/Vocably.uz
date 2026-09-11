// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseGapHtml } from './parseGapHtml';

// TZ-vocably-v2.md §3.5/§6.4 — bu, ehtimol, butun exam engine'dagi eng
// "shaytoni tafsilotlarda yashirin" qism: `{{qN}}` gap-belgilarini HTML
// ichida (jumladan jadval kataklari ichida) buzmasdan almashtirish. Naiv
// string-split (regex bilan bo'lib, har bo'lakni alohida `dangerouslySetInnerHTML`
// qilish) `<td>{{q14}}</td>`ni yarim ochiq `<td>` qoldirib jadvalni buzardi —
// shuning uchun DOM-parse yondashuvi tanlandi (parseGapHtml.tsx izohiga q.).
// Bu testlar aynan shu farqni tekshiradi.
function renderHtml(html: string, answers: Record<string, string> = {}) {
  const node = parseGapHtml(html, { answers, onChangeGap: () => {} });
  return renderToStaticMarkup(<>{node}</>);
}

describe('parseGapHtml', () => {
  it('replaces a single gap token in plain text with an input', () => {
    const out = renderHtml('In 1932, the factory produced {{q5}}.');
    expect(out).toContain('<input');
    expect(out).toContain('In 1932, the factory produced');
  });

  it('preserves surrounding inline formatting tags', () => {
    const out = renderHtml('The <strong>capital</strong> is {{q1}}.');
    expect(out).toContain('<strong>capital</strong>');
    expect(out).toContain('<input');
  });

  it('keeps a gap correctly nested inside a table cell without breaking table structure', () => {
    const out = renderHtml('<table><tbody><tr><td>Name</td><td>{{q14}}</td></tr></tbody></table>');
    expect(out).toContain('<table>');
    expect(out).toContain('</table>');
    // Ikkala <td> ham saqlanib qolgan bo'lishi kerak — buzilgan holatda
    // (input tashqariga "sizib chiqsa") bittasi yo'qolib qoladi.
    expect((out.match(/<td>/g) || []).length).toBe(2);
    expect((out.match(/<\/td>/g) || []).length).toBe(2);
    // <input> ikkinchi <td> yopilishidan OLDIN kelishi kerak (ya'ni ichida).
    const secondTdOpen = out.indexOf('Name') > -1 ? out.indexOf('<td>', out.indexOf('</td>')) : -1;
    const inputIdx = out.indexOf('<input');
    const closingTdAfterInput = out.indexOf('</td>', inputIdx);
    expect(secondTdOpen).toBeGreaterThan(-1);
    expect(inputIdx).toBeGreaterThan(secondTdOpen);
    expect(closingTdAfterInput).toBeGreaterThan(inputIdx);
  });

  it('renders the initial value into the input', () => {
    const out = renderHtml('Answer: {{q7}}', { q7: 'museum' });
    expect(out).toContain('value="museum"');
  });

  it('drops script/style tags along with their content', () => {
    const out = renderHtml('<script>alert(1)</script>Hello {{q2}}<style>.x{color:red}</style>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert');
    expect(out).not.toContain('color:red');
    expect(out).toContain('Hello');
  });

  it('unwraps a disallowed tag but keeps its text content', () => {
    const out = renderHtml('<article>Hello {{q3}} world</article>');
    expect(out).not.toContain('<article>');
    expect(out).toContain('Hello');
    expect(out).toContain('world');
  });

  it('produces identical output across repeated calls with identical input (stable keys)', () => {
    const html = 'A {{q1}} B {{q2}} C';
    const first = renderHtml(html);
    const second = renderHtml(html);
    expect(first).toBe(second);
  });

  it('handles text with no gap tokens at all', () => {
    const out = renderHtml('Just a plain sentence with no gaps.');
    expect(out).toContain('Just a plain sentence with no gaps.');
    expect(out).not.toContain('<input');
  });

  it('flags a value exceeding the word limit without blocking the render', () => {
    const node = parseGapHtml('{{q1}}', {
      answers: { q1: 'one two three' },
      onChangeGap: () => {},
      defaultWordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
    });
    const out = renderToStaticMarkup(<>{node}</>);
    // React SSR HTML-entity qiladi (' -> &#x27;), matnni to'g'ridan-to'g'ri
    // solishtirish o'rniga shu kalit so'zlarni tekshiramiz.
    expect(out).toContain('Ko&#x27;pi bilan 2 ta so&#x27;z');
  });
});
