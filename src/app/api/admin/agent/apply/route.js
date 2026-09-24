import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { runAgentAi } from '@/lib/contentAgent/agent/aiCall';
import { AgentThread, AgentAttachment, ExamTest } from '@/lib/models';
import { parseTestSections, answerKeyTextFrom, audioscriptTextFrom } from '@/lib/contentAgent/agent/analyze';
import { buildSections, summarizeSections, slugify, uniqueSlug, attachAudioToPart } from '@/lib/contentAgent/agent/buildTest';
import { listListeningCandidates } from '@/lib/contentAgent/agent/candidates';
import { scoreTranscriptAgainstPart, buildAudioVerifyPrompt, decideAudioAttachment, AUDIO_VERIFY_SCHEMA } from '@/lib/contentAgent/agent/audioMatch';
import { validateTest, hasBlockingErrors, isMockEligible } from '@/lib/exam/contentValidator';
import { syncValidationIssuesToReviewQueue } from '@/lib/exam/reviewSync';
import { buildImageUrl } from '@/lib/exam/imageStorage';
import { NextResponse } from 'next/server';

// Chatdagi taklif tugmasi bosilganda haqiqiy o'zgarish shu yerda bo'ladi.
// Har bir harakat:
//   1. tekshiriladi (kontent validatori / audio moslik dalili),
//   2. bajariladi (ExamTest qoralamasi yaratiladi yoki yangilanadi),
//   3. natija chatga xabar sifatida yoziladi (audit yozuvi bilan birga).
//
// Yaratilgan testlar HAR DOIM `isPublished:false` — AI hech qachon o'zi
// nashr qilmaydi (TZ §14 "AI hech qachon o'zi hal qilmasin" qoidasi).
export const maxDuration = 300;

// Serverless vaqt chegarasiga (300s) urilib, hech narsa qaytarmasdan
// "yo'qolib qolish"dan ko'ra — qilinganini qaytarib, qolganini keyingi
// bosishga qoldirgan ma'qul.
const TIME_BUDGET_MS = 230 * 1000;

