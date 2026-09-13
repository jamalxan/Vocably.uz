import { getGeminiClient } from '@/lib/gemini';
import { streamOpenAiCompatible } from '@/lib/providers/openaiCompatible';
import { withRetry, resolveModelChainOrder, aiErrorResponse } from '@/lib/ai/client';

// src/app/api/words/enrich/route.js'da ishlab chiqilgan Groq -> Gemini -> Cerebras ->
// OpenRouter zaxira zanjirini umumlashtiradi — FAZA 3'ning Reading/Listening/Writing/
// Speaking generatsiya va baholash endpoint'lari ham xuddi shu naqshga muhtoj edi.
//
// TZ-vocably-v2.md §D1 (BUG-006): har provayder endi 3 marta eksponensial backoff bilan
// qayta uriniladi (src/lib/ai/client.js withRetry) — avval bitta muvaffaqiyatsiz urinish
// darhol keyingi provayderga o'tkazib yuborardi, hatto vaqtinchalik (429/503) xato
// bo'lsa ham. Zanjir tartibi `AI_MODEL_CHAIN` env orqali sozlanishi mumkin.
//
// 2026-09-13: barcha 4 provayder haqiqiy kalit bilan jonli sinaldi (ushbu
// sessiyaning o'zida, alohida `node --env-file=.env` skriptlari orqali —
// bu faylning testlari mock `fetch` ishlatadi, shuning uchun bu tekshiruv
// FAQAT shu tarzda qo'lda qilinishi mumkin edi). Natija — tartib shunga
// qarab tanlangan:
//   - Groq: ISHLAYDI, lekin eski model ID (`llama-3.3-70b-versatile`) endi
//     mavjud emas (404) — Groq katalogi o'zgargan, `openai/gpt-oss-120b`ga
//     yangilandi.
//   - Gemini: ISHLAYDI, model ID (`gemini-3.6-flash`) allaqachon to'g'ri
//     edi (eski, "deprecated" nomlardan biri emas — Google'ning o'zi ham
//     404 xabarida aynan shu modelni tavsiya qiladi).
//   - Cerebras: autentifikatsiya ishlaydi (200 `/models`), lekin haqiqiy
//     chaqiruv 402 "Payment required" qaytaradi — hisobda kredit yo'q.
//   - OpenRouter: eski bepul model slug'i (`meta-llama/llama-3.3-70b-
//     instruct:free`) endi 404 — `google/gemma-4-31b-it:free`ga
//     yangilandi; lekin $0 balansli hisob umumiy bepul pool'da 429'ga
//     tez uchraydi (vaqtinchalik, retry bilan hal bo'ladi — hisobdagi
//     haqiqiy pul yo'qligi sababli emas, provayderning umumiy navbati
//     bandligi sababli).
// Xulosa: Groq va Gemini HOZIR ishonchli ishlaydi, Cerebras/OpenRouter esa
// kredit/navbat sababli hozircha ko'proq zaxira vazifasini o'taydi —
// zanjirning o'zi (kod) barchasi uchun to'g'ri, faqat provayder hisoblari
// hali to'liq faollashtirilmagan.
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
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

// Groq bilan bir xil OpenAI-mos `/chat/completions` shakli — faqat baseUrl/
// model farq qiladi (docs' §14 emas, bu umumiy `src/lib` provayder qatlami).
async function viaCerebras(prompt) {
  if (!process.env.CEREBRAS_API_KEY) throw new Error("CEREBRAS_API_KEY yo'q");
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY,
    model: 'gpt-oss-120b',
    messages: [{ role: 'user', content: prompt + JSON_INSTRUCTION }],
  });
  return extractJson(text);
}

async function viaOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY yo'q");
  const { text } = await streamOpenAiCompatible({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'google/gemma-4-31b-it:free',
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
  gemini: (prompt, schema) => viaGemini(prompt, schema),
  cerebras: (prompt) => viaCerebras(prompt),
  openrouter: (prompt) => viaOpenRouter(prompt),
};

/** `prompt` — to'liq matn (kutilgan JSON tuzilma tavsifi bilan). `schema` — faqat
 * Gemini uchun (responseSchema); boshqalarida prompt ichidagi tavsifga tayaniladi. */
export async function generateJson(prompt, schema) {
  const order = resolveModelChainOrder(['groq', 'gemini', 'cerebras', 'openrouter']);
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
