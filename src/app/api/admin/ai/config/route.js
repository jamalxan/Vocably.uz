import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AiTaskConfig } from '@/lib/models';
import { DEFAULT_MODEL_MATRIX } from '@/lib/contentAgent/aiRouter';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §5.1/§11.5 — "Har taskKey uchun model dropdown'i...
// Modelni almashtirish faqat admin paneldagi dropdown orqali — kod
// o'zgartirilmaydi" (§20 item 11). DB'da mavjud bo'lmagan taskKey'lar
// `aiRouter.js`ning `DEFAULT_MODEL_MATRIX`idan to'ldiriladi — shuning uchun
// bu ro'yxat DOIM barcha taskKey'larni ko'rsatadi, hatto hech kim hali
// hech narsani o'zgartirmagan bo'lsa ham.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const overrides = await AiTaskConfig.find({}).lean();
    const overrideByKey = new Map(overrides.map((o) => [o.taskKey, o]));

    const taskKeys = [...new Set([...Object.keys(DEFAULT_MODEL_MATRIX), ...overrideByKey.keys()])];
    const configs = taskKeys.map((taskKey) => {
      const override = overrideByKey.get(taskKey);
      const base = DEFAULT_MODEL_MATRIX[taskKey] || {};
      return {
        taskKey,
        primary: override?.primary ?? base.primary ?? '',
        fallback: override?.fallback ?? base.fallback ?? [],
        temperature: override?.temperature ?? base.temperature ?? 0.2,
        maxTokens: override?.maxTokens ?? base.maxTokens ?? 8000,
        costCapUsd: override?.costCapUsd ?? base.costCapUsd ?? 1,
        isCustomised: !!override,
      };
    });

    return NextResponse.json({ configs });
  } catch (err) {
    return serverError(err, 'admin/ai/config:list');
  }
}

export async function PATCH(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const { taskKey, primary, fallback, temperature, maxTokens, costCapUsd } = body;
    if (!taskKey || !primary) {
      return NextResponse.json({ error: 'taskKey va primary majburiy' }, { status: 400 });
    }

    await AiTaskConfig.findOneAndUpdate(
      { taskKey },
      {
        taskKey,
        primary,
        fallback: Array.isArray(fallback) ? fallback : [],
        temperature: temperature ?? 0.2,
        maxTokens: maxTokens ?? 8000,
        costCapUsd: costCapUsd ?? 1,
        updatedBy: admin._id,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    await writeAuditLog(req, admin._id, 'ai_task_config.update', 'AiTaskConfig', taskKey, { primary, fallback });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/ai/config:update');
  }
}
