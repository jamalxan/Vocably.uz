// Writing seriyasini (scripts/content/open/writing/writing-N.mjs, generator: tools/writing-gen.mjs)
// bazaga yuklaydi. Task 1 ma'lumotlari — Our World in Data (CC BY 4.0), Task 2 — Vocably mavzulari.
// Yuklashdan oldin har test tekshiriladi (xato bo'lsa YUKLANMAYDI):
//   1. har qiymat OWID CSV'sidagi asl qiymat bilan (kasr xonalarigacha) mos
//   2. prompt: barcha mamlakatlar/yillar nomi, sarlavha, manba eslatmasi; Task 2 so'z limitlari
//   3. grafik haqiqiy <svg> ga render bo'ladi (chartToImage), qiymatlar NaN emas
//   4. contentValidator.ts#validateTest — blocking xato yo'q
//   node --env-file=.env --import tsx scripts/load-writing-tests.mts [--dry] [--draft] [--only=1,2]
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const draft = args.includes('--draft');
const only = ((args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean).map(Number);

const DIR = path.join(process.cwd(), 'scripts', 'content', 'open', 'writing');
const { owidTable, DS } = await import('./content/open/tools/writing-gen.mjs');
const { chartToImage } = await import('./seed-practice-tests.mjs');
const { validateTest } = await import('@/lib/exam/contentValidator');

const files = fs.readdirSync(DIR).map((f) => /^writing-(\d+)\.mjs$/.exec(f)).filter(Boolean)
  .map((m) => ({ n: Number(m[1]), f: m[0] })).sort((a, b) => a.n - b.n).filter((x) => !only.length || only.includes(x.n));

let mongoose: any = null, db: any = null, adminId: any = null;
if (!dry) {
  const { connectToDatabase } = await import('@/lib/db');
  mongoose = (await import('mongoose')).default;
  await connectToDatabase();
  db = mongoose.connection.db;
  adminId = (await db.collection('users').findOne({ role: 'admin' }, { projection: { _id: 1 } }))?._id;
  if (!adminId) throw new Error('admin foydalanuvchi topilmadi');
}

const words = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
let failed = 0;

for (const { n, f } of files) {
  let slug = `writing-${n}`;
  try {
    const t = (await import(pathToFileURL(path.join(DIR, f)).href)).default;
    slug = t.slug;
    if (t.slug !== `vocably-writing-${n}`) throw new Error('slug fayl nomiga mos emas');
    const errs: string[] = [];
    const ds = DS.find((d: any) => d.d === t.dataset);
    if (!ds) throw new Error(`noma'lum dataset ${t.dataset}`);

    // 1. CSV bilan solishtirish
    const table = await owidTable(t.dataset);
    const { chart, source, ...t1 } = t.writing.task1;
    for (const s of chart.series) {
      chart.categories.forEach((y: string, i: number) => {
        const raw = table.map.get(s.name)?.get(Number(y));
        if (raw === undefined) return errs.push(`${s.name} ${y}: CSV'da yo'q`);
        if (!Number.isFinite(s.data[i]) || s.data[i] !== Number(raw.toFixed(ds.dp))) errs.push(`${s.name} ${y}: ${s.data[i]} ≠ ${raw.toFixed(ds.dp)}`);
      });
    }
    // 2. matn
    const p1 = t1.promptHtml as string;
    for (const s of chart.series) if (!p1.includes(s.name.replace(/^United /, (m: string) => m))) errs.push(`prompt'da ${s.name} yo'q`);
    const ys = chart.categories;
    if (!p1.includes(`between ${ys[0]} and ${ys[ys.length - 1]}`)) errs.push('prompt yillari grafikka mos emas');
    if (!p1.includes('Our World in Data') || !p1.includes('CC BY 4.0')) errs.push('manba eslatmasi yo\'q');
    if (chart.series.length < 3 || ys.length < 4) errs.push('grafik juda kichik');
    const p2 = t.writing.task2.promptHtml as string;
    if (words(p2) < 18) errs.push('Task 2 prompt juda qisqa');
    if (t1.minWords !== 150 || t.writing.task2.minWords !== 250) errs.push('minWords 150/250 emas');
    // 3. render
    const img = chartToImage(chart);
    if (!img.imageUrl.startsWith('data:image/svg+xml;base64,') || img.imageUrl.length < 2000) errs.push('grafik render bo\'lmadi');
    if (errs.length) throw new Error(errs.join('; '));

    const doc: any = {
      slug: t.slug, title: t.title, module: 'academic', difficulty: t.difficulty,
      sections: { writing: { durationSec: t.writing.durationSec, tasks: [{ ...t1, ...img, source }, t.writing.task2] } },
      bandTable: null, isPublished: !draft, isMockEligible: false,
      rights: {
        sourceType: 'licensed', publisher: 'Our World in Data', licence: 'CC BY 4.0 (Writing Task 1 data)',
        licenceNote: `Writing Task 1 data: ${source.url} (CC BY 4.0). Task 2 prompts written for Vocably.`,
        rightsVerifiedBy: adminId, rightsVerifiedAt: new Date(), publishScope: 'public',
      },
    };
    // 4. validator
    const issues = validateTest(doc).filter((i: any) => i.severity === 'error');
    if (issues.length) throw new Error(`validateTest: ${issues.map((i: any) => `${i.path} ${i.message}`).join('; ')}`);
    if (dry) { console.log(`✓ ${t.slug} (dry) — ${t.dataset} ${chart.chartType}, ${chart.series.length}×${ys.length}`); continue; }

    const prev = await db.collection('examtests').findOne({ slug: t.slug }, { projection: { _id: 1, createdAt: 1, createdBy: 1 } });
    await db.collection('examtests').replaceOne(
      { slug: t.slug },
      { ...doc, createdBy: prev?.createdBy || adminId, createdAt: prev?.createdAt || new Date(), updatedAt: new Date() },
      { upsert: true },
    );
    const saved = await db.collection('examtests').findOne({ slug: t.slug });
    if (saved.sections.writing.tasks.length !== 2 || !saved.sections.writing.tasks[0].imageUrl) throw new Error('saqlangan hujjat noto\'g\'ri');
    console.log(`✓ ${t.slug} — ${prev ? 'yangilandi' : 'yaratildi'}, published=${doc.isPublished}`);
  } catch (e: any) {
    failed++;
    console.log(`✗ ${slug}: ${e.message}`);
  }
}

if (mongoose) await mongoose.disconnect();
console.log(failed ? `\n${failed} ta test xato bilan o'tkazib yuborildi.` : `\nBarcha ${files.length} ta test muvaffaqiyatli.`);
process.exit(failed ? 1 : 0);
