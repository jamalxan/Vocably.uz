import { connectToDatabase } from '@/lib/db';
import { safeEqual } from '@/lib/safeEqual';
import { serverError } from '@/lib/apiError';
import { validateCallEventBody, recordCall, notifyRecordedCall } from '@/lib/chat/callRecord';
import { after, NextResponse } from 'next/server';

// realtime-server qo'ng'iroq tugaganda shu yerga yozadi (realtime-server/persist.js,
// docs/chat/CALLS_SPEC.md §6.3). Ichki maxfiy kalit bilan himoyalangan (presence-online
// bilan bir xil). callId bo'yicha idempotent — realtime tomoni 5xx/timeout'da qayta
// urinadi, ikkinchi yozuv hech qachon yaratilmaydi. Bu route `message:new`ni O'ZI
// yubormaydi: javobdagi xabarni realtime-server ikkala tomonga tarqatadi.
export async function POST(req) {
  try {
    const secret = req.headers.get('x-internal-secret');
    if (!process.env.REALTIME_SHARED_SECRET || !safeEqual(secret, process.env.REALTIME_SHARED_SECRET)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { field, value } = validateCallEventBody(body);
    if (field) return NextResponse.json({ error: 'bad payload', field }, { status: 400 });

    await connectToDatabase();

    // Suhbat aynan shu ikki ishtirokchiniki bo'lishi shart (sir oqib ketgan taqdirda ham
    // begona suhbatga yozib bo'lmasin).
    const result = await recordCall(value);
    if (result.notFound) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // Bildirishnomalar faqat birinchi (haqiqiy) yozuvda — retry'lar takror yubormaydi.
    if (result.created) {
      after(() => notifyRecordedCall({ convo: result.convo, value }));
    }

    return NextResponse.json({ message: result.message, created: result.created });
  } catch (err) {
    return serverError(err, 'internal/call-event POST');
  }
}
