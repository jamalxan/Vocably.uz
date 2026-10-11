// "Vocably Open Test"larni (scripts/content/open/open-test-N.mjs — ochiq litsenziyali
// manbalardan: Wikipedia CC BY-SA, VOA public domain, Our World in Data CC BY)
// bazaga yuklaydi. Har bosqich tekshiriladi, birorta xato bo'lsa test YUKLANMAYDI:
//   1. verify.mjs — raqamlash, javob formati, so'z limiti, javob/iqtibos manbada borligi
//   2. scoring.ts#isCorrect — har bir kalit javob haqiqiy baholashda TO'G'RI deb topiladimi
//   3. audio — VOA mp3 yuklab olinadi, 40 kbps mono'ga siqiladi, ffmpeg bilan
//      to'liq dekodlanadi (xatosiz), davomiyligi asl fayl bilan solishtiriladi
//   4. GridFS — yuklangan fayl qayta o'qilib sha256 solishtiriladi (bir xil fayl
//      ikkinchi marta yuklanmaydi — metadata.sha256 bo'yicha qayta ishlatiladi)
//   5. contentValidator.ts#validateTest — blocking xato bo'lmasligi kerak
//   node --env-file=.env --import tsx scripts/load-open-tests.mts [--only=1,2] [--dry] [--draft]
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const draft = args.includes('--draft');
const only = ((args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean).map(Number);
const CACHE = path.join(process.cwd(), '.local-scratch', 'open-audio');
fs.mkdirSync(CACHE, { recursive: true });

const { loadOpenTests, verifyOpenTest, norm } = await import('./content/open/verify.mjs');
const { SPEAKING } = await import('./content/open/speaking.mjs');
const { chartToImage, computeMockEligible } = await import('./seed-practice-tests.mjs');
const { isCorrect, isSetCorrect } = await import('@/lib/exam/scoring');
const { validateTest } = await import('@/lib/exam/contentValidator');

const sha256 = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');
const probe = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

async function prepareAudio(key: string, url: string) {
  const orig = path.join(CACHE, `${key}.orig.mp3`);
  const out = path.join(CACHE, `${key}.mp3`);
  if (!fs.existsSync(orig) || fs.statSync(orig).size < 50_000) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${key}: audio yuklab olinmadi (${res.status})`);
    fs.writeFileSync(orig, Buffer.from(await res.arrayBuffer()));
  }
  if (!fs.existsSync(out)) {
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', orig, '-ac', '1', '-ar', '22050', '-b:a', '40k', '-map_metadata', '-1', out]);
  }
  // To'liq dekodlash — buzilgan freym bo'lsa ffmpeg stderr'ga yozadi.
  const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', out, '-f', 'null', '-'], { encoding: 'utf8' });
  if (dec.status !== 0 || dec.stderr.trim()) throw new Error(`${key}: dekodlashda xato: ${dec.stderr.trim().slice(0, 300)}`);
  const dOrig = probe(orig), dOut = probe(out);
  if (!(dOut > 60) || Math.abs(dOrig - dOut) > 1.5) throw new Error(`${key}: davomiylik shubhali (asl ${dOrig}s, siqilgan ${dOut}s)`);
  return { file: out, durationSec: Math.round(dOut), buf: fs.readFileSync(out) };
}

// 6. ASR — siqilgan audio Whisper (Groq) bilan matnga o'giriladi: (a) audio veb-sahifadagi
// transkriptga mosligi (so'zlar qamrovi), (b) har bir gap-savol javobi audioda HAQIQATAN
// aytilgani. Natija keshlanadi (.asr.json), qayta ishga tushirishda API chaqirilmaydi.
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];
ORDINALS[30] = 'thirtieth';
function numWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numWords(n % 100)}` : ''}`;
  return `${numWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numWords(n % 1000)}` : ''}`;
}
function spokenForms(a: string): string[] {
  const forms = [a];
  const n = Number(a.replace(/,/g, ''));
  if (/^[\d,]+$/.test(a) && Number.isFinite(n)) {
    forms.push(String(n), n.toLocaleString('en-US'), numWords(n), numWords(n).replace(/-/g, ' '));
    // Tartib sonlar: "July 4" audioda "July fourth"/"4th" bo'lib aytiladi.
    const sfx = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th';
    forms.push(`${n}${sfx}`, `${n}s`); // tartib son va o'n yillik ("1990s")
    if (n >= 1 && n <= 31) forms.push(ORDINALS[n] || `${TENS[Math.floor(n / 10)]} ${ORDINALS[n % 10]}`);
    if (n >= 1100 && n < 2100) forms.push(`${numWords(Math.floor(n / 100))} ${n % 100 < 10 ? `oh ${numWords(n % 100)}` : numWords(n % 100)}`.replace(/-/g, ' '));
  } else if (ONES.includes(a.toLowerCase())) forms.push(String(ONES.indexOf(a.toLowerCase())));
  return forms.filter((f) => f.trim());
}
async function groqAsr(file: string, format: 'json' | 'verbose_json') {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY yo'q — audio ASR tekshiruvi ishlamaydi");
  for (let attempt = 1; ; attempt++) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/mpeg' }), path.basename(file));
    form.append('model', 'whisper-large-v3');
    form.append('language', 'en');
    form.append('response_format', format);
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    if (res.ok) return res.json();
    const body = await res.text();
    if (attempt >= 6 || ![429, 500, 502, 503].includes(res.status)) throw new Error(`ASR xatosi ${res.status}: ${body.slice(0, 200)}`);
    // Groq bepul tarifi soatiga 7200 s audio — javobdagi "try again in 12m3.5s" kutiladi.
    const m = /try again in (?:(\d+)m)?([\d.]+)s/.exec(body);
    const waitMs = m ? (Number(m[1] || 0) * 60 + Number(m[2])) * 1000 + 5_000 : 20_000 * attempt;
    console.log(`   … ASR limit, ${Math.round(waitMs / 1000)} s kutilmoqda`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

// To'liq faylning ASR'i ba'zan raqam yoki so'zni tushirib qoldiradi (masalan "2,400" -> "2").
// Shuning uchun tekshiruv muvaffaqiyatsiz bo'lsa, ibora joylashgan segment topiladi, o'sha
// bo'lak (+-2 s) alohida kesilib QAYTA tanilanadi va qaror shu aniqroq natija bo'yicha qabul qilinadi.
async function asrCheck(key: string, file: string, part: any, norm: (s: string) => string): Promise<string[]> {
  const cache = path.join(CACHE, `${key}.asr.json`);
  if (!fs.existsSync(cache)) fs.writeFileSync(cache, JSON.stringify(await groqAsr(file, 'verbose_json')));
  const full = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const segs: { start: number; end: number; text: string }[] = full.segments || [];
  const asr = norm(full.text);
  const asrSet = new Set(asr.trim().split(' '));
  const errs: string[] = [];

  const clipText = async (probeText: string): Promise<string> => {
    // Faqat mazmunli so'zlar (yordamchi so'zlarsiz) bo'yicha baholanadi; raqamlar ikki
    // baravar og'irlikka ega — qisqa iqtibosda "the" kabi so'zlar noto'g'ri segmentni tanlatmasin.
    const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'is', 'was', 'it', 'that', 'this', 'with', 'as', 'by', 'be', 'are', 'from', 'he', 'she', 'they', 'his', 'her', 'their', 'you', 'we', 'i']);
    const pw = new Set(norm(probeText).trim().split(' ').filter((w) => w && !STOP.has(w)));
    let best = -1, bi = 0;
    for (let i = 0; i < segs.length; i++) {
      const win = new Set(norm(segs.slice(Math.max(0, i - 1), i + 2).map((s) => s.text).join(' ')).trim().split(' '));
      let score = 0;
      for (const w of pw) if (win.has(w)) score += /\d/.test(w) ? 2 : 1;
      if (score > best) { best = score; bi = i; }
    }
    if (!segs.length) return '';
    const from = Math.max(0, segs[Math.max(0, bi - 1)].start - 2), to = segs[Math.min(segs.length - 1, bi + 1)].end + 2;
    const cf = path.join(CACHE, `${key}.clip-${Math.round(from)}.txt`);
    if (!fs.existsSync(cf)) {
      const clip = path.join(CACHE, `${key}.clip.mp3`);
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(from), '-to', String(to), '-i', file, clip]);
      fs.writeFileSync(cf, (await groqAsr(clip, 'json')).text || '');
    }
    return norm(fs.readFileSync(cf, 'utf8'));
  };
  // test(text) — matnda kerakli narsa eshitildimi; avval to'liq ASR, keyin aniq bo'lak.
  const heard = async (probeText: string, test: (t: string, set: Set<string>) => boolean) => {
    if (test(asr, asrSet)) return true;
    const c = await clipText(probeText);
    return test(c, new Set(c.trim().split(' ')));
  };

  const tw = norm(part.transcript).trim().split(' ');
  const coverage = tw.filter((w) => asrSet.has(w)).length / tw.length;
  if (coverage < 0.85) errs.push(`part ${part.order}: audio transkriptga mos emas (so'z qamrovi ${(coverage * 100).toFixed(0)}%)`);

  // Har savol izohidagi dalil iqtibosi audioda ham bo'lishi kerak: so'zlarining kamida
  // 80%i eshitilgan va undagi har bir RAQAM audioda (raqam yoki so'z shaklida) aytilgan.
  for (const g of part.questionGroups) for (const q of g.questions) {
    for (const m of String(q.explanationHtml).matchAll(/"([^"]{4,})"/g)) {
      const fw = norm(m[1]).trim().split(' ').filter(Boolean);
      if (!(await heard(m[1], (_t, set) => fw.filter((w) => set.has(w)).length / fw.length >= 0.8))) errs.push(`part ${part.order} Q${q.number}: dalil audioda eshitilmadi: "${m[1]}"`);
      for (const num of m[1].match(/\d[\d,]*/g) || []) {
        if (!(await heard(m[1], (t) => spokenForms(num).some((f) => t.includes(norm(f)))))) errs.push(`part ${part.order} Q${q.number}: dalildagi raqam ${num} audioda eshitilmadi`);
      }
    }
    if (g.wordLimit) {
      const probe = String(q.explanationHtml);
      const ok = await heard(probe, (t) => q.answer.accepted.some((a: string) => spokenForms(a).some((f) => t.includes(norm(f)))));
      if (!ok) errs.push(`part ${part.order} Q${q.number}: javob (${q.answer.accepted.join(' | ')}) audioda eshitilmadi`);
    }
  }
  return errs;
}