async function resolveUniqueSlug(base) {
  const existing = await ExamTest.find({ slug: new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?$`) })
    .select('slug')
    .lean();
  return uniqueSlug(base, existing.map((t) => t.slug));
}

/** Bitta testni hujjatdan yig'ib, `ExamTest` qoralamasi sifatida yaratadi.
 *
 * IDEMPOTENT: 2026-09-24, jonli Chrome sinovida topilgan xato — bitta
 * "joylashtirish" taklifi ikki marta bosilganda (yoki so'rov qayta
 * yuborilganda) IKKITA bir xil qoralama yaratilardi. Client tarafida
 * (`AdminAgentChat.jsx`, tugma muvaffaqiyatdan keyin butunlay o'chadi)
 * ham tuzatildi, lekin bu yerda — server tomonida — HAM tekshiriladi:
 * boshqa tab/qurilma yoki tarmoq qayta urinishi kabi client himoyasi
 * qamrab olmaydigan holatlar uchun. */
async function ingestOneTest({ attachment, testEntry, bookTitle, adminId, req }) {
  const existing = await ExamTest.findOne({
    'source.agentAttachmentId': attachment._id,
    'source.testIndex': testEntry.index,
  }).lean();
  if (existing) {
    return {
      ok: true,
      testId: String(existing._id),
      title: existing.title,
      slug: existing.slug,
      sections: summarizeSections(existing.sections || {}),
      blockers: 0,
      warnings: ["Bu test allaqachon shu fayldan yaratilgan — qayta yaratilmadi."],
      summary: `${existing.title} (allaqachon mavjud)`,
      canPublish: !hasBlockingErrors(validateTest(existing)),
    };
  }

  const analysis = attachment.analysis || {};
  const pages = attachment.pages || [];
  const answerKeyText = answerKeyTextFrom(pages, analysis.answerKeyPages);
  const audioscriptText = audioscriptTextFrom(pages, analysis.audioscriptPages);

  const { parsed, warnings, needsReview } = await parseTestSections({
    pages,
    test: testEntry,
    answerKeyText,
    audioscriptText,
    // Sahifa oralig'i bo'lmagan (qisqa/bir sahifali) hujjatlar uchun
    // sarlavha bo'yicha kesilgan matn — `analyzeDocument` uni allaqachon
    // hisoblab, tahlil bilan birga saqlagan.
    fallbackTexts: analysis.headingSplit || null,
  });

  const sections = buildSections(parsed);
  if (Object.keys(sections).length === 0) {
    return { ok: false, summary: `Test ${testEntry.index}: kontent ajratib bo'lmadi (bo'lim matni bo'sh yoki tanib bo'lmadi).` };
  }

  const title = `${bookTitle} — Test ${testEntry.index}`;
  const slug = await resolveUniqueSlug(slugify(title));

  const draft = {
    slug,
    title,
    module: 'academic',
    difficulty: 'medium',
    sections,
    // LEGAL-01 — chat orqali yuklangan kitob deyarli har doim uchinchi
    // tomon materiali. Ataylab eng CHEKLOVCHI default: `private` +
    // `third_party_copyright` — admin huquqni o'zi tasdiqlab, test
    // sahifasida o'zgartiradi. Yolg'on "own/public" yozib qo'yish
    // publish gate'ini aldab o'tib ketardi.
    rights: {
      sourceType: 'third_party_copyright',
      publisher: '',
      licence: '',
      licenceNote: `Admin AI chat orqali yuklangan fayl: ${attachment.filename}`,
      publishScope: 'private',
    },
  };

  const issues = validateTest(draft);

  const test = await ExamTest.create({
    ...draft,
    isPublished: false,
    isMockEligible: isMockEligible(draft),
    createdBy: adminId,
    source: { bookTitle, testIndex: testEntry.index, agentAttachmentId: attachment._id },
  });

  await syncValidationIssuesToReviewQueue(String(test._id), issues);
  await writeAuditLog(req, adminId, 'agent.test.create', 'ExamTest', test._id, { slug, title, fromAttachment: String(attachment._id) });

  const blockers = issues.filter((i) => i.severity === 'error').length;
  const summaryParts = summarizeSections(sections);

  return {
    ok: true,
    testId: String(test._id),
    title,
    slug,
    sections: summaryParts,
    blockers,
    warnings: [...warnings, ...(needsReview.length ? [`${needsReview.length} ta savol guruhi tekshiruv navbatiga tushdi.`] : [])],
    summary: `${title} — ${summaryParts.map((s) => `${s.label} (${s.detail})`).join(', ')}`,
    canPublish: !hasBlockingErrors(issues),
  };
}

async function handleIngest({ payload, all, admin, req }) {
  const attachment = await AgentAttachment.findOne({ _id: payload.attachmentId, adminId: admin._id });
  if (!attachment) return { content: 'Fayl topilmadi — qaytadan yuklang.', proposals: [] };

  const analysis = attachment.analysis || {};
  const entries = (analysis.tests || []).filter((t) =>
    all ? ['listening', 'reading', 'writing', 'speaking'].some((k) => t.sections?.[k]) : t.index === payload.testIndex
  );
  if (entries.length === 0) return { content: "Bu fayl ichida joylashtiriladigan test topilmadi.", proposals: [] };

  const bookTitle = payload.title || analysis.bookTitle || attachment.filename.replace(/\.[a-z0-9]+$/i, '');
  const startedAt = Date.now();
  const results = [];
  const remaining = [];

  for (const entry of entries) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      remaining.push(entry);
      continue;
    }
    try {
      results.push(await ingestOneTest({ attachment, testEntry: entry, bookTitle, adminId: admin._id, req }));
    } catch (err) {
      results.push({ ok: false, summary: `Test ${entry.index}: ${String(err?.message || err).slice(0, 200)}` });
    }
  }

  if (results.some((r) => r.ok)) {
    attachment.status = 'applied';
    await attachment.save();
  }

  const lines = [];
  const proposals = [];
  for (const r of results) {
    if (!r.ok) {
      lines.push(`❌ ${r.summary}`);
      continue;
    }
    lines.push(`✅ **${r.title}** qoralama sifatida yaratildi:\n${r.sections.map((s) => `- ${s.label}: ${s.detail}`).join('\n')}`);
    if (r.warnings?.length) lines.push(r.warnings.map((w) => `⚠️ ${w}`).join('\n'));
    if (r.blockers > 0) {
      lines.push(`ℹ️ ${r.blockers} ta bloklovchi masala bor (odatda: Listening audiosi hali yuklanmagan). Nashr qilishdan oldin hal qilinadi.`);
    }
    if (r.canPublish) {
      proposals.push({
        type: 'publish_test',
        label: `${r.title} — nashr qilish`,
        description: 'Validatsiyadan o\'tdi, o\'quvchilarga ochiladi',
        payload: { testId: r.testId },
      });
    }
  }

  if (remaining.length) {
    lines.push(`⏳ Vaqt chegarasi sababli ${remaining.length} ta test qoldi.`);
    proposals.push({
      type: 'ingest_test',
      label: `Qolganini davom ettirish (Test ${remaining[0].index})`,
      description: 'Keyingi testni joylashtirish',
      payload: { attachmentId: String(attachment._id), testIndex: remaining[0].index, title: bookTitle },
    });
  }

  lines.push('Qoralamalar: `/admin/exam-tests`. Listening audiolarini shu chatga tashlasangiz — o\'zim tegishli part\'ga biriktiraman.');
  return { content: lines.join('\n\n'), proposals };
}

async function handleAttachAudio({ payload, admin, req }) {
  const attachment = await AgentAttachment.findOne({ _id: payload.attachmentId, adminId: admin._id });
  if (!attachment?.audioFileId) return { content: 'Audio fayl topilmadi — qaytadan yuklang.', proposals: [] };

  const test = await ExamTest.findById(payload.testId);
  if (!test) return { content: 'Test topilmadi.', proposals: [] };

  const candidates = await listListeningCandidates({ includeFilled: true });
  const candidate = candidates.find((c) => c.testId === String(test._id) && c.partOrder === payload.partOrder);
  if (!candidate) return { content: `Bu testda Part ${payload.partOrder} topilmadi.`, proposals: [] };

  const transcript = (attachment.text || '').trim();

  // Tekshiruv — foydalanuvchi talabi: "mos keladimi yo'qmi tekshirishi kerak,
  // to'g'ri kelsa yuklashi kerak, to'g'ri kelmasa to'g'ri kelmaganligi
  // aytilsin". Qaror qoidalari sof funksiyada (`decideAudioAttachment`,
  // testda qotirilgan) — bu yerda faqat dalil yig'iladi.
  const evidence = transcript ? scoreTranscriptAgainstPart(transcript, candidate) : null;
  let ai = null;
  if (transcript) {
    try {
      const verified = await runAgentAi({
        taskKey: 'audio.match',
        systemPrompt: "Sen IELTS Listening audiolarini to'g'ri part'ga moslashtiradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
        userContent: buildAudioVerifyPrompt(transcript, candidate),
        jsonSchema: AUDIO_VERIFY_SCHEMA,
        schemaName: 'audio_verify',
      });
      ai = verified.data;
    } catch {
      ai = null;
    }
  }

  const decision = decideAudioAttachment({
    hasTranscript: !!transcript,
    evidence,
    ai,
    candidateHasReference: (evidence?.answerTotal || 0) > 0 || !!candidate.transcript?.trim(),
  });

  if (!decision.allow) {
    const proposals = [];
    if (ai?.suggestedPartOrder && ai.suggestedPartOrder !== payload.partOrder) {
      proposals.push({
        type: 'attach_audio',
        label: `${test.title} · Part ${ai.suggestedPartOrder} ga biriktirish`,
        description: "AI shu part'ni taklif qilmoqda",
        payload: { attachmentId: String(attachment._id), testId: String(test._id), partOrder: ai.suggestedPartOrder },
      });
    }
    return {
      content: `❌ **Mos kelmadi.** Bu audio **${test.title} · Part ${payload.partOrder}** ga tegishli emas.

${decision.note}

Shuning uchun biriktirmadim. To'g'ri part'ni ko'rsating yoki boshqa audio tashlang.`,
      proposals,
    };
  }

  const verdictLine = decision.note;

  const audioUrl = `/api/exam/audio/${attachment.audioFileId}`;
  const { sections, attached } = attachAudioToPart(test.sections, payload.partOrder, {
    audioUrl,
    durationSec: attachment.durationSec || 0,
    transcript,
  });
  if (!attached) return { content: `Part ${payload.partOrder} topilmadi.`, proposals: [] };

  test.sections = sections;
  test.markModified('sections');
  const issues = validateTest(test.toObject());
  test.isMockEligible = isMockEligible(test.toObject());
  await test.save();
  await syncValidationIssuesToReviewQueue(String(test._id), issues);

  attachment.status = 'applied';
  await attachment.save();
  await writeAuditLog(req, admin._id, 'agent.audio.attach', 'ExamTest', test._id, { partOrder: payload.partOrder, attachmentId: String(attachment._id) });

  const stillMissing = (sections.listening?.parts || []).filter((p) => !p.audioUrl).length;
  const proposals = [];
  if (!hasBlockingErrors(issues)) {
    proposals.push({
      type: 'publish_test',
      label: `${test.title} — nashr qilish`,
      description: "Barcha tekshiruvlardan o'tdi",
      payload: { testId: String(test._id) },
    });
  }

  return {
    content: `✅ **${test.title} · Part ${payload.partOrder}** ga audio biriktirildi.\n\n${verdictLine}${stillMissing ? `\n\nShu testda yana ${stillMissing} ta part audiosiz — ularni ham tashlang.` : ''}`,
    proposals,
  };
}

async function handleAttachImage({ payload, admin, req }) {
  const attachment = await AgentAttachment.findOne({ _id: payload.attachmentId, adminId: admin._id });
  if (!attachment?.imageFileId) return { content: 'Rasm topilmadi — qaytadan yuklang.', proposals: [] };

  const test = await ExamTest.findById(payload.testId);
  if (!test?.sections?.writing) return { content: "Test yoki uning Writing bo'limi topilmadi.", proposals: [] };

  const tasks = (test.sections.writing.tasks || []).map((t) =>
    t.order === payload.taskOrder
      ? {
          ...t,
          imageUrl: buildImageUrl(attachment.imageFileId),
          // `imageAlt` bo'sh bo'lsa validator BLOKLAYDI (a11y talabi).
          // Rasmni "ko'rib" tavsif yozadigan vision modeli bu oqimda yo'q,
          // shuning uchun aniq va halol matn — admin test sahifasida
          // aniqlashtirishi mumkin.
          imageAlt: t.imageAlt?.trim() || `${test.title} — Writing Task ${payload.taskOrder} uchun grafik material`,
        }
      : t
  );
  test.sections = { ...test.sections, writing: { ...test.sections.writing, tasks } };
  test.markModified('sections');
  await test.save();

  attachment.status = 'applied';
  await attachment.save();
  await writeAuditLog(req, admin._id, 'agent.image.attach', 'ExamTest', test._id, { taskOrder: payload.taskOrder });

  return {
    content: `✅ Rasm **${test.title} · Writing Task ${payload.taskOrder}** ga biriktirildi.\n\nRasm tavsifi (alt) avtomatik yozildi — aniqroq tavsif kerak bo'lsa test sahifasida tahrirlang.`,
    proposals: [],
  };
}

