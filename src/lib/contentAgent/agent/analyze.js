import { runAgentAi } from '@/lib/contentAgent/agent/aiCall';
import { SEGMENT_SCHEMA, buildSegmentPrompt, crossCheckTestBoundaries, sliceSections, joinPagesByNumbers } from '@/lib/contentAgent/parsers/bookMap';
import {
  LISTENING_SCHEMA,
  WRITING_SCHEMA,
  SPEAKING_SCHEMA,
  buildListeningPrompt,
  buildWritingPrompt,
  buildSpeakingPrompt,
  normalizeListeningParts,
  normalizeWritingTasks,
  normalizeSpeakingSection,
} from '@/lib/contentAgent/parsers/sectionParsers';
import { AI_IMPORT_RESPONSE_SCHEMA, buildAiImportPrompt, normalizeAiPassages } from '@/lib/exam/aiImportSchema';

// Admin AI chatning "kitobni ko'rib chiqib o'zi bo'laklaydi" qismi —
// server tarafidagi orkestratsiya (AI chaqiruvlari shu yerda, sof
// sxema/prompt qismi esa `../parsers/*`da).
//
// Worker pipeline'i (`worker/stages/*`) bilan BIR XIL bosqichlar, faqat:
//   - navbat/job yo'q (admin javobni darhol kutadi);
//   - R2 yo'q (fayl baytlari so'rov ichida keldi, matn DB'da);
//   - model routeri sifatida `generateJson` (Groq -> Gemini -> Cerebras ->
//     OpenRouter zanjiri) ishlatiladi, `aiRouter` (faqat OpenRouter) EMAS —
//     shu sababli bitta provayder ishlamay qolsa ham chat javob beradi.

// Bo'lim sarlavhalari — DETERMINISTIK zaxira yo'l (AI'siz). Sahifa-asosidagi
// xarita FAQAT ko'p sahifali kitobda ishlaydi; admin esa ko'pincha bitta
// passage yoki bitta test yozilgan qisqa hujjat tashlaydi — unda "sahifa"
// tushunchasi yo'q va AI xaritasi bo'sh qaytadi (bu HAQIQIY smoke-testda
// aniqlandi, 2026-09-24). Shunday holatda matn sarlavhalar bo'yicha
// kesiladi.
const HEADING_PATTERNS = [
  ['listening', /^[^\S\n]*(?:SECTION\s*\d\s*[-–—:]?\s*)?LISTENING\b/gim],
  ['reading', /^[^\S\n]*READING(?:\s+PASSAGE)?\b/gim],
  ['writing', /^[^\S\n]*WRITING(?:\s+TASK)?\b/gim],
  ['speaking', /^[^\S\n]*SPEAKING\b/gim],
  ['answerKey', /^[^\S\n]*ANSWER\s*KEYS?\b/gim],
  ['audioscript', /^[^\S\n]*(?:AUDIO\s*SCRIPTS?|AUDIOSCRIPTS?|TAPESCRIPTS?)\b/gim],
];

/** Matnni bo'lim sarlavhalari bo'yicha bo'laklarga ajratadi. Har bo'lim
 * uchun BIRINCHI sarlavha olinadi va keyingi (istalgan turdagi) sarlavhagacha
 * bo'lgan matn qaytariladi. Sof funksiya — testda qoplangan. */
export function splitByHeadings(fullText) {
  const text = String(fullText || '');
  if (!text.trim()) return {};

  const marks = [];
  for (const [key, pattern] of HEADING_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      marks.push({ key, at: match.index });
    }
  }
  if (marks.length === 0) return {};

  marks.sort((a, b) => a.at - b.at);

  const out = {};
  for (let i = 0; i < marks.length; i++) {
    const { key, at } = marks[i];
    const end = i + 1 < marks.length ? marks[i + 1].at : text.length;
    const chunk = text.slice(at, end).trim();
    // Bir bo'lim bir necha marta uchrashi mumkin (masalan "WRITING TASK 1"
    // va "WRITING TASK 2", yoki 4 ta "SECTION ... LISTENING") — bo'laklar
    // BIRLASHTIRILADI, shunda hech qanday kontent yo'qolmaydi.
    out[key] = out[key] ? `${out[key]}\n\n${chunk}` : chunk;
  }
  return out;
}

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    sectionKey: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking', 'answer_key', 'unknown'] },
    confidence: { type: 'number' },
    reason: { type: 'string' },
  },
  required: ['sectionKey', 'confidence', 'reason'],
};