function checkScoring(t: any): string[] {
  const errs: string[] = [];
  const all = [...t.reading.passages, ...t.listening.parts];
  for (const c of all) for (const g of c.questionGroups) for (const q of g.questions) {
    const ok = g.type === 'multiple_choice_multi'
      ? isSetCorrect(q.answer.accepted, q.answer)
      : q.answer.accepted.every((a: string) => isCorrect(a, q.answer, g.wordLimit));
    if (!ok) errs.push(`${t.slug} ${g.id} Q${q.number}: kalit javob baholashda to'g'ri deb topilmadi`);
  }
  return errs;
}

const tests = (await loadOpenTests()).filter((t: any) => !only.length || only.includes(Number(t.slug.split('-').pop())));
let failed = 0;

let db: any = null, bucket: any = null, mongoose: any = null, adminId: any = null;
if (!dry) {
  const { connectToDatabase } = await import('@/lib/db');
  mongoose = (await import('mongoose')).default;
  await connectToDatabase();
  db = mongoose.connection.db;
  bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'examAudio' });
  adminId = (await db.collection('users').findOne({ role: 'admin' }, { projection: { _id: 1 } }))?._id;
  if (!adminId) throw new Error('admin foydalanuvchi topilmadi');
}

async function uploadVerified(buf: Buffer, filename: string, meta: any): Promise<string> {
  const hash = sha256(buf);
  const existing = await db.collection('examAudio.files').findOne({ 'metadata.sha256': hash });
  if (existing) return String(existing._id);
  const id: any = await new Promise((resolve, reject) => {
    const up = bucket.openUploadStream(filename, { contentType: 'audio/mpeg', metadata: { ...meta, sha256: hash } });
    up.on('error', reject).on('finish', () => resolve(up.id));
    up.end(buf);
  });
  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => bucket.openDownloadStream(id).on('data', (c: Buffer) => chunks.push(c)).on('error', reject).on('end', resolve));
  if (sha256(Buffer.concat(chunks)) !== hash) throw new Error(`${filename}: GridFS'dan qayta o'qilgan fayl mos emas`);
  return String(id);
}

