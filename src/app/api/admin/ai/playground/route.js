import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { getTaskConfig, recordAiCall, hashInput } from '@/lib/contentAgent/aiCallStore';
import { callTask, AiRouterError } from '@/lib/contentAgent/aiRouter';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §11.5 — "AI sozlamalari" ekranining chat ko'rinishidagi
// sinov qatlami: admin bir taskKey'ni tanlab, uning HOZIRGI (DB'dagi yoki
// standart) model/fallback/temperature konfiguratsiyasini chat orqali sinab
// ko'radi — haqiqiy `aiRouter.callTask` orqali, production pipeline'ga hech
// qanday ta'sir qilmasdan. Har javob productionda ishlatiladigan XUDDI SHU
// router/model orqali keladi, shuning uchun bu yerdagi natija ishonchli
// signal beradi (mock emas).
//
// Javob shakli har doim qattiq `{ reply: string }` JSON sxemasi bilan
// majburlanadi (router HAR doim JSON kutadi, ozod matnni qabul qilmaydi —
// §5.3 item 1'dagi qoida bu yerda ham amal qiladi), lekin suhbat tarixida
// faqat `reply`ning o'zi saqlanadi — model o'z avvalgi JSON qobig'ini emas,
// tabiiy matnni ko'radi, shunda ko'p burilishli suhbat izchil bo'ladi.
const REPLY_SCHEMA = {
  name: 'playground_reply',
  schema: {
    type: 'object',
    properties: { reply: { type: 'string' } },
    required: ['reply'],
    additionalProperties: false,
  },
};

const MAX_HISTORY_MESSAGES = 20; // sinov chat cheksiz o'smasin — narx nazorati

export async function POST(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const body = await req.json().catch(() => ({}));
    const { taskKey, systemPrompt, messages } = body;

    if (!taskKey) return NextResponse.json({ error: 'taskKey majburiy' }, { status: 400 });
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages bo\'sh bo\'lmasin' }, { status: 400 });
    }

    const config = await getTaskConfig(taskKey);
    if (!config) return NextResponse.json({ error: `Noma'lum taskKey: ${taskKey}` }, { status: 400 });

    const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 8000),
    }));

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY sozlanmagan.' }, { status: 500 });
    }

    const startedAt = Date.now();
    let result;
    try {
      result = await callTask({
        taskKey,
        systemPrompt: systemPrompt || `Siz "${taskKey}" bosqichi uchun tanlangan AI modelsiz — admin sizni ishlab chiqish paytida sinamoqda. Foydali va qisqa javob bering.`,
        messages: trimmedMessages,
        jsonSchema: REPLY_SCHEMA,
        config,
        apiKey,
      });
    } catch (err) {
      if (err instanceof AiRouterError) {
        return NextResponse.json({ error: err.message, attempts: err.attempts || [] }, { status: 502 });
      }
      throw err;
    }

    recordAiCall({
      taskKey,
      model: result.model,
      promptVersion: 'playground',
      inputHash: hashInput(trimmedMessages),
      modelId: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      latencyMs: Date.now() - startedAt,
      ok: true,
    }).catch(() => {}); // audit yozuvi muvaffaqiyatsiz bo'lsa ham chatning o'zi ishlayveradi

    return NextResponse.json({
      reply: result.data?.reply ?? '',
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      attempts: result.attempts,
    });
  } catch (err) {
    return serverError(err, 'admin/ai/playground:chat');
  }
}