/** Sarlavhasiz, bitta bo'limdan iborat matn uchun — "bu qaysi mashq turi?"
 * (foydalanuvchi talabi: "AI o'zi aniqlasin qaysi mashq turiga kiradi"). */
export async function classifyDocument(text) {
  const prompt = `Quyida IELTS o'quv materiali matni berilgan. Bu QAYSI bo'limga tegishli — Reading, Listening, Writing yoki Speaking?

MATN:
"""
${String(text || '').slice(0, 8000)}
"""

Belgilar: Reading — uzun passage + savollar; Listening — audio uchun mo'ljallangan savollar (form/note completion, "You will hear...") yoki audioscript; Writing — "Write at least 150/250 words" kabi topshiriq; Speaking — Part 1/2/3 savollari, cue card. Faqat javob kalitidan iborat bo'lsa — answer_key. Aniq ayta olmasang — unknown va past confidence. TAXMIN BILAN TO'LDIRMA. "reason" — o'zbek tilida bir jumla.`;

  const { data } = await runAgentAi({
    taskKey: 'agent.classify',
    systemPrompt: "Sen IELTS o'quv materiallarini bo'limlarga ajratadigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
    userContent: prompt,
    jsonSchema: CLASSIFY_SCHEMA,
    schemaName: 'document_classify',
  });
  return data;
}

/** Kitob "xaritasi": nechta test, qaysi bo'lim qayerda.
 *
 * Uch qatlamli, shu tartibda: (1) AI sahifa-xaritasi — ko'p sahifali
 * kitoblar uchun; (2) sarlavha bo'yicha deterministik kesish — bitta
 * testli/qisqa hujjatlar uchun; (3) AI klassifikatsiyasi — sarlavhasiz,
 * bitta bo'limdan iborat matn uchun. Birinchi natija bergan qatlam
 * ishlatiladi, lekin pastdagi qatlamlar natijasi ham qaytariladi
 * (`headingSplit`) — `parseTestSections` bo'sh bo'lim uchun ularga
 * qaytadi. */
