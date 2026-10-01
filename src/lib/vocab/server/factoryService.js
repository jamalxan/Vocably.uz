// AI Content Factory servisi (TZ §29, §52): hujjat -> bo'laklar -> AI -> kutubxonaga AI_GENERATED sifatida.
// Navbat holati bo'laklarda saqlanadi, shuning uchun ish davom ettiriladi (admin sahifani yopib qayta ochsa ham);
// bo'lakni "band qilish" atomik — ikki tab/so'rov bir bo'lakni ikki marta ishlamaydi.
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { VocabIngestJob, VocabUploadPart, VocabularyEntry } from '@/lib/models';
import { generateJsonWithMeta, generateTextFromPdf } from '@/lib/aiJson';
import { OCR_LIMITS, buildOcrPrompt, cleanOcrText, looksLikeRefusal, planOcrRanges } from '@/lib/vocab/ocr';
import { checkComplete } from '@/lib/vocab/uploadParts';
import { logAiError } from '@/lib/ai/client';
import { extractDocumentText } from '@/lib/contentAgent/documentText';
import { AI_PROMPT_VERSIONS, EXERCISES_SCHEMA, buildExercisesPrompt, validateExercises } from '@/lib/vocab/ai';
import { normalizeWordKey } from '@/lib/vocab/library';
import {
  FACTORY_LIMITS,
  FACTORY_SCHEMA,
  buildFactoryPrompt,
  chunkText,
  selectCandidates,
  validateFactoryOutput,
} from '@/lib/vocab/factory';
import { lemmaCandidates } from '@/lib/vocab/wordForms';
import { ServiceError } from './sessionService';
import { importEntries } from './libraryService';

const STALE_MS = 5 * 60 * 1000; // "processing"da qotib qolgan bo'lak shundan keyin qayta olinadi
const MAX_ATTEMPTS = 3;
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));
const notFound = () => new ServiceError(404, 'Ish topilmadi', 'not_found');

export const ALLOWED_FORMATS = { pdf: 'pdf', docx: 'docx', txt: 'text', md: 'text', text: 'text' };

export function formatFromName(name = '') {
  const ext = String(name).toLowerCase().split('.').pop();
  return ALLOWED_FORMATS[ext] || null;
}

export function summarizeJob(job) {
  const chunks = job.chunks || [];
  const count = (st) => chunks.filter((c) => c.status === st).length;
  const done = count('done');
  const failed = count('failed');
  const finished = chunks.length > 0 && done + failed === chunks.length;
  return {
    id: String(job._id),
    filename: job.filename,
    format: job.format,
    charCount: job.charCount,
    ocr: !!job.uploadId,
    pages: chunks.reduce((m, c) => Math.max(m, c.ocr?.to || 0), 0),
    createdAt: job.createdAt,
    cancelled: !!job.cancelled,
    status: job.cancelled ? 'cancelled' : finished ? 'done' : count('processing') ? 'processing' : done || failed ? 'processing' : 'queued',
    chunks: { total: chunks.length, pending: count('pending'), processing: count('processing'), done, failed },
    created: chunks.reduce((s, c) => s + (c.created || 0), 0),
    duplicates: chunks.reduce((s, c) => s + (c.duplicates || 0), 0),
    rejected: chunks.reduce((s, c) => s + (c.rejected || 0), 0),
    exercises: chunks.reduce((s, c) => s + (c.exercises || 0), 0),
    exerciseErrors: chunks.filter((c) => c.exerciseError).length,
    errors: chunks.filter((c) => c.status === 'failed').slice(0, 5).map((c) => ({ index: c.index, error: c.error })),
    rejectedSamples: job.rejectedSamples || [],
  };
}

