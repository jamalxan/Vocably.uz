// Global lug'at kutubxonasi servisi (TZ §29–§32): admin CRUD/import/export/holat o'tishlari va
// foydalanuvchi uchun nashr qilingan yozuvlarni qidirish + o'z lug'atiga qo'shish.
import mongoose from 'mongoose';
import { User, VocabularyEntry } from '@/lib/models';
import {
  CONTENT_STATUSES,
  canTransition,
  csvToInputs,
  entriesToCsv,
  normalizeEntry,
  normalizeWordKey,
  publishProblems,
  toUserWord,
} from '@/lib/vocab/library';
import { ServiceError } from './sessionService';
import { assertWordRoom } from './wordCap';

const MAX_VERSIONS = 20;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));

const notFound = () => new ServiceError(404, 'Topilmadi', 'not_found');
const bad = (msg, code = 'validation') => new ServiceError(400, msg, code);
const conflict = (msg, code = 'conflict') => new ServiceError(409, msg, code);

// Versiya snapshot'iga kirmaydigan texnik maydonlar.
const SNAPSHOT_SKIP = new Set(['_id', '__v', 'versions', 'createdAt', 'updatedAt']);
function snapshotOf(doc) {
  const out = {};
  for (const [k, v] of Object.entries(doc)) if (!SNAPSHOT_SKIP.has(k)) out[k] = v;
  return out;
}

export function serializeEntry(e, { full = false } = {}) {
  const base = {
    id: String(e._id),
    word: e.word,
    pos: e.pos,
    cefr: e.cefr,
    ieltsRelevance: e.ieltsRelevance,
    translationUz: e.translationUz,
    shortDefinition: e.shortDefinition,
    ipaUk: e.ipaUk,
    ipaUs: e.ipaUs,
    audioUk: e.audioUk,
    audioUs: e.audioUs,
    imageUrl: e.imageUrl,
    examples: e.examples || [],
    synonyms: e.synonyms || [],
    antonyms: e.antonyms || [],
    collocations: e.collocations || [],
    topicTags: e.topicTags || [],
    register: e.register,
  };
  if (!full) return base;
  return {
    ...base,
    lemma: e.lemma,
    translationRu: e.translationRu,
    detailedDefinition: e.detailedDefinition,
    commonMistakes: e.commonMistakes || [],
    usageNotes: e.usageNotes,
    source: e.source,
    sourceType: e.sourceType,
    status: e.status,
    aiGenerated: e.aiGenerated,
    verifiedByAdmin: e.verifiedByAdmin,
    reviewNote: e.reviewNote,
    contentVersion: e.contentVersion,
    publishedVersion: e.publishedVersion,
    publishedAt: e.publishedAt,
    versionCount: (e.versions || []).length,
    updatedAt: e.updatedAt,
    createdAt: e.createdAt,
  };
}

function searchFilter({ q, cefr, pos, topic, status }) {
  const f = {};
  if (status) f.status = status;
  if (cefr) f.cefr = String(cefr).toUpperCase();
  if (pos) f.pos = String(pos);
  if (topic) f.topicTags = String(topic).toLowerCase();
  const key = normalizeWordKey(q || '');
  if (key) {
    const re = new RegExp(escapeRe(key), 'i');
    f.$or = [{ normalizedWord: re }, { translationUz: re }, { synonyms: re }, { topicTags: re }];
  }
  return f;
}

function pageParams({ page, limit }, maxLimit = 100) {
  const l = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 30));
  const p = Math.max(1, parseInt(page, 10) || 1);
  return { limit: l, skip: (p - 1) * l, page: p };
}

// ------------------------------------------------------------------ admin

