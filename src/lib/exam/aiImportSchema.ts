// TZ-vocably-v2.md §15.1 item 3 — "AI yordamchi: xom matn + javob kalitini
// joylashtiradi, AI Test JSON'ini generatsiya qiladi." Sof qism (bu fayl):
// AI JSON sxemasi (faqat Gemini `responseSchema` sifatida ishlatiladi — Groq/
// Cerebras/OpenRouter faqat PROMPT MATNIGA tayanadi, structured output yo'q,
// q. `aiJson.js`/`generateJson`) + AI'ning yassi JSON javobini haqiqiy
// `Passage[]` (types.ts) shakliga o'giradigan funksiya — DB/tarmoq bilan
// ishlamaydi, shuning uchun unit-test qilinadi. AI chaqiruvining o'zi
// (`generateJson`) `/api/admin/exam-tests/ai-generate/route.js`da.
//
// AUDIT P0-01 (VOCABLY_TZ_FINAL... 2026-09-20 §3): avval faqat 5 ta "tekis"
// tur qabul qilinardi (TFNG/YNG/short_answer/matching_information/
// multiple_choice_single), prompt esa qolgan hamma turni "eng yaqiniga
// almashtir yoki tashla" deb buyurardi — bu professional IELTS kontent uchun
// yaroqsiz (matching_headings/summary/table kabi turlar shunchaki yo'qolib
// ketardi yoki noto'g'ri tur bilan buzib saqlanardi). Endi Reading uchun
// MUMKIN bo'lgan deyarli barcha DSL turi (types.ts `QuestionType`) qamrab
// olinadi, VA aniq bo'lmagan joy uchun majburiy almashtirish o'rniga
// `needsReview`/`reviewReason` chiqish yo'li bor.
//
// ATAYLAB TASHQARIDA QOLDIRILGAN 4 tur (buni ATAYLAB qildim, tasodifan emas):
//  - `form_completion`, `map_label`, `plan_label` — types.ts'da "Faqat
//    Listening" deb belgilangan, bu endpoint esa faqat Reading matni oladi.
//  - `diagram_label` — rasm (imageUrl + hotspot koordinatalari) talab qiladi;
//    bu endpoint faqat XOM MATN oladi (rasm yuklash/tahlil yo'q), shuning
//    uchun AI hech qachon haqiqiy imageUrl chiqara olmaydi — buni "eng
//    yaqin" boshqa turga majburan almashtirish yolg'on kontent yaratardi.
//    Rasm asosidagi turlar TZ §2 (AI Content Studio, alohida asset pipeline)
//    doirasida, bu oddiy matn-import endpointida emas.
import type { BankItem, Passage, QuestionType, WordLimit } from './types';

// Reading uchun to'liq qamrab olinadigan 15 tur (19 tadan 4 tasi yuqoridagi
// sabablar bilan chiqarib tashlangan).
const AI_IMPORT_QUESTION_TYPES: QuestionType[] = [
  'multiple_choice_single',
  'multiple_choice_multi',
  'sentence_completion',
  'short_answer',
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'summary_completion',
  'summary_completion_bank',
  'matching_features',
  'matching_sentence_endings',
  'matching_headings',
  'matching_information',
  'true_false_notgiven',
  'yes_no_notgiven',
];

// Guruh darajasida umumiy `stemHtml` + `{{qN}}` karkasga muhtoj turlar
// (GroupGapFill.tsx) — bularda `question.prompt` deyarli bo'sh qoladi, o'rniga
// butun matn `stemHtml`da bitta joyda beriladi.
const STEM_BASED_TYPES = new Set<QuestionType>([
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'summary_completion',
  'summary_completion_bank',
]);