/** Matnni (yoki fayl buferini) bo'laklarga ajratib, ish yaratadi. */
export async function createJob({ adminId, filename = '', format = 'text', buffer = null, text = '' }) {
  let source = text;
  if (buffer) {
    const doc = await extractDocumentText(buffer, format).catch(() => null);
    if (!doc) throw new ServiceError(422, "Faylni o'qib bo'lmadi (buzilgan yoki parol bilan himoyalangan bo'lishi mumkin)", 'extract_failed');
    if (format === 'pdf' && !doc.hasTextLayer) throw new ServiceError(422, "PDF skanerlangan (matn qatlami yo'q) — OCR uchun faylni admin sahifasidagi 'Fayl yuklash' orqali yuboring", 'no_text_layer');
    source = doc.fullText;
  }
  source = String(source || '').trim();
  if (source.length < 200) throw new ServiceError(422, "Matn juda qisqa (kamida 200 belgi kerak)", 'too_short');
  if (source.length > FACTORY_LIMITS.maxChars) {
    throw new ServiceError(422, `Matn juda katta (maks ${FACTORY_LIMITS.maxChars.toLocaleString('en')} belgi) — bo'limlarga bo'lib yuklang`, 'too_large');
  }
  const chunks = chunkText(source);
  if (chunks.length > FACTORY_LIMITS.maxChunks) throw new ServiceError(422, `Bo'laklar juda ko'p (maks ${FACTORY_LIMITS.maxChunks})`, 'too_many_chunks');
  const job = await VocabIngestJob.create({
    createdBy: adminId,
    filename: String(filename).slice(0, 160),
    format,
    charCount: source.length,
    promptVersion: AI_PROMPT_VERSIONS.contentFactory,
    chunks: chunks.map((t, index) => ({ index, text: t })),
  });
  return summarizeJob(job.toObject());
}

export async function listJobs(limit = 20) {
  const jobs = await VocabIngestJob.find().select('-chunks.text').sort({ createdAt: -1 }).limit(limit).lean();
  return jobs.map(summarizeJob);
}

export async function getJob(id) {
  if (!isId(id)) throw notFound();
  const job = await VocabIngestJob.findById(id).select('-chunks.text').lean();
  if (!job) throw notFound();
  return summarizeJob(job);
}

export async function cancelJob(id) {
  if (!isId(id)) throw notFound();
  const job = await VocabIngestJob.findOneAndUpdate({ _id: id }, { $set: { cancelled: true } }, { projection: { uploadId: 1 } }).lean();
  if (!job) throw notFound();
  if (job.uploadId) await VocabUploadPart.deleteMany({ uploadId: job.uploadId });
  return { success: true };
}

export async function deleteJob(id) {
  if (!isId(id)) throw notFound();
  const job = await VocabIngestJob.findById(id).select('uploadId').lean();
  const res = await VocabIngestJob.deleteOne({ _id: id });
  if (!res.deletedCount) throw notFound();
  if (job?.uploadId) await VocabUploadPart.deleteMany({ uploadId: job.uploadId }); // OCR manba PDF'i endi kerak emas
  return { success: true }; // yaratilgan yozuvlar kutubxonada qoladi (ularni admin alohida ko'rib chiqadi)
}

/** Bitta kutilayotgan (yoki qotib qolgan) bo'lakni atomik band qiladi. @returns {{index:number,text:string,attempts:number}|null} */
async function claimChunk(jobId, now) {
  const token = crypto.randomBytes(8).toString('hex');
  const stale = new Date(now.getTime() - STALE_MS);
  const doc = await VocabIngestJob.findOneAndUpdate(
    {
      _id: jobId,
      cancelled: { $ne: true },
      chunks: { $elemMatch: { $or: [{ status: 'pending' }, { status: 'processing', claimedAt: { $lt: stale } }] } },
    },
    { $set: { 'chunks.$.status': 'processing', 'chunks.$.claim': token, 'chunks.$.claimedAt': now }, $inc: { 'chunks.$.attempts': 1 } },
    { new: true }
  ).lean();
  if (!doc) return null;
  const chunk = doc.chunks.find((c) => c.claim === token);
  return chunk ? { index: chunk.index, text: chunk.text, attempts: chunk.attempts, claim: token, ocr: chunk.ocr?.from ? { from: chunk.ocr.from, to: chunk.ocr.to } : null } : null;
}

