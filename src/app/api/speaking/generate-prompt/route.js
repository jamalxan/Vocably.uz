import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson, friendlyAiError } from '@/lib/aiJson';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: { prompt: { type: 'string' }, cueCardPoints: { type: 'array', items: { type: 'string' } } },
  required: ['prompt', 'cueCardPoints'],
};

const TOPICS = ['travel', 'technology', 'education', 'family', 'work', 'hobbies', 'environment', 'health'];

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { part = 1 } = await req.json().catch(() => ({}));
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const prompt =
      part === 2
        ? `IELTS Speaking Part 2 "cue card" tuz — "${topic}" mavzusida. "Describe a..." shaklida savol + 3-4 ta yo'naltiruvchi nuqta (cueCardPoints, masalan "you should say: ...").`
        : `IELTS Speaking Part ${part} uchun "${topic}" mavzusida BITTA sodda savol yoz (cueCardPoints bo'sh massiv bo'lsin).`;

    let data;
    try {
      data = await generateJson(
        `${prompt}\nJAVOBNI FAQAT JSON qaytar: {"prompt": "...", "cueCardPoints": [...]}`,
        RESPONSE_SCHEMA
      );
    } catch (aiErr) {
      return NextResponse.json({ error: friendlyAiError(aiErr) }, { status: 502 });
    }

    return NextResponse.json({ part, prompt: data.prompt || '', cueCardPoints: data.cueCardPoints || [] });
  } catch (err) {
    return serverError(err, 'speaking/generate-prompt');
  }
}
