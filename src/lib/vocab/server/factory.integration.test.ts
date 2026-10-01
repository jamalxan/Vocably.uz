// Content Factory — haqiqiy MongoDB ustida, AI soxta: matn -> bo'laklar -> AI_GENERATED yozuvlar, davom ettirish,
// parallel band qilish, xatoda qayta urinish va bekor qilish.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { cancelJob, completeUpload, createJob, deleteJob, getJob, runJob, storeUploadPart } from './factoryService';

const VocabularyEntry: any = Models.VocabularyEntry;
const VocabUploadPart: any = Models.VocabUploadPart;
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
    await VocabUploadPart.deleteMany({});
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

  describe('bo‘laklab yuklash va OCR', () => {
    const upId = (s: string) => `${s}-12345678`;
    const put = (adminId: any, uploadId: string, index: number, text: string) =>
      storeUploadPart({ adminId, uploadId, index, buffer: Buffer.from(text) });

    it('TXT fayl qismlarga bo‘lib yuklanadi, yig‘ilib oddiy ish yaratiladi va qismlar o‘chiriladi', async () => {
      const id = upId('txt');
      const third = Math.ceil(TEXT.length / 3);
      for (let i = 0; i < 3; i++) await put(admin, id, i, TEXT.slice(i * third, (i + 1) * third));
      const job = await completeUpload({ adminId: admin, uploadId: id, total: 3, filename: 'book.txt' });
      expect(job).toMatchObject({ ocr: false, format: 'text', charCount: TEXT.trim().length });
      expect(job.chunks.total).toBeGreaterThanOrEqual(3);
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(0);
    });

    it('yetishmayotgan qism aniq xato beradi va qismlar saqlanib qoladi (qayta yuborish mumkin)', async () => {
      const id = upId('gap');
      await put(admin, id, 0, TEXT.slice(0, 100));
      await put(admin, id, 2, TEXT.slice(100, 200));
      await expect(completeUpload({ adminId: admin, uploadId: id, total: 3, filename: 'b.txt' })).rejects.toMatchObject({ status: 400, code: 'missing_part' });
    });

    it('noma‘lum format rad etiladi; boshqa adminning uploadId’siga yozib bo‘lmaydi', async () => {
      await expect(completeUpload({ adminId: admin, uploadId: upId('fmt'), total: 1, filename: 'x.exe' })).rejects.toMatchObject({ status: 415 });
      const other = new mongoose.Types.ObjectId();
      const id = upId('own');
      await put(admin, id, 0, 'a');
      await expect(put(other, id, 0, 'evil')).rejects.toMatchObject({ code: 'upload_id_taken' });
      // boshqa admin complete qilolmaydi ham (o'z qismlari yo'q)
      await expect(completeUpload({ adminId: other, uploadId: id, total: 1, filename: 'a.txt' })).rejects.toMatchObject({ code: 'missing_part' });
    });

    it('matn qatlami bor PDF oddiy ishga aylanadi (OCR emas)', async () => {
      const id = upId('pdftext');
      await put(admin, id, 0, '%PDF-fake');
      const extract = async () => ({ hasTextLayer: true, pageCount: 3, fullText: TEXT, pages: [] });
      const job = await completeUpload({ adminId: admin, uploadId: id, total: 1, filename: 'b.pdf', extract: extract as any });
      expect(job.ocr).toBe(false);
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(0);
    });

    it('skanerlangan PDF OCR ishiga aylanadi: bo‘lak = 3 sahifa, har chaqiruvda bitta bo‘lak, tugagach qismlar o‘chadi', async () => {
      const id = upId('scan');
      await put(admin, id, 0, '%PDF-fake-scan');
      const extract = async () => ({ hasTextLayer: false, pageCount: 7, fullText: '', pages: [] });
      const job = await completeUpload({ adminId: admin, uploadId: id, total: 1, filename: 'scan.pdf', extract: extract as any });
      expect(job).toMatchObject({ ocr: true, pages: 7, format: 'pdf' });
      expect(job.chunks.total).toBe(3); // 1–3, 4–6, 7
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(1); // OCR uchun saqlangan

      const ranges: string[] = [];
      const ocr = async (pdf: Buffer, from: number, to: number) => {
        expect(Buffer.isBuffer(pdf)).toBe(true);
        expect(pdf.toString()).toBe('%PDF-fake-scan'); // saqlangan baytlar aynan qaytadi (Binary -> Buffer)
        ranges.push(`${from}-${to}`);
        return para(['mitigate', 'sustain', 'allocate'][ranges.length - 1]).repeat(9);
      };
      let cur = await runJob(job.id, admin, { maxChunks: 5, ai: fakeAi() as any, ocr });
      expect(cur.chunks.done).toBe(1); // OCR ishida har chaqiruvda bitta bo'lak
      for (let i = 0; i < 5 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { ai: fakeAi() as any, ocr });
      expect(ranges).toEqual(['1-3', '4-6', '7-7']);
      expect(cur).toMatchObject({ status: 'done', created: 3 });
      expect((await VocabularyEntry.find().lean()).map((e: any) => e.word).sort()).toEqual(['allocate', 'mitigate', 'sustain']);
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(0); // tugagach tozalandi
    });

    it('OCR xatosi 3 martagacha qayta uriniladi, keyin shu bo‘lak failed (qolganlari davom etadi)', async () => {
      const id = upId('scanfail');
      await put(admin, id, 0, '%PDF-fake');
      const extract = async () => ({ hasTextLayer: false, pageCount: 4, fullText: '', pages: [] });
      const job = await completeUpload({ adminId: admin, uploadId: id, total: 1, filename: 's.pdf', extract: extract as any });
      let calls = 0;
      const ocr = async (_p: Buffer, from: number) => {
        calls++;
        if (from === 1) throw new Error("OCR: model sahifalarni o'qiy olmadi");
        return para('sustain').repeat(9);
      };
      let cur = job;
      for (let i = 0; i < 10 && cur.chunks.pending + cur.chunks.processing > 0; i++) cur = await runJob(job.id, admin, { ai: fakeAi() as any, ocr });
      expect(cur.chunks).toMatchObject({ failed: 1, done: 1 });
      expect(cur.errors[0].error).toContain('OCR');
      expect(calls).toBe(4); // 3 urinish (xato) + 1 muvaffaqiyatli
    });

    it('juda ko‘p sahifali yoki juda katta skaner rad etiladi, qismlar tozalanadi', async () => {
      const id = upId('huge');
      await put(admin, id, 0, '%PDF');
      const extract = async () => ({ hasTextLayer: false, pageCount: 9999, fullText: '', pages: [] });
      await expect(completeUpload({ adminId: admin, uploadId: id, total: 1, filename: 'h.pdf', extract: extract as any })).rejects.toMatchObject({ code: 'too_many_pages' });
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(0);
    });

    it('OCR ishi o‘chirilsa manba qismlari ham o‘chadi', async () => {
      const id = upId('delete');
      await put(admin, id, 0, '%PDF');
      const extract = async () => ({ hasTextLayer: false, pageCount: 2, fullText: '', pages: [] });
      const job = await completeUpload({ adminId: admin, uploadId: id, total: 1, filename: 'd.pdf', extract: extract as any });
      await deleteJob(job.id);
      expect(await VocabUploadPart.countDocuments({ uploadId: id })).toBe(0);
    });
  });

  it('juda qisqa/katta matn rad etiladi', async () => {
    await expect(createJob({ adminId: admin, format: 'text', text: 'short' })).rejects.toMatchObject({ code: 'too_short' });
    await expect(createJob({ adminId: admin, format: 'text', text: 'x '.repeat(250_000) })).rejects.toMatchObject({ code: 'too_large' });
  });
});
