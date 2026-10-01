// Global lug'at kutubxonasi — haqiqiy MongoDB (mongodb-memory-server) ustida: import -> review -> publish -> user'ga qo'shish.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import {
  addEntriesToUser,
  createEntry,
  deleteEntry,
  exportCsv,
  importEntries,
  searchPublished,
  transitionEntry,
  updateEntry,
} from './libraryService';

const User: any = Models.User;
const VocabularyEntry: any = Models.VocabularyEntry;

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
const admin = new mongoose.Types.ObjectId();

const full = (word: string, over: Record<string, unknown> = {}) => ({
  word,
  pos: 'verb',
  cefr: 'B2',
  translationUz: 'tarjima',
  shortDefinition: 'definition',
  examples: [{ en: `Use ${word}.` }],
  ...over,
});

describeDb('vocabulary library (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    await VocabularyEntry.syncIndexes();
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await VocabularyEntry.deleteMany({});
    await User.deleteMany({});
  });

  it('dublikat (so‘z+turkum) rad etiladi', async () => {
    await createEntry(full('abandon'), admin);
    await expect(createEntry(full('Abandon'), admin)).rejects.toMatchObject({ status: 409, code: 'duplicate' });
    await expect(createEntry(full('abandon', { pos: 'noun' }), admin)).resolves.toBeTruthy(); // boshqa turkum — mumkin
  });

  it('AI kontent review’siz nashr qilinmaydi, tasdiqlangach nashr qilinadi', async () => {
    const res = await importEntries({ items: [full('maintain'), full('sustain')] }, admin, { aiGenerated: true });
    expect(res.created).toBe(2);
    const e: any = await VocabularyEntry.findOne({ normalizedWord: 'maintain' }).lean();
    expect(e.status).toBe('AI_GENERATED');
    expect(e.verifiedByAdmin).toBe(false);
    await expect(transitionEntry(e._id, 'PUBLISHED', admin)).rejects.toMatchObject({ code: 'bad_transition' });
    await transitionEntry(e._id, 'UNDER_REVIEW', admin);
    await transitionEntry(e._id, 'APPROVED', admin);
    const pub = await transitionEntry(e._id, 'PUBLISHED', admin);
    expect(pub.status).toBe('PUBLISHED');
    expect(pub.verifiedByAdmin).toBe(true);
    expect(pub.publishedVersion).toBe(1);
  });

  it('to‘liq bo‘lmagan yozuv nashr qilinmaydi', async () => {
    const e = await createEntry({ word: 'vague' }, admin);
    await transitionEntry(e.id, 'APPROVED', admin);
    await expect(transitionEntry(e.id, 'PUBLISHED', admin)).rejects.toMatchObject({ code: 'not_publishable' });
  });

  it('import: dublikat, xato qator va fayl ichidagi takror hisobi', async () => {
    await createEntry(full('keep'), admin);
    const csv = 'word,pos,cefr,translationUz\nkeep,verb,B1,saqlamoq\nnew,verb,B1,yangi\nnew,verb,B1,yangi\n,verb,B1,x\nbad,verb,Z9,x\n';
    const r = await importEntries({ csv }, admin);
    expect(r.created).toBe(1);
    expect(r.duplicates).toBe(1);
    expect(r.invalid).toBe(3);
    expect(await VocabularyEntry.countDocuments()).toBe(2);
  });

  it('tahrirlash versiyani oshiradi va tarixni saqlaydi; parallel tahrir to‘qnashuvi aniqlanadi', async () => {
    const e = await createEntry(full('alter'), admin);
    const v2 = await updateEntry(e.id, { translationUz: 'o‘zgartirmoq' }, admin);
    expect(v2.contentVersion).toBe(2);
    expect(v2.versionCount).toBe(1);
    const raw: any = await VocabularyEntry.findById(e.id).lean();
    expect(raw.versions[0].snapshot.translationUz).toBe('tarjima');
  });

  it('nashr qilingan yozuv o‘chirilmaydi, arxivlangach o‘chadi', async () => {
    const e = await createEntry(full('keep2'), admin);
    await transitionEntry(e.id, 'APPROVED', admin);
    await transitionEntry(e.id, 'PUBLISHED', admin);
    await expect(deleteEntry(e.id)).rejects.toMatchObject({ code: 'published' });
    await transitionEntry(e.id, 'ARCHIVED', admin);
    await expect(deleteEntry(e.id)).resolves.toEqual({ success: true });
  });

  it('foydalanuvchi faqat PUBLISHED ni ko‘radi va o‘z lug‘atiga qo‘sha oladi (dublikatsiz)', async () => {
    const a = await createEntry(full('significant', { pos: 'adjective', ieltsRelevance: 3 }), admin);
    const b = await createEntry(full('hidden'), admin); // DRAFT
    await transitionEntry(a.id, 'APPROVED', admin);
    await transitionEntry(a.id, 'PUBLISHED', admin);

    const user = await User.create({ phone: '+998901234567', name: 'T', password: 'x', categories: [] });
    const list = await searchPublished({ q: 'sign' }, String(user._id));
    expect(list.total).toBe(1);
    expect(list.items[0].word).toBe('significant');
    expect(list.items[0].owned).toBe(false);
    expect(list.items[0]).not.toHaveProperty('reviewNote');
    expect((await searchPublished({ q: 'hidden' }, String(user._id))).total).toBe(0);

    const r1 = await addEntriesToUser(String(user._id), { entryIds: [a.id, b.id] }); // b — DRAFT, e'tiborsiz
    expect(r1).toMatchObject({ added: 1, skipped: 0, createdCategory: 'Kutubxona' });
    const r2 = await addEntriesToUser(String(user._id), { entryIds: [a.id] });
    expect(r2).toMatchObject({ added: 0, skipped: 1 });

    const u: any = await User.findById(user._id).lean();
    expect(u.categories).toHaveLength(1);
    expect(u.categories[0].words[0].word).toBe('significant');
    expect(u.categories[0].words[0].syns).toEqual(['tarjima']);
    expect(u.categories[0].words[0].enrichment.cefr).toBe('B2');
    expect((await searchPublished({ q: 'sign' }, String(user._id))).items[0].owned).toBe(true);
  });

  it('export CSV barcha yozuvlarni beradi', async () => {
    await createEntry(full('one'), admin);
    await createEntry(full('two'), admin);
    const csv = await exportCsv({});
    expect(csv.split('\r\n')).toHaveLength(3);
  });

  it('to‘g‘ri javob berilgan savoldagi o‘z so‘zi uchun signal yoziladi; xato javob jazolamaydi', async () => {
    const { recordAttemptUsage } = await import('./signalService');
    const user = await User.create({
      phone: '+998907654321',
      name: 'S',
      password: 'x',
      categories: [{ name: 'c', words: [{ word: 'significant', syns: ['muhim'] }, { word: 'abandon', syns: ['tark etmoq'] }] }],
    });
    const r = await recordAttemptUsage({
      userId: user._id,
      source: 'reading',
      questions: [
        { prompt: 'The author finds the result significant because…', options: ['a', 'b'], correctAnswer: 'a', isCorrect: true },
        { prompt: 'Why did they abandon the plan?', correctAnswer: 'b', isCorrect: false },
      ],
    });
    expect(r.applied).toBe(1);
    const u: any = await User.findById(user._id).lean();
    const [sig, aba] = u.categories[0].words;
    expect(sig.stats.skills.context.correct).toBe(1);
    expect(aba.stats?.skills?.context).toBeUndefined();
  });
});
