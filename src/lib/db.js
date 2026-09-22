import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// AI-01 — `MONGODB_URI` ATAYLAB modul darajasida (import paytida) EMAS,
// funksiya ichida O'QILADI. Sabab: Next.js'da farq qilmasdi (u ilova kodi
// import qilinishidan OLDIN env'ni yuklaydi), lekin worker/index.ts o'zi
// `dotenv.config()` chaqiradi — ES module import'lari HAR DOIM chaqiruvchi
// modulning o'z tanasi (shu jumladan dotenv.config() chaqiruvlari)dan OLDIN
// baholanadi, import qatorining fayldagi o'rnidan qat'i nazar. Shuning
// uchun modul darajasidagi `const MONGODB_URI = process.env.MONGODB_URI`
// dotenv hali ishlamagan paytda `undefined`ni "muzlatib" qo'yardi — qo'lda
// sinovda ANIQLANDI (worker/index.ts ishga tushirilganda "MONGODB_URI
// sozlanmagan" xatosi, garchi .env'da haqiqatan ham bor bo'lsa ham).
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI sozlanmagan. .env.local faylida MONGODB_URI ni to'ldiring.");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
