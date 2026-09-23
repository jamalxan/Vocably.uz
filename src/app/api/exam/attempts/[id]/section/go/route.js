import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { goToMockSection, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const VALID_SECTIONS = ['listening', 'reading', 'writing'];

// AUDIT Sprint 2/§52.1 — "POST /attempts/:id/section/go — Practice mock'da
// bo'limlar orasida erkin o'tish (§4/§9.1'dagi `section/next`dan FARQLI:
// bu istalgan bo'limga, oldinga HAM orqaga HAM sakraydi, faqat
// `mockKind:'practice'`da ishlaydi — goToMockSection() server-side buni
// qat'iy tekshiradi, 403 boshqa mockKind'lar uchun).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { targetSection } = await req.json().catch(() => ({}));
    if (!VALID_SECTIONS.includes(targetSection)) {
      return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });
    }

    await connectToDatabase();
    const attempt = await goToMockSection(params.id, userId, targetSection);

    return NextResponse.json({
      currentSection: attempt.currentSection,
      status: attempt.status,
      endsAt: attempt.endsAt,
    });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:section-go');
  }
}
