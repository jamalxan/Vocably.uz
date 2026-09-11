import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { ExamTest } from '@/lib/models';
import { validateTest, hasBlockingErrors } from '@/lib/exam/contentValidator';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const test = await ExamTest.findById(params.id).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    return NextResponse.json({ test: { ...test, id: String(test._id), _id: undefined } });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id GET');
  }
}

// §15.2 — "Preview rejimi... publish qilishdan oldin tekshiradi." Kontentni
// (qayta import qilib) YOKI faqat `isPublished`ni almashtirish uchun
// ishlatiladi — ikkalasi ham shu bitta PATCH, chunki ikkalasi ham "mavjud
// hujjatni yangilash" (alohida endpoint qilish ortiqcha bo'lardi).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const test = await ExamTest.findById(params.id);
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { title, difficulty, sections, bandTable, isPublished } = body;

    if (title !== undefined) test.title = title;
    if (difficulty !== undefined) test.difficulty = difficulty;
    if (sections !== undefined) {
      test.sections = sections;
      test.markModified('sections');
    }
    if (bandTable !== undefined) test.bandTable = bandTable;

    // Publish qilinayotganda — HAR DOIM qayta validatsiya (content o'zgarmagan
    // bo'lsa ham, chunki avval draft holida xatolik bilan saqlangan bo'lishi
    // mumkin edi). Faqat unpublish qilish (isPublished: false) validatsiyasiz.
    let issues = [];
    if (isPublished === true) {
      issues = validateTest(test.toObject());
      if (hasBlockingErrors(issues)) {
        return NextResponse.json({ error: 'Validatsiya xatoliklari bor — publish qilinmadi', issues }, { status: 422 });
      }
      test.isPublished = true;
    } else if (isPublished === false) {
      test.isPublished = false;
    }

    await test.save();
    await writeAuditLog(req, admin._id, 'exam_test.update', 'ExamTest', test._id, { isPublished: test.isPublished });

    return NextResponse.json({ success: true, issues });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id PATCH');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const test = await ExamTest.findByIdAndDelete(params.id);
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    await writeAuditLog(req, admin._id, 'exam_test.delete', 'ExamTest', params.id, { slug: test.slug, title: test.title });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id DELETE');
  }
}
