import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §11.3 / §19 Faza 3 item 18 — "Natija ekranida: Matnda
// uchragan qiyin so'zlarni ajratib, 'Lug'atga qo'shish' tugmasi". Imtihon
// matnida (passage/transkript) uchragan so'z hali foydalanuvchi lug'atida
// YO'Q — `/api/words/add` esa kamida bitta tarjima (`syns`) talab qiladi
// (WordEnrichmentSchema emas, oddiy so'z-yozuvi). Shu yerda so'zning o'zi
// (kategoriya/wordId'siz, chunki hali qayerga ham qo'shilmagan) AI'dan
// tezkor tarjima+talaffuz so'raydi — `words/enrich`dagi to'liq boyitishdan
// FARQLI, faqat "qo'shish" dialogini oldindan to'ldirish uchun kerakli
// minimal maydonlar (foydalanuvchi baribir tahrirlab, keyin normal
// "boyitish" oqimidan (WordTable) alohida o'tkazadi).
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    pronunciation: { type: 'string' },
    syns: { type: 'array', items: { type: 'string' }, maxItems: 4 },
  },
  required: ['pronunciation', 'syns'],
};

function buildPrompt(word, context) {
  return `Ingliz tili so'zi: "${word}"${context ? `\nMatndagi jumla (kontekst uchun): "${context}"` : ''}

Shu so'z uchun (aynan shu kontekstdagi ma'nosida, agar kontekst berilgan bo'lsa):
- pronunciation: IPA talaffuz transkripsiyasi (masalan "/əˈraɪz/")
- syns: 1-4 ta ENG TABIIY o'zbekcha tarjima (sinonim tarjimalar, vergul bilan sanab bo'lmaydi — massiv sifatida)

JAVOBNI FAQAT JSON sxemaga qat'iy mos qaytar.`;
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { word, context } = await req.json();
    const cleanWord = typeof word === 'string' ? word.trim() : '';
    if (!cleanWord || !/^[a-zA-Z][a-zA-Z'-]*$/.test(cleanWord) || cleanWord.length > 40) {
      return NextResponse.json({ error: "Noto'g'ri so'z" }, { status: 400 });
    }

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(cleanWord, typeof context === 'string' ? context.slice(0, 300) : ''), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'words/suggest-translation', userId });
    }

    return NextResponse.json({
      word: cleanWord,
      pronunciation: data.pronunciation || '',
      syns: Array.isArray(data.syns) ? data.syns.map((s) => String(s).trim()).filter(Boolean).slice(0, 4) : [],
    });
  } catch (err) {
    return serverError(err, 'words/suggest-translation');
  }
}