export async function analyzeDocument({ pages }) {
  const safePages = (pages || []).map((p) => ({ n: p.n, text: p.text || '' }));
  const fullText = safePages.map((p) => p.text).join('\n\n');

  const { data } = await runAgentAi({
    taskKey: 'book.segment',
    systemPrompt: "Sen IELTS practice test kitoblarini tuzilishiga qarab xaritalaydigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
    userContent: buildSegmentPrompt(safePages),
    jsonSchema: SEGMENT_SCHEMA,
    schemaName: 'book_segment',
  });

  const tests = (Array.isArray(data.tests) ? data.tests : []).map((t, i) => ({
    index: Number.isFinite(t.index) ? t.index : i + 1,
    pageFrom: t.pageFrom ?? 1,
    pageTo: t.pageTo ?? safePages.length,
    sections: t.sections || {},
    audioscript: t.audioscript || undefined,
    confidence: typeof t.confidence === 'number' ? t.confidence : null,
  }));

  const headingSplit = splitByHeadings(fullText);
  const headingSections = ['listening', 'reading', 'writing', 'speaking'].filter((k) => (headingSplit[k] || '').trim());

  const mapHasSections = tests.some((t) => ['listening', 'reading', 'writing', 'speaking'].some((k) => t.sections?.[k]?.pageFrom != null));

  let classified = null;
  if (!mapHasSections && headingSections.length === 0 && fullText.trim()) {
    classified = await classifyDocument(fullText);
  }

  // Xarita bo'sh bo'lsa — zaxira qatlamlardan test yozuvi yasaymiz, shunda
  // chat oqimining qolgan qismi (taklif tugmasi -> apply) o'zgarishsiz
  // ishlayveradi.
  let resolvedTests = tests;
  if (!mapHasSections) {
    const fallbackKeys =
      headingSections.length > 0
        ? headingSections
        : classified && classified.sectionKey !== 'unknown' && classified.sectionKey !== 'answer_key' && classified.confidence >= 0.4
          ? [classified.sectionKey]
          : [];

    resolvedTests =
      fallbackKeys.length > 0
        ? [
            {
              index: tests[0]?.index || 1,
              pageFrom: 1,
              pageTo: safePages.length,
              // Sahifa oralig'i YO'Q (bo'sh obyekt) — bu "matn bo'yicha
              // kesiladi" degan signal (`parseTestSections`).
              sections: Object.fromEntries(fallbackKeys.map((k) => [k, {}])),
              confidence: classified?.confidence ?? null,
              sectionSource: headingSections.length > 0 ? 'headings' : 'classified',
            },
          ]
        : [];
  }

  return {
    bookTitle: (data.bookTitle || '').trim(),
    tests: resolvedTests,
    answerKeyPages: data.answerKeyPages || [],
    audioscriptPages: data.audioscriptPages || [],
    headingSplit,
    classified,
    crossCheckWarnings: crossCheckTestBoundaries(safePages, resolvedTests),
  };
}

/** Bitta test uchun mavjud bo'limlarni parse qiladi. `only` berilsa (masalan
 * ['reading']), faqat o'sha bo'lim(lar) ishlanadi — admin chatda "faqat
 * Reading'ni ol" deyishi mumkin. */
