// One-off dev script: inserts (or replaces) ONE small sample ExamTest document
// so the new IELTS CD Exam Engine (TZ-vocably-v2.md, "IELTS CD Exam Engine
// v1.0" section) can actually be opened in a browser end-to-end — there is no
// admin content-authoring tool yet (TZ §15 is Faza 4), so without this there
// is nothing in the `examtests` collection to create an attempt against.
//
// Content is ORIGINAL (written for this script, not copied from any real
// IELTS test — TZ-vocably-v2.md old-TZ BUG-021 flagged reusing real Cambridge
// material as a copyright risk). Only 10 questions, one short passage — this
// is for exercising the Reading UI plumbing (all 6 Faza-1 question types),
// NOT a realistic full 40-question/3-passage exam, and the band table lookup
// (calibrated for 40 questions) will report a low, MEANINGLESS band no matter
// how many of these 10 you get right. Faza 3's real content pipeline replaces
// this entirely.
//
// Run manually:
//   node --env-file=.env.local scripts/seed-exam-test.mjs
//
// Self-contained (talks to MongoDB directly via the `mongodb` driver, not
// src/lib/models.js) — matches scripts/create-indexes.mjs's convention, since
// plain `node` can't resolve this app's `@/` path alias.

import { MongoClient } from 'mongodb';

const SLUG = 'demo-reading-bicycle';

