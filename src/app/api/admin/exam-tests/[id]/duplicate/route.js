import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { ExamTest } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §12 — "POST /api/admin/exam-tests/:id/duplicate." Nusxa
// har doim DRAFT (`isPublished: false`) sifatida yaratiladi — ikkita
// nashr etilgan test bir xil savol/javob to'plami bilan tasodifiy mock
// tanlovga tushib qolmasligi uchun (admin nusxani tahrirlab keyin o'zi
// nashr qiladi).
function uniqueSlug(baseSlug, existingSlugs) {
  let candidate = `${baseSlug}-copy`;
  let n = 2;
  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-copy-${n}`;
    n += 1;
  }
  return candidate;
}

export async function POST(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const source = await ExamTest.findById(params.id).lean();
    if (!source) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const allSlugs = new Set((await ExamTest.find({}).select('slug').lean()).map((t) => t.slug));
    const slug = uniqueSlug(source.slug, allSlugs);

    const copy = await ExamTest.create({
      slug,
      title: `${source.title} (nusxa)`,
      module: source.module,
      difficulty: source.difficulty,
      sections: source.sections,
      bandTable: source.bandTable,
      rights: source.rights,
      isPublished: false,
      createdBy: admin._id,
      source: source.source,
      availability: source.availability,
    });

    await writeAuditLog(req, admin._id, 'exam_test.duplicate', 'ExamTest', copy._id, { sourceId: params.id, slug });

    return NextResponse.json({ id: String(copy._id), slug });
  } catch (err) {
    return serverError(err, 'admin/exam-tests:id/duplicate');
  }
}
