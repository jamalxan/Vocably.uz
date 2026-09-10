import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §4.1/§19 (FAZA 1): mavjud (va yangi) so'zlarni AI bilan boyitish —
// POS, ta'rif, kamida 2 ta misol jumla, kollokatsiya, so'z oilasi, inglizcha
// sinonim/antonim, CEFR, register, mavzular, mnemonika. Audio/rasm YO'Q — loyihada
// hali TTS-fayl/rasm generatsiya quvuri yo'q (models.js'dagi WordEnrichmentSchema
// izohi), shuning uchun bu yerda ham so'ralmaydi/yozilmaydi.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
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
    'pos', 'definitionEn', 'definitionUz', 'examples', 'collocations', 'wordFamily',
    'synonymsEn', 'antonyms', 'cefr', 'register', 'topics', 'mnemonicUz', 'commonMistakes',
  ],
};

function buildPrompt(word, existingTranslations) {
  return `Ingliz tili so'zi: "${word}"
Mavjud o'zbekcha tarjima(lar): ${existingTranslations.join(', ') || "yo'q"}

Shu so'z uchun o'quv lug'ati yozuvini tayyorla (JSON sxemaga qat'iy mos):
- definitionEn: sodda inglizcha ta'rif (advanced learner's dictionary uslubida)
- definitionUz: o'zbekcha ta'rif
- examples: kamida 2 ta tabiiy jumla, har biri inglizcha + o'zbekcha tarjimasi bilan, so'zning aynan shu ma'nosini ko'rsatadigan
- collocations: eng ko'p ishlatiladigan 3-5 ta so'z birikmasi ("highly resilient" kabi)
- wordFamily: bir xil o'zakdan boshqa so'z turkumlari (agar mavjud bo'lsa)
- synonymsEn: 3-5 ta INGLIZCHA yaqin ma'noli so'z (o'zbekcha tarjima emas)
- antonyms: 2-4 ta qarama-qarshi ma'noli so'z (bo'lmasa bo'sh massiv)
- cefr: CEFR darajasi (A1-C2)
- register: formal/neutral/informal/academic
- topics: 1-3 ta mavzu yorlig'i (masalan "business", "psychology")
- mnemonicUz: o'zbek tilida qisqa, ijodiy eslab qolish usuli (so'z qismlarini o'zbekcha assotsiatsiya bilan bog'lash)
- commonMistakes: o'zbek tilida so'zlashuvchilar ko'p qiladigan 1-3 ta xato (bo'lmasa bo'sh massiv)`;
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { categoryId, wordId } = await req.json();
    if (!categoryId || !wordId) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const category = user.categories.id(categoryId);
    const word = category?.words.id(wordId);
    if (!category || !word) return NextResponse.json({ error: "So'z topilmadi" }, { status: 404 });

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(word.word, word.syns || []), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'words/enrich', userId });
    }

    word.enrichment = {
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
      userMnemonicUz: word.enrichment?.userMnemonicUz || '',
      commonMistakes: Array.isArray(data.commonMistakes) ? data.commonMistakes.slice(0, 3) : [],
      audioUrl: word.enrichment?.audioUrl || { uk: '', us: '' },
      imageUrl: word.enrichment?.imageUrl || '',
      aiEnrichedAt: new Date(),
    };

    await user.save();

    return NextResponse.json({ success: true, word: word.toObject() });
  } catch (err) {
    return serverError(err, 'words/enrich');
  }
}
