import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, syncAttemptExpiry, remainingSec, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4 — "POST /attempts/:id/heartbeat — Har 15s. Body:
// {audioPositionSec, currentQuestion}. Javob: {remainingSec, status}". Bu
// so'rov taymer drift'ini tuzatish (§4.2: "server remainingSec qaytaradi va
// klient farqni ≥3s bo'lsa tuzatadi") va Listening audio pozitsiyasini
// (refresh'dan keyin qayta tinglab bo'lmasligi uchun, TZ §7.1) saqlash ishini
// birlashtiradi — ikkalasi ham "hayotdaligini bildirish" signali bilan birga keladi.
//
// `partIndex`/`partEnded` — TZ §7.1 "playedParts[] ga qo'shilgan part qayta
// tinglanmaydi" qoidasini SERVERDA saqlash uchun (jadval §4 body'sida aniq
// sanalmagan, lekin `Attempt.audio.playedParts` maydoni shu maqsadda,
// TZ §3.7 — shu yerdan boshqa yozadigan joy yo'q). `partEnded: true` kelsa
// `partIndex` `playedParts`ga qo'shiladi va keyingi partga o'tkaziladi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    let attempt = await getOwnedAttempt(params.id, userId);

    if (attempt.status === 'in_progress') {
      const { audioPositionSec, currentQuestion, partIndex, partEnded, volume } = await req.json().catch(() => ({}));
      // PERF-02 — avvalgi versiya "qiymat berilganmi" (typeof === 'number')
      // tekshirardi, "qiymat O'ZGARDIMI" emas — klient odatda HAR 15s'da
      // currentQuestion/audioPositionSec'ni QAYTA-QAYTA yuboradi (masalan
      // foydalanuvchi bir necha daqiqa bir savolda o'tirsa ham), shuning
      // uchun deyarli HAR heartbeat Mongo'ga yozuv bilan tugardi. Endi
      // faqat HAQIQATAN farq qilganda `dirty` bo'ladi.
      let dirty = false;
      if (typeof audioPositionSec === 'number' && attempt.audio.positionSec !== audioPositionSec) {
        attempt.audio.positionSec = audioPositionSec;
        dirty = true;
      }
      if (typeof currentQuestion === 'number' && attempt.lastQuestion !== currentQuestion) {
        attempt.lastQuestion = currentQuestion;
        dirty = true;
      }
      if (typeof partIndex === 'number' && attempt.audio.partIndex !== partIndex) {
        attempt.audio.partIndex = partIndex;
        dirty = true;
      }
      if (typeof volume === 'number' && attempt.audio.volume !== volume) {
        attempt.audio.volume = volume;
        dirty = true;
      }
      if (partEnded && typeof partIndex === 'number' && !attempt.audio.playedParts.includes(partIndex)) {
        attempt.audio.playedParts.push(partIndex);
        dirty = true;
      }
      if (dirty) await attempt.save();
    }

    attempt = await syncAttemptExpiry(attempt);

    return NextResponse.json({
      remainingSec: attempt.status === 'in_progress' ? remainingSec(attempt.endsAt) : 0,
      status: attempt.status,
    });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:heartbeat');
  }
}
