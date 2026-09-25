import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { StickerPack } from '@/lib/models';
import { OBJECT_ID } from '@/lib/stickerCatalog';
import { presignStableDownload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Admin yuklagan stiker rasmi — <img src> sifatida to'g'ridan-to'g'ri ishlatiladi
// (cookie bilan autentifikatsiya, so'ng S3'ning keshlanadigan imzolangan URL'iga 302).
// O'chirilgan stiker ham beriladi — eski xabarlarda ko'rinishi uchun.
export async function GET(req, { params }) {
  try {
    if (!getUserIdFromRequest(req)) return new NextResponse(null, { status: 401 });
    if (!OBJECT_ID.test(params.stickerId)) return new NextResponse(null, { status: 400 });

    await connectToDatabase();
    const pack = await StickerPack.findOne({ 'stickers._id': params.stickerId }, { 'stickers.$': 1 }).lean();
    const sticker = pack?.stickers?.[0];
    if (!sticker) return new NextResponse(null, { status: 404 });

    const url = await presignStableDownload(sticker.key);
    return NextResponse.redirect(url, {
      status: 302,
      headers: { 'Cache-Control': 'private, max-age=1800', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    return serverError(err, 'stickers GET');
  }
}
