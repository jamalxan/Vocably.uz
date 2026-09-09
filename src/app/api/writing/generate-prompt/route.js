import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson, friendlyAiError } from '@/lib/aiJson';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §10 (Writing moduli). Prompt "sir" emas (javob kaliti yo'q — insho
// ochiq savol), shuning uchun bu yerda hech narsa saqlanmaydi — foydalanuvchi
// yozib bo'lgach, prompt+matn birga /api/writing/submit'ga yuboriladi.
const RESPONSE_SCHEMA = { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] };

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

    const { task = 2 } = await req.json().catch(() => ({}));
    const type = TASK2_TYPES[Math.floor(Math.random() * TASK2_TYPES.length)];

    const prompt =
      task === 1
        ? `IELTS Writing Task 1 (Academic) uchun BITTA topshiriq matni yoz — grafik/jadval/diagramma/xarita/jarayonni tasvirlashni so'ragan, ingliz tilida, 1-2 gap. Faqat topshiriq matnining o'zini yoz (grafikning o'zi kerak emas, faqat matnli tavsif so'roviga o'xshagan topshiriq).`
        : `IELTS Writing Task 2 uchun BITTA insho topshirig'ini yoz (${type} turida), ingliz tilida, 1-2 gap, real IELTS uslubida.`;

    let data;
    try {
      data = await generateJson(`${prompt}\nJAVOBNI FAQAT JSON qaytar: {"prompt": "..."}`, RESPONSE_SCHEMA);
    } catch (aiErr) {
      return NextResponse.json({ error: friendlyAiError(aiErr) }, { status: 502 });
    }

    return NextResponse.json({ task, prompt: data.prompt || '' });
  } catch (err) {
    return serverError(err, 'writing/generate-prompt');
  }
}
