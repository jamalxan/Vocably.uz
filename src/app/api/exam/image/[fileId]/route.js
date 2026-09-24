import { Readable } from 'node:stream';
import { getUserIdFromRequest } from '@/lib/auth';
import { getImageFileMeta, openImageDownloadStream } from '@/lib/exam/imageStorage';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Kontent rasmlari (Writing Task 1 grafigi va h.k.) GridFS'da — bu route
// shu baytlarni beradi. `/api/exam/audio/[fileId]` bilan bir xil naqsh,
// faqat `Range` qo'llab-quvvatlash YO'Q: rasm audio kabi oqim emas, brauzer
// uni bir so'rovda to'liq oladi.
//
// Auth talab qilinadi (barcha /api/exam/* kabi) — kontent ochiq internetga
// hotlink qilinmasin.
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const meta = await getImageFileMeta(params.fileId);
    if (!meta) return NextResponse.json({ error: 'Rasm topilmadi' }, { status: 404 });

    const nodeStream = await openImageDownloadStream(params.fileId);
    return new NextResponse(Readable.toWeb(nodeStream), {
      status: 200,
      headers: {
        'Content-Type': meta.contentType,
        'Content-Length': String(meta.length),
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return serverError(err, 'exam/image');
  }
}
