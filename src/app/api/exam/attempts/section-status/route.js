import { connectToDatabase } from '@/lib/db';
import { ExamAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const VALID_SECTIONS = ['listening', 'reading', 'writing', 'speaking'];

// VOCABLY-TZ.md §2.4/§5 item 12 — "Test ro'yxati kartalarida holat va oxirgi
// ball ko'rsatilsin." TestPicker shu yerdan, ro'yxatni chizishdan OLDIN, har
// testId uchun foydalanuvchining ENG SO'NGGI `mode:'section'` urinishi
// qanday holatda ekanini so'raydi — aks holda foydalanuvchi allaqachon
// tugallangan yoki muddati o'tib ketgan eski urinishga tasodifan kirib,
// kutilmagan (masalan darhol "0 band") natija ko'rib qolishi mumkin edi.
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }

    await connectToDatabase();
    const attempts = await ExamAttempt.find({ userId, mode: 'section', sections: section })
      .sort({ createdAt: -1 })
      .select('testId status result submittedAt endsAt')
      .lean();

    const statuses = {};
    const now = Date.now();
    for (const a of attempts) {
      const key = String(a.testId);
      if (statuses[key]) continue; // faqat har testning ENG SO'NGGI urinishi
      const expired = a.status === 'in_progress' && new Date(a.endsAt).getTime() < now;
      statuses[key] = {
        attemptId: String(a._id),
        status: expired ? 'expired' : a.status,
        band: a.result?.[section]?.band ?? null,
        submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : null,
      };
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    return serverError(err, 'exam/attempts/section-status:get');
  }
}
