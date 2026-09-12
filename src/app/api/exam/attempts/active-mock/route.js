import { connectToDatabase } from '@/lib/db';
import { ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §1.1/"Attempt boshqaruvi" auditi — Mock intro ekrani
// "Imtihonni boshlash"ni bosishdan OLDIN shu yerdan so'raydi: agar
// foydalanuvchida allaqachon tugallanmagan mock bo'lsa, tugma matnini
// ("Davom ettirish") va qo'shimcha "Yangi mock boshlash" havolasini
// ko'rsatish uchun. Bo'lmasa — jimgina davom etib, xuddi Listening
// "o'tkazib yuborilgandek" ko'rinar edi.
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const existing = await ExamAttempt.findOne({ userId, mode: 'mock', status: 'in_progress' })
      .select('currentSection')
      .lean();

    return NextResponse.json({ active: existing ? { attemptId: String(existing._id), currentSection: existing.currentSection } : null });
  } catch (err) {
    return serverError(err, 'exam/attempts/active-mock:get');
  }
}
