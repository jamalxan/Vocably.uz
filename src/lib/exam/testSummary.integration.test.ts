// Haqiqiy MongoDB: proyeksiya og'ir maydonlarni olib kelmaydi, sonlar to'g'ri; javob kaliti hech qachon chiqmaydi.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { TEST_SUMMARY_SELECT, summarizeTest } from './testSummary';

const ExamTest: any = Models.ExamTest;
const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;

const q = (n: number) => ({ number: n, type: 'multiple_choice', promptHtml: 'p'.repeat(200), answer: 'SECRET-ANSWER', options: ['a', 'b'] });

describeDb('test summary (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    await ExamTest.create({
      slug: 't1',
      title: 'T1',
      module: 'academic',
      isPublished: true,
      createdBy: new mongoose.Types.ObjectId(),
      sections: {
        listening: { durationSec: 1800, parts: [{ audioUrl: 'x', transcript: 'T'.repeat(5000), questionGroups: [{ questions: [q(1), q(2)] }, { questions: [q(3)] }] }] },
        reading: { durationSec: 3600, passages: [{ text: 'R'.repeat(9000), questionGroups: [{ questions: [q(4), q(5), q(6), q(7)] }] }] },
        writing: { durationSec: 3600, tasks: [{ order: 1, promptHtml: 'w' }, { order: 2, promptHtml: 'w' }] },
        speaking: { durationSec: 840 },
      },
    });
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });

  it('proyeksiya: faqat kerakli maydonlar keladi (matn, transkripsiya, javob kaliti yo‘q), sonlar to‘g‘ri', async () => {
    const [t] = await ExamTest.find({ isPublished: true }).select(TEST_SUMMARY_SELECT).lean();
    const json = JSON.stringify(t);
    expect(json).not.toContain('SECRET-ANSWER');
    expect(json).not.toContain('RRRRR');
    expect(json).not.toContain('TTTTT');
    expect(json.length).toBeLessThan(1500); // to'liq hujjat ~20 KB
    expect(summarizeTest(t)).toEqual({
      id: String(t._id),
      title: 'T1',
      module: 'academic',
      sections: {
        listening: { durationSec: 1800, questionCount: 3 },
        reading: { durationSec: 3600, questionCount: 4 },
        writing: { durationSec: 3600, taskCount: 2 },
        speaking: { durationSec: 840 },
      },
    });
  });

  it('bo‘lim yo‘q bo‘lsa xulosada ham yo‘q', () => {
    expect(summarizeTest({ _id: 'x', title: 'only reading', module: 'general', sections: { reading: { durationSec: 60, passages: [] } } })).toEqual({
      id: 'x',
      title: 'only reading',
      module: 'general',
      sections: { reading: { durationSec: 60, questionCount: 0 } },
    });
  });
});
