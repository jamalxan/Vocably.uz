import { requireAdminUser } from '@/lib/chatAuth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse } from '@/lib/ai/client';
import { AI_IMPORT_RESPONSE_SCHEMA, buildAiImportPrompt, normalizeAiPassages } from '@/lib/exam/aiImportSchema';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §15.1 item 3 — "AI yordamchi: xom matn + javob kalitini
// joylashtiradi, AI Test JSON'ini generatsiya qiladi. Admin ko'rib chiqadi va
// tasdiqlaydi. Bu eng tez yo'l, lekin tekshiruvsiz publish qilmang." Shuning
// uchun bu endpoint HECH NARSANI saqlamaydi — faqat `Passage[]` qaytaradi,
// admin uni (DSL natijasi kabi) preview+validator orqali ko'rib chiqib,
// keyin ALOHIDA `POST /api/admin/exam-tests` bilan yaratadi. Admin-only
// (o'zining AI rate-limitiga ega emas — chunki bu allaqachon admin, spam
// xavfi yo'q, oddiy foydalanuvchi AI oqimlaridan farqli).
export async function POST(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const { rawText } = await req.json().catch(() => ({}));
    const cleanText = typeof rawText === 'string' ? rawText.trim() : '';
    if (!cleanText) return NextResponse.json({ error: "Xom matn bo'sh bo'lmasin" }, { status: 400 });

    let data;
    try {
      data = await generateJson(buildAiImportPrompt(cleanText), AI_IMPORT_RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'admin/exam-tests:ai-generate' });
    }

    const { passages, needsReview } = normalizeAiPassages(data);
    return NextResponse.json({ passages, needsReview });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:ai-generate');
  }
}
