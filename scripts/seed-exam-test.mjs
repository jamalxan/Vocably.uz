// One-off dev script: inserts (or replaces) ONE small sample ExamTest document
// so the new IELTS CD Exam Engine (TZ-vocably-v2.md, "IELTS CD Exam Engine
// v1.0" section) can actually be opened in a browser end-to-end — there is no
// admin content-authoring tool yet (TZ §15 is Faza 4), so without this there
// is nothing in the `examtests` collection to create an attempt against.
//
// Content is ORIGINAL (written for this script, not copied from any real
// IELTS test — TZ-vocably-v2.md old-TZ BUG-021 flagged reusing real Cambridge
// material as a copyright risk). One small Reading passage (10 questions,
// all 6 Faza-1 types), one small Writing section (2 tasks), one small
// Listening section (2 parts, placeholder sine-tone audio — see the comment
// above generateSineWav) — NOT a realistic 40-question/3-passage/4-part exam,
// and the band table lookups (calibrated for 40 questions) will report a
// low, MEANINGLESS band no matter how many questions you get right. Faza 3's
// real content pipeline replaces this entirely.
//
// Run manually:
//   node --env-file=.env.local scripts/seed-exam-test.mjs
//
// Self-contained (talks to MongoDB directly via the `mongodb` driver, not
// src/lib/models.js) — matches scripts/create-indexes.mjs's convention, since
// plain `node` can't resolve this app's `@/` path alias.

import { MongoClient } from 'mongodb';
import { Readable } from 'node:stream';

const SLUG = 'demo-reading-bicycle';

// TZ-vocably-v2.md §23 open question #1 answer (MongoDB/GridFS, no external
// Blob/S3/R2) + Faza 2 item 10 (AudioEngine) — there is no TTS/ffmpeg
// synthesis pipeline yet (that's a separate, much larger piece of work the
// old TZ already deferred), so this generates a PLAIN SINE TONE as a stand-in
// "audio file" purely to exercise AudioEngine's mechanics (play-once,
// position tracking, part auto-advance) end to end. It is NOT listening
// content — nobody could answer these demo questions by ear; they exist only
// to prove the player works.
function generateSineWav({ seconds, freq, sampleRate = 8000 }) {
  const numSamples = Math.round(seconds * sampleRate);
  const dataSize = numSamples * 2; // 16-bit mono PCM
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Boshi/oxirida qisqa fade — tovushning "click" bilan kesilib
    // qolmasligi uchun (faqat eshitish qulayligi, funksional emas).
    const fadeSec = 0.05;
    const fade = Math.min(1, t / fadeSec, (seconds - t) / fadeSec);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.25 * fade * 32767;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer;
}

async function uploadAudio(db, buffer, filename) {
  const { GridFSBucket } = await import('mongodb');
  const bucket = new GridFSBucket(db, { bucketName: 'examAudio' });
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType: 'audio/wav' });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(String(uploadStream.id)));
    Readable.from(buffer).pipe(uploadStream);
  });
}

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

    // Faza 2 item 10 (AudioEngine) sinovi uchun — ikkita qisqa sinus-ton,
    // §7.1 dagi "part tugagach keyingisiga avtomatik o'tish" mexanizmini
    // sinash uchun ikkita alohida part sifatida yetarli.
    const part1AudioId = await uploadAudio(db, generateSineWav({ seconds: 6, freq: 440 }), 'demo-part1.wav');
    const part2AudioId = await uploadAudio(db, generateSineWav({ seconds: 6, freq: 660 }), 'demo-part2.wav');

    const doc = {
      slug: SLUG,
      title: 'Demo — The Evolution of the Bicycle',
      module: 'academic',
      difficulty: 'easy',
      sections: {
        reading: { durationSec: 600, passages: [PASSAGE] },
        // Faza 2 item 10 sinovi — audio ATAYLAB haqiqiy nutq emas (yuqoridagi
        // izohga q.), shuning uchun savollar ham "eshitib javob berish" emas,
        // faqat pleer mexanizmini (part almashinuvi, pozitsiya saqlash)
        // sinash uchun.
        listening: {
          durationSec: 900,
          checkTimeSec: 120,
          parts: [
            {
              order: 1,
              audioUrl: `/api/exam/audio/${part1AudioId}`,
              durationSec: 6,
              contextText: '(Demo audio — 440Hz ton, haqiqiy nutq emas)',
              gapAfterSec: 5,
              questionGroups: [
                {
                  id: 'l1-form',
                  type: 'form_completion',
                  instructionHtml: 'Complete the form below. Write <strong>ONE WORD ONLY</strong>.',
                  wordLimit: { maxWords: 1, label: 'ONE WORD ONLY' },
                  stemHtml: '<p>Name: {{q1}}<br/>City: {{q2}}</p>',
                  questions: [
                    { number: 1, answer: { accepted: ['demo'] }, explanationHtml: 'Demo audio uchun namunaviy javob.' },
                    { number: 2, answer: { accepted: ['tashkent'] }, explanationHtml: 'Demo audio uchun namunaviy javob.' },
                  ],
                },
              ],
            },
            {
              order: 2,
              audioUrl: `/api/exam/audio/${part2AudioId}`,
              durationSec: 6,
              contextText: '(Demo audio — 660Hz ton, haqiqiy nutq emas)',
              questionGroups: [
                {
                  id: 'l2-mc',
                  type: 'multiple_choice_single',
                  instructionHtml: 'Choose the correct letter, A, B or C.',
                  questions: [
                    {
                      number: 3,
                      promptHtml: '(Demo savol — istalgan javobni tanlang)',
                      options: [
                        { key: 'A', text: 'Variant A' },
                        { key: 'B', text: 'Variant B' },
                        { key: 'C', text: 'Variant C' },
                      ],
                      answer: { accepted: ['A'] },
                      explanationHtml: 'Demo audio uchun namunaviy javob.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Faza 2 item 12 (WritingSection) sinovi uchun — original, kichik
        // topshiriqlar. Real IELTS band jadvali AI grader hali yo'q (Faza 2
        // item 13) shuning uchun `result.writing` submit'dan keyin ham `null`
        // qoladi — bu ATAYLAB shunday (attemptServer.ts).
        writing: {
          durationSec: 600,
          tasks: [
            {
              order: 1,
              minWords: 50,
              recommendedMin: 5,
              promptHtml:
                '<p>The chart below shows how bicycle commuting in one city changed between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>',
            },
            {
              order: 2,
              minWords: 80,
              recommendedMin: 10,
              promptHtml:
                '<p>Some people think cities should build more bicycle lanes, while others believe the money should be spent on public transport instead.</p><p>Discuss both views and give your own opinion.</p>',
            },
          ],
        },
      },
      bandTable: null,
      isPublished: true,
      createdBy: user._id,
      createdAt: new Date(),
    };

    const result = await db.collection('examtests').replaceOne({ slug: SLUG }, doc, { upsert: true });
    const testId = result.upsertedId ?? (await db.collection('examtests').findOne({ slug: SLUG }, { projection: { _id: 1 } }))._id;

    console.log(`Tayyor. Test ID: ${testId}`);
    console.log(`Reading sinovi: /app/oqish-beta?testId=${testId}`);
    console.log(`Writing sinovi: /app/yozish-beta?testId=${testId}`);
    console.log(`Listening sinovi: /app/tinglash-beta?testId=${testId}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Seed qilishda xatolik:', err);
  process.exit(1);
});
