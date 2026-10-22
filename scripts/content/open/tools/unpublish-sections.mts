// Bo'lim mashqlarini (vocably-reading-N / vocably-listening-N — 1 passage / 1 part)
// nashrdan olib tashlaydi yoki qaytaradi. Ular endi to'liq 40-savollik testlar
// (vocably-reading-full-N / vocably-listening-full-N) ichida ishlatiladi; hujjatlar
// bazada qoladi (eski urinishlar tarixi buzilmasin), faqat isPublished o'zgaradi.
//   node --env-file=<env> --import tsx scripts/content/open/tools/unpublish-sections.mts [--republish] [--dry]
import mongoose from 'mongoose';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const republish = args.includes('--republish');

const { connectToDatabase } = await import('@/lib/db');
await connectToDatabase();
const col = mongoose.connection.db!.collection('examtests');

const filter = { slug: { $regex: /^vocably-(reading|listening)-\d+$/ } };
const before = await col.countDocuments({ ...filter, isPublished: !republish });
const full = await col.countDocuments({ slug: { $regex: /^vocably-(reading|listening)-full-\d+$/ }, isPublished: true });
console.log(`Bo'lim testlari (${republish ? 'nashrdan olingan' : 'nashrda'}): ${before}; nashrdagi to'liq testlar: ${full}`);
if (!republish && full < 50) throw new Error("To'liq testlar hali nashr qilinmagan — avval ularni yuklang (load-open-tests --series=reading-full|listening-full).");
if (dry) {
  console.log('(dry) hech narsa o\'zgartirilmadi');
} else {
  const res = await col.updateMany({ ...filter, isPublished: !republish }, { $set: { isPublished: republish, updatedAt: new Date() } });
  console.log(`${res.modifiedCount} ta bo'lim testi ${republish ? 'qayta nashr qilindi' : 'nashrdan olindi'}`);
}
await mongoose.disconnect();
