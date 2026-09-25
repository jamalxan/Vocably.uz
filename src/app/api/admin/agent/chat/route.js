import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { aiErrorResponse } from '@/lib/ai/client';
import { runAgentAi } from '@/lib/contentAgent/agent/aiCall';
import { AgentThread, AgentAttachment } from '@/lib/models';
import { analyzeDocument } from '@/lib/contentAgent/agent/analyze';
import { listListeningCandidates, listWritingImageTargets, getPlatformState } from '@/lib/contentAgent/agent/candidates';
import { rankCandidates, buildAudioPickPrompt, AUDIO_PICK_SCHEMA, MATCH_STRONG, MATCH_WEAK } from '@/lib/contentAgent/agent/audioMatch';
import { AGENT_REPLY_SCHEMA, buildConversationPrompt } from '@/lib/contentAgent/agent/converse';
import { SECTION_LABEL } from '@/lib/contentAgent/agent/buildTest';
import { NextResponse } from 'next/server';

// Admin AI chatining bitta "burilishi" (turn).
//
// Arxitektura qarori: HARAKAT TAKLIFLARINI (`proposals`) model emas, SERVER
// yasaydi — haqiqiy DB holatidan va haqiqiy fayl tahlilidan. Model faqat
// gapiradi (`/converse`). Shu sababli chatda hech qachon mavjud bo'lmagan
// testga yoki part'ga ishora qiluvchi tugma paydo bo'lmaydi.
//
// Har bir taklif `POST /api/admin/agent/apply`ga yuboriladi — ya'ni hech
// narsa admin tugmani bosmaguncha o'zgarmaydi ("AI o'zi joylashtirsin"
// talabi AI qaror qabul qilishini bildiradi, nazoratni yo'qotishni emas;
// bitta bosish bilan hammasi joylashadi — "Hammasini joylash" tugmasi).
export const maxDuration = 300;

const MAX_TEXT = 4000;
// Butun so'rov uchun qat'iy muddat (Vercel 300s'da funksiyani o'ldiradi va
// client JSON o'rniga "An error occurred..." matnini oladi).
const REQUEST_BUDGET_MS = 265 * 1000;
// Suhbat javobi (matnli xabar) uchun kamida shuncha vaqt qolishi kerak.
const MIN_REPLY_MS = 40 * 1000;
const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking'];

function messageOut(m) {
  return {
    id: String(m._id),
    role: m.role,
    content: m.content,
    data: m.data || null,
    attachments: m.attachmentsOut || [],
    createdAt: m.createdAt,
  };
}

function attachmentOut(a) {
  return {
    id: String(a._id),
    kind: a.kind,
    filename: a.filename,
    bytes: a.bytes,
    pageCount: a.pageCount,
    audioFileId: a.audioFileId,
    imageFileId: a.imageFileId,
  };
}

