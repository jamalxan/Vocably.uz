// TZ-vocably-v2.md §15.1 item 3 — "AI yordamchi: xom matn + javob kalitini
// joylashtiradi, AI Test JSON'ini generatsiya qiladi." Sof qism (bu fayl):
// Gemini structured-output sxemasi + AI'ning yassi JSON javobini haqiqiy
// `Passage[]` (types.ts) shakliga o'giradigan funksiya — DB/tarmoq bilan
// ishlamaydi, shuning uchun unit-test qilinadi. AI chaqiruvining o'zi
// (`generateJson`) `/api/admin/exam-tests/ai-generate/route.js`da.
//
// ATAYLAB DSL bilan bir xil "tekis" savol turlariga cheklangan
// (TFNG/YNG/short_answer/matching_information/multiple_choice_single) —
// summary/table kabi umumiy stem+{{qN}} guruh turlari AI'dan ishonchli
// structured chiqishga ko'proq imkon qoldiradi (kamroq erkin joy = kamroq
// gallyutsinatsiya xavfi), JSON import esa baribir to'liq turlarni qamrab oladi.
import type { Passage, QuestionType } from './types';

export const AI_IMPORT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    passages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          order: { type: 'integer' },
          title: { type: 'string' },
          paragraphs: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['text'],
            },
          },
          questionGroups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['true_false_notgiven', 'yes_no_notgiven', 'short_answer', 'matching_information', 'multiple_choice_single'],
                },
                instruction: { type: 'string' },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      number: { type: 'integer' },
                      prompt: { type: 'string' },
                      options: {
                        type: 'array',
                        items: { type: 'object', properties: { key: { type: 'string' }, text: { type: 'string' } }, required: ['key', 'text'] },
                      },
                      accepted: { type: 'array', items: { type: 'string' } },
                      locatorParagraph: { type: 'string' },
                    },
                    required: ['number', 'prompt', 'accepted'],
                  },
                },
              },
              required: ['type', 'instruction', 'questions'],
            },
          },
        },
        required: ['order', 'title', 'paragraphs', 'questionGroups'],
      },
    },
  },
  required: ['passages'],
};

export function buildAiImportPrompt(rawText: string): string {
  return `Quyida IELTS Reading passage matni va uning javob kaliti (xom holda, formatlanmagan) berilgan. Buni strukturali JSON'ga o'gir.

XOM MATN VA JAVOB KALITI:
"""
${rawText.slice(0, 12000)}
"""

Qoidalar:
- Har bir passage uchun: order (1, 2, 3...), title, paragraphs (har biri {label?, text} — label faqat matnda A/B/C... harflari aniq ko'rsatilgan bo'lsa)
- Har savol guruhi uchun: type FAQAT quyidagilardan biri bo'lishi mumkin: true_false_notgiven, yes_no_notgiven, short_answer, matching_information, multiple_choice_single. Boshqa turdagi savollarni (summary/table/flowchart to'ldirish, matching_headings) shu ro'yxatga ENG YAQINI bilan almashtir yoki tashlab ket.
- Har savol uchun: number (global, matndagi original raqami), prompt (savol/gap matni), accepted (to'g'ri javob(lar), massiv — bir nechta muqobil variant bo'lsa hammasini qo'sh), multiple_choice_single bo'lsa options ({key, text} massiv) ham kerak, locatorParagraph (agar javob qaysi paragrafda ekani ma'lum bo'lsa — paragraf harfi).
- O'zingdan hech narsa TO'QIMA — faqat berilgan matndan chiqar. Noaniq joyni eng yaqin taxmin bilan to'ldir, lekin javob kalitini o'zgartirma.`;
}

interface AiPassage {
  order: number;
  title: string;
  paragraphs: { label?: string; text: string }[];
  questionGroups: {
    type: string;
    instruction: string;
    questions: {
      number: number;
      prompt: string;
      options?: { key: string; text: string }[];
      accepted: string[];
      locatorParagraph?: string;
    }[];
  }[];
}

function escapeHtml(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** AI'ning yassi JSON javobini (yuqoridagi sxema) haqiqiy `Passage[]`
 * (types.ts) shakliga o'giradi — DSL parser (dsl.ts) qanday `Passage[]`
 * qaytarsa, bu ham xuddi shunday, shu bilan ikkalasi HAM keyingi bosqichga
 * (validator + preview) BIR XIL shaklda kiradi. */
export function normalizeAiPassages(data: { passages?: AiPassage[] }): Passage[] {
  const passages = Array.isArray(data.passages) ? data.passages : [];
  return passages.map((p) => ({
    order: (p.order || 1) as 1 | 2 | 3,
    title: p.title || '',
    paragraphs: (p.paragraphs || []).map((para) => ({
      label: para.label || undefined,
      html: `<p>${escapeHtml(para.text || '')}</p>`,
    })),
    questionGroups: (p.questionGroups || []).map((g, gi) => ({
      id: `ai-${p.order}-${gi + 1}`,
      type: (g.type || 'short_answer') as QuestionType,
      instructionHtml: escapeHtml(g.instruction || ''),
      questions: (g.questions || []).map((q) => ({
        number: q.number,
        promptHtml: escapeHtml(q.prompt || ''),
        options: q.options?.map((o) => ({ key: (o.key || '').toUpperCase(), text: o.text || '' })),
        answer: { accepted: Array.isArray(q.accepted) ? q.accepted.filter(Boolean) : [] },
        locatorParagraph: q.locatorParagraph || undefined,
      })),
    })),
  }));
}