// Guruh darajasidagi umumiy variantlar banki talab qiladigan turlar
// (matching_headings/features/sentence_endings/summary_completion_bank).
const BANK_BASED_TYPES = new Set<QuestionType>([
  'matching_headings',
  'matching_features',
  'matching_sentence_endings',
  'summary_completion_bank',
]);

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
                type: { type: 'string', enum: AI_IMPORT_QUESTION_TYPES },
                instruction: { type: 'string' },
                // Faqat STEM_BASED_TYPES uchun: {{q14}} kabi joylar bilan umumiy matn/jadval/diagramma karkasi.
                stemHtml: { type: 'string' },
                wordLimit: {
                  type: 'object',
                  properties: { maxWords: { type: 'integer' }, maxNumbers: { type: 'integer' }, label: { type: 'string' } },
                },
                // Faqat BANK_BASED_TYPES uchun: umumiy variantlar ro'yxati (sarlavhalar/ismlar/gap oxirlari/so'zlar).
                bank: {
                  type: 'array',
                  items: { type: 'object', properties: { key: { type: 'string' }, text: { type: 'string' } }, required: ['key', 'text'] },
                },
                bankReusable: { type: 'boolean' },
                // AI ushbu guruh turini/mazmunini ANIQ deb hisoblamasa: true + sabab. Majburan
                // "eng yaqin" turga almashtirish O'RNIGA shu ishlatiladi (audit P0-01 talabi).
                needsReview: { type: 'boolean' },
                reviewReason: { type: 'string' },
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
                      selectCount: { type: 'integer' },
                      accepted: { type: 'array', items: { type: 'string' } },
                      locatorParagraph: { type: 'string' },
                    },
                    required: ['number', 'accepted'],
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

Har savol guruhi (questionGroup) uchun "type" FAQAT quyidagilardan biri bo'lishi mumkin — hech qachon ro'yxatda yo'q turga "eng yaqini" bilan majburan almashtirma, buning o'rniga pastdagi "Noaniq holat" qoidasiga qara:

1. **Savol darajasida javob** (har savol o'z promptiga ega, "prompt" majburiy):
   - true_false_notgiven / yes_no_notgiven — prompt: gap matni, accepted: ["TRUE"|"FALSE"|"NOT GIVEN"] (yoki YES/NO/NOT GIVEN).
   - multiple_choice_single — prompt: savol, options: [{key:"A", text}, ...], accepted: [to'g'ri harf].
   - multiple_choice_multi — prompt: savol ("Choose TWO letters" kabi), options, selectCount: nechta harf tanlanishi kerak (2 yoki 3), accepted: to'g'ri harflar massivi (uzunligi selectCount bilan bir xil).
   - sentence_completion — prompt ICHIDA aynan "{{qN}}" belgisi bo'lishi SHART (N = shu savol raqami), masalan "In 1932 the factory produced {{q14}}.". accepted: gapga to'g'ri keladigan so'z(lar).
   - short_answer — prompt: to'liq savol matni (masalan "What did the factory produce in 1932?"), accepted: qisqa javob(lar).

2. **Guruh darajasida umumiy bank** (matching turlari — har savolning "prompt"i bank ichidagi variant emas, balki solishtiriladigan narsa: paragraf tavsifi/odam ismi/gap boshi):
   - matching_headings — guruh "bank": rim raqamlari bilan sarlavhalar ro'yxati ([{key:"i", text:"..."}, {key:"ii", text:"..."}]), har savol prompt: "Paragraph A" kabi va accepted: [to'g'ri sarlavha key'i].
   - matching_information — guruh "bank"ni ODATDA BO'SH qoldir (variantlar avtomatik paragraf harflaridan olinadi, UI o'zi to'ldiradi); har savol prompt: qidirilayotgan ma'lumot tavsifi, accepted: [paragraf harfi], bankReusable: true.
   - matching_features — guruh "bank": odam ismlari/xususiyatlar ro'yxati ([{key:"A", text:"Dr Smith"}, ...]), har savol prompt: fikr/tavsif, accepted: [bank key'i].
   - matching_sentence_endings — guruh "bank": gap oxirlari ro'yxati ([{key:"A", text:"...because it was cheap."}, ...]), har savol prompt: gapning BOSHI, accepted: [to'g'ri oxir key'i].

