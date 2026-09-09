import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// V6 "Mnemonika ustaxonasi" (VOCABLY-TZ.md 6.2) — AI chaqirilmaydi, foydalanuvchi o'z
// mnemonikasini to'g'ridan-to'g'ri yozadi/saqlaydi. Shuning uchun /api/words/enrich'dan
// alohida, sodda PATCH endpoint.
export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { categoryId, wordId, userMnemonicUz } = await req.json();
    if (!categoryId || !wordId || typeof userMnemonicUz !== 'string') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const category = user.categories.id(categoryId);
    const word = category?.words.id(wordId);
    if (!category || !word) return NextResponse.json({ error: "So'z topilmadi" }, { status: 404 });

    if (!word.enrichment) word.enrichment = {};
    word.enrichment.userMnemonicUz = userMnemonicUz.trim().slice(0, 500);
    await user.save();

    return NextResponse.json({ success: true, userMnemonicUz: word.enrichment.userMnemonicUz });
  } catch (err) {
    return serverError(err, 'words/mnemonic');
  }
}
