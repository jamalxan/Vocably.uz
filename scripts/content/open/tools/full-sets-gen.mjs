// To'liq testlar jadvalini (full/sets.json) yaratadi/kengaytiradi: bo'lim mashqlarini
// Reading uchun uchtalab (13+13+14 savol, jami 2150-2750 so'z), Listening uchun
// to'rttalab (4×10 savol) guruhlaydi. MAVJUD to'plamlar o'zgartirilmaydi (ularning
// slug'lari nashr qilingan) — faqat hali ishlatilmagan bo'limlardan yangilari qo'shiladi.
//   node scripts/content/open/tools/full-sets-gen.mjs [--dry]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOpenTests } from '../verify.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SETS_FILE = path.join(DIR, '..', 'full', 'sets.json');
const dry = process.argv.includes('--dry');

const strip = (h) => String(h).replace(/<[^>]+>/g, ' ');
const words = (s) => strip(s).trim().split(/\s+/).filter(Boolean).length;
const DIFF = { easy: 0, medium: 1, hard: 2 };

// Deterministik aralashtirish (mulberry32) — har safar bir xil natija, lekin
// mavzular raqam tartibida emas, aralash tushadi.
function shuffled(arr, seed) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sets = existsSync(SETS_FILE) ? JSON.parse(readFileSync(SETS_FILE, 'utf8')) : { reading: [], listening: [] };
const usedR = new Set(sets.reading.flatMap((s) => s.parts));
const usedL = new Set(sets.listening.flatMap((s) => s.parts));

const all = await loadOpenTests();
const readings = all
  .filter((t) => t.series === 'reading' && !usedR.has(t.n))
  .map((t) => {
    const p = t.reading.passages[0];
    return { n: t.n, q: p.questionGroups.reduce((s, g) => s + g.questions.length, 0), w: p.paragraphs.reduce((s, x) => s + words(x.html), 0), d: DIFF[t.difficulty] ?? 1 };
  });
const listenings = all.filter((t) => t.series === 'listening' && !usedL.has(t.n)).map((t) => ({ n: t.n, d: DIFF[t.difficulty] ?? 1 }));

// Reading: 13 + 13 + 14. 14-savollik passage'lar kamroq, shuning uchun ular hisobga
// olinib, har biriga ikkita 13-savollik juftlanadi; so'z yig'indisi 2150-2750 bo'lishi shart.
const q14 = shuffled(readings.filter((r) => r.q === 14), 14);
const q13 = shuffled(readings.filter((r) => r.q === 13), 13);
let nextR = sets.reading.reduce((m, s) => Math.max(m, s.n), 0) + 1;
const addedR = [];
for (const a of q14) {
  let done = false;
  for (let i = 0; i < q13.length && !done; i++) {
    for (let j = i + 1; j < q13.length && !done; j++) {
      const sum = a.w + q13[i].w + q13[j].w;
      if (sum < 2150 || sum > 2750) continue;
      const trio = [a, q13[i], q13[j]].sort((x, y) => x.d - y.d || x.n - y.n); // oson → qiyin (IELTS tartibi)
      sets.reading.push({ n: nextR, parts: trio.map((x) => x.n), words: sum });
      addedR.push(nextR++);
      q13.splice(j, 1);
      q13.splice(i, 1);
      done = true;
    }
  }
}

// Listening: 4 part, oson → qiyin tartibda.
const pool = shuffled(listenings, 10);
let nextL = sets.listening.reduce((m, s) => Math.max(m, s.n), 0) + 1;
const addedL = [];
while (pool.length >= 4) {
  const four = pool.splice(0, 4).sort((x, y) => x.d - y.d || x.n - y.n);
  sets.listening.push({ n: nextL, parts: four.map((x) => x.n) });
  addedL.push(nextL++);
}

console.log(`Reading: +${addedR.length} to'liq test (jami ${sets.reading.length}); ishlatilmagan bo'limlar: 13-savollik ${q13.length}, 14-savollik ${q14.length - addedR.length}`);
console.log(`Listening: +${addedL.length} to'liq test (jami ${sets.listening.length}); ishlatilmagan bo'limlar: ${pool.length}`);
if (!dry) {
  writeFileSync(SETS_FILE, JSON.stringify(sets, null, 1) + '\n');
  console.log(`→ ${path.relative(process.cwd(), SETS_FILE)} yozildi`);
}
