// MongoDB to'liq backup skripti — FAQAT O'QIYDI, hech narsani o'chirmaydi/o'zgartirmaydi.
// Har bir collection'ni alohida JSON faylga eksport qiladi: backups/<sana>/mongodb/<collection>.json
//
// Ishlatish:
//   MONGODB_URI="mongodb+srv://..." node scripts/backup-mongo.mjs
// yoki .env faylida MONGODB_URI to'g'ri qiymat bo'lsa:
//   node -r dotenv/config scripts/backup-mongo.mjs

import { MongoClient, EJSON } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<username>")) {
  console.error("Xato: MONGODB_URI topilmadi yoki hali namuna (placeholder) qiymat turibdi.");
  console.error('Masalan: MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sinonimlar" node scripts/backup-mongo.mjs');
  process.exit(1);
}

const dateStr = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(process.cwd(), "backups", dateStr, "mongodb");

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const client = new MongoClient(uri, { readPreference: "secondaryPreferred" });
  await client.connect();
  const db = client.db(); // .env URI ichidagi default database

  const collections = await db.listCollections().toArray();
  console.log(`Topildi: ${collections.length} ta collection (baza: ${db.databaseName})`);

  let totalDocs = 0;
  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray();
    const filePath = path.join(outDir, `${name}.json`);
    await fs.writeFile(filePath, EJSON.stringify(docs, null, 2));
    console.log(`  ${name}: ${docs.length} ta hujjat -> ${filePath}`);
    totalDocs += docs.length;
  }

  await client.close();
  console.log(`\nTayyor. Jami ${totalDocs} ta hujjat backup qilindi: ${outDir}`);
}

main().catch((err) => {
  console.error("Backup xatosi:", err);
  process.exit(1);
});