3. **Guruh darajasida umumiy stemHtml** (bitta umumiy matn/jadval/diagramma karkasi, ichida "{{qN}}" bo'shliqlar — har savolning "prompt"ini BO'SH qoldir, "accepted"ni yoz):
   - note_completion / table_completion / flowchart_completion / summary_completion — guruh "stemHtml": asl matnni saqlagan holda har bo'sh joyni aynan "{{qN}}" bilan belgila (masalan jadval uchun "<table><tr><td>Year</td><td>{{q14}}</td></tr></table>", note uchun oddiy matn ichida "{{qN}}"). wordLimit ko'rsat (masalan {maxWords:2, label:"NO MORE THAN TWO WORDS"}).
   - summary_completion_bank — xuddi shu, lekin qo'shimcha guruh "bank": tanlanadigan so'zlar ro'yxati ([{key:"A", text:"..."}, ...]), wordLimit shart emas (bankdan tanlanadi).

Umumiy qoidalar:
- Har bir passage uchun: order (1, 2, 3...), title, paragraphs (har biri {label?, text} — label faqat matnda A/B/C... harflari aniq ko'rsatilgan bo'lsa).
- number — har doim global, matndagi original savol raqami. locatorParagraph — agar javob qaysi paragrafda ekani ANIQ ma'lum bo'lsa (paragraf harfi), aks holda qoldirib ket.
- O'zingdan hech narsa TO'QIMA — faqat berilgan matndan chiqar.
- **Noaniq holat**: agar savol guruhining turi yuqoridagi 15 tadan qay biri ekanini ANIQ ajrata olmasang, YOKI kontent (masalan rasm/diagramma/xarita talab qiladigan savol) shu ro'yxatdagi hech biriga to'g'ri kelmasa — turni TAXMIN QILIB TO'QIMA. Eng yaqin ko'ringan turni tanla, LEKIN shu guruhga "needsReview: true" va "reviewReason"ga aniq nima noaniq ekanini (masalan "Diagram-based turdek ko'rinadi, lekin rasm matn ichida yo'q — qo'lda tekshirish kerak") yoz. Admin buni ko'rib chiqib qaror qiladi, sen javob kalitini hech qachon o'zgartirma yoki taxmin bilan to'ldirma.`;
}

interface AiQuestionGroup {
  type: string;
  instruction: string;
  stemHtml?: string;
  wordLimit?: { maxWords?: number; maxNumbers?: number; label?: string };
  bank?: { key: string; text: string }[];
  bankReusable?: boolean;
  needsReview?: boolean;
  reviewReason?: string;
  questions: {
    number: number;
    prompt?: string;
    options?: { key: string; text: string }[];
    selectCount?: number;
    accepted: string[];
    locatorParagraph?: string;
  }[];
}

interface AiPassage {
  order: number;
  title: string;
  paragraphs: { label?: string; text: string }[];
  questionGroups: AiQuestionGroup[];
}

export interface AiImportNeedsReview {
  passageOrder: number;
  groupId: string;
  type: string;
  reason: string;
}

