// Kitob "xaritasi" — nechta test bor, har testning Listening/Reading/Writing/
// Speaking bo'limi qaysi sahifalarda, Answer Key/Audioscript qayerda.
//
// Bu sxema+prompt AVVAL `worker/stages/segment.ts` ichida yashardi. Admin AI
// chat (2026-09-24) xuddi shu xaritani worker'siz, yuklangan faylning o'zidan
// chiqarishi kerak — "AI kitobni ko'rib chiqib, qaysi bo'lim qayerdaligini
// O'ZI aniqlasin" talabi aynan shu bosqich. Shuning uchun SOF qism (sxema,
// prompt, deterministik cross-check) shu yerga ko'chirildi; worker bosqichi
// endi shu moduldan import qiladi — ikkala oqim BIR XIL xarita mantiqidan
// foydalanadi.
export const SEGMENT_PROMPT_VERSION = 'v2';

export const SEGMENT_SCHEMA = {
  type: 'object',
  properties: {
    // Admin chat uchun qo'shildi (worker bosqichi buni o'qimaydi — u
    // sarlavhani adminning o'zi kiritgan `ContentBook.title`dan oladi):
    // chatda admin hech qanday forma to'ldirmaydi, shuning uchun kitob
    // nomini matnning o'zidan aniqlash kerak.
    bookTitle: { type: 'string' },
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          pageFrom: { type: 'integer' },
          pageTo: { type: 'integer' },
          sections: {
            type: 'object',
            properties: {
              listening: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              reading: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              writing: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              speaking: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
            },
          },
          // "Audioscripts" bo'limi odatda kitob OXIRIDA, testlar bo'yicha
          // alohida guruhlangan — audio<->test moslashtirish uchun kerak.
          audioscript: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
          confidence: { type: 'number' },
        },
        required: ['index', 'pageFrom', 'pageTo', 'sections'],
      },
    },
    answerKeyPages: { type: 'array', items: { type: 'integer' } },
    audioscriptPages: { type: 'array', items: { type: 'integer' } },
    generalTrainingPages: { type: 'array', items: { type: 'integer' } },
    frontMatterPages: { type: 'array', items: { type: 'integer' } },
  },
  required: ['tests'],
};

export interface SegmentPage {
  n: number;
  text: string;
}

export function buildSegmentPrompt(pages: SegmentPage[]): string {
  const numbered = pages.map((p) => `[PAGE ${p.n}]\n${p.text.slice(0, 2000)}`).join('\n\n');
  return `Quyida IELTS practice test kitobining HAR SAHIFA matni (sahifa raqami bilan belgilangan) berilgan.

Vazifang: kitobning STRUKTURAVIY XARITASINI chiqarish — nechta test bor, har biri qaysi sahifalarda, har testning Listening/Reading/Writing/Speaking bo'limlari qaysi sahifa oralig'ida, Answer Key va Audioscript qaysi sahifalarda.

QATTIQ QOIDA: matnni KO'CHIRMA — faqat sahifa raqamlarini aniqla. Har bir "Test N" sarlavhasi, "Reading Passage", "SECTION", "Answer Key", "Audioscripts/Tapescripts" kabi belgilarni izlab, qaysi sahifada boshlanib qaysi sahifada tugashini top.

MUHIM: "Audioscripts"/"Tapescripts" bo'limi odatda kitob oxirida, HAR TEST UCHUN ALOHIDA guruhlangan bo'ladi (masalan "Test 1 Audioscript", "Test 2 Audioscript" kabi sarlavhalar bilan). Agar buni ajrata olsang, har testning "audioscript" maydoniga O'SHA testga tegishli audioscript sahifa oralig'ini yoz — bu audio fayl(lar)ni to'g'ri testga bog'lash uchun ishlatiladi. Ajrata olmasang, bo'sh qoldir (umumiy "audioscriptPages" baribir bor).

"bookTitle" — hujjatning o'zidan aniqlangan kitob/to'plam nomi (masalan "Cambridge IELTS 19"). Muqovada yoki kolontitulda ko'rinmasa, bo'sh qoldir — O'YLAB TOPMA.

MUHIM 2: kitobda faqat BITTA bo'lim bo'lishi ham mumkin (masalan faqat Reading mashqlari to'plami, yoki bitta ko'chirilgan passage). Bunday holda ham bitta "test" yozuvi qaytar — faqat mavjud bo'lim(lar)ni to'ldirib, qolganini bo'sh qoldir. Yo'q bo'limni O'YLAB TOPMA.

SAHIFALAR:
"""
${numbered.slice(0, 100000)}
"""

Agar biror narsa noaniq bo'lsa (masalan test chegarasi aniq ko'rinmasa), eng yaqin taxminni ber, lekin "confidence"ni pastroq qo'y (0-1 oralig'ida) — 0'ga yaqin taxminiy, 1'ga yaqin ishonchli.`;
}

/** Yengil, deterministik tekshiruv — AI aytgan "Test N" sahifa oralig'ida
 * haqiqatan ham shu raqam matnda uchraydimi (regex). Mos kelmasa hard-block
 * QILMAYDI (AI xatosi ham, matn formatining g'alatiligi ham bo'lishi mumkin)
 * — faqat ogohlantirish sifatida qaytariladi. */
export function crossCheckTestBoundaries(
  pages: SegmentPage[],
  tests: { index: number; pageFrom: number; pageTo: number }[]
): string[] {
  const warnings: string[] = [];
  const textByPage = new Map(pages.map((p) => [p.n, p.text] as const));
  for (const t of tests) {
    const windowText = Array.from({ length: Math.max(1, t.pageTo - t.pageFrom + 1) }, (_, i) => textByPage.get(t.pageFrom + i) || '').join(' ');
    const pattern = new RegExp(`test\\s*${t.index}\\b`, 'i');
    if (!pattern.test(windowText)) {
      warnings.push(`Test ${t.index}: "Test ${t.index}" matni ${t.pageFrom}-${t.pageTo} sahifalarda topilmadi (AI xarita xatosi bo'lishi mumkin)`);
    }
  }
  return warnings;
}

export interface BookMapTest {
  index: number;
  pageFrom: number;
  pageTo: number;
  sections: Record<string, { pageFrom: number; pageTo: number } | undefined>;
  audioscript?: { pageFrom: number; pageTo: number };
  confidence?: number;
}

/** Xarita bo'yicha sahifa matnlarini bo'limlarga DETERMINISTIK kesish
 * (`worker/stages/splitSections.ts` bilan bir xil mantiq — AI bu yerda
 * umuman qatnashmaydi, shuning uchun bu bosqich hech qachon matn
 * "to'qiy" olmaydi). */
export function sliceSections(pages: SegmentPage[], test: BookMapTest, fallbackAudioscript: string) {
  const join = (range?: { pageFrom: number; pageTo: number }) =>
    range == null
      ? ''
      : pages
          .filter((p) => p.n >= range.pageFrom && p.n <= range.pageTo)
          .map((p) => p.text)
          .join('\n\n');

  return {
    listening: join(test.sections?.listening),
    reading: join(test.sections?.reading),
    writing: join(test.sections?.writing),
    speaking: join(test.sections?.speaking),
    audioscript: (test.audioscript ? join(test.audioscript) : '') || fallbackAudioscript,
  };
}

export function joinPagesByNumbers(pages: SegmentPage[], pageNumbers: number[]): string {
  return pageNumbers
    .map((n) => pages.find((p) => p.n === n)?.text || '')
    .filter(Boolean)
    .join('\n\n');
}
