import { getGeminiClient } from '@/lib/gemini';
import { streamOpenAiCompatible } from '@/lib/providers/openaiCompatible';
import { withRetry, resolveModelChainOrder, aiErrorResponse } from '@/lib/ai/client';

// src/app/api/words/enrich/route.js'da ishlab chiqilgan Groq -> OpenRouter -> Gemini
// zaxira zanjirini umumlashtiradi — FAZA 3'ning Reading/Listening/Writing/Speaking
// generatsiya va baholash endpoint'lari ham xuddi shu naqshga muhtoj edi. Gemini
// structured-output (responseSchema) bergani uchun eng ishonchli, lekin oxirgi
// zaxira sifatida qoldiriladi (GEMINI_API_KEY har doim sozlanmagan bo'lishi mumkin).
//
// TZ-vocably-v2.md §D1 (BUG-006): har provayder endi 3 marta eksponensial backoff bilan
// qayta uriniladi (src/lib/ai/client.js withRetry) — avval bitta muvaffaqiyatsiz urinish
// darhol keyingi provayderga o'tkazib yuborardi, hatto vaqtinchalik (429/503) xato
// bo'lsa ham. Zanjir tartibi `AI_MODEL_CHAIN` env orqali sozlanishi mumkin.
const JSON_INSTRUCTION =
  '\n\nJAVOBNI FAQAT xom JSON obyekti sifatida qaytar — hech qanday izoh, markdown yoki ```json bloki bo\'lmasin.';

function extractJson(text) {
  const match = /\{[\s\S]*\}/.exec(text || '');
  if (!match) throw new Error('Javobda JSON topilmadi');
  return JSON.parse(match[0]);
}

async function viaGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY yo'q");
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

async function viaOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY yo'q");
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    extraHeaders: { 'HTTP-Referer': process.env.APP_URL || 'https://vocably.app', 'X-Title': 'Vocably' },
    messages: [{ role: 'user', content: prompt + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

async function viaGemini(prompt, schema) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  });
  return JSON.parse(result.response.text());
}

const PROVIDER_FNS = {
  groq: (prompt) => viaGroq(prompt),
  openrouter: (prompt) => viaOpenRouter(prompt),
  gemini: (prompt, schema) => viaGemini(prompt, schema),
};

/** `prompt` — to'liq matn (kutilgan JSON tuzilma tavsifi bilan). `schema` — faqat
 * Gemini uchun (responseSchema); Groq/OpenRouter'da prompt ichidagi tavsifga tayaniladi. */
export async function generateJson(prompt, schema) {
  const order = resolveModelChainOrder(['groq', 'openrouter', 'gemini']);
  let lastErr;
  for (const name of order) {
    try {
      return await withRetry(() => PROVIDER_FNS[name](prompt, schema));
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/** @deprecated `aiErrorResponse(err, meta)` dan foydalaning — u log (requestId bilan) +
 * o'zbekcha xabarni bitta NextResponse'da birlashtiradi. Eski chaqiruvchilar buzilmasligi
 * uchun saqlab qolindi. */
export { toUserMessage as friendlyAiError } from '@/lib/ai/client';
export { aiErrorResponse };
