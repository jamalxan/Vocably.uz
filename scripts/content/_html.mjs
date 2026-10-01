// Kontent modullari uchun kichik HTML yordamchilari — table_completion stem'lari
// har testda qo'lda yoziladigan uzun inline-style jadvallarni takrorlamaslik uchun.
const CELL = 'border:1px solid #999;padding:4px 8px';

/** `table(['Col A', 'Col B'], [['x', '{{q7}}'], ...], 'Optional title')` */
export function table(headers, rows, title) {
  const head = `<thead><tr>${headers.map((h) => `<th style="${CELL}">${h}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="${CELL}">${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
  const caption = title ? `<p><strong>${title}</strong></p>` : '';
  return `${caption}<table style="border-collapse:collapse;width:100%">${head}${body}</table>`;
}

export const TFNG_INSTRUCTION =
  'Do the following statements agree with the information given in the passage?<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this';

export const YNNG_INSTRUCTION =
  'Do the following statements agree with the views of the writer?<br/><strong>YES</strong> if the statement agrees with the views of the writer<br/><strong>NO</strong> if the statement contradicts the views of the writer<br/><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this';

/** Inline SVG -> `data:` URI for map_label / plan_label / diagram_label images
 * (same approach as the Writing Task 1 charts in seed-practice-tests.mjs, so the
 * images need no upload or storage). */
export function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg.trim(), 'utf-8').toString('base64')}`;
}

/** Kompakt savol yaratuvchi: `q(7, 'prompt yoki null', 'B' | ['a','b'], 'izoh', 'C')`.
 * promptHtml null bo'lsa (gap-turlar) kalit qo'shilmaydi. */
export function q(number, promptHtml, accepted, explanationHtml, locatorParagraph) {
  return {
    number,
    ...(promptHtml != null ? { promptHtml } : {}),
    answer: { accepted: Array.isArray(accepted) ? accepted : [accepted] },
    explanationHtml,
    ...(locatorParagraph ? { locatorParagraph } : {}),
  };
}

/** Bir nechta paragraf: `paras(['A', 'matn'], ['B', 'matn'])` -> [{label, html}] */
export function paras(...items) {
  return items.map(([label, text]) => ({ label, html: `<p>${text}</p>` }));
}

/** MC savol (A-D): `mc(3, 'savol', ['a','b','c','d'], 'B', 'izoh')` */
export function mc(number, promptHtml, texts, answer, explanationHtml, locatorParagraph) {
  return {
    number,
    promptHtml,
    options: texts.map((text, i) => ({ key: 'ABCDEFGH'[i], text })),
    answer: { accepted: [answer] },
    explanationHtml,
    ...(locatorParagraph ? { locatorParagraph } : {}),
  };
}

/** Bank: `bank(['a','b'])` -> [{key:'A',text:'a'},...]; roman=true -> i, ii, ... */
export function bank(texts, roman = false) {
  const R = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
  return texts.map((text, i) => ({ key: roman ? R[i] : 'ABCDEFGHIJKLMNOP'[i], text }));
}
