import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { ContentAsset } from '@/lib/models';
import { presignSourceDownload } from '@/lib/storage/r2';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// AI-01 worker (assemble.ts) tomonidan yaratilgan `ExamTest`larda R2'da
// saqlangan RASM (masalan Academic Writing Task 1 grafik/jadval, `worker/
// stages/extractImages.ts`dan) uchun `imageUrl` shu yo'lga (`/api/content/
// assets/{assetId}`) ishora qiladi.
//
// Audio (`src/app/api/exam/audio/[fileId]/route.js`, GridFS)dan FARQLI —
// bu yerda 302 REDIRECT ishlatiladi, JSON+alohida `fetch` EMAS: statik
// rasm uchun `<img src>` orqali redirect'ga ergashish butunlay yetarli
// (brauzer buni shaffof boshqaradi), audio/video'dagi kabi progressiv
// oqim/Range-so'rov muammosi bu yerda YO'Q (bitta butun fayl, bir martalik
// GET — src/lib/useAuthedMedia.js'dagi izohga q., u YERDA redirect aynan
// shu sabab bilan RAD ETILGAN edi, lekin sabab audio/video'ga xos edi).
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const asset = await ContentAsset.findById(params.assetId).lean();
    if (!asset) return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 });

    const url = await presignSourceDownload(asset.storage.key);
    return NextResponse.redirect(url);
  } catch (err) {
    return serverError(err, 'content/assets:get');
  }
}
