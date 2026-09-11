import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, advanceMockSection, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4/§9.1 — "POST /attempts/:id/section/next — Mock'da
// keyingi bo'limga o'tish (orqaga qaytish mumkin emas)". Amalda foydalanuvchi
// UI'da buni bosadigan tugma YO'Q (§5.5: mock'da submit tugmasi faqat oxirgi
// bo'limda ko'rinadi) — bo'lim vaqti tugashi bilan server (syncAttemptExpiry)
// avtomatik chaqiradi. Bu route klientning o'z bo'limi ICHKI jarayoni
// (masalan Listening'ning audio+final-check tugashi) tabiiy ravishda
// bo'limni "tugatgan" paytda ishlatiladi — bo'lim vaqti hali tugamagan bo'lsa
// ham, o'sha bo'limning o'z mazmuni allaqachon tugagan (audio tugadi).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    await getOwnedAttempt(params.id, userId); // faqat egalikni tekshirish uchun

    const attempt = await advanceMockSection(params.id, userId, 'section_complete');

    return NextResponse.json({
      currentSection: attempt.currentSection,
      status: attempt.status,
      endsAt: attempt.endsAt,
    });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:section-next');
  }
}
