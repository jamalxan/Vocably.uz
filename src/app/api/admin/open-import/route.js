import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { ExamTest } from '@/lib/models';
import { validateTest, hasBlockingErrors, isMockEligible } from '@/lib/exam/contentValidator';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';
import { TESTS } from './_data/index.js';

// TEMPORARY one-off import (2026-10-23): the 91 full 40-question Reading/Listening
// tests built by scripts/load-open-tests.mts --export. The production MONGODB_URI is
// a sensitive Vercel secret the loader can't read locally, so the admin opens this
// URL in the browser instead (admin session required) and the server does the
// upsert + publish, then unpublishes the single-section practice tests. The route
// and its _data bundle are deleted in the next deploy.
//
//   GET ?step=status
//   GET ?step=import&from=0      (batches of BATCH, the page auto-continues)
//   GET ?step=unpublish          (sections → isPublished:false; needs ≥ 50 full tests live)
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH = 12;
const SECTION_RE = /^vocably-(reading|listening)-\d+$/;
const FULL_RE = /^vocably-(reading|listening)-full-\d+$/;

function page(title, body, refresh) {
  const meta = refresh ? `<meta http-equiv="refresh" content="1;url=${refresh}">` : '';
  return new Response(
    `<!doctype html><html lang="uz"><head><meta charset="utf-8">${meta}<title>${title}</title><style>body{font:15px/1.5 system-ui;max-width:720px;margin:40px auto;padding:0 16px;color:#1b1b1f}pre{background:#f4f4f6;padding:12px;border-radius:8px;white-space:pre-wrap}a{color:#2b5bd7}</style></head><body><h1>${title}</h1>${body}</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );
}

async function counts() {
  const [sectionsPub, sectionsAll, fullPub, fullAll] = await Promise.all([
    ExamTest.countDocuments({ slug: SECTION_RE, isPublished: true }),
    ExamTest.countDocuments({ slug: SECTION_RE }),
    ExamTest.countDocuments({ slug: FULL_RE, isPublished: true }),
    ExamTest.countDocuments({ slug: FULL_RE }),
  ]);
  return { bundle: TESTS.length, fullPub, fullAll, sectionsPub, sectionsAll };
}

export async function GET(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();

    const url = new URL(req.url);
    const step = url.searchParams.get('step') || 'status';
    const base = url.pathname;

    if (step === 'import') {
      const from = Math.max(0, Number(url.searchParams.get('from') || 0));
      const slice = TESTS.slice(from, from + BATCH);
      const lines = [];
      for (const doc of slice) {
        const draft = { slug: doc.slug, title: doc.title, module: doc.module || 'academic', difficulty: doc.difficulty || 'medium', sections: doc.sections, bandTable: doc.bandTable || null, rights: doc.rights };
        const issues = validateTest(draft);
        if (hasBlockingErrors(issues)) {
          lines.push(`✗ ${doc.slug}: ${issues.filter((i) => i.severity === 'error').map((i) => `${i.path} ${i.message}`).join('; ')}`);
          continue;
        }
        const prev = await ExamTest.findOne({ slug: doc.slug }).select('_id').lean();
        const update = { ...draft, rights: { ...draft.rights, rightsVerifiedBy: admin._id, rightsVerifiedAt: new Date() }, isPublished: true, isMockEligible: isMockEligible(draft), updatedAt: new Date() };
        await ExamTest.updateOne({ slug: doc.slug }, { $set: update, $setOnInsert: { createdBy: admin._id, createdAt: new Date() } }, { upsert: true });
        lines.push(`✓ ${doc.slug} — ${prev ? 'yangilandi' : 'yaratildi'}, nashr qilindi`);
      }
      const next = from + BATCH;
      const done = next >= TESTS.length;
      if (slice.length) await writeAuditLog(req, admin._id, 'exam_test.import', 'ExamTest', `open-import:${from}-${from + slice.length}`, { count: slice.length, failed: lines.filter((l) => l.startsWith('✗')).length });
      const c = await counts();
      const body = `<p>${Math.min(next, TESTS.length)} / ${TESTS.length}</p><pre>${lines.join('\n')}</pre>` +
        (done
          ? `<p><strong>Import tugadi.</strong> Nashrdagi to'liq testlar: ${c.fullPub}. Endi qisqa testlarni nashrdan oling: <a href="${base}?step=unpublish">${base}?step=unpublish</a></p>`
          : `<p>Davom etmoqda…</p>`);
      return page('Open tests import', body, done ? null : `${base}?step=import&from=${next}`);
    }

    if (step === 'unpublish') {
      const c = await counts();
      if (c.fullPub < 50) return page('Unpublish', `<p>Nashrdagi to'liq testlar ${c.fullPub} ta (kamida 50 kerak) — avval <a href="${base}?step=import">import</a>.</p>`);
      const res = await ExamTest.updateMany({ slug: SECTION_RE, isPublished: true }, { $set: { isPublished: false, updatedAt: new Date() } });
      await writeAuditLog(req, admin._id, 'exam_test.unpublish_sections', 'ExamTest', 'open-sections', { modified: res.modifiedCount });
      const after = await counts();
      return page('Unpublish', `<p>${res.modifiedCount} ta qisqa test nashrdan olindi.</p><pre>${JSON.stringify(after, null, 2)}</pre>`);
    }

    const c = await counts();
    return page('Open tests import — holat', `<pre>${JSON.stringify(c, null, 2)}</pre><p><a href="${base}?step=import&from=0">Importni boshlash</a> · <a href="${base}?step=unpublish">Qisqa testlarni nashrdan olish</a></p>`);
  } catch (err) {
    return serverError(err, 'admin/open-import');
  }
}