for (const t of tests) {
  const errs = [...verifyOpenTest(t), ...checkScoring(t)];
  if (errs.length) { failed++; console.log(`✗ ${t.slug}`); errs.forEach((e) => console.log('   ', e)); continue; }

  try {
    const parts = [];
    for (const p of t.listening.parts) {
      const a = await prepareAudio(p.source.key, p.source.mp3);
      const asrErrs = await asrCheck(p.source.key, a.file, p, norm);
      if (asrErrs.length) throw new Error(`ASR tekshiruvi:\n    ${asrErrs.join('\n    ')}`);
      const audioUrl = dry ? `DRY:${p.source.key}` : `/api/exam/audio/${await uploadVerified(a.buf, `${p.source.key}.mp3`, { source: p.source.url, licence: p.source.licence })}`;
      parts.push({ order: p.order, audioUrl, durationSec: a.durationSec, transcript: p.transcript, contextText: p.contextText, gapAfterSec: p.gapAfterSec, questionGroups: p.questionGroups, source: p.source });
    }
    const { chart, source: chartSource, ...task1Rest } = t.writing.task1;
    const sections = {
      reading: t.reading,
      listening: { durationSec: parts.reduce((s, p) => s + p.durationSec, 0) + t.listening.checkTimeSec, checkTimeSec: t.listening.checkTimeSec, parts },
      writing: { durationSec: t.writing.durationSec, tasks: [{ ...task1Rest, ...chartToImage(chart), source: chartSource }, t.writing.task2] },
      ...(SPEAKING[Number(t.slug.split('-').pop())] ? { speaking: SPEAKING[Number(t.slug.split('-').pop())] } : {}),
    };
    const sourcesNote = [
      ...t.reading.passages.map((p: any) => `Reading P${p.order}: Wikipedia "${p.source.article}" ${p.source.url} (CC BY-SA 4.0, adapted)`),
      ...parts.map((p: any) => `Listening P${p.order}: VOA Learning English "${p.source.title}" ${p.source.url} (public domain; ${p.source.credit})`),
      `Writing T1 data: ${chartSource.url} (CC BY 4.0)`,
    ].join('\n');
    const doc: any = {
      slug: t.slug, title: t.title, module: 'academic', difficulty: t.difficulty, sections, bandTable: null,
      isPublished: !draft,
      rights: {
        sourceType: 'licensed',
        publisher: 'Wikipedia contributors; VOA Learning English; Our World in Data',
        licence: 'CC BY-SA 4.0 (Reading texts); Public domain (Listening audio/transcripts); CC BY 4.0 (Writing Task 1 data)',
        licenceNote: `Questions and answer keys written for Vocably. Reading texts adapted from Wikipedia and shared under CC BY-SA 4.0.\n${sourcesNote}`,
        rightsVerifiedBy: adminId, rightsVerifiedAt: new Date(), publishScope: 'public',
      },
    };
    const issues = validateTest(doc).filter((i: any) => i.severity === 'error');
    if (issues.length) throw new Error(`validateTest: ${issues.map((i: any) => `${i.path} ${i.message}`).join('; ')}`);
    doc.isMockEligible = computeMockEligible(sections);
    const mins = Math.round(sections.listening.durationSec / 60);
    if (dry) { console.log(`✓ ${t.slug} (dry) — listening ${mins} daq, mock=${doc.isMockEligible}`); continue; }

    const prev = await db.collection('examtests').findOne({ slug: t.slug }, { projection: { _id: 1, createdAt: 1, createdBy: 1 } });
    await db.collection('examtests').replaceOne(
      { slug: t.slug },
      { ...doc, createdBy: prev?.createdBy || adminId, createdAt: prev?.createdAt || new Date(), updatedAt: new Date() },
      { upsert: true },
    );
    // Yozilganini qayta o'qib audio havolalari haqiqiy GridFS fayliga olib borishini tekshirish.
    const saved = await db.collection('examtests').findOne({ slug: t.slug });
    for (const p of saved.sections.listening.parts) {
      const fid = new mongoose.Types.ObjectId(p.audioUrl.split('/').pop());
      const f = await db.collection('examAudio.files').findOne({ _id: fid });
      if (!f || f.length < 100_000) throw new Error(`part ${p.order}: audio fayl bazada topilmadi`);
    }
    console.log(`✓ ${t.slug} — ${prev ? 'yangilandi' : 'yaratildi'}, listening ${mins} daq, mock=${doc.isMockEligible}, published=${doc.isPublished}`);
  } catch (e: any) {
    failed++;
    console.log(`✗ ${t.slug}: ${e.message}`);
  }
}

if (mongoose) await mongoose.disconnect();
console.log(failed ? `\n${failed} ta test xato bilan o'tkazib yuborildi.` : `\nBarcha ${tests.length} ta test muvaffaqiyatli.`);
process.exit(failed ? 1 : 0);
