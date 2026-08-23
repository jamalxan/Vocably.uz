import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { connectToDatabase } from '@/lib/db';
import { STICKER_PACKS } from '@/lib/stickers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    return NextResponse.json({ packs: STICKER_PACKS });
  } catch (err) {
    return serverError(err, 'chat/stickers');
  }
}
