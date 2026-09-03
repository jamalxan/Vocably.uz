// Bir martalik tozalash: kod endi bildirishnoma o'qilgani zahoti uni bazadan o'chirib
// tashlaydi (src/app/api/notifications/[id]/route.js, read-all/route.js), lekin shu
// o'zgarishdan OLDIN read:true qilib "osilib qolgan" eski yozuvlar bazada qolib ketgan.
// Shularni bir martalik tozalab, ro'yxat faqat yangi/o'qilmagan bildirishnomalar bilan
// qolishini ta'minlaydi.
//
// Mustaqil skript — src/lib/models.js'ni import qilmaydi (u Next.js'ning extensionsiz
// modul aliaslariga tayanadi, plain Node ESM esa buni hal qila olmaydi), shuning uchun
// faqat shu tozalash uchun kerakli minimal schema'ni o'zi e'lon qiladi.
//
// Ishga tushirish: node --env-file=.env scripts/cleanup-read-notifications.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI sozlanmagan.");

const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    'Notification',
    new mongoose.Schema({ read: Boolean }, { strict: false, collection: 'notifications' })
  );

async function main() {
  await mongoose.connect(MONGODB_URI);

  const before = await Notification.countDocuments({ read: true });
  console.log(`O'qilgan (eski) bildirishnomalar soni: ${before}`);

  if (before === 0) {
    console.log("Tozalanadigan hech narsa yo'q.");
  } else {
    const result = await Notification.deleteMany({ read: true });
    console.log(`O'chirildi: ${result.deletedCount}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
