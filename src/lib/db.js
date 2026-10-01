import mongoose from 'mongoose';
// Side-effect: Request.json() NoSQL operator inyeksiyasidan tozalanadi (src/lib/safeRequest.js) — DB'ga tegadigan har bir yo'l shu modulni yuklaydi.
import './safeRequest';

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
    cached.promise = mongoose.connect(MONGODB_URI).catch(async (err) => {
      // Ba'zi Windows/provayder DNS'lari `mongodb+srv` SRV so'rovini rad etadi (querySrv ECONNREFUSED) —
      // butun sayt (chat ham) 500 beradi. Faqat shu xatoda ommaviy DNS'ga o'tib, bir marta qayta urinamiz.
      if (err?.syscall !== 'querySrv' || !MONGODB_URI.startsWith('mongodb+srv://')) throw err;
      const dns = await import('node:dns');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      return mongoose.connect(MONGODB_URI);
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
