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

// 2026-09-24: bitta bepul model (`gemma-4-31b-it:free`) umumiy pool'da tez-tez
// 429 ("temporarily rate-limited upstream") qaytaradi — bu holatda butun zanjir
// yiqilardi (Cambridge-IELTS PDF tahlili shu sabab bilan to'xtagan). Endi bir
// nechta bepul model navbat bilan sinaladi: har birining limiti ALOHIDA, shuning
// uchun biri band bo'lsa keyingisi odatda javob beradi. Hammasi band bo'lsa —
// oxirgi xato (429) tashlanadi va tashqi `withRetry` butun ro'yxatni qayta uradi.
// Jonli sinovda (katta ~90k belgili prompt) `nemotron-3-super` ishladi, gemma/qwen 429.
const OPENROUTER_FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-26b-a4b-it:free',
  'qwen/qwen3.8-27b:free',
];
// Keyingi modelga o'tishga arziydigan xatolar: tezlik chegarasi, model yo'q/o'chirilgan,
// kontekst sig'madi, provayder vaqtincha ishlamayapti.
const OPENROUTER_NEXT_MODEL_STATUSES = new Set([400, 402, 404, 413, 429, 500, 502, 503, 504]);

async function viaOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY yo'q");
  let lastErr;
  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const { text } = await streamOpenAiCompatible({
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        model,
        extraHeaders: { 'HTTP-Referer': process.env.APP_URL || 'https://vocably.app', 'X-Title': 'Vocably' },
        messages: [{ role: 'user', content: prompt + JSON_INSTRUCTION }],
      });
      return extractJson(text);
    } catch (err) {
      lastErr = err;
      // JSON topilmadi kabi status'siz xatolarda ham keyingi model sinaladi.
      if (err?.status != null && !OPENROUTER_NEXT_MODEL_STATUSES.has(Number(err.status))) throw err;
    }
  }
  throw lastErr;
}

async function viaGemini(prompt, schema) {
  if (!process.env.GEMINI_API_KEY) {
    // status berilmasa withRetry buni "tarmoq xatosi" deb 3 marta bekorga qayta urardi.
    const err = new Error("GEMINI_API_KEY yo'q");
    err.status = 401;
    throw err;
  }
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  });
  return JSON.parse(result.response.text());
}

// EX-02 (speakingGrader.ts — audio-based pronunciation assessment) uchun
// GEMINI-ONLY: yuqoridagi viaGroq/viaCerebras/viaOpenRouter uchtasi ham
// OpenAI-mos `/chat/completions` API'lari — bu faylning ularni chaqirish
// naqshi FAQAT matn (`content: string`) yuboradi, audio inlineData emas.
// Gemini esa multimodal `generateContent`'ni qo'llab-quvvatlaydi (xuddi
// src/app/api/ai/chat/route.js'da rasm uchun ishlatilgani kabi) — shuning
// uchun bu yerda 4 provayderlik zaxira zanjiri YO'Q, faqat Gemini.
export async function generateJsonWithAudio(prompt, schema, audioParts) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  return withRetry(async () => {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }, ...audioParts.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.data } }))],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
    });
    return JSON.parse(result.response.text());
  });
}

const PROVIDER_FNS = {
  groq: (prompt) => viaGroq(prompt),
  gemini: (prompt, schema) => viaGemini(prompt, schema),
  cerebras: (prompt) => viaCerebras(prompt),
  openrouter: (prompt) => viaOpenRouter(prompt),
};

/** `prompt` — to'liq matn (kutilgan JSON tuzilma tavsifi bilan). `schema` — faqat
 * Gemini uchun (responseSchema); boshqalarida prompt ichidagi tavsifga tayaniladi.
 * Qaysi provayder haqiqatan javob berganini ham qaytaradi — chaqiruvchilarning
 * aksariyati buni bilishi shart emas (shuning uchun `generateJson` hali ham
 * faqat `data`ni qaytaradi), lekin masalan Writing grading kabi natija
 * saqlanadigan joylarda "qaysi model baholadi" audit uchun kerak bo'ladi. */
export async function generateJsonWithMeta(prompt, schema) {
  const order = resolveModelChainOrder(['groq', 'gemini', 'cerebras', 'openrouter']);
  const failures = [];
  for (const name of order) {
    try {
      const data = await withRetry(() => PROVIDER_FNS[name](prompt, schema));
      return { data, provider: name };
    } catch (err) {
      failures.push({ name, err });
    }
  }
  // Avval faqat OXIRGI provayder xatosi tashlanardi — bu adashtirardi (masalan
  // "OpenRouter 429" ko'rinardi, holbuki Groq 413 "juda katta", Gemini kaliti yo'q
  // edi). Endi har provayderning qisqa sababi bitta xabarda; `status` oxirgisiniki
  // qoladi, shunda `toUserMessage`/retry mantig'i avvalgidek ishlaydi.
  const last = failures[failures.length - 1]?.err;
  const summary = failures
    .map(({ name, err }) => `${name}: ${err?.status ? `${err.status} ` : ''}${String(err?.message || err).replace(/^Provayder xatosi \(\d+\): /, '').slice(0, 120)}`)
    .join(' | ');
  const err = new Error(`Barcha AI provayderlar javob bermadi — ${summary}`);
  err.status = last?.status;
  err.failures = failures;
  throw err;
}

export async function generateJson(prompt, schema) {
  const { data } = await generateJsonWithMeta(prompt, schema);
  return data;
}

/** @deprecated `aiErrorResponse(err, meta)` dan foydalaning — u log (requestId bilan) +
 * o'zbekcha xabarni bitta NextResponse'da birlashtiradi. Eski chaqiruvchilar buzilmasligi
 * uchun saqlab qolindi. */
export { toUserMessage as friendlyAiError } from '@/lib/ai/client';
export { aiErrorResponse };