// ---------------------------------------------------------------- bo'laklab yuklash va OCR

/** Fayl qismini saqlaydi (qayta yuborilsa ustiga yoziladi). Boshqa admin ning uploadId'siga yozib bo'lmaydi. */
export async function storeUploadPart({ adminId, uploadId, index, buffer }) {
  try {
    await VocabUploadPart.updateOne(
      { uploadId, index, createdBy: adminId },
      { $set: { size: buffer.length, data: buffer, createdAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    if (err?.code === 11000) throw new ServiceError(409, 'Bu uploadId band', 'upload_id_taken');
    throw err;
  }
  return { success: true };
}

async function loadUploadBuffer(uploadId) {
  const parts = await VocabUploadPart.find({ uploadId }).sort({ index: 1 }).lean();
  if (!parts.length) throw new Error("Manba fayl topilmadi (muddati o'tgan bo'lishi mumkin) — ishni qayta yarating");
  // lean() Binary qaytaradi: haqiqiy uzunlik `position` (buffer undan katta bo'lishi mumkin).
  const toBuf = (d) => (Buffer.isBuffer(d) ? d : Buffer.from(d.buffer.subarray(0, d.position ?? d.buffer.length)));
  return Buffer.concat(parts.map((p) => toBuf(p.data)));
}

/** OCR ishi: har bo'lak — sahifa oralig'i; matn ishlash paytida OCR qilinadi (runJob). */
export async function createOcrJob({ adminId, filename = '', uploadId, pageCount }) {
  const ranges = planOcrRanges(pageCount);
  if (!ranges.length) throw new ServiceError(422, "PDF'da sahifa topilmadi", 'no_pages');
  if (ranges.length > FACTORY_LIMITS.maxChunks) throw new ServiceError(422, `Sahifalar juda ko'p (maks ${OCR_LIMITS.maxPages})`, 'too_many_pages');
  const job = await VocabIngestJob.create({
    createdBy: adminId,
    filename: String(filename).slice(0, 160),
    format: 'pdf',
    charCount: 0,
    promptVersion: AI_PROMPT_VERSIONS.contentFactory,
    uploadId,
    chunks: ranges.map((r, index) => ({ index, ocr: { from: r.from, to: r.to } })),
  });
  return summarizeJob(job.toObject());
}

/**
 * Barcha qismlar kelgach faylni yig'adi va ish yaratadi. Matn qatlami bor PDF/DOCX/TXT — oddiy ish; skanerlangan PDF —
 * OCR ishi (qismlar saqlanib qoladi). `extract` — sinov uchun almashtiriladigan.
 */
export async function completeUpload({ adminId, uploadId, total, filename, extract = extractDocumentText }) {
  const format = formatFromName(filename);
  if (!format) throw new ServiceError(415, "Faqat PDF, DOCX yoki TXT fayllar qo'llab-quvvatlanadi", 'bad_format');
  const parts = await VocabUploadPart.find({ uploadId, createdBy: adminId }).select('index size').lean();
  const check = checkComplete(parts, total);
  if (!check.ok) throw new ServiceError(check.code === 'too_large' ? 413 : 400, check.error, check.code);

  let keepParts = false;
  try {
    const buffer = await loadUploadBuffer(uploadId);
    if (format !== 'pdf') return await createJob({ adminId, filename, format, buffer });
    const doc = await extract(buffer, 'pdf').catch(() => null);
    if (!doc) throw new ServiceError(422, "Faylni o'qib bo'lmadi (buzilgan yoki parol bilan himoyalangan bo'lishi mumkin)", 'extract_failed');
    if (doc.hasTextLayer) return await createJob({ adminId, filename, format, text: doc.fullText });
    // Skanerlangan PDF -> OCR
    if (buffer.length > OCR_LIMITS.maxPdfBytes) {
      throw new ServiceError(422, `Skanerlangan PDF OCR uchun juda katta (maks ${OCR_LIMITS.maxPdfBytes / 1024 / 1024} MB)`, 'ocr_too_large');
    }
    if (doc.pageCount > OCR_LIMITS.maxPages) throw new ServiceError(422, `Sahifalar juda ko'p (maks ${OCR_LIMITS.maxPages})`, 'too_many_pages');
    const job = await createOcrJob({ adminId, filename, uploadId, pageCount: doc.pageCount });
    keepParts = true;
    return job;
  } finally {
    if (!keepParts) await VocabUploadPart.deleteMany({ uploadId, createdBy: adminId });
  }
}

/** Standart OCR: Gemini PDF'ni o'qiydi; rad/uzr javobi xato sifatida qaytariladi (qayta uriniladi). */
async function ocrPdfPages(pdf, from, to) {
  const text = cleanOcrText(await generateTextFromPdf(pdf, buildOcrPrompt(from, to)));
  if (looksLikeRefusal(text)) throw new Error("OCR: model sahifalarni o'qiy olmadi");
  return text;
}

async function finishChunk(jobId, claim, set, extra = {}) {
  const $set = Object.fromEntries(Object.entries(set).map(([k, v]) => [`chunks.$[c].${k}`, v]));
  await VocabIngestJob.updateOne({ _id: jobId }, { $set, ...extra }, { arrayFilters: [{ 'c.claim': claim }] });
}

async function knownWordsFor(candidates) {
  if (!candidates.length) return new Set();
  const all = [...new Set(candidates.flatMap((c) => lemmaCandidates(c)))];
  const rows = await VocabularyEntry.find({ normalizedWord: { $in: all } }).select('normalizedWord').lean();
  return new Set(rows.map((r) => r.normalizedWord));
}

/**
 * TZ §29 "Exercise/Answer/Explanation generation": yangi yaratilgan yozuvlarga AI mashqlarini biriktiradi.
 * So'zlar allaqachon saqlangan, shuning uchun bu bosqich xato qilsa ham bo'lak muvaffaqiyatsiz bo'lmaydi
 * (qaytadan urinilsa yozuvlar "dublikat" bo'lardi) — xato `exerciseError` sifatida qaytadi.
 * Faqat shu manbadan (`source`) yaratilgan va hali mashqsiz AI yozuvlariga yoziladi — admin tahrirlaganiga tegmaydi.
 * @returns {Promise<{exercises:number, exerciseError:string}>}
 */
async function attachExercises(entries, source, ai) {
  if (!entries.length) return { exercises: 0, exerciseError: '' };
  try {
    const words = entries.map((e) => e.word);
    const list = entries.map((e) => ({ word: e.word, translations: String(e.translationUz || '').split(/[;,]/).map((s) => s.trim()).filter(Boolean) }));
    const { data } = await ai(buildExercisesPrompt(list, 2), EXERCISES_SCHEMA);
    const { valid } = validateExercises(data, words);
    const byWord = new Map();
    for (const ex of valid) {
      const k = normalizeWordKey(ex.word);
      if (!byWord.has(k)) byWord.set(k, []);
      const { word: _w, ...rest } = ex;
      byWord.get(k).push(rest);
    }
    let attached = 0;
    for (const [normalizedWord, exercises] of byWord) {
      const r = await VocabularyEntry.updateOne(
        { normalizedWord, source, aiGenerated: true, status: 'AI_GENERATED', exercises: { $size: 0 } },
        { $set: { exercises: exercises.slice(0, 6) } }
      );
      if (r.modifiedCount) attached += exercises.slice(0, 6).length;
    }
    return { exercises: attached, exerciseError: '' };
  } catch (err) {
    logAiError(err, { endpoint: 'vocab-factory/exercises' });
    return { exercises: 0, exerciseError: String(err?.message || err).slice(0, 200) };
  }
}

/** Bitta bo'lakni ishlaydi. Xato bo'lsa MAX_ATTEMPTS gacha qayta uriniladi (pending'ga qaytadi). */
async function processChunk(job, chunk, adminId, filename, ai, ocr) {
  // Skanerlangan PDF: avval sahifa oralig'i matnga aylantiriladi (OCR), keyin odatdagi yo'l.
  let text = chunk.text;
  if (chunk.ocr) text = await ocr(await loadUploadBuffer(job.uploadId), chunk.ocr.from, chunk.ocr.to);
  // Nomzodlar: avval kutubxonada borlarini chiqarib tashlaymiz (ikki bosqich: keng ro'yxat -> ma'lumlarni olib tashlash).
  const wide = selectCandidates(text, new Set(), FACTORY_LIMITS.maxCandidatesPerChunk * 3);
  const known = await knownWordsFor(wide);
  const candidates = selectCandidates(text, known, FACTORY_LIMITS.maxCandidatesPerChunk);
  if (!candidates.length) return { candidates: 0, created: 0, duplicates: 0, rejected: [], provider: '' };

  const { data, provider } = await ai(buildFactoryPrompt(text, candidates), FACTORY_SCHEMA);
  const { entries, rejected } = validateFactoryOutput(data, text, candidates, { sourceName: filename });
  let created = 0;
  let duplicates = 0;
  let ex = { exercises: 0, exerciseError: '' };
  if (entries.length) {
    const r = await importEntries({ items: entries }, adminId, { aiGenerated: true, sourceType: 'book' });
    created = r.created;
    duplicates = r.duplicates;
    if (created > 0) ex = await attachExercises(entries, entries[0].source, ai);
  }
  return { candidates: candidates.length, created, duplicates, rejected, provider, ...ex };
}

/**
 * Navbatdan keyingi `maxChunks` ta bo'lakni ishlaydi va yangilangan holatni qaytaradi.
 * `ai` / `ocr` — sinov uchun almashtiriladigan (default: provayder zanjiri / Gemini PDF OCR).
 */
export async function runJob(id, adminId, { maxChunks = 2, now = new Date(), ai = generateJsonWithMeta, ocr = ocrPdfPages } = {}) {
  if (!isId(id)) throw notFound();
  const job0 = await VocabIngestJob.findById(id).select('filename cancelled uploadId').lean();
  if (!job0) throw notFound();
  if (job0.cancelled) return getJob(id);

  // OCR bo'lagi (Gemini PDF o'qish + tahlil + mashq) sekin — so'rov vaqt chegarasiga sig'ishi uchun bittadan.
  const limit = job0.uploadId ? 1 : maxChunks;
  for (let i = 0; i < limit; i++) {
    const chunk = await claimChunk(id, now);
    if (!chunk) break;
    try {
      const out = await processChunk(job0, chunk, adminId, job0.filename, ai, ocr);
      await finishChunk(
        id,
        chunk.claim,
        { status: 'done', text: '', error: '', candidates: out.candidates, created: out.created, duplicates: out.duplicates, rejected: out.rejected.length, provider: out.provider || '', exercises: out.exercises || 0, exerciseError: out.exerciseError || '' },
        out.rejected.length
          ? { $push: { rejectedSamples: { $each: out.rejected.slice(0, 3).map((r) => `${r.word}: ${r.reason}`), $slice: -30 } } }
          : {}
      );
    } catch (err) {
      logAiError(err, { endpoint: 'vocab-factory/chunk', jobId: String(id), chunk: chunk.index });
      const giveUp = chunk.attempts >= MAX_ATTEMPTS;
      await finishChunk(id, chunk.claim, {
        status: giveUp ? 'failed' : 'pending',
        claim: '',
        error: String(err?.message || err).slice(0, 300),
      });
    }
  }
  const state = await getJob(id);
  // OCR ishi tugagach manba PDF qismlari kerak emas (xotira tejash; TTL baribir 7 kun).
  if (job0.uploadId && (state.status === 'done' || state.cancelled)) await VocabUploadPart.deleteMany({ uploadId: job0.uploadId });
  return state;
}
