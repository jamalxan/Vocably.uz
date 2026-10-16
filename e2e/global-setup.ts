import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { SAMPLE_WORDS } from '../src/lib/vocab/fixtures';

export const E2E_PASSWORD = 'e2e-Passw0rd!';
/** Premium tarif — barcha o'yinlar ochiq. */
export const E2E_PHONE = '+998901234567';
/** Free tarif — pullik o'yinlar qulflanganini tekshirish uchun. */
export const E2E_FREE_PHONE = '+998901234568';
/** Admin — kontent (lug'at kutubxonasi, fabrika) sahifalari uchun. */
export const E2E_ADMIN_PHONE = '+998901234569';
export const E2E_TEST_SLUG = 'e2e-published-test';
export const E2E_DRAFT_SLUG = 'e2e-draft-test';
/** O'qituvchi — /teacher sahifalari uchun. */
export const E2E_TEACHER_PHONE = '+998901234570';
/** To'rt bo'limli (reading/listening/writing/speaking) chop etilgan test — dinamik imtihon sahifalari crawl'i uchun. */
export const E2E_FULL_SLUG = 'e2e-full-test';
export const E2E_FULL_TITLE = 'E2E Full Test';
/** Dinamik sahifalar uchun belgilangan ID'lar (site-crawl.spec.ts): so'z (E2E_PHONE), suhbat (E2E_PHONE <-> E2E_FREE_PHONE), sinfxona. */
export const E2E_WORD_ID = '64e2e0000000000000000001';
export const E2E_CONVERSATION_ID = '64e2e0000000000000000002';
export const E2E_CLASSROOM_ID = '64e2e0000000000000000003';
export const E2E_USERNAME = 'e2euser';
export const E2E_FRIEND_USERNAME = 'e2efriend';

