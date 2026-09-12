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

// VOCABLY-TZ.md §3 ("kuzatilgan, lekin tasdiqlanmagan" caret/qiymat aralashib
// ketish bugi) — root cause tergovi: `GroupGapFill` bir stemHtml ichida
// KO'P gap'ni bitta bloqda chiqaradi (masalan note_completion'da 10 ta),
// va OLDIN butun DOM-parse (`DOMParser` + TreeWalker) har renderda — ya'ni
// GURUHDAGI ISTALGAN gap'ga HAR BOSILGAN TUGMADA — qaytadan bajarilardi. Bu
// static STRUKTURA (qaysi teglar, qaysi joyda gap bor)ni har keystrokeda
// qayta hisoblardi, holbuki faqat gap QIYMATLARI o'zgaradi. Og'ir/sekin
// qurilmada yoki tez yozganda bu React commit'ini kechiktirib, brauzerning
// o'zi controlled input'ni vaqtincha "uncontrolled" holatda qoldirishiga
// (bir necha xat-harakat DOM'da to'planib, keyin React eski `value`ni ustidan
// yozib chiqishiga) imkon berishi mumkin edi.
//
// Yechim: struktura endi `parseGapTemplate` bilan BIR MARTA (faqat `stemHtml`
// o'zgarsa) hisoblanadi va chaqiruvchida `useMemo`ga qo'yiladi (`GroupGapFill.tsx`).
// Har render esa faqat YENGIL `renderGapTemplate`ni ishlatadi — DOMParser YO'Q,
// faqat oldindan tayyor tuzilma bo'ylab yurish va joriy `answers`dan qiymat olish.
export type GapTemplateNode =
  | { kind: 'text'; text: string }
  | { kind: 'br' }
  | { kind: 'gap'; qNum: number }
  | { kind: 'element'; tag: string; children: GapTemplateNode[] };

function textNodeToTemplate(text: string): GapTemplateNode[] {
  GAP_PATTERN.lastIndex = 0;
  if (!GAP_PATTERN.test(text)) return text ? [{ kind: 'text', text }] : [];
  GAP_PATTERN.lastIndex = 0;

  const pieces: GapTemplateNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = GAP_PATTERN.exec(text))) {
    if (match.index > lastIndex) pieces.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    pieces.push({ kind: 'gap', qNum: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) pieces.push({ kind: 'text', text: text.slice(lastIndex) });
  return pieces;
}

function domNodeToTemplate(node: ChildNode): GapTemplateNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return textNodeToTemplate(node.textContent || '');
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT_TAGS.has(tag)) return [];

    const children = Array.from(el.childNodes).flatMap(domNodeToTemplate);

    // §3.2 izohi: "faqat p/em/strong/sup ruxsat" — ruxsat etilmagan teg kelsa
    // (ehtiyot chorasi sifatida) tegning o'zini tashlab, faqat ICHIDAGI
    // kontentni ko'rsatamiz (butunlay yo'qotib yubormaslik uchun).
    if (!ALLOWED_TAGS.has(tag)) return children;
    if (tag === 'br') return [{ kind: 'br' }];

    return [{ kind: 'element', tag, children }];
  }

  return [];
}

/** `html` — admin tomonidan yozilgan, `{{qN}}` gap-belgilari bo'lgan matn
 * (TZ §3.5 `stemHtml`/`promptHtml`). Faqat brauzerda ishlaydi (`DOMParser`).
 * `answers`ga BOG'LIQ EMAS — shuning uchun chaqiruvchida `useMemo(() =>
 * parseGapTemplate(html), [html])` bilan xavfsiz keshlanadi. */
export function parseGapTemplate(html: string): GapTemplateNode[] {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return [];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return [];
  return Array.from(root.childNodes).flatMap(domNodeToTemplate);
}

function renderTemplateNode(node: GapTemplateNode, ctx: GapFillContext, key: string): ReactNode {
  if (node.kind === 'text') return node.text;
  if (node.kind === 'br') return <br key={key} />;

  if (node.kind === 'gap') {
    const rawValue = ctx.answers[`q${node.qNum}`];
    const stringValue = typeof rawValue === 'string' ? rawValue : '';
    return ctx.bank ? (
      <GapSelect key={key} questionNumber={node.qNum} value={stringValue} onChange={(v) => ctx.onChangeGap(node.qNum, v)} bank={ctx.bank} />
    ) : (
      <GapInput
        key={key}
        questionNumber={node.qNum}
        value={stringValue}
        onChange={(v) => ctx.onChangeGap(node.qNum, v)}
        wordLimit={ctx.wordLimitByQuestion?.[node.qNum] ?? ctx.defaultWordLimit}
      />
    );
  }

  const Tag = node.tag as keyof JSX.IntrinsicElements;
  return <Tag key={key}>{node.children.map((c, i) => renderTemplateNode(c, ctx, `${key}-${i}`))}</Tag>;
}

/** Oldindan `parseGapTemplate` bilan hisoblangan (va keshlangan) strukturani
 * joriy `ctx.answers` bilan yengil qayta chizadi — DOMParser YO'Q. */
export function renderGapTemplate(template: GapTemplateNode[], ctx: GapFillContext): ReactNode {
  return template.map((n, i) => <Fragment key={`n${i}`}>{renderTemplateNode(n, ctx, `n${i}`)}</Fragment>);
}

/** Qulaylik uchun — struktura VA qiymatlarni BIRGALIKDA, bitta chaqiruvda
 * hisoblaydi (keshlanmaydi). Kam gapli, tez-tez qayta chaqirilmaydigan joylar
 * uchun (masalan `SentenceCompletion` — bitta savolga bitta gap) yetarli;
 * ko'p gapli guruhlar (`GroupGapFill`) esa `parseGapTemplate`+`renderGapTemplate`
 * juftligini `useMemo` bilan ishlatadi. */
export function parseGapHtml(html: string, ctx: GapFillContext): ReactNode {
  return renderGapTemplate(parseGapTemplate(html), ctx);
}
