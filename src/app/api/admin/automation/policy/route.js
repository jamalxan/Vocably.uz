import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AutomationPolicy } from '@/lib/models';
import { NextResponse } from 'next/server';

const DEFAULTS = {
  level: 'assisted',
  autoAcceptConfidence: 0.93,
  autoPublishMinQaScore: 0.95,
  autoSelfHealMaxAttempts: 2,
  autoMockGeneration: true,
  autoContentGapScan: false,
  maxAutonomousCostUsdPerDay: 15,
  paused: false,
};

// docs/ai-content-agent-tz-avtopilot.md §3.2/§4.1/§6 — global policy
// (bitta hujjat) + ixtiyoriy per-book override. `bookId` berilmasa faqat
// global qaytariladi; berilsa ikkalasi ham qaytariladi (frontend'da
// "bu kitob global'dan farq qiladimi" ko'rsatish uchun) — override yo'q
// bo'lsa `book: null`, effektiv qiymat global bilan bir xil ekanligi
// frontend'da hisoblanadi.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const bookId = req.nextUrl.searchParams.get('bookId');

    let global = await AutomationPolicy.findOne({ scope: 'global' }).lean();
    if (!global) global = { scope: 'global', ...DEFAULTS };

    let book = null;
    if (bookId) {
      book = await AutomationPolicy.findOne({ scope: 'book', bookId }).lean();
    }

    return NextResponse.json({ global, book });
  } catch (err) {
    return serverError(err, 'admin/automation/policy:get');
  }
}

// §3.2 — `scope:'global'` yoki `{scope:'book', bookId}`. Faqat berilgan
// maydonlar yangilanadi (partial update), qolganlari mavjud hujjatdan yoki
// standartdan olinadi.
export async function PATCH(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const { scope, bookId, ...fields } = body;

    if (scope !== 'global' && scope !== 'book') {
      return NextResponse.json({ error: "scope 'global' yoki 'book' bo'lishi kerak" }, { status: 400 });
    }
    if (scope === 'book' && !bookId) {
      return NextResponse.json({ error: "scope:'book' uchun bookId majburiy" }, { status: 400 });
    }

    // N-11: "autopilot" (odam tasdig'isiz to'liq avtonom nashr) admin UI'dan
    // olib tashlangan — bu yerda ham rad etiladi, aks holda UI'ni chetlab,
    // to'g'ridan-to'g'ri API chaqiruvi bilan yoqib bo'lardi. `canAutoPublish`
    // (src/lib/contentAgent/autopilotGuards.js) copyright qoidasini `level`dan
    // mustaqil qo'llaydi, lekin bu rejimning o'zi ham umuman yoqilmasligi kerak.
    if (fields.level === 'autopilot') {
      return NextResponse.json(
        { error: "'autopilot' rejimi o'chirilgan — nashr doim admin tasdig'i bilan amalga oshadi" },
        { status: 400 }
      );
    }

    const allowedKeys = [
      'level',
      'autoAcceptConfidence',
      'autoPublishMinQaScore',
      'autoSelfHealMaxAttempts',
      'autoMockGeneration',
      'autoContentGapScan',
      'maxAutonomousCostUsdPerDay',
    ];
    const update = {};
    for (const key of allowedKeys) {
      if (fields[key] !== undefined) update[key] = fields[key];
    }
    update.updatedBy = admin._id;
    update.updatedAt = new Date();

    // $set va $setOnInsert bir xil maydonga tegsa Mongo xato beradi — shuning
    // uchun `update`da allaqachon bor kalitlarni $setOnInsert'dan chiqarib
    // tashlaymiz (ular baribir $set orqali yoziladi).
    const setOnInsert = Object.fromEntries(Object.entries(DEFAULTS).filter(([k]) => !(k in update)));

    const query = scope === 'global' ? { scope: 'global' } : { scope: 'book', bookId };
    const doc = await AutomationPolicy.findOneAndUpdate(
      query,
      { $set: { ...update, scope, bookId: scope === 'book' ? bookId : null }, $setOnInsert: setOnInsert },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await writeAuditLog(req, admin._id, 'automation_policy.update', 'AutomationPolicy', String(doc._id), { scope, bookId, ...update });

    return NextResponse.json({ policy: doc });
  } catch (err) {
    return serverError(err, 'admin/automation/policy:patch');
  }
}
