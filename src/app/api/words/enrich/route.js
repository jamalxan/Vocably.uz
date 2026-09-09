import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getGeminiClient } from '@/lib/gemini';
import { streamOpenAiCompatible } from '@/lib/providers/openaiCompatible';
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

// chat/route.js'dagi bilan bir xil chidamlilik naqshi (o'sha yerdagi izohga q.): Groq (eng
// tez/bepul) -> OpenRouter -> Gemini (oxirgi zaxira). Gemini structured-output (responseSchema)
// bergani uchun eng ishonchli, lekin GEMINI_API_KEY har doim ham sozlanmagan bo'lishi mumkin —
// shu sabab birinchi EMAS, oxirgi urinish sifatida qoldirildi (agar ikkalasi ham sozlangan bo'lsa,
// avval tezroq/bepul Groq sinaladi).
const JSON_INSTRUCTION =
  '\n\nJAVOBNI FAQAT xom JSON obyekti sifatida qaytar — hech qanday izoh, markdown yoki ```json bloki bo\'lmasin.';

function extractJson(text) {
  const match = /\{[\s\S]*\}/.exec(text || '');
  if (!match) throw new Error("Javobda JSON topilmadi");
  return JSON.parse(match[0]);
}

async function enrichWithGroq(word, translations) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY yo\'q');
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: buildPrompt(word, translations) + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

async function enrichWithOpenRouter(word, translations) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY yo\'q');
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    extraHeaders: { 'HTTP-Referer': process.env.APP_URL || 'https://vocably.app', 'X-Title': 'Vocably' },
    messages: [{ role: 'user', content: buildPrompt(word, translations) + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

async function enrichWithGemini(word, translations) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: buildPrompt(word, translations) }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
  });
  return JSON.parse(result.response.text());
}

async function enrichWord(word, translations) {
  const attempts = [enrichWithGroq, enrichWithOpenRouter, enrichWithGemini];
  let lastErr;
  for (const attempt of attempts) {
    try {
      return await attempt(word, translations);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
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

    let data;
    try {
      data = await enrichWord(word.word, word.syns || []);
    } catch (aiErr) {
      const msg = aiErr?.message || "Noma'lum xatolik";
      const friendly = /quota|rate limit|429/i.test(msg)
        ? "AI xizmati hozir band (so'rovlar chegarasi to'ldi). Bir necha daqiqadan keyin qayta urinib ko'ring."
        : `AI bilan boyitib bo'lmadi: ${msg}`;
      return NextResponse.json({ error: friendly }, { status: 502 });
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
