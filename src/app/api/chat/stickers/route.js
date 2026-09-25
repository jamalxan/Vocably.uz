import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { connectToDatabase } from '@/lib/db';
import { loadStickerCatalog } from '@/lib/stickerCatalog';
import { NextResponse } from 'next/server';

// Stiker katalogi: statik "Standart" to'plam + admin yaratgan faol to'plamlar
// (`packs`), va eski xabarlarni ko'rsatish uchun o'chirilgan/yashirilganlari (`extra`).
export async function GET(req) {
  try {
    const { error, status } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    return NextResponse.json(await loadStickerCatalog());
  } catch (err) {
    return serverError(err, 'chat/stickers');
  }
}
