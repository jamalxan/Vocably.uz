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
/** O'qituvchi — /teacher sahifalari uchun. */
export const E2E_TEACHER_PHONE = '+998901234570';

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
      await users.deleteOne({ phone });
      await users.insertOne({ phone, name: 'E2E', password, subscriptionTier, role, timezone: 'Asia/Tashkent', createdAt: now, updatedAt: now, categories: categories() });
    }
    // Admin kutubxona testi uchun toza holat (oldingi yugurishdan qolgan yozuvlar).
    await mongoose.connection.collection('vocabularyentries').deleteMany({ normalizedWord: 'e2eword' });
  } finally {
    await mongoose.disconnect();
  }
}
