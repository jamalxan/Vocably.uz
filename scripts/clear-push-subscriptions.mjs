// VAPID kalitlari almashtirilganda eskirgan push-obunalarni bazadan tozalash skripti.
// Eski kalit juftligi bilan yaratilgan obunalar yangi VAPID_PRIVATE_KEY bilan ishlamaydi
// (brauzer push-abonement server ochiq kalitiga bog'langan) — shuning uchun ularni saqlashning
// ma'nosi yo'q, sendPushToUser() baribir 404/410 xatosi bilan o'chirib tashlagan bo'lardi.
//
// Ishlatish:
//   node -r dotenv/config scripts/clear-push-subscriptions.mjs
// yoki:
//   MONGODB_URI="mongodb+srv://..." node scripts/clear-push-subscriptions.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<username>")) {
  console.error("Xato: MONGODB_URI topilmadi yoki hali namuna (placeholder) qiymat turibdi.");
  console.error('Masalan: MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sinonimlar" node scripts/clear-push-subscriptions.mjs');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // .env URI ichidagi default database

  const collection = db.collection("pushsubscriptions"); // mongoose "PushSubscription" -> "pushsubscriptions"
  const count = await collection.countDocuments();
  console.log(`Topildi: ${count} ta eski push-obuna.`);

  if (count > 0) {
    const { deletedCount } = await collection.deleteMany({});
    console.log(`O'chirildi: ${deletedCount} ta.`);
  } else {
    console.log("O'chirish uchun hech narsa yo'q.");
  }

  await client.close();
}

main().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
