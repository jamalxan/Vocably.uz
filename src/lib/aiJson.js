import { getGeminiClient } from '@/lib/gemini';
import { streamOpenAiCompatible } from '@/lib/providers/openaiCompatible';

// src/app/api/words/enrich/route.js'da ishlab chiqilgan Groq -> OpenRouter -> Gemini
// zaxira zanjirini umumlashtiradi — FAZA 3'ning Reading/Listening/Writing/Speaking
// generatsiya va baholash endpoint'lari ham xuddi shu naqshga muhtoj edi. Gemini
// structured-output (responseSchema) bergani uchun eng ishonchli, lekin oxirgi
// zaxira sifatida qoldiriladi (GEMINI_API_KEY har doim sozlanmagan bo'lishi mumkin).
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

/** `prompt` — to'liq matn (kutilgan JSON tuzilma tavsifi bilan). `schema` — faqat
 * Gemini uchun (responseSchema); Groq/OpenRouter'da prompt ichidagi tavsifga tayaniladi. */
export async function generateJson(prompt, schema) {
  const attempts = [() => viaGroq(prompt), () => viaOpenRouter(prompt), () => viaGemini(prompt, schema)];
  let lastErr;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export function friendlyAiError(err) {
  const msg = err?.message || "Noma'lum xatolik";
  if (/quota|rate limit|429/i.test(msg)) {
    return "AI xizmati hozir band (so'rovlar chegarasi to'ldi). Bir necha daqiqadan keyin qayta urinib ko'ring.";
  }
  return `AI bilan bog'lanib bo'lmadi: ${msg}`;
}
