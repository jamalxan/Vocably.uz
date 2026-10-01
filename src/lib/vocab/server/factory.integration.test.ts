// Content Factory — haqiqiy MongoDB ustida, AI soxta: matn -> bo'laklar -> AI_GENERATED yozuvlar, davom ettirish,
// parallel band qilish, xatoda qayta urinish va bekor qilish.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { cancelJob, createJob, getJob, runJob } from './factoryService';

const VocabularyEntry: any = Models.VocabularyEntry;
const VocabIngestJob: any = Models.VocabIngestJob;

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
const admin = new mongoose.Types.ObjectId();

const para = (word: string) =>
  `Governments must ${word} the effects of rapid change. ` + 'Ordinary sentences continue about communities and their daily routines. '.repeat(6);
// 3 ta bo'lak: har birida bittadan o'ziga xos so'z
const TEXT = ['mitigate', 'sustain', 'allocate'].map((w) => para(w).repeat(9)).join('\n\n');

/** Mashq so'rovi (buildExercisesPrompt) uchun javob: har so'zga bitta yaroqli fill_gap va bitta yaroqsiz (variantsiz MC). */
const exercisesFor = (prompt: string) => {
  const words = [...prompt.matchAll(/^- "([^"]+)"/gm)].map((m) => m[1]);
  return {
    data: {
      exercises: words.flatMap((w) => [
        { word: w, type: 'fill_gap', prompt: `Leaders must _____ resources (${w}).`, answer: w, explanationUz: 'Kontekstga mos.' },
        { word: w, type: 'multiple_choice', prompt: 'Qaysi?', answer: w, explanationUz: 'x' }, // variantsiz — rad etiladi
      ]),
    },
    provider: 'fake',
  };
};

const fakeAi = (log: string[] = []) => async (prompt: string) => {
  if (prompt.includes('mashq tuz')) return exercisesFor(prompt);
  const m = /NOMZODLAR: ([^\n]*)/.exec(prompt)!;
  const cands = m[1].split(', ');
  log.push(m[1]);
  const pick = ['mitigate', 'sustain', 'allocate'].find((w) => cands.includes(w));
  const words: any[] = pick
    ? [{ word: pick, pos: 'verb', cefr: 'C1', translationUz: 'tarjima', shortDefinition: 'definition', example: `Leaders ${pick} resources.` }]
    : [];
  words.push({ word: 'banana', pos: 'noun', cefr: 'A1', translationUz: 'banan', shortDefinition: 'fruit', example: 'A banana.' }); // gallyutsinatsiya
  return { data: { words }, provider: 'fake' };
};