/** Hujjat tahlili -> chat matni + taklif tugmalari. */
function documentTurn(attachment, analysis) {
  const tests = analysis.tests || [];
  const proposals = [];
  const lines = [];

  const title = analysis.bookTitle || attachment.filename.replace(/\.[a-z0-9]+$/i, '');
  lines.push(`**${title}** — ${attachment.pageCount} sahifa ko'rib chiqildi.`);

  if (tests.length === 0) {
    lines.push("Ichidan IELTS test tuzilmasi topilmadi. Bu qanday material ekanini yozsangiz (masalan \"faqat Reading passage\"), qaytadan urinaman.");
    return { content: lines.join('\n\n'), proposals };
  }

  if (analysis.classified?.reason && tests[0]?.sectionSource === 'classified') {
    lines.push(`Bo'lim sarlavhalari topilmadi — mazmuniga qarab aniqladim: ${analysis.classified.reason}`);
  }

  lines.push(tests.length === 1 ? 'Quyidagi kontent topildi:' : `${tests.length} ta test topildi:`);
  for (const t of tests) {
    const present = SECTION_KEYS.filter((k) => t.sections?.[k]);
    const where = t.sectionSource ? '' : ` (${t.pageFrom}-${t.pageTo}-sahifa)`;
    lines.push(
      `- **Test ${t.index}**${where}: ${present.length ? present.map((k) => SECTION_LABEL[k]).join(', ') : "bo'lim aniqlanmadi"}`
    );
    if (present.length === 0) continue;
    proposals.push({
      type: 'ingest_test',
      label: `Test ${t.index} — joylashtirish`,
      description: present.map((k) => SECTION_LABEL[k]).join(' · '),
      payload: { attachmentId: String(attachment._id), testIndex: t.index, sections: present, title },
    });
  }

  if (analysis.answerKeyPages?.length) lines.push(`Javob kaliti: ${analysis.answerKeyPages.length} sahifa topildi.`);
  else lines.push("⚠️ Javob kaliti topilmadi — javoblarsiz savollar tekshiruv navbatiga tushadi (men javobni o'zim to'qimayman).");

  if (analysis.crossCheckWarnings?.length) {
    lines.push(`⚠️ ${analysis.crossCheckWarnings.join(' ')}`);
  }

  const withSections = proposals.length;
  if (withSections > 1) {
    proposals.unshift({
      type: 'ingest_all',
      label: `Hammasini joylashtirish (${withSections} ta test)`,
      description: 'Har bir test alohida qoralama sifatida yaratiladi',
      payload: { attachmentId: String(attachment._id), title },
    });
  }

  lines.push('Qaysi birini joylashtiray?');
  return { content: lines.join('\n\n'), proposals };
}

/** Audio -> qaysi Listening part ekanini aniqlash/so'rash. */
async function audioTurn(attachment, deadlineAt) {
  const candidates = await listListeningCandidates();
  const proposals = [];
  const lines = [];

  if (candidates.length === 0) {
    return {
      content: `**${attachment.filename}** qabul qilindi, lekin hozir audio kutayotgan Listening part yo'q. Avval Listening savollari bo'lgan kitob/hujjatni tashlang — keyin bu audioni o'sha part'ga biriktiraman.`,
      proposals,
    };
  }

  const transcript = (attachment.text || '').trim();
  let ranked = [];
  let aiPick = null;

  if (transcript) {
    ranked = rankCandidates(transcript, candidates);
    // Model faqat DALIL TO'PLASH uchun — yakuniy biriktirish baribir
    // `apply` ichida qayta tekshiriladi.
    try {
      const picked = await runAgentAi({
        taskKey: 'audio.match',
        systemPrompt: "Sen IELTS Listening audiolarini to'g'ri part'ga moslashtiradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
        userContent: buildAudioPickPrompt(transcript, candidates.slice(0, 12)),
        jsonSchema: AUDIO_PICK_SCHEMA,
        schemaName: 'audio_pick',
        deadlineAt,
      });
      aiPick = picked.data;
    } catch {
      aiPick = null;
    }
  } else {
    lines.push("Audio matnga o'girilmadi, shuning uchun o'zim aniqlay olmayman — qaysi Listening uchun ekanini tanlang:");
  }

  const best = ranked[0];
  if (best && best.score >= MATCH_STRONG) {
    lines.unshift(
      `**${attachment.filename}** — bu **${best.testTitle} · Part ${best.partOrder}** ga mos keladi (javob kalitidan ${best.answerHits}/${best.answerTotal} javob audioda uchradi).`
    );
    proposals.push({
      type: 'attach_audio',
      label: `${best.testTitle} · Part ${best.partOrder} ga biriktirish`,
      description: `Moslik: ${Math.round(best.score * 100)}%`,
      payload: { attachmentId: String(attachment._id), testId: best.testId, partOrder: best.partOrder },
    });
  } else if (transcript) {
    lines.unshift(
      best && best.score > MATCH_WEAK
        ? `**${attachment.filename}** — ishonchim past. Eng yaqini: **${best.testTitle} · Part ${best.partOrder}** (${best.answerHits}/${best.answerTotal} javob mos). Qaysi Listening uchun ekanini tasdiqlang:`
        : `**${attachment.filename}** — bu audio mavjud Listening part'larining birortasiga ham aniq mos kelmadi. Qaysi Listening uchun ekanini o'zingiz ko'rsating — tanlaganingizdan keyin qayta tekshiraman va mos kelmasa biriktirmayman:`
    );
  }

  if (aiPick?.reason) lines.push(`AI izohi: ${aiPick.reason}`);

  // Qolgan nomzodlar — har doim ko'rsatiladi (admin o'zi ko'rsatishi mumkin
  // bo'lsin degan talab). Har biri bosilganda `apply` QAYTA TEKSHIRADI.
  const shown = (ranked.length ? ranked : candidates.map((c) => ({ ...c, score: null }))).slice(0, 8);
  for (const c of shown) {
    const already = proposals.some((p) => p.payload.testId === c.testId && p.payload.partOrder === c.partOrder);
    if (already) continue;
    proposals.push({
      type: 'attach_audio',
      label: `${c.testTitle} · Part ${c.partOrder}`,
      description: c.score != null ? `Moslik: ${Math.round(c.score * 100)}%` : 'Tekshirib biriktiraman',
      secondary: true,
      payload: { attachmentId: String(attachment._id), testId: c.testId, partOrder: c.partOrder },
    });
  }

  return { content: lines.join('\n\n'), proposals };
}

