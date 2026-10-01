// AI Content Factory servisi (TZ §29, §52): hujjat -> bo'laklar -> AI -> kutubxonaga AI_GENERATED sifatida.
// Navbat holati bo'laklarda saqlanadi, shuning uchun ish davom ettiriladi (admin sahifani yopib qayta ochsa ham);
// bo'lakni "band qilish" atomik — ikki tab/so'rov bir bo'lakni ikki marta ishlamaydi.
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { VocabIngestJob, VocabularyEntry } from '@/lib/models';
import { generateJsonWithMeta } from '@/lib/aiJson';
import { logAiError } from '@/lib/ai/client';
import { extractDocumentText } from '@/lib/contentAgent/documentText';
import { AI_PROMPT_VERSIONS } from '@/lib/vocab/ai';
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
    createdAt: job.createdAt,
    cancelled: !!job.cancelled,
    status: job.cancelled ? 'cancelled' : finished ? 'done' : count('processing') ? 'processing' : done || failed ? 'processing' : 'queued',
    chunks: { total: chunks.length, pending: count('pending'), processing: count('processing'), done, failed },
    created: chunks.reduce((s, c) => s + (c.created || 0), 0),
    duplicates: chunks.reduce((s, c) => s + (c.duplicates || 0), 0),
    rejected: chunks.reduce((s, c) => s + (c.rejected || 0), 0),
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
    if (format === 'pdf' && !doc.hasTextLayer) throw new ServiceError(422, "PDF skanerlangan (matn qatlami yo'q) — OCR hozircha qo'llab-quvvatlanmaydi", 'no_text_layer');
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
  const res = await VocabIngestJob.updateOne({ _id: id }, { $set: { cancelled: true } });
  if (!res.matchedCount) throw notFound();
  return { success: true };
}

export async function deleteJob(id) {
  if (!isId(id)) throw notFound();
  const res = await VocabIngestJob.deleteOne({ _id: id });
  if (!res.deletedCount) throw notFound();
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
  return chunk ? { index: chunk.index, text: chunk.text, attempts: chunk.attempts, claim: token } : null;
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

/** Bitta bo'lakni ishlaydi. Xato bo'lsa MAX_ATTEMPTS gacha qayta uriniladi (pending'ga qaytadi). */
async function processChunk(job, chunk, adminId, filename, ai) {
  // Nomzodlar: avval kutubxonada borlarini chiqarib tashlaymiz (ikki bosqich: keng ro'yxat -> ma'lumlarni olib tashlash).
  const wide = selectCandidates(chunk.text, new Set(), FACTORY_LIMITS.maxCandidatesPerChunk * 3);
  const known = await knownWordsFor(wide);
  const candidates = selectCandidates(chunk.text, known, FACTORY_LIMITS.maxCandidatesPerChunk);
  if (!candidates.length) return { candidates: 0, created: 0, duplicates: 0, rejected: [], provider: '' };

  const { data, provider } = await ai(buildFactoryPrompt(chunk.text, candidates), FACTORY_SCHEMA);
  const { entries, rejected } = validateFactoryOutput(data, chunk.text, candidates, { sourceName: filename });
  let created = 0;
  let duplicates = 0;
  if (entries.length) {
    const r = await importEntries({ items: entries }, adminId, { aiGenerated: true, sourceType: 'book' });
    created = r.created;
    duplicates = r.duplicates;
  }
  return { candidates: candidates.length, created, duplicates, rejected, provider };
}

/**
 * Navbatdan keyingi `maxChunks` ta bo'lakni ishlaydi va yangilangan holatni qaytaradi.
 * `ai` — sinov uchun almashtiriladigan (default: provayder zanjiri).
 */
export async function runJob(id, adminId, { maxChunks = 2, now = new Date(), ai = generateJsonWithMeta } = {}) {
  if (!isId(id)) throw notFound();
  const job0 = await VocabIngestJob.findById(id).select('filename cancelled').lean();
  if (!job0) throw notFound();
  if (job0.cancelled) return getJob(id);

  for (let i = 0; i < maxChunks; i++) {
    const chunk = await claimChunk(id, now);
    if (!chunk) break;
    try {
      const out = await processChunk(job0, chunk, adminId, job0.filename, ai);
      await finishChunk(
        id,
        chunk.claim,
        { status: 'done', text: '', error: '', candidates: out.candidates, created: out.created, duplicates: out.duplicates, rejected: out.rejected.length, provider: out.provider || '' },
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
  return getJob(id);
}