/** Test foydalanuvchilarni (so'zlar bilan) E2E bazasiga yozadi. Har safar yangidan yaratiladi. */
export default async function globalSetup() {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) throw new Error('E2E_MONGODB_URI o\'rnatilmagan (alohida test bazasi kerak, masalan mongodb://127.0.0.1:27017/vocably_e2e)');
  await mongoose.connect(uri);
  try {
    const users = mongoose.connection.collection('users');
    const password = await bcrypt.hash(E2E_PASSWORD, 8);
    const now = new Date();
    const categories = () => [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'IELTS',
        words: SAMPLE_WORDS.map((w) => ({
          _id: new mongoose.Types.ObjectId(),
          word: w.word,
          syns: w.translations,
          enrichment: {
            definitionEn: w.definitionEn,
            examples: (w.examples || []).map((e) => ({ en: e.en, uz: e.uz || '' })),
            synonymsEn: w.synonymsEn,
            antonyms: w.antonyms,
            cefr: 'B2',
            imageUrl: w.imageUrl, // rasm o'yinlari uchun (fayl yo'q — faqat UI oqimi sinaladi)
          },
        })),
      },
    ];
    for (const [phone, subscriptionTier, role] of [
      [E2E_PHONE, 'premium', 'user'],
      [E2E_FREE_PHONE, 'free', 'user'],
      [E2E_ADMIN_PHONE, 'premium', 'admin'],
      [E2E_TEACHER_PHONE, 'premium', 'teacher'],
    ]) {
      const cats = categories();
      // Chat (do'stlar, admin suhbat ko'ruvchi) uchun username + chatAccess; /app/vocabulary/word/:id uchun belgilangan so'z ID.
      const chat = phone === E2E_PHONE ? { username: E2E_USERNAME, chatAccess: true } : phone === E2E_FREE_PHONE ? { username: E2E_FRIEND_USERNAME, chatAccess: true } : {};
      if (phone === E2E_PHONE) cats[0].words[0]._id = new mongoose.Types.ObjectId(E2E_WORD_ID);
      await users.deleteOne({ phone });
      await users.insertOne({ phone, name: 'E2E', password, subscriptionTier, role, timezone: 'Asia/Tashkent', createdAt: now, updatedAt: now, categories: cats, ...chat });
    }
    const userDoc = await users.findOne({ phone: E2E_PHONE });
    const friendDoc = await users.findOne({ phone: E2E_FREE_PHONE });
    const teacherDoc = await users.findOne({ phone: E2E_TEACHER_PHONE });
    const conversations = mongoose.connection.collection('conversations');
    const pair = [userDoc!._id, friendDoc!._id].sort((a, b) => String(a).localeCompare(String(b)));
    await conversations.deleteMany({ $or: [{ _id: new mongoose.Types.ObjectId(E2E_CONVERSATION_ID) }, { pairKey: pair.map(String).join('_') }] });
    await conversations.insertOne({
      _id: new mongoose.Types.ObjectId(E2E_CONVERSATION_ID),
      participantIds: pair,
      pairKey: pair.map(String).join('_'),
      lastMessageAt: now,
      lastMessagePreview: '',
      createdAt: now,
    });
    const classrooms = mongoose.connection.collection('classrooms');
    await classrooms.deleteOne({ _id: new mongoose.Types.ObjectId(E2E_CLASSROOM_ID) });
    await classrooms.insertOne({
      _id: new mongoose.Types.ObjectId(E2E_CLASSROOM_ID),
      teacherId: teacherDoc!._id,
      name: 'E2E Classroom',
      studentIds: [userDoc!._id],
      invitedIds: [],
      createdAt: now,
    });
    // Admin kutubxona testi uchun toza holat (oldingi yugurishdan qolgan yozuvlar).
    await mongoose.connection.collection('vocabularyentries').deleteMany({ normalizedWord: 'e2eword' });

    // Imtihon testlari: bitta CHOP ETILGAN (Reading + Writing) va bitta qoralama (isPublished: false) — kontent original practice-test-1.
    const { default: content } = await import(pathToFileURL(path.resolve('scripts/content/practice-test-1.mjs')).href);
    const { buildWritingSection } = await import(pathToFileURL(path.resolve('scripts/seed-practice-tests.mjs')).href);
    const admin = await users.findOne({ phone: E2E_ADMIN_PHONE });
    const sections = { reading: content.reading, writing: buildWritingSection(content) };
    const examtests = mongoose.connection.collection('examtests');
    await examtests.deleteMany({ slug: { $in: [E2E_TEST_SLUG, E2E_DRAFT_SLUG] } });
    for (const [slug, title, isPublished] of [
      [E2E_TEST_SLUG, 'E2E Published Test', true],
      [E2E_DRAFT_SLUG, 'E2E Draft Test', false],
    ] as const) {
      await examtests.insertOne({ slug, title, module: 'academic', difficulty: 'medium', sections, bandTable: null, isPublished, createdBy: admin!._id, createdAt: now });
    }
    // To'rt bo'limli test: listening audio metadata (scripts/tts/out) va speaking seed'i repoda bor.
    const { buildListeningSection } = await import(pathToFileURL(path.resolve('scripts/seed-practice-tests.mjs')).href);
    const readJson = (p: string) => JSON.parse(fs.readFileSync(path.resolve(p), 'utf-8'));
    const speakingSeed = readJson('scripts/speaking-content-seed.json');
    const fullSections = {
      ...sections,
      listening: buildListeningSection(content, readJson('scripts/tts/out/durations.json'), readJson('scripts/tts/out/parts.json')),
      speaking: speakingSeed[content.slug] || Object.values(speakingSeed)[0],
    };
    await examtests.deleteMany({ slug: E2E_FULL_SLUG });
    await examtests.insertOne({ slug: E2E_FULL_SLUG, title: E2E_FULL_TITLE, module: 'academic', difficulty: 'medium', sections: fullSections, bandTable: null, isPublished: true, createdBy: admin!._id, createdAt: now });
  } finally {
    await mongoose.disconnect();
  }
}
