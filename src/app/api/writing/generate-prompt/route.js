import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { renderChartSvg } from '@/lib/chartSvg';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §10 (Writing moduli). Prompt "sir" emas (javob kaliti yo'q — insho
// ochiq savol), shuning uchun bu yerda hech narsa saqlanmaydi — foydalanuvchi
// yozib bo'lgach, prompt+matn birga /api/writing/submit'ga yuboriladi.
const RESPONSE_SCHEMA = { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] };

// TZ-vocably-v2.md §C3 F-W1 (BUG-014) — Task 1 uchun AI endi topshiriq matni bilan
// BIRGA shu matnga mos, ichki izchil GRAFIK MA'LUMOTI ham qaytaradi. Server bu
// ma'lumotdan haqiqiy vizualni chizadi (src/lib/chartSvg.js) — ilgari AI'ga aynan
// "grafikning o'zi kerak emas" deyilardi, natijada "The chart below shows..." degan
// topshiriq hech qanday grafiksiz chiqardi.
const TASK1_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    prompt: { type: 'string' },
    chart: {
      type: 'object',
      properties: {
        chartType: { type: 'string', enum: ['bar', 'line', 'pie', 'table'] },
        title: { type: 'string' },
        unit: { type: 'string' },
        categories: { type: 'array', items: { type: 'string' } },
        series: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' }, data: { type: 'array', items: { type: 'number' } } },
            required: ['name', 'data'],
          },
        },
      },
      required: ['chartType', 'title', 'categories', 'series'],
    },
  },
  required: ['prompt', 'chart'],
};

const TASK2_TYPES = [
  'opinion (fikringizni his qiling — Do you agree or disagree?)',
  'discussion (ikki tomonlama qarashni muhokama qiling)',
  'problem-solution (muammo va yechim)',
  'advantage-disadvantage (afzallik va kamchilik)',
];

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    const { task = 2 } = await req.json().catch(() => ({}));
    const type = TASK2_TYPES[Math.floor(Math.random() * TASK2_TYPES.length)];

    if (task === 1) {
      const chartTypes = ['bar', 'line', 'pie', 'table'];
      const suggestedType = chartTypes[Math.floor(Math.random() * chartTypes.length)];
      const prompt = `IELTS Writing Task 1 (Academic) uchun BITTA topshiriq tayyorla — grafik/jadval tavsifini so'ragan, ingliz tilida, 1-2 gap ("The chart/table below shows..." uslubida).

Topshiriqqa mos, ICHKI IZCHIL grafik ma'lumoti ham o'ylab top (o'zing to'qigan, real bo'lishi shart emas, lekin mantiqiy va topshiriq matniga aynan mos bo'lsin):
- chartType: "${suggestedType}" turida (yoki mos kelsa boshqa: bar/line/pie/table)
- title: grafik sarlavhasi (ingliz tilida)
- unit: o'lchov birligi (masalan "%", "million", "" agar shart bo'lmasa)
- categories: 4-6 ta toifa/davr nomi (masalan yillar yoki mamlakat nomlari)
- series: 1-3 ta qator, har biri {name, data: categories soniga teng sonli raqamlar}

JAVOBNI FAQAT JSON qaytar: {"prompt": "...", "chart": {"chartType": "...", "title": "...", "unit": "...", "categories": [...], "series": [{"name": "...", "data": [...]}]}}`;

      let data;
      try {
        data = await generateJson(prompt, TASK1_RESPONSE_SCHEMA);
      } catch (aiErr) {
        return aiErrorResponse(aiErr, { endpoint: 'writing/generate-prompt:task1', userId });
      }

      const chartSvg = renderChartSvg(data.chart);
      return NextResponse.json({ task, prompt: data.prompt || '', chart: data.chart || null, chartSvg });
    }

    const prompt = `IELTS Writing Task 2 uchun BITTA insho topshirig'ini yoz (${type} turida), ingliz tilida, 1-2 gap, real IELTS uslubida.`;

    let data;
    try {
      data = await generateJson(`${prompt}\nJAVOBNI FAQAT JSON qaytar: {"prompt": "..."}`, RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'writing/generate-prompt:task2', userId });
    }

    return NextResponse.json({ task, prompt: data.prompt || '' });
  } catch (err) {
    return serverError(err, 'writing/generate-prompt');
  }
}
