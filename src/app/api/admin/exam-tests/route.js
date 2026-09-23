import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { ExamTest } from '@/lib/models';
import { validateTest, hasBlockingErrors, isMockEligible } from '@/lib/exam/contentValidator';
import { syncValidationIssuesToReviewQueue } from '@/lib/exam/reviewSync';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §15 / §19 Faza 4 item 21 — Admin kontent kiritish.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const tests = await ExamTest.find({})
      .select('slug title module difficulty isPublished createdAt sections isMockEligible rights')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      tests: tests.map((t) => ({
        id: String(t._id),
        slug: t.slug,
        title: t.title,
        module: t.module,
        difficulty: t.difficulty,
        isPublished: t.isPublished,
        createdAt: t.createdAt,
        hasReading: !!t.sections?.reading,
        hasListening: !!t.sections?.listening,
        hasWriting: !!t.sections?.writing,
        // AUDIT N-04 (Sprint 2) — Speaking section indicator badge (mirrors R/L/W).
        hasSpeaking: !!t.sections?.speaking,
        // AUDIT EX-06/N-06 — Sprint 1.
        isMockEligible: !!t.isMockEligible,
        // AUDIT N-12 — Sprint 1.
        rights: t.rights || null,
      })),
    });
  } catch (err) {
    return serverError(err, 'admin/exam-tests GET');
  }
}

// TZ §15.1 — uch xil kiritish yo'li (JSON/DSL/AI) HAMMASI shu bitta endpointga
// tushadi (DSL/AI natijasi client'da avval `Passage[]`ga o'giriladi, keyin
// shu yerga to'liq `Test` sifatida yuboriladi) — "tekshiruvsiz publish
// qilmang" qoidasi bo'yicha server HAM (client'ga ishonmasdan) qayta
// validatsiya qiladi, xatolar bo'lsa yaratmaydi.
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const { slug, title, module: mod, difficulty, sections, bandTable, rights } = body;

    const testDraft = { slug, title, module: mod, difficulty, sections: sections || {}, rights };
    const issues = validateTest(testDraft);
    if (hasBlockingErrors(issues)) {
      return NextResponse.json({ error: 'Validatsiya xatoliklari bor', issues }, { status: 422 });
    }

    const existing = await ExamTest.findOne({ slug }).select('_id').lean();
    if (existing) return NextResponse.json({ error: 'Bu slug allaqachon mavjud', issues }, { status: 409 });

    const test = await ExamTest.create({
      slug,
      title,
      module: mod || 'academic',
      difficulty: difficulty || 'medium',
      sections: sections || {},
      bandTable: bandTable || null,
      rights: rights || undefined,
      isPublished: false,
      // AUDIT EX-06/N-06 (Sprint 1) — computed at (re)create/publish time,
      // never user-settable directly. `testDraft` already has the exact
      // sections shape validated above.
      isMockEligible: isMockEligible(testDraft),
      createdBy: admin._id,
    });

    // AUDIT N-10 (Sprint 1) — persist validator findings into the admin
    // review queue for this manually-created test (both severities, not
    // just blockers — `hasBlockingErrors` already gated creation above).
    await syncValidationIssuesToReviewQueue(String(test._id), issues);

    await writeAuditLog(req, admin._id, 'exam_test.create', 'ExamTest', test._id, { slug, title });

    return NextResponse.json({ id: String(test._id), issues });
  } catch (err) {
    return serverError(err, 'admin/exam-tests POST');
  }
}