export async function listAdminEntries(params) {
  const { limit, skip, page } = pageParams(params);
  const status = CONTENT_STATUSES.includes(params.status) ? params.status : '';
  const filter = searchFilter({ ...params, status });
  const [items, total, counts] = await Promise.all([
    VocabularyEntry.find(filter).select('-versions').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    VocabularyEntry.countDocuments(filter),
    VocabularyEntry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  return {
    items: items.map((e) => serializeEntry(e, { full: true })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  };
}

export async function getAdminEntry(id) {
  if (!isId(id)) throw notFound();
  const e = await VocabularyEntry.findById(id).lean();
  if (!e) throw notFound();
  return {
    ...serializeEntry(e, { full: true }),
    versions: (e.versions || []).map((v) => ({ version: v.version, status: v.status, savedAt: v.savedAt })),
  };
}

export async function createEntry(input, adminId, { sourceType = 'manual', aiGenerated = false } = {}) {
  const { entry, errors } = normalizeEntry(input);
  if (errors.length) throw bad(errors.join('; '));
  try {
    const doc = await VocabularyEntry.create({
      ...entry,
      sourceType,
      aiGenerated,
      status: aiGenerated ? 'AI_GENERATED' : 'DRAFT',
      createdBy: adminId,
      updatedBy: adminId,
    });
    return serializeEntry(doc.toObject(), { full: true });
  } catch (err) {
    if (err?.code === 11000) throw conflict("Bu so'z va turkum allaqachon kutubxonada bor", 'duplicate');
    throw err;
  }
}

export async function updateEntry(id, input, adminId) {
  if (!isId(id)) throw notFound();
  const cur = await VocabularyEntry.findById(id).lean();
  if (!cur) throw notFound();
  const { entry, errors } = normalizeEntry({ ...cur, ...input });
  if (errors.length) throw bad(errors.join('; '));
  // Nashr qilingan yozuvni tahrirlash ham minimal sifat talabiga javob berishi kerak.
  if (cur.status === 'PUBLISHED') {
    const problems = publishProblems(entry, cur);
    if (problems.length) throw bad(problems.join('; '), 'not_publishable');
  }
  const curVersion = cur.contentVersion || 1;
  const nextVersion = curVersion + 1;
  const set = {
    ...entry,
    contentVersion: nextVersion,
    updatedBy: adminId,
    updatedAt: new Date(),
    ...(cur.status === 'PUBLISHED' ? { publishedVersion: nextVersion } : {}),
  };
  try {
    const updated = await VocabularyEntry.findOneAndUpdate(
      { _id: id, contentVersion: curVersion }, // optimistik qulf
      {
        $set: set,
        $push: { versions: { $each: [{ version: curVersion, snapshot: snapshotOf(cur), status: cur.status, savedBy: adminId }], $slice: -MAX_VERSIONS } },
      },
      { new: true }
    ).lean();
    if (!updated) throw conflict("Yozuv boshqa joyda o'zgartirilgan, sahifani yangilang");
    return serializeEntry(updated, { full: true });
  } catch (err) {
    if (err?.code === 11000) throw conflict("Bu so'z va turkum allaqachon kutubxonada bor", 'duplicate');
    throw err;
  }
}

export async function transitionEntry(id, to, adminId, note = '') {
  if (!isId(id)) throw notFound();
  if (!CONTENT_STATUSES.includes(to)) throw bad("Noma'lum holat");
  const cur = await VocabularyEntry.findById(id).lean();
  if (!cur) throw notFound();
  if (!canTransition(cur.status, to)) throw conflict(`${cur.status} → ${to} o'tishi mumkin emas`, 'bad_transition');
  const set = { status: to, updatedBy: adminId, updatedAt: new Date(), reviewNote: String(note || '').slice(0, 500) };
  if (to === 'APPROVED' || to === 'PUBLISHED') set.verifiedByAdmin = true; // admin ko'rib chiqqan (TZ §4.3)
  if (to === 'REJECTED' || to === 'DRAFT') set.verifiedByAdmin = false;
  if (to === 'PUBLISHED') {
    const problems = publishProblems(cur, { aiGenerated: cur.aiGenerated, verifiedByAdmin: true });
    if (problems.length) throw bad(problems.join('; '), 'not_publishable');
    set.publishedVersion = cur.contentVersion || 1;
    set.publishedAt = new Date();
  }
  const updated = await VocabularyEntry.findOneAndUpdate({ _id: id, status: cur.status }, { $set: set }, { new: true })
    .select('-versions')
    .lean();
  if (!updated) throw conflict("Holat boshqa joyda o'zgargan");
  return serializeEntry(updated, { full: true });
}

export async function deleteEntry(id) {
  if (!isId(id)) throw notFound();
  // Nashr qilinganlar foydalanuvchi lug'atlariga nusxalangan bo'lishi mumkin — avval arxivlash kerak.
  const res = await VocabularyEntry.deleteOne({ _id: id, status: { $ne: 'PUBLISHED' } });
  if (!res.deletedCount) {
    if (!(await VocabularyEntry.exists({ _id: id }))) throw notFound();
    throw conflict("Nashr qilingan yozuvni o'chirib bo'lmaydi — avval arxivlang", 'published');
  }
  return { success: true };
}

/** Ommaviy import (CSV matni yoki JSON ro'yxat). Dublikatlar o'tkazib yuboriladi; xatolar qator raqami bilan qaytadi. */
export async function importEntries({ csv = undefined, items = undefined }, adminId, { aiGenerated = false, sourceType } = {}) {
  let rows;
  const notes = [];
  if (typeof csv === 'string' && csv.trim()) {
    const parsed = csvToInputs(csv);
    rows = parsed.rows;
    notes.push(...parsed.errors);
  } else if (Array.isArray(items)) {
    rows = items.slice(0, 2000).map((input, i) => ({ line: i + 1, input }));
  } else throw bad('csv yoki items kerak');

  const valid = [];
  const errors = [];
  const seen = new Set();
  for (const { line, input } of rows) {
    const { entry, errors: errs } = normalizeEntry(input || {});
    if (errs.length) {
      errors.push({ line, error: errs.join('; ') });
      continue;
    }
    const k = `${entry.normalizedWord}|${entry.pos}`;
    if (seen.has(k)) {
      errors.push({ line, error: 'Faylda takrorlangan' });
      continue;
    }
    seen.add(k);
    valid.push({ line, entry });
  }

  let created = 0;
  if (valid.length) {
    const now = new Date();
    const ops = valid.map(({ entry }) => ({
      updateOne: {
        filter: { normalizedWord: entry.normalizedWord, pos: entry.pos },
        update: {
          $setOnInsert: {
            ...entry,
            sourceType: sourceType || (aiGenerated ? 'ai' : 'csv'),
            aiGenerated,
            status: aiGenerated ? 'AI_GENERATED' : 'DRAFT',
            createdBy: adminId,
            updatedBy: adminId,
            createdAt: now,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    }));
    const res = await VocabularyEntry.bulkWrite(ops, { ordered: false });
    created = res.upsertedCount || 0;
  }
  return { total: rows.length, created, duplicates: valid.length - created, invalid: errors.length, errors: errors.slice(0, 50), notes };
}

export async function exportCsv({ status } = {}) {
  const filter = CONTENT_STATUSES.includes(status) ? { status } : {};
  const items = await VocabularyEntry.find(filter).select('-versions').sort({ normalizedWord: 1 }).limit(20000).lean();
  return entriesToCsv(items);
}

// ------------------------------------------------------------------ foydalanuvchi

export async function searchPublished(params, userId) {
  const { limit, skip, page } = pageParams(params, 50);
  const filter = searchFilter({ ...params, status: 'PUBLISHED' });
  const ielts = parseInt(params.ielts, 10);
  if (ielts >= 1 && ielts <= 3) filter.ieltsRelevance = { $gte: ielts };
  const [items, total] = await Promise.all([
    VocabularyEntry.find(filter)
      .select('-versions -sourceType -reviewNote -createdBy -updatedBy -source')
      .sort({ ieltsRelevance: -1, normalizedWord: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VocabularyEntry.countDocuments(filter),
  ]);
  // Qaysilari allaqachon foydalanuvchi lug'atida ekanini belgilaymiz.
  const owned = new Set();
  if (userId && items.length) {
    const user = await User.findById(userId).select('categories.words.word').lean();
    for (const c of user?.categories || []) for (const w of c.words || []) owned.add(normalizeWordKey(w.word));
  }
  return {
    items: items.map((e) => ({ ...serializeEntry(e), owned: owned.has(e.normalizedWord) })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

const LIBRARY_CATEGORY = 'Kutubxona';

/** Tanlangan nashr qilingan yozuvlarni foydalanuvchi kategoriyasiga nusxalaydi (mavjud so'zlar o'tkazib yuboriladi). */
export async function addEntriesToUser(userId, { entryIds, categoryId = undefined }) {
  const ids = [...new Set((Array.isArray(entryIds) ? entryIds : []).map(String).filter(isId))].slice(0, 50);
  if (!ids.length) throw bad("So'z tanlanmagan");
  const entries = await VocabularyEntry.find({ _id: { $in: ids }, status: 'PUBLISHED' }).select('-versions').lean();
  if (!entries.length) throw notFound();

  const user = await User.findById(userId).select('categories._id categories.name categories.words.word').lean();
  if (!user) throw notFound();
  const owned = new Set();
  for (const c of user.categories || []) for (const w of c.words || []) owned.add(normalizeWordKey(w.word));
  const fresh = entries.filter((e) => !owned.has(e.normalizedWord));
  const skipped = entries.length - fresh.length;
  if (!fresh.length) return { added: 0, skipped, categoryId: null };

  await assertWordRoom(userId, fresh.length);
  const words = fresh.map((e) => toUserWord(e));
  let target = null;
  if (categoryId) {
    target = (user.categories || []).find((c) => String(c._id) === String(categoryId)) || null;
    if (!target) throw notFound();
  } else {
    target = (user.categories || []).find((c) => c.name === LIBRARY_CATEGORY) || null;
  }

  if (target) {
    const r = await User.updateOne({ _id: userId, 'categories._id': target._id }, { $push: { 'categories.$.words': { $each: words } } });
    if (!r.matchedCount) throw notFound();
    return { added: words.length, skipped, categoryId: String(target._id) };
  }
  await User.updateOne({ _id: userId }, { $push: { categories: { name: LIBRARY_CATEGORY, words } } });
  return { added: words.length, skipped, categoryId: null, createdCategory: LIBRARY_CATEGORY };
}
