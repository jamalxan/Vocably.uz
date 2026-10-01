import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { SAMPLE_WORDS } from '../src/lib/vocab/fixtures';

export const E2E_PASSWORD = 'e2e-Passw0rd!';
/** Premium tarif — barcha o'yinlar ochiq. */
export const E2E_PHONE = '+998901234567';
/** Free tarif — pullik o'yinlar qulflanganini tekshirish uchun. */
export const E2E_FREE_PHONE = '+998901234568';

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
    for (const [phone, subscriptionTier] of [
      [E2E_PHONE, 'premium'],
      [E2E_FREE_PHONE, 'free'],
    ]) {
      await users.deleteOne({ phone });
      await users.insertOne({ phone, name: 'E2E', password, subscriptionTier, timezone: 'Asia/Tashkent', createdAt: now, updatedAt: now, categories: categories() });
    }
  } finally {
    await mongoose.disconnect();
  }
}
