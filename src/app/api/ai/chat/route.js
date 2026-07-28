import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getGeminiClient } from '@/lib/gemini';
import { getUserIdFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Siz "Sinonimlar AI" ilovasidagi yordamchi botsiz. Sizning vazifangiz FAQAT ingliz tilini o'rganayotgan o'zbek foydalanuvchilarga yordam berish:
- ingliz tili grammatikasi, qoidalari va mashqlari bo'yicha tushuntirish berish;
- inglizcha so'z yoki iboralarni o'zbek tiliga (yoki aksincha) tarjima qilish;
- sinonimlar, antonimlar va so'z qo'llanilishi bo'yicha misollar keltirish;
- talaffuz va imlo bo'yicha maslahat berish.

Agar foydalanuvchi ingliz tili yoki tarjimaga aloqador bo'lmagan mavzuda savol bersa (masalan siyosat, dasturlash, boshqa fanlar va h.k.), muloyimlik bilan uzr so'rang va faqat ingliz tili bo'yicha yordam bera olishingizni ayting. Javoblaringiz qisqa, aniq va tushunarli bo'lsin, kerak bo'lganda misollar bilan tushuntiring.`;

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Xabar bo'sh bo'lmasin" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const history = (user.chatHistory || []).map(h => ({
      role: h.role,
      parts: h.parts.map(p => ({ text: p.text })),
    }));

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text() || '';

    user.chatHistory.push({ role: 'user', parts: [{ text: message }] });
    user.chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
    await user.save();

    return NextResponse.json({ reply: responseText, history: user.chatHistory });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server xatoligi" }, { status: 500 });
  }
}
