import { Readable } from 'node:stream';
import { getUserIdFromRequest } from '@/lib/auth';
import { getAudioFileMeta, openAudioDownloadStream } from '@/lib/exam/audioStorage';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §23 — audio GridFS'da (audioStorage.ts). Bu route shu
// baytlarni HTTP orqali beradi. `<audio>` elementi (AudioEngine.tsx, keyingi
// qadam) odatda `Range` so'rovi yuboradi — buni qo'llab-quvvatlamasak ba'zi
// brauzerlar progressiv yuklashda muammo qilishi mumkin, shuning uchun 206
// Partial Content ham qo'llab-quvvatlanadi.
//
// Auth talab qilinadi (boshqa barcha /api/exam/* kabi) — audio ochiq internetga
// hotlink qilinmasin degan ehtiyot chorasi, javob kaliti darajasidagi maxfiylik
// emas (TZ §4.1'dagi "hech qachon yubormaydi" qoidasi savol javoblariga tegishli).
function parseRange(rangeHeader, totalLength) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (!startStr && !endStr) return null;
  const start = startStr ? parseInt(startStr, 10) : totalLength - parseInt(endStr, 10);
  const end = endStr ? parseInt(endStr, 10) : totalLength - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start < 0 || end >= totalLength) return null;
  return { start, end };
}

export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const meta = await getAudioFileMeta(params.fileId);
    if (!meta) return NextResponse.json({ error: 'Audio topilmadi' }, { status: 404 });

    const range = parseRange(req.headers.get('range'), meta.length);
    const nodeStream = await openAudioDownloadStream(params.fileId, range || undefined);
    const webStream = Readable.toWeb(nodeStream);

    const headers = {
      'Content-Type': meta.contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=31536000, immutable',
    };

    if (range) {
      headers['Content-Range'] = `bytes ${range.start}-${range.end}/${meta.length}`;
      headers['Content-Length'] = String(range.end - range.start + 1);
      return new NextResponse(webStream, { status: 206, headers });
    }

    headers['Content-Length'] = String(meta.length);
    return new NextResponse(webStream, { status: 200, headers });
  } catch (err) {
    return serverError(err, 'exam/audio');
  }
}