export async function parseTestSections({ pages, test, answerKeyText, audioscriptText, fallbackTexts = null, only = null }) {
  const safePages = (pages || []).map((p) => ({ n: p.n, text: p.text || '' }));
  const fromPages = sliceSections(safePages, test, audioscriptText || '');

  // Sahifa oralig'i bo'lmagan (yoki bo'sh chiqqan) bo'lim uchun sarlavha
  // bo'yicha kesilgan matnga qaytamiz — `analyzeDocument`dagi 2/3-qatlam.
  // Shusiz bitta sahifali hujjatda hech narsa joylashmasdi (smoke-testda
  // aniqlangan real xato).
  const sliced = {};
  for (const key of ['listening', 'reading', 'writing', 'speaking']) {
    sliced[key] = (fromPages[key] || '').trim() || (fallbackTexts?.[key] || '').trim();
  }
  sliced.audioscript = (fromPages.audioscript || '').trim() || (fallbackTexts?.audioscript || '').trim();
  const resolvedAnswerKey = (answerKeyText || '').trim() || (fallbackTexts?.answerKey || '').trim();

  const wanted = (key) => (!only || only.includes(key)) && (sliced[key] || '').trim().length > 0;

  const parsed = { transcripts: {} };
  const warnings = [];
  const needsReview = [];

  if (wanted('reading')) {
    const readingInput = `${sliced.reading}\n\n=== JAVOB KALITI ===\n${(answerKeyText || '').slice(0, 8000)}`;
    const { data } = await runAgentAi({
      taskKey: 'reading.parse',
      systemPrompt: "Sen IELTS Reading kontentini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildAiImportPrompt(readingInput),
      jsonSchema: AI_IMPORT_RESPONSE_SCHEMA,
      schemaName: 'reading_section',
    });
    const { passages, needsReview: readingReview } = normalizeAiPassages(data);
    parsed.reading = passages;
    needsReview.push(...readingReview.map((r) => ({ section: 'reading', ...r })));
  }

  if (wanted('listening')) {
    const { data } = await runAgentAi({
      taskKey: 'listening.parse',
      systemPrompt: "Sen IELTS Listening kontentini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildListeningPrompt(sliced.listening, resolvedAnswerKey),
      jsonSchema: LISTENING_SCHEMA,
      schemaName: 'listening_section',
    });
    const { parts, needsReview: listeningReview } = normalizeListeningParts(data, `t${test.index}`);
    parsed.listening = parts;
    needsReview.push(...listeningReview.map((r) => ({ section: 'listening', ...r })));

    // Audioscript matnini part'larga taqsimlash — DETERMINISTIK, AI'siz:
    // audioscriptda "PART 1/SECTION 1" sarlavhalari bo'lsa shular bo'yicha
    // kesiladi. Topilmasa umuman biriktirilmaydi (noto'g'ri transkript
    // biriktirishdan ko'ra, transkriptsiz qolgani yaxshi — u faqat
    // practice rejimida ko'rsatiladi va audio moslik tekshiruvida dalil
    // sifatida ishlatiladi).
    parsed.transcripts = splitAudioscriptByPart(sliced.audioscript);
  }

  if (wanted('writing')) {
    const { data } = await runAgentAi({
      taskKey: 'writing.parse',
      systemPrompt: "Sen IELTS Writing topshiriqlarini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildWritingPrompt(sliced.writing),
      jsonSchema: WRITING_SCHEMA,
      schemaName: 'writing_section',
    });
    parsed.writing = normalizeWritingTasks(data);
    const withVisual = parsed.writing.filter((t) => t.hasVisual);
    if (withVisual.length) {
      warnings.push(
        `Writing Task ${withVisual.map((t) => t.order).join(', ')} uchun grafik/diagramma kerak — rasmni chatga tashlasangiz, o'sha taskka biriktiraman.`
      );
    }
  }

  if (wanted('speaking')) {
    const { data } = await runAgentAi({
      taskKey: 'speaking.parse',
      systemPrompt: "Sen IELTS Speaking savollarini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildSpeakingPrompt(sliced.speaking),
      jsonSchema: SPEAKING_SCHEMA,
      schemaName: 'speaking_section',
    });
    parsed.speaking = normalizeSpeakingSection(data);
  }

  return { parsed, warnings, needsReview, sliced };
}

/** "PART 2" / "SECTION 3" sarlavhalari bo'yicha audioscriptni bo'laklarga
 * ajratadi. Sof funksiya (test qilinadi) — hech qanday AI yo'q. */
export function splitAudioscriptByPart(audioscriptText) {
  const text = (audioscriptText || '').trim();
  if (!text) return {};

  const pattern = /\b(?:PART|SECTION)\s*([1-4])\b/gi;
  const marks = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    marks.push({ order: Number(match[1]), at: match.index });
  }
  if (marks.length === 0) return {};

  const out = {};
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].at;
    const end = i + 1 < marks.length ? marks[i + 1].at : text.length;
    const chunk = text.slice(start, end).trim();
    // Bir xil part bir necha marta uchrasa (masalan mundarijada ham) — eng
    // UZUN bo'lagini olamiz, u haqiqiy transkript bo'lishi ehtimoli yuqori.
    if (!out[marks[i].order] || chunk.length > out[marks[i].order].length) out[marks[i].order] = chunk;
  }
  return out;
}

/** Answer key sahifalari matni — xaritada ko'rsatilgan sahifalardan. */
export function answerKeyTextFrom(pages, answerKeyPages) {
  return joinPagesByNumbers((pages || []).map((p) => ({ n: p.n, text: p.text || '' })), answerKeyPages || []);
}

export function audioscriptTextFrom(pages, audioscriptPages) {
  return joinPagesByNumbers((pages || []).map((p) => ({ n: p.n, text: p.text || '' })), audioscriptPages || []);
}