describeDb('content factory (integration)', () => {
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
    await VocabIngestJob.deleteMany({});
    await VocabularyEntry.deleteMany({});
  });

  it('matndan ish yaratadi, bo‘laklarni ishlaydi va AI_GENERATED yozuvlar yaratadi (gallyutsinatsiya rad etiladi)', async () => {
    const job = await createJob({ adminId: admin, filename: 'book.txt', format: 'text', text: TEXT });
    expect(job.chunks.total).toBeGreaterThanOrEqual(3);
    let cur = job;
    for (let i = 0; i < 10 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { maxChunks: 2, ai: fakeAi() as any });
    expect(cur.status).toBe('done');
    expect(cur.chunks.failed).toBe(0);
    expect(cur.created).toBe(3);
    expect(cur.rejected).toBeGreaterThanOrEqual(3);

    const entries: any[] = await VocabularyEntry.find().lean();
    expect(entries.map((e) => e.word).sort()).toEqual(['allocate', 'mitigate', 'sustain']);
    expect(entries.every((e) => e.status === 'AI_GENERATED' && e.aiGenerated && !e.verifiedByAdmin && e.sourceType === 'book')).toBe(true);
    expect(entries[0].source).toBe('factory: book.txt');
    // matn tozalangan
    const raw: any = await VocabIngestJob.findById(job.id).lean();
    expect(raw.chunks.every((c: any) => c.text === '')).toBe(true);
  });

  it('yaratilgan yozuvlarga AI mashqlari biriktiriladi (faqat yaroqlilari, AI_GENERATED holatda)', async () => {
    const job = await createJob({ adminId: admin, filename: 'book.txt', format: 'text', text: TEXT });
    let cur = job;
    for (let i = 0; i < 10 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { maxChunks: 2, ai: fakeAi() as any });
    expect(cur.exercises).toBe(3); // 3 so'z x 1 yaroqli (variantsiz MC rad etilgan)
    expect(cur.exerciseErrors).toBe(0);
    const entries: any[] = await VocabularyEntry.find().lean();
    for (const e of entries) {
      expect(e.exercises).toHaveLength(1);
      expect(e.exercises[0]).toMatchObject({ type: 'fill_gap', status: 'AI_GENERATED' });
      expect(e.exercises[0].prompt).toContain('_____');
    }
  });

  it('mashq bosqichi xato qilsa bo‘lak muvaffaqiyatli qoladi va so‘zlar saqlanadi', async () => {
    const job = await createJob({ adminId: admin, filename: 'b.txt', format: 'text', text: TEXT });
    const base = fakeAi();
    const flaky = async (prompt: string) => {
      if (prompt.includes('mashq tuz')) throw new Error('exercise provider down');
      return base(prompt);
    };
    let cur = job;
    for (let i = 0; i < 10 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { maxChunks: 2, ai: flaky as any });
    expect(cur.chunks.failed).toBe(0);
    expect(cur.created).toBe(3);
    expect(cur.exercises).toBe(0);
    expect(cur.exerciseErrors).toBe(3);
    expect((await VocabularyEntry.find().lean()).every((e: any) => e.exercises.length === 0)).toBe(true);
  });

  it('kutubxonada bor so‘z nomzod bo‘lmaydi (takrorlanmaydi)', async () => {
    await VocabularyEntry.create({ word: 'mitigate', normalizedWord: 'mitigate', pos: 'verb', status: 'DRAFT' });
    const job = await createJob({ adminId: admin, format: 'text', text: TEXT });
    const log: string[] = [];
    let cur = job;
    for (let i = 0; i < 10 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { maxChunks: 3, ai: fakeAi(log) as any });
    expect(log.some((l) => l.split(', ').includes('mitigate'))).toBe(false);
    expect(await VocabularyEntry.countDocuments({ normalizedWord: 'mitigate' })).toBe(1);
  });

  it('parallel run chaqiruvlari bir bo‘lakni ikki marta ishlamaydi', async () => {
    const job = await createJob({ adminId: admin, format: 'text', text: TEXT });
    const log: string[] = [];
    await Promise.all([1, 2, 3, 4].map(() => runJob(job.id, admin, { maxChunks: 1, ai: fakeAi(log) as any })));
    const state = await getJob(job.id);
    expect(log.length).toBe(state.chunks.done); // har bir bajarilgan bo'lak uchun roppa-rosa bitta AI chaqiruv
    expect(state.chunks.done).toBe(4); // 4 ta parallel chaqiruv x 1 bo'lak, hech biri takrorlanmagan
    expect(state.chunks.pending).toBe(state.chunks.total - 4);
  });

  it('AI xatosida 3 martagacha qayta uriniladi, keyin failed', async () => {
    const job = await createJob({ adminId: admin, format: 'text', text: 'Short but long enough text. '.repeat(20) });
    expect(job.chunks.total).toBe(1);
    let calls = 0;
    const failing = async () => {
      calls++;
      throw new Error('provider down');
    };
    const cur = await runJob(job.id, admin, { maxChunks: 5, ai: failing as any });
    expect(calls).toBe(3);
    expect(cur.chunks.failed).toBe(1);
    expect(cur.status).toBe('done');
    expect(cur.errors[0].error).toContain('provider down');
  });

  it('bekor qilingan ish qayta ishlanmaydi', async () => {
    const job = await createJob({ adminId: admin, format: 'text', text: TEXT });
    await cancelJob(job.id);
    const cur = await runJob(job.id, admin, { ai: fakeAi() as any });
    expect(cur.status).toBe('cancelled');
    expect(cur.chunks.done).toBe(0);
  });

  it('juda qisqa/katta matn rad etiladi', async () => {
    await expect(createJob({ adminId: admin, format: 'text', text: 'short' })).rejects.toMatchObject({ code: 'too_short' });
    await expect(createJob({ adminId: admin, format: 'text', text: 'x '.repeat(250_000) })).rejects.toMatchObject({ code: 'too_large' });
  });
});
