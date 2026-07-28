import { getGeminiClient, parseDataUrl } from '@/lib/gemini';
import { getUserIdFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Rasm yuklanmadi" }, { status: 400 });
    }

    const { mimeType, data } = parseDataUrl(imageBase64);

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `Ushbu rasmda inglizcha so'zlar ro'yxati va ularning o'zbekcha tarjimasi yoki izohi bor (masalan lug'at sahifasi). Rasmdagi har bir inglizcha so'zni va unga mos o'zbekcha tarjima(lar)ini aniqla.

Natijani FAQAT quyidagi JSON massiv formatida qaytar, hech qanday qo'shimcha matn, izoh yoki markdown belgilarisiz:
[{"word":"arise","syns":["paydo bo'lmoq","tug'ilmoq"]},{"word":"blacksmith","syns":["temirchi"]}]

Qoidalar:
- "word" maydoni har doim inglizcha, kichik harflarda.
- "syns" massivi o'zbekcha tarjima(lar), rasmda qanday yozilgan bo'lsa shundayligicha.
- Agar rasmda inglizcha so'z topilmasa, bo'sh massiv [] qaytar.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data } },
    ]);

    const responseText = result.response.text() || '';
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let words = [];
    try {
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        words = parsed
          .filter(w => w && typeof w.word === 'string' && w.word.trim())
          .map(w => ({
            word: w.word.trim(),
            syns: Array.isArray(w.syns) ? w.syns.map(s => String(s).trim()).filter(Boolean) : [],
          }))
          .filter(w => w.syns.length > 0);
      }
    } catch {
      return NextResponse.json({ error: "AI javobini o'qib bo'lmadi, boshqa rasm bilan urinib ko'ring" }, { status: 500 });
    }

    return NextResponse.json({ words });
  } catch (err) {
    return NextResponse.json({ error: "Rasm tahlilida xatolik: " + (err.message || '') }, { status: 500 });
  }
}