/** Rasm -> qaysi Writing task (yoki savol guruhi) uchun. */
async function imageTurn(attachment) {
  const targets = await listWritingImageTargets();
  const waiting = targets.filter((t) => !t.hasImage && t.taskOrder === 1);
  const proposals = waiting.slice(0, 8).map((t) => ({
    type: 'attach_image_writing',
    label: `${t.testTitle} · Writing Task ${t.taskOrder}`,
    description: t.promptText.slice(0, 90),
    payload: { attachmentId: String(attachment._id), testId: t.testId, taskOrder: t.taskOrder },
  }));

  return {
    content: proposals.length
      ? `**${attachment.filename}** qabul qilindi. Bu rasm qaysi Writing Task 1 grafigi?`
      : `**${attachment.filename}** qabul qilindi, lekin hozir rasm kutayotgan Writing Task 1 yo'q. Avval Writing bo'limi bo'lgan hujjatni tashlang.`,
    proposals,
  };
}

export async function POST(req) {
  const deadlineAt = Date.now() + REQUEST_BUDGET_MS;
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    if (!(await checkRateLimit(admin._id, 'admin-agent-chat', 30))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const text = String(body.text || '').slice(0, MAX_TEXT).trim();
    const attachmentIds = Array.isArray(body.attachmentIds) ? body.attachmentIds.slice(0, 10) : [];
    if (!text && attachmentIds.length === 0) {
      return NextResponse.json({ error: "Xabar bo'sh" }, { status: 400 });
    }

    let thread = body.threadId ? await AgentThread.findOne({ _id: body.threadId, adminId: admin._id }) : null;
    if (!thread) {
      thread = await AgentThread.create({ adminId: admin._id, title: text.slice(0, 60) || 'Fayl tahlili', messages: [] });
    }

    const attachments = attachmentIds.length
      ? await AgentAttachment.find({ _id: { $in: attachmentIds }, adminId: admin._id })
      : [];

    thread.messages.push({ role: 'user', content: text, attachmentIds: attachments.map((a) => a._id) });

    const assistantMessages = [];

    for (const attachment of attachments) {
      attachment.threadId = thread._id;
      try {
        if (attachment.kind === 'document' || attachment.kind === 'text') {
          const analysis = await analyzeDocument({ pages: attachment.pages || [], deadlineAt });
          attachment.analysis = analysis;
          attachment.status = 'analyzed';
          assistantMessages.push({ ...documentTurn(attachment, analysis), attachmentId: attachment._id });
        } else if (attachment.kind === 'audio') {
          const turn = await audioTurn(attachment, deadlineAt);
          attachment.status = 'analyzed';
          assistantMessages.push({ ...turn, attachmentId: attachment._id });
        } else if (attachment.kind === 'image') {
          const turn = await imageTurn(attachment);
          attachment.status = 'analyzed';
          assistantMessages.push({ ...turn, attachmentId: attachment._id });
        }
      } catch (err) {
        attachment.status = 'failed';
        attachment.error = String(err?.message || err).slice(0, 500);
        assistantMessages.push({
          content: `**${attachment.filename}** tahlil qilinmadi: ${attachment.error}`,
          proposals: [],
          attachmentId: attachment._id,
        });
      }
      await attachment.save();
    }

    // Matn yozilgan bo'lsa — suhbat javobi ham beriladi (fayl tahlilidan
    // TASHQARI: admin ko'pincha faylni izoh bilan birga tashlaydi, izohga
    // javob bermaslik "eshitmaganday" ko'rinardi). Faqat fayl tashlangan
    // bo'lsa model ortiqcha chaqirilmaydi — narx va kutish vaqti.
    if (text && (assistantMessages.length === 0 || deadlineAt - Date.now() > MIN_REPLY_MS)) {
      try {
        const state = await getPlatformState();
        const history = thread.messages.slice(-12).map((m) => ({ role: m.role, content: m.content, data: m.data }));
        // `generateJson` (Groq -> Gemini -> ... zanjiri) o'rniga `runAgentAi`:
        // unda so'rov muddati (deadlineAt) va har chaqiruv timeout'i bor,
        // shuning uchun sekin provayder butun so'rovni 300s'ga osib qo'ymaydi.
        const { data } = await runAgentAi({
          taskKey: 'agent.converse',
          systemPrompt: "Sen Vocably admin kontent agentisan. Faqat so'ralgan JSON'ni qaytar.",
          userContent: buildConversationPrompt(state, history, text),
          jsonSchema: AGENT_REPLY_SCHEMA,
          schemaName: 'agent_reply',
          deadlineAt,
        });
        const reply = String(data.reply || '').trim();
        if (reply) assistantMessages.push({ content: reply, proposals: [] });
      } catch (aiErr) {
        // Fayl tahlili allaqachon javob bergan bo'lsa, suhbat qatlamining
        // yiqilishi butun burilishni yiqitmasligi kerak.
        if (assistantMessages.length === 0) return aiErrorResponse(aiErr, { endpoint: 'admin/agent:chat' });
      }
    }

    if (assistantMessages.length === 0) {
      // Bu yerga faqat model bo'sh javob qaytarganda tushiladi. Xabar
      // holatga mos bo'lsin — "Fayl qabul qilindi" deb yozib, hech qanday
      // fayl yuborilmagan bo'lsa adminni chalg'itmaylik.
      assistantMessages.push({
        content: attachments.length ? 'Fayl qabul qilindi.' : "Javob ololmadim — savolni boshqacha yozib ko'ring.",
        proposals: [],
      });
    }

    for (const m of assistantMessages) {
      thread.messages.push({
        role: 'assistant',
        content: m.content,
        data: m.proposals?.length ? { proposals: m.proposals } : null,
        attachmentIds: m.attachmentId ? [m.attachmentId] : [],
      });
    }

    thread.updatedAt = new Date();
    if (thread.title === 'Fayl tahlili' && attachments.length) thread.title = attachments[0].filename.slice(0, 60);
    await thread.save();

    const attachmentMap = new Map(attachments.map((a) => [String(a._id), attachmentOut(a)]));
    const out = thread.messages.slice(-(assistantMessages.length + 1)).map((m) => ({
      ...messageOut(m),
      attachments: (m.attachmentIds || []).map((id) => attachmentMap.get(String(id))).filter(Boolean),
    }));

    return NextResponse.json({ threadId: String(thread._id), messages: out });
  } catch (err) {
    return serverError(err, 'admin/agent:chat');
  }
}