async function handlePublish({ payload, admin, req }) {
  const test = await ExamTest.findById(payload.testId);
  if (!test) return { content: 'Test topilmadi.', proposals: [] };

  const issues = validateTest(test.toObject());
  if (hasBlockingErrors(issues)) {
    const blockers = issues.filter((i) => i.severity === 'error');
    return {
      content: `❌ **${test.title}** nashr qilinmadi — ${blockers.length} ta bloklovchi masala:\n${blockers.slice(0, 6).map((b) => `- ${b.path}: ${b.message}`).join('\n')}`,
      proposals: [],
    };
  }

  test.isPublished = true;
  test.isMockEligible = isMockEligible(test.toObject());
  await test.save();
  await writeAuditLog(req, admin._id, 'agent.test.publish', 'ExamTest', test._id, { slug: test.slug });

  return {
    content: `✅ **${test.title}** nashr qilindi${test.isMockEligible ? ' va to\'liq Mock imtihonga ham mos' : " (mini test — to'liq Mock uchun mos emas)"}.`,
    proposals: [],
  };
}

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    if (!(await checkRateLimit(admin._id, 'admin-agent-apply', 30))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    await connectToDatabase();

    const { threadId, proposal } = await req.json().catch(() => ({}));
    if (!proposal?.type) return NextResponse.json({ error: 'Taklif yuborilmadi' }, { status: 400 });

    const thread = threadId ? await AgentThread.findOne({ _id: threadId, adminId: admin._id }) : null;
    if (!thread) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const payload = proposal.payload || {};
    let result;
    switch (proposal.type) {
      case 'ingest_test':
        result = await handleIngest({ payload, all: false, admin, req });
        break;
      case 'ingest_all':
        result = await handleIngest({ payload, all: true, admin, req });
        break;
      case 'attach_audio':
        result = await handleAttachAudio({ payload, admin, req });
        break;
      case 'attach_image_writing':
        result = await handleAttachImage({ payload, admin, req });
        break;
      case 'publish_test':
        result = await handlePublish({ payload, admin, req });
        break;
      default:
        return NextResponse.json({ error: `Noma'lum taklif turi: ${proposal.type}` }, { status: 400 });
    }

    thread.messages.push({ role: 'user', content: proposal.label || 'Bajarildi', data: { appliedProposal: proposal.type } });
    thread.messages.push({
      role: 'assistant',
      content: result.content,
      data: result.proposals?.length ? { proposals: result.proposals } : null,
    });
    thread.updatedAt = new Date();
    await thread.save();

    const out = thread.messages.slice(-2).map((m) => ({
      id: String(m._id),
      role: m.role,
      content: m.content,
      data: m.data || null,
      attachments: [],
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ threadId: String(thread._id), messages: out });
  } catch (err) {
    return serverError(err, 'admin/agent:apply');
  }
}