const PASSAGE = {
  order: 1,
  title: 'The Evolution of the Bicycle',
  subtitle: 'Read the text and answer questions 1-10.',
  paragraphs: [
    {
      label: 'A',
      html: '<p>The bicycle was invented in the early nineteenth century as a simple two-wheeled machine without pedals, propelled by pushing the feet directly against the ground. Riders called it a &ldquo;running machine&rdquo;, and it could only be used on smooth, flat roads.</p>',
    },
    {
      label: 'B',
      html: '<p>By the 1860s, pedals had been attached directly to the front wheel, creating a faster but less stable design known as the velocipede. Because the front wheel had to be large to cover more ground with each turn of the pedals, these bicycles were difficult and sometimes dangerous to ride.</p>',
    },
    {
      label: 'C',
      html: '<p>The modern bicycle, with a chain driving the rear wheel and two wheels of equal size, appeared in the 1880s. This &ldquo;safety bicycle&rdquo; was far easier to balance and control, and it quickly became popular with both men and women across Europe and North America.</p>',
    },
  ],
  questionGroups: [
    {
      id: 'g1-tfng',
      type: 'true_false_notgiven',
      instructionHtml:
        'Do the following statements agree with the information given in the passage?<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this',
      questions: [
        {
          number: 1,
          promptHtml: 'The earliest bicycles had pedals.',
          answer: { accepted: ['FALSE'] },
          explanationHtml: 'Paragraph A: the first bicycles were "without pedals".',
          locatorParagraph: 'A',
        },
        {
          number: 2,
          promptHtml: "The velocipede's front wheel was large.",
          answer: { accepted: ['TRUE'] },
          explanationHtml: 'Paragraph B: "the front wheel had to be large".',
          locatorParagraph: 'B',
        },
      ],
    },
    {
      id: 'g2-mc',
      type: 'multiple_choice_single',
      instructionHtml: 'Choose the correct letter, A, B, C or D.',
      questions: [
        {
          number: 3,
          promptHtml: 'According to the passage, why was the velocipede difficult to ride?',
          options: [
            { key: 'A', text: 'It had no brakes' },
            { key: 'B', text: 'Its front wheel was large' },
            { key: 'C', text: 'It was too heavy' },
            { key: 'D', text: 'It had a chain' },
          ],
          answer: { accepted: ['B'] },
          explanationHtml: 'Paragraph B links the large front wheel to the bicycle being "difficult and sometimes dangerous to ride".',
          locatorParagraph: 'B',
        },
      ],
    },
    {
      id: 'g3-headings',
      type: 'matching_headings',
      instructionHtml:
        'The passage has three paragraphs, A-C. Choose the correct heading for each paragraph from the list of headings below.',
      bank: [
        { key: 'i', text: 'An early wheel without pedals' },
        { key: 'ii', text: 'A faster but unstable design' },
        { key: 'iii', text: 'A safer bicycle for everyone' },
      ],
      questions: [
        { number: 4, promptHtml: 'Paragraph A', answer: { accepted: ['i'] }, explanationHtml: 'Paragraph A describes the pedal-less "running machine".' },
        { number: 5, promptHtml: 'Paragraph B', answer: { accepted: ['ii'] }, explanationHtml: 'Paragraph B describes the fast, unstable velocipede.' },
        { number: 6, promptHtml: 'Paragraph C', answer: { accepted: ['iii'] }, explanationHtml: 'Paragraph C describes the safety bicycle.' },
      ],
    },
    {
      id: 'g4-sentence',
      type: 'sentence_completion',
      instructionHtml: 'Complete the sentence below. Write <strong>ONE WORD ONLY</strong> from the passage.',
      wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
      questions: [
        {
          number: 7,
          promptHtml: "The modern safety bicycle had two wheels of {{q7}} size.",
          answer: { accepted: ['equal'] },
          explanationHtml: 'Paragraph C: "two wheels of equal size".',
          locatorParagraph: 'C',
        },
      ],
    },
    {
      id: 'g5-short',
      type: 'short_answer',
      instructionHtml: 'Answer the question below. Write <strong>NO MORE THAN THREE WORDS</strong> from the passage.',
      wordLimit: { maxWords: 3, label: 'NO MORE THAN THREE WORDS' },
      questions: [
        {
          number: 8,
          promptHtml: 'What drives the rear wheel of the safety bicycle?',
          answer: { accepted: ['a chain', 'chain'] },
          explanationHtml: 'Paragraph C: "a chain driving the rear wheel".',
          locatorParagraph: 'C',
        },
      ],
    },
    {
      id: 'g6-summary',
      type: 'summary_completion',
      instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> from the passage for each answer.',
      wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
      stemHtml:
        '<p>Bicycles evolved in three stages: a running machine without pedals, a fast but unstable {{q9}} with a large front wheel, and finally the modern safety bicycle with a {{q10}} connecting the pedals to the rear wheel.</p>',
      questions: [
        { number: 9, answer: { accepted: ['velocipede'] }, explanationHtml: 'Paragraph B names this design "the velocipede".', locatorParagraph: 'B' },
        { number: 10, answer: { accepted: ['chain'] }, explanationHtml: 'Paragraph C: "a chain driving the rear wheel".', locatorParagraph: 'C' },
      ],
    },
  ],
};

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI sozlanmagan.');

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  try {
    // `createdBy` User modelida required — dev muhitda birinchi topilgan
    // foydalanuvchini egasi qilib qo'yamiz (haqiqiy admin oqimi hali yo'q, TZ §15).
    const user = await db.collection('users').findOne({}, { projection: { _id: 1 } });
    if (!user) throw new Error("'users' kolleksiyasida hech kim topilmadi — avval hisob yarating.");

    const doc = {
      slug: SLUG,
      title: 'Demo Reading — The Evolution of the Bicycle',
      module: 'academic',
      difficulty: 'easy',
      sections: { reading: { durationSec: 600, passages: [PASSAGE] } },
      bandTable: null,
      isPublished: true,
      createdBy: user._id,
      createdAt: new Date(),
    };

    const result = await db.collection('examtests').replaceOne({ slug: SLUG }, doc, { upsert: true });
    const testId = result.upsertedId ?? (await db.collection('examtests').findOne({ slug: SLUG }, { projection: { _id: 1 } }))._id;

    console.log(`Tayyor. Test ID: ${testId}`);
    console.log(`Sinash uchun: /app/oqish-beta?testId=${testId}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Seed qilishda xatolik:', err);
  process.exit(1);
});