function escapeHtml(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeBank(bank: { key: string; text: string }[] | undefined): BankItem[] | undefined {
  if (!Array.isArray(bank) || bank.length === 0) return undefined;
  return bank.map((b) => ({ key: (b.key || '').toUpperCase(), text: b.text || '' }));
}

function normalizeWordLimit(wl: AiQuestionGroup['wordLimit']): WordLimit | undefined {
  if (!wl || !wl.maxWords) return undefined;
  return { maxWords: wl.maxWords, maxNumbers: wl.maxNumbers, label: wl.label || `NO MORE THAN ${wl.maxWords} WORDS` };
}

/** AI o'zi tanlagan `type` uchun kerakli maydonlarni chindan ham to'ldirganmi
 * — tekshiradi va agar yo'q bo'lsa (masalan bank-based turga bank bermagan,
 * yoki stem-based turga stemHtml bermagan) buni ham `needsReview`ga aylantiradi.
 * Bu AI'ning o'z e'lon qilgan `needsReview: false`siga ko'r-ko'rona ishonmaydi —
 * strukturaviy jihatdan tekshirib chiqadi (audit P0-01: "AI hech qachon 'eng
 * yaqin type'ga o'zboshimchalik bilan almashtirmasligi kerak" talabining
 * kod tomonidagi kafolati). */
function detectMissingFields(type: QuestionType, g: AiQuestionGroup): string | null {
  if (STEM_BASED_TYPES.has(type) && !g.stemHtml?.trim()) {
    return `"${type}" turi stemHtml ({{qN}} bilan umumiy karkas) talab qiladi, lekin AI uni bermadi.`;
  }
  if (BANK_BASED_TYPES.has(type) && type !== 'matching_information' && (!Array.isArray(g.bank) || g.bank.length === 0)) {
    return `"${type}" turi guruh darajasidagi "bank" (variantlar ro'yxati) talab qiladi, lekin AI uni bermadi.`;
  }
  if ((type === 'multiple_choice_single' || type === 'multiple_choice_multi') && g.questions.some((q) => !q.options?.length)) {
    return `"${type}" turidagi savollarda "options" yo'q.`;
  }
  return null;
}

/** AI'ning yassi JSON javobini (yuqoridagi sxema) haqiqiy `Passage[]`
 * (types.ts) shakliga o'giradi — DSL parser (dsl.ts) qanday `Passage[]`
 * qaytarsa, bu ham xuddi shunday, shu bilan ikkalasi HAM keyingi bosqichga
 * (validator + preview) BIR XIL shaklda kiradi. `needsReview` — admin UI'da
 * "AI aniq bo'lmagan deb belgilagan" ro'yxati sifatida alohida ko'rsatiladi
 * (P0-01: majburiy tur almashtirish o'rniga ochiq exception queue). */
export function normalizeAiPassages(data: { passages?: AiPassage[] }): { passages: Passage[]; needsReview: AiImportNeedsReview[] } {
  const rawPassages = Array.isArray(data.passages) ? data.passages : [];
  const needsReview: AiImportNeedsReview[] = [];

  const passages = rawPassages.map((p) => ({
    order: (p.order || 1) as 1 | 2 | 3,
    title: p.title || '',
    paragraphs: (p.paragraphs || []).map((para) => ({
      label: para.label || undefined,
      html: `<p>${escapeHtml(para.text || '')}</p>`,
    })),
    questionGroups: (p.questionGroups || []).map((g, gi) => {
      const id = `ai-${p.order}-${gi + 1}`;
      const type = (AI_IMPORT_QUESTION_TYPES.includes(g.type as QuestionType) ? g.type : 'short_answer') as QuestionType;

      const missing = detectMissingFields(type, g);
      if (g.type !== type) {
        needsReview.push({ passageOrder: p.order, groupId: id, type: g.type, reason: `AI noma'lum tur qaytardi ("${g.type}") — short_answer'ga zaxiralab qo'yildi, qo'lda tekshiring.` });
      } else if (g.needsReview || missing) {
        needsReview.push({ passageOrder: p.order, groupId: id, type, reason: missing || g.reviewReason || 'AI bu guruhni aniq emas deb belgiladi.' });
      }

      return {
        id,
        type,
        instructionHtml: escapeHtml(g.instruction || ''),
        stemHtml: g.stemHtml?.trim() || undefined,
        wordLimit: normalizeWordLimit(g.wordLimit),
        bank: normalizeBank(g.bank),
        bankReusable: g.bankReusable ?? undefined,
        questions: (g.questions || []).map((q) => ({
          number: q.number,
          promptHtml: escapeHtml(q.prompt || ''),
          options: q.options?.map((o) => ({ key: (o.key || '').toUpperCase(), text: o.text || '' })),
          selectCount: q.selectCount || undefined,
          answer: { accepted: Array.isArray(q.accepted) ? q.accepted.filter(Boolean) : [] },
          locatorParagraph: q.locatorParagraph || undefined,
        })),
      };
    }),
  }));

  return { passages, needsReview };
}
