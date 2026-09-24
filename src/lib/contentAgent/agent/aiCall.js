import { getTaskConfig, recordAiCall, hashInput } from '@/lib/contentAgent/aiCallStore';
import { callTask, AiRouterError, DEFAULT_MODEL_MATRIX } from '@/lib/contentAgent/aiRouter';
import { generateJson } from '@/lib/aiJson';

// Admin AI chatining AI-chaqiruv qatlami — `worker/lib/aiStageRunner.ts`ning
// chatdagi ekvivalenti (job/book konteksti o'rniga hech narsa, qolgani bir xil).
//
// NEGA `generateJson` EMAS (bu HAQIQIY smoke-testda aniqlangan xato,
// 2026-09-24): `generateJson` zanjiridagi Groq/Cerebras/OpenRouter
// provayderlari JSON SXEMASINI MAJBURLAMAYDI — sxema faqat Gemini'ga
// (`responseSchema`) uzatiladi, qolganlari uchun u shunchaki prompt matni.
// Amalda Groq Reading uchun `{passages:[...]}` o'rniga BITTA passage
// obyektini, Listening uchun esa `questions` massivisiz, guruh darajasidagi
// `accepted` bilan javob qaytardi — normalizatorlar buni jimgina BO'SH
// natijaga aylantirib yubordi ("hammasi ishladi, lekin hech narsa
// joylashmadi" — eng yomon turdagi xato).
//
// `aiRouter.callTask` esa OpenRouter'ning `response_format:
// {type:'json_schema', strict:true}` rejimini ishlatadi (TZ §5.3 item 1:
// "Erkin matn qabul qilinmaydi"), model/fallback/temperature'ni admin
// panelidagi `AiTaskConfig`dan oladi va har chaqiruvni `AiCall`ga yozadi —
// ya'ni "Sozlamalar" va "Xarajatlar" ekranlari chat uchun ham ishlaydi.
//
// `OPENROUTER_API_KEY` bo'lmasa — funksionallik BUTUNLAY yo'qolmasin
// uchun `generateJson` zanjiriga qaytamiz (sxemasiz, ya'ni ishonchsizroq),
// lekin buni chaqiruvchiga aytib qo'yamiz (`schemaEnforced:false`).
export async function runAgentAi({ taskKey, systemPrompt, userContent, jsonSchema, promptVersion = 'agent-v1', schemaName }) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    const data = await generateJson(`${systemPrompt}\n\n${userContent}`, jsonSchema);
    return { data, model: 'fallback-chain', schemaEnforced: false };
  }

  // Admin panelidagi model sozlamasi (AiTaskConfig) — DB'dan. DB javob
  // bermasa AI qatlami butunlay to'xtamasligi kerak: modulning o'z
  // standart matritsasi (`DEFAULT_MODEL_MATRIX`) bilan davom etamiz.
  let config = null;
  try {
    config = await getTaskConfig(taskKey);
  } catch {
    config = DEFAULT_MODEL_MATRIX[taskKey] || null;
  }
  config = config || DEFAULT_MODEL_MATRIX[taskKey];
  if (!config) throw new Error(`Noma'lum taskKey: ${taskKey}`);

  const startedAt = Date.now();
  try {
    const result = await callTask({
      taskKey,
      systemPrompt,
      userContent,
      jsonSchema: { name: schemaName || taskKey.replace(/\./g, '_'), schema: jsonSchema },
      config,
      apiKey,
    });

    recordAiCall({
      taskKey,
      model: result.model,
      promptVersion,
      inputHash: hashInput(userContent),
      modelId: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      latencyMs: Date.now() - startedAt,
      ok: true,
    }).catch(() => {}); // audit yozuvi chatni bloklamasin

    return { data: result.data, model: result.model, schemaEnforced: true };
  } catch (err) {
    recordAiCall({
      taskKey,
      model: config.primary,
      promptVersion,
      inputHash: hashInput(userContent),
      modelId: config.primary,
      ok: false,
      validationErrors: [String(err?.message || err).slice(0, 300)],
      latencyMs: Date.now() - startedAt,
    }).catch(() => {});

    // Router butunlay yiqilsa (masalan OpenRouter ishlamayotgan bo'lsa) —
    // oxirgi chora sifatida sxemasiz zanjir. Bu yerda ham jim qolmaymiz:
    // natija `schemaEnforced:false` bilan keladi.
    if (err instanceof AiRouterError) {
      const data = await generateJson(`${systemPrompt}\n\n${userContent}`, jsonSchema);
      return { data, model: 'fallback-chain', schemaEnforced: false };
    }
    throw err;
  }
}
