// TZ-vocably-v2.md §6.3 — "Offset'ni hisoblash uchun TreeWalker bilan text
// node'larni yurib chiqing va kumulyativ offset toping. DOM'ni qayta
// chizishda offsetdan Range tiklanadi." Bu fayl aynan shu ikki yo'nalishni
// (Selection → offset, offset → DOM `<mark>`) qiladi — sof DOM kodi, React'ga
// bog'liq emas (paragraf matni `dangerouslySetInnerHTML` bilan chiqarilgani
// uchun, unga mos boshqa yondashuv yo'q).
export const HIGHLIGHT_MARK_ATTR = 'data-highlight-id';

/** Berilgan `range`ning `container` ichidagi kumulyativ text-offsetlarini
 * hisoblaydi (barcha text node'lar bitta uzun satr sifatida). `range`
 * `container` ichida bo'lishi kerak — aks holda `null`. */
export function computeOffsets(container: HTMLElement, range: Range): { start: number; end: number } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let start = -1;
  let end = -1;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length || 0;
    if (start === -1 && node === range.startContainer) start = offset + range.startOffset;
    if (node === range.endContainer) {
      end = offset + range.endOffset;
      break;
    }
    offset += len;
  }
  if (start === -1 || end === -1 || end <= start) return null;
  return { start, end };
}

/** `container` ichidagi barcha mavjud `<mark data-highlight-id>` belgilarini
 * olib tashlab, asl (bezaksiz) matn node'lariga qaytaradi — qayta
 * qo'llashdan oldin har doim chaqiriladi, chunki offsetlar ASL matnga
 * nisbatan hisoblangan. */
function unwrapMarks(container: HTMLElement): void {
  const marks = Array.from(container.querySelectorAll(`mark[${HIGHLIGHT_MARK_ATTR}]`));
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  }
  container.normalize();
}

/** `targetOffset`ga to'g'ri keladigan text node + shu node ichidagi lokal
 * offsetni topadi. Offset aynan ikki node orasidagi chegaraga to'g'ri kelsa
 * — keyingi node'ning boshi afzal ko'riladi (oxirgi node bo'lmasa), shunda
 * `splitText` doim aniq bitta natijaga ega bo'ladi. */
function findBoundary(container: HTMLElement, targetOffset: number): { node: Text; localOffset: number } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);

  let offset = 0;
  for (let i = 0; i < nodes.length; i++) {
    const len = nodes[i].textContent?.length || 0;
    const nodeEnd = offset + len;
    if (targetOffset < nodeEnd) return { node: nodes[i], localOffset: targetOffset - offset };
    if (targetOffset === nodeEnd && i === nodes.length - 1) return { node: nodes[i], localOffset: len };
    offset = nodeEnd;
  }
  return null;
}

export interface HighlightRange {
  id: string;
  startOffset: number;
  endOffset: number;
  note?: string;
}

/** `container` ichidagi mavjud belgilashlarni tozalab, `highlights` ro'yxatini
 * qayta qo'llaydi (`<mark data-highlight-id>` bilan o'raydi). Bir xil
 * paragrafda kesishmaydigan (overlap qilmaydigan) belgilashlar uchun
 * mo'ljallangan — TZ ham, haqiqiy IELTS CD ham kesishgan belgilashni alohida
 * hodisa sifatida ko'rsatmaydi, shuning uchun bu yerda ham qo'llab-quvvatlanmaydi. */
export function applyHighlights(container: HTMLElement, highlights: HighlightRange[]): void {
  unwrapMarks(container);
  const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);

  for (const h of sorted) {
    if (h.endOffset <= h.startOffset) continue;

    const startB = findBoundary(container, h.startOffset);
    if (!startB) continue;
    let startNode = startB.node;
    if (startB.localOffset > 0) {
      if (startB.localOffset >= (startNode.textContent?.length || 0)) continue;
      startNode = startNode.splitText(startB.localOffset);
    }

    // `endOffset`ni START bo'lingandan KEYIN qayta hisoblaymiz — splitText
    // umumiy matn miqdorini o'zgartirmaydi (faqat node chegarasini), shuning
    // uchun kumulyativ offsetlar hamon to'g'ri.
    const endB = findBoundary(container, h.endOffset);
    if (!endB) continue;
    if (endB.localOffset < (endB.node.textContent?.length || 0)) {
      endB.node.splitText(endB.localOffset);
    }
    const endNode = endB.node;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const segment: Text[] = [];
    let collecting = false;
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (n === startNode) collecting = true;
      if (collecting) segment.push(n as Text);
      if (n === endNode) break;
    }
    if (segment.length === 0) continue;

    for (const textNode of segment) {
      if (!textNode.textContent) continue;
      const mark = document.createElement('mark');
      mark.setAttribute(HIGHLIGHT_MARK_ATTR, h.id);
      mark.className = 'exam-highlight-mark';
      if (h.note) mark.title = h.note;
      textNode.parentNode?.insertBefore(mark, textNode);
      mark.appendChild(textNode);
    }
  }
}
