// Character offsets of a DOM Range inside a container's text, and back.
// Used by TextMarker to persist highlights on content React renders (the
// question panels), where wrapping text in <mark> would fight React's
// reconciliation — the marks are painted with the CSS Custom Highlight API
// instead, and only these offsets are stored.

function textNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n = walker.nextNode();
  while (n) {
    out.push(n as Text);
    n = walker.nextNode();
  }
  return out;
}

export interface TextSpan {
  start: number;
  end: number;
}

/** Offset of (node, offset) within root's concatenated text, or -1. */
function pointOffset(root: Node, nodes: Text[], node: Node, offset: number): number {
  let acc = 0;
  if (node.nodeType === Node.TEXT_NODE) {
    for (const t of nodes) {
      if (t === node) return acc + offset;
      acc += t.data.length;
    }
    return -1;
  }
  // Element boundary: count the text before its `offset`-th child.
  const child = node.childNodes[offset] || null;
  for (const t of nodes) {
    if (child && (child === t || child.contains(t) || child.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)) return acc;
    acc += t.data.length;
  }
  return root.contains(node) ? acc : -1;
}

export function rangeToSpan(root: Node, range: Range): TextSpan | null {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const nodes = textNodes(root);
  const start = pointOffset(root, nodes, range.startContainer, range.startOffset);
  const end = pointOffset(root, nodes, range.endContainer, range.endOffset);
  if (start < 0 || end <= start) return null;
  return { start, end };
}

export function spanToRange(root: Node, span: TextSpan): Range | null {
  const nodes = textNodes(root);
  let acc = 0;
  let startNode: Text | null = null;
  let startOff = 0;
  for (const t of nodes) {
    const len = t.data.length;
    if (!startNode && span.start < acc + len) {
      startNode = t;
      startOff = span.start - acc;
    }
    if (startNode && span.end <= acc + len) {
      const range = document.createRange();
      range.setStart(startNode, startOff);
      range.setEnd(t, span.end - acc);
      return range;
    }
    acc += len;
  }
  return null;
}

/** Merge overlapping/adjacent spans; drop empties. */
export function normalizeSpans(spans: TextSpan[]): TextSpan[] {
  const sorted = spans.filter((s) => s.end > s.start).sort((a, b) => a.start - b.start);
  const out: TextSpan[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.end);
    else out.push({ ...s });
  }
  return out;
}

/** Remove [cut.start, cut.end) from the spans (splitting where needed). */
export function subtractSpan(spans: TextSpan[], cut: TextSpan): TextSpan[] {
  const out: TextSpan[] = [];
  for (const s of spans) {
    if (cut.end <= s.start || cut.start >= s.end) {
      out.push(s);
      continue;
    }
    if (s.start < cut.start) out.push({ start: s.start, end: cut.start });
    if (s.end > cut.end) out.push({ start: cut.end, end: s.end });
  }
  return out;
}
