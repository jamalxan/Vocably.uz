import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §D5 (BUG-008) — bitta so'rovda bir nechta so'zni boyitish. Avvalgi
// /api/words/enrich bitta so'z uchun bitta AI chaqiruv edi (≈10s/so'z, ketma-ket) —
// 30 so'z ≈ 5 daqiqa. Bu endpoint bitta AI chaqiruvda MAX_BATCH tagacha so'zni birga
// so'raydi; klient (WordTable.jsx) buning ustiga bir nechta partiyani PARALLEL yuboradi
// (§D5: "3 ta parallel so'rov"), shu ikkalasi birgalikda 30 so'zni ≈12-18 soniyaga tushiradi.
const MAX_BATCH = 10;

const WORD_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    word: { type: 'string' },
    pos: { type: 'string', enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'phrasal_verb'] },
    definitionEn: { type: 'string' },
    definitionUz: { type: 'string' },
    examples: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: { type: 'object', properties: { en: { type: 'string' }, uz: { type: 'string' } }, required: ['en', 'uz'] },
    },
    collocations: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    wordFamily: {
      type: 'array',
      items: { type: 'object', properties: { form: { type: 'string' }, pos: { type: 'string' } }, required: ['form', 'pos'] },
      maxItems: 4,
    },
    synonymsEn: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    antonyms: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    cefr: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    register: { type: 'string', enum: ['formal', 'neutral', 'informal', 'academic'] },
    topics: { type: 'array', items: { type: 'string' }, maxItems: 3 },
    mnemonicUz: { type: 'string' },
    commonMistakes: { type: 'array', items: { type: 'string' }, maxItems: 3 },
  },
  required: [
    'word', 'pos', 'definitionEn', 'definitionUz', 'examples', 'collocations', 'wordFamily',
    'synonymsEn', 'antonyms', 'cefr', 'register', 'topics', 'mnemonicUz', 'commonMistakes',
  ],
};

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: { results: { type: 'array', items: WORD_ITEM_SCHEMA } },
  required: ['results'],
};

function buildPrompt(items) {
  const list = items.map((it, i) => `${i + 1}. "${it.word}" (mavjud tarjima: ${it.syns.join(', ') || "yo'q"})`).join('\n');
  return `Quyidagi ${items.length} ta ingliz tili so'zining har biri uchun o'quv lug'ati yozuvini tayyorla (JSON sxemaga qat'iy mos, "results" massivi — AYNAN shu tartibda, ${items.length} ta element):
${list}

Har bir element uchun:
- word: aynan so'zning o'zi (yuqoridagi ro'yxatdagidek)
- definitionEn: sodda inglizcha ta'rif (advanced learner's dictionary uslubida)
- definitionUz: o'zbekcha ta'rif
- examples: kamida 2 ta tabiiy jumla, har biri inglizcha + o'zbekcha tarjimasi bilan
- collocations: eng ko'p ishlatiladigan 3-5 ta so'z birikmasi
- wordFamily: bir xil o'zakdan boshqa so'z turkumlari (agar mavjud bo'lsa)
- synonymsEn: 3-5 ta INGLIZCHA yaqin ma'noli so'z
- antonyms: 2-4 ta qarama-qarshi ma'noli so'z (bo'lmasa bo'sh massiv)
- cefr: CEFR darajasi (A1-C2)
- register: formal/neutral/informal/academic
- topics: 1-3 ta mavzu yorlig'i
- mnemonicUz: o'zbek tilida qisqa, ijodiy eslab qolish usuli
- commonMistakes: o'zbek tilida so'zlashuvchilar ko'p qiladigan 1-3 ta xato (bo'lmasa bo'sh massiv)`;
}

function toEnrichment(data, existing) {
  return {
    pos: data.pos || '',
    definitionEn: data.definitionEn || '',
    definitionUz: data.definitionUz || '',
    examples: Array.isArray(data.examples) ? data.examples.slice(0, 3) : [],
    collocations: Array.isArray(data.collocations) ? data.collocations.slice(0, 5) : [],
    wordFamily: Array.isArray(data.wordFamily) ? data.wordFamily.slice(0, 4) : [],
    synonymsEn: Array.isArray(data.synonymsEn) ? data.synonymsEn.slice(0, 5) : [],
    antonyms: Array.isArray(data.antonyms) ? data.antonyms.slice(0, 4) : [],
    cefr: data.cefr || '',
    register: data.register || '',
    topics: Array.isArray(data.topics) ? data.topics.slice(0, 3) : [],
    mnemonicUz: data.mnemonicUz || '',
    userMnemonicUz: existing?.userMnemonicUz || '',
    commonMistakes: Array.isArray(data.commonMistakes) ? data.commonMistakes.slice(0, 3) : [],
    audioUrl: existing?.audioUrl || { uk: '', us: '' },
    imageUrl: existing?.imageUrl || '',
    aiEnrichedAt: new Date(),
  };
}

// AI natijalarini kiritilgan so'zlarga moslashtiradi: avval aniq nom bo'yicha (case-insensitive),
// keyin (Groq/OpenRouter erkin matn JSON qaytarganda tartib buzilishi mumkin) qolganlarni
// pozitsiya bo'yicha to'ldiradi.
function matchResults(items, results) {
  const byWord = new Map();
  for (const r of Array.isArray(results) ? results : []) {
    const key = String(r?.word || '').trim().toLowerCase();
    if (key && !byWord.has(key)) byWord.set(key, r);
  }
  const usedResults = new Set();
  const matched = items.map((it) => {
    const r = byWord.get(it.word.trim().toLowerCase());
    if (r) usedResults.add(r);
    return r || null;
  });
  const leftoverResults = (Array.isArray(results) ? results : []).filter((r) => !usedResults.has(r));
  let leftoverIdx = 0;
  return matched.map((r) => (r ? r : leftoverResults[leftoverIdx++] || null));
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { categoryId, wordIds } = await req.json();
    if (!categoryId || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    const targetIds = wordIds.slice(0, MAX_BATCH);

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const category = user.categories.id(categoryId);
    if (!category) return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });

    const items = targetIds
      .map((id) => category.words.id(id))
      .filter(Boolean)
      .map((w) => ({ wordId: String(w._id), word: w.word, syns: w.syns || [] }));
    if (items.length === 0) return NextResponse.json({ error: "So'zlar topilmadi" }, { status: 404 });

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(items), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'words/enrich-batch', userId });
    }

    const matched = matchResults(items, data?.results);
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const { wordId, word } = items[i];
      const result = matched[i];
      const wordDoc = category.words.id(wordId);
      if (!result) {
        results.push({ wordId, word, error: "AI bu so'z uchun natija qaytarmadi" });
        continue;
      }
      wordDoc.enrichment = toEnrichment(result, wordDoc.enrichment);
      results.push({ wordId, word, success: true, enrichment: wordDoc.enrichment });
    }

    await user.save();

    return NextResponse.json({ results });
  } catch (err) {
    return serverError(err, 'words/enrich-batch');
  }
}
