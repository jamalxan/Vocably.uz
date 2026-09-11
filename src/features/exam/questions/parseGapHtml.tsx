'use client';
import { Fragment, type ReactNode } from 'react';
import GapInput from './GapInput';
import GapSelect from './GapSelect';
import type { AnswerValue, BankItem, WordLimit } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.4/§6.5/§8.1 (stemHtml) — sentence/summary/note/table
// completion turlarining barchasi bitta muammoni yechadi: admin yozgan HTML
// ICHIDA `{{qN}}` joylarni haqiqiy React inputiga almashtirish.
//
// NEGA DOM'ni PARSE QILAMIZ (oddiy string.split emas): `table_completion`da
// placeholder `<td>{{q14}}</td>` kabi teg ICHIDA turadi. Xom stringni regex
// bilan bo'lib, har bo'lakni alohida `dangerouslySetInnerHTML`ga berish
// `<td>`/`</td>`ni yarim ochiq holda qoldirib jadvalni buzadi. DOMParser bilan
// haqiqiy daraxt qurib, har TEXT NODE ichidagi `{{qN}}`ni topib, uni GapInput
// bilan almashtirsak — atrofdagi teglar (jadval, ro'yxat, nima bo'lishidan
// qat'iy nazar) butun qoladi.
const GAP_PATTERN = /\{\{q(\d+)\}\}/g;

const ALLOWED_TAGS = new Set([
  'p', 'em', 'strong', 'sup', 'sub', 'b', 'i', 'br',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'ol', 'ul', 'li', 'span', 'div',
]);

// `script`/`style` matni ODDIY MATN ham emas — ko'rinmasligi kerak (boshqa
// ruxsat etilmagan teglardan farqli, ular faqat "formatlashni" yo'qotadi,
// bularning ICHIDAGI kontenti sahifada umuman chiqmasligi kerak).
const DROP_WITH_CONTENT_TAGS = new Set(['script', 'style', 'noscript']);

export interface GapFillContext {
  answers: Record<string, AnswerValue>;
  onChangeGap: (questionNumber: number, value: string) => void;
  wordLimitByQuestion?: Record<number, WordLimit>;
  defaultWordLimit?: WordLimit;
  // TZ §6.4 `summary_completion_bank` — berilsa har gap erkin matn input
  // o'rniga shu bankdan tanlaydigan <select> bo'ladi (GapSelect).
  bank?: BankItem[];
}

function textNodeToReact(text: string, ctx: GapFillContext, keyPrefix: string): ReactNode {
  GAP_PATTERN.lastIndex = 0;
  if (!GAP_PATTERN.test(text)) return text;
  GAP_PATTERN.lastIndex = 0;

  const pieces: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = GAP_PATTERN.exec(text))) {
    if (match.index > lastIndex) pieces.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    const qNum = Number(match[1]);
    const rawValue = ctx.answers[`q${qNum}`];
    const stringValue = typeof rawValue === 'string' ? rawValue : '';
    pieces.push(
      ctx.bank ? (
        <GapSelect
          key={`${keyPrefix}-gap-${qNum}`}
          questionNumber={qNum}
          value={stringValue}
          onChange={(v) => ctx.onChangeGap(qNum, v)}
          bank={ctx.bank}
        />
      ) : (
        <GapInput
          key={`${keyPrefix}-gap-${qNum}`}
          questionNumber={qNum}
          value={stringValue}
          onChange={(v) => ctx.onChangeGap(qNum, v)}
          wordLimit={ctx.wordLimitByQuestion?.[qNum] ?? ctx.defaultWordLimit}
        />
      )
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) pieces.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(lastIndex)}</Fragment>);
  return pieces;
}

function domNodeToReact(node: ChildNode, ctx: GapFillContext, keyPrefix: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return textNodeToReact(node.textContent || '', ctx, keyPrefix);
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT_TAGS.has(tag)) return null;

    const children = Array.from(el.childNodes).map((child, i) => domNodeToReact(child, ctx, `${keyPrefix}-${i}`));

    // §3.2 izohi: passage/instruction HTML'da "faqat p/em/strong/sup ruxsat" —
    // ruxsat etilmagan teg kelsa (ehtiyot chorasi sifatida) tegning o'zini
    // tashlab, faqat ICHIDAGI kontentni ko'rsatamiz (butunlay yo'qotib
    // yubormaslik uchun).
    if (!ALLOWED_TAGS.has(tag)) return <Fragment key={keyPrefix}>{children}</Fragment>;
    if (tag === 'br') return <br key={keyPrefix} />;

    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag key={keyPrefix}>{children}</Tag>;
  }

  return null;
}

/** `html` — admin tomonidan yozilgan, `{{qN}}` gap-belgilari bo'lgan matn
 * (TZ §3.5 `stemHtml`/`promptHtml`). Faqat brauzerda ishlaydi (`DOMParser`). */
export function parseGapHtml(html: string, ctx: GapFillContext): ReactNode {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return null;
  return Array.from(root.childNodes).map((child, i) => domNodeToReact(child, ctx, `n${i}`));
}
