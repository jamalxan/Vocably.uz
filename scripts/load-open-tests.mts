// "Vocably Open Test"larni (scripts/content/open/** — ochiq litsenziyali manbalardan:
// Wikipedia CC BY-SA, VOA public domain, Our World in Data CC BY) bazaga yuklaydi.
// Uch seriya: open-test-N.mjs (to'liq test), reading/reading-N.mjs (faqat Reading,
// 1 passage), listening/listening-N.mjs (faqat Listening, 1 VOA hikoyasi).
// Har bosqich tekshiriladi, birorta xato bo'lsa test YUKLANMAYDI:
//   1. verify.mjs — raqamlash, javob formati, so'z limiti, javob/iqtibos manbada borligi
//   2. scoring.ts#isCorrect — har bir kalit javob haqiqiy baholashda TO'G'RI deb topiladimi
//   3. audio — VOA mp3 yuklab olinadi, 40 kbps mono'ga siqiladi, ffmpeg bilan
//      to'liq dekodlanadi (xatosiz), davomiyligi asl fayl bilan solishtiriladi
//   4. ASR — Whisper (Groq) bilan har bir javob/dalil audioda aytilgani tekshiriladi
//   5. audio saqlash: `listening.audio === 'static'` bo'lsa public/audio/exam/open/<key>.mp3
//      (Atlas'da joy yo'q — Vercel statik fayl; nashrdan oldin jonli URL HEAD 200 bo'lishi
//      shart), aks holda GridFS (qayta o'qilib sha256 solishtiriladi, sha256 bo'yicha dedupe)
//   6. contentValidator.ts#validateTest — blocking xato bo'lmasligi kerak
//   node --env-file=.env --import tsx scripts/load-open-tests.mts [--series=open|reading|listening]
//        [--only=1,2] [--dry] [--draft] [--no-live-check] [--site=https://www.vocably.uz]
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const draft = args.includes('--draft');
const noLiveCheck = args.includes('--no-live-check');
const site = ((args.find((a) => a.startsWith('--site=')) || '').split('=')[1] || 'https://www.vocably.uz').replace(/\/$/, '');
const series = (args.find((a) => a.startsWith('--series=')) || '').split('=')[1] || undefined;
const only = ((args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean).map(Number);
if (only.length && !series) throw new Error('--only bilan birga --series=open|reading|listening ko\'rsating');
const STATIC_DIR = path.join(process.cwd(), 'public', 'audio', 'exam', 'open');

const { loadOpenTests, verifyOpenTest, norm } = await import('./content/open/verify.mjs');
const { SPEAKING } = await import('./content/open/speaking.mjs');
const { chartToImage, computeMockEligible } = await import('./seed-practice-tests.mjs');
const { prepareAudio, asrCheck } = await import('./content/open/tools/audio.mts');
const { isCorrect, isSetCorrect } = await import('@/lib/exam/scoring');
const { validateTest } = await import('@/lib/exam/contentValidator');

const sha256 = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');

function checkScoring(t: any): string[] {
  const errs: string[] = [];
  const all = [...(t.reading?.passages || []), ...(t.listening?.parts || [])];
  for (const c of all) for (const g of c.questionGroups) for (const q of g.questions) {
    const ok = g.type === 'multiple_choice_multi'
      ? isSetCorrect(q.answer.accepted, q.answer)
      : q.answer.accepted.every((a: string) => isCorrect(a, q.answer, g.wordLimit));
    if (!ok) errs.push(`${t.slug} ${g.id} Q${q.number}: kalit javob baholashda to'g'ri deb topilmadi`);
  }
  return errs;
}

const tests = (await loadOpenTests(series)).filter((t: any) => !only.length || only.includes(t.n));
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

/** Statik audio: public/audio/exam/open/<key>.mp3 ga yoziladi (bir xil bo'lsa qayta yozilmaydi). */
function placeStatic(key: string, buf: Buffer): string {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
  const file = path.join(STATIC_DIR, `${key}.mp3`);
  if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== sha256(buf)) fs.writeFileSync(file, buf);
  return `/audio/exam/open/${key}.mp3`;
}

const liveOk = new Map<string, boolean>();
async function isLive(url: string): Promise<boolean> {
  if (liveOk.has(url)) return liveOk.get(url)!;
  let ok = false;
  try {
    const res = await fetch(`${site}${url}`, { method: 'HEAD', redirect: 'follow' });
    ok = res.ok && /audio\/mpeg/.test(res.headers.get('content-type') || '');
  } catch {}
  liveOk.set(url, ok);
  return ok;
}

for (const t of tests) {
  const errs = [...verifyOpenTest(t), ...checkScoring(t)];
  if (errs.length) { failed++; console.log(`✗ ${t.slug}`); errs.forEach((e) => console.log('   ', e)); continue; }

  try {
    const sections: any = {};
    const notes: string[] = [];
    const licences: string[] = [];
    const publishers: string[] = [];

    if (t.reading) {
      sections.reading = t.reading;
      notes.push(...t.reading.passages.map((p: any) => `Reading P${p.order}: Wikipedia "${p.source.article}" ${p.source.url} (CC BY-SA 4.0, adapted)`));
      licences.push('CC BY-SA 4.0 (Reading texts)');
      publishers.push('Wikipedia contributors');
    }

    if (t.listening) {
      const isStatic = t.listening.audio === 'static';
      const parts = [];
      for (const p of t.listening.parts) {
        const a = await prepareAudio(p.source.key, p.source.mp3);
        const asrErrs = await asrCheck(p.source.key, a.file, p, norm);
        if (asrErrs.length) throw new Error(`ASR tekshiruvi:\n    ${asrErrs.join('\n    ')}`);
        let audioUrl: string;
        if (isStatic) {
          audioUrl = placeStatic(p.source.key, a.buf);
          if (!dry && !draft && !noLiveCheck && !(await isLive(audioUrl))) {
            throw new Error(`${audioUrl} jonli saytda yo'q (HEAD) — avval public/audio/exam/open ni commit+push qiling yoki --draft bilan yuklang`);
          }
        } else {
          audioUrl = dry ? `DRY:${p.source.key}` : `/api/exam/audio/${await uploadVerified(a.buf, `${p.source.key}.mp3`, { source: p.source.url, licence: p.source.licence })}`;
        }
        parts.push({ order: p.order, audioUrl, durationSec: a.durationSec, transcript: p.transcript, contextText: p.contextText, gapAfterSec: p.gapAfterSec, questionGroups: p.questionGroups, source: p.source });
      }
      sections.listening = { durationSec: parts.reduce((s, p) => s + p.durationSec, 0) + t.listening.checkTimeSec, checkTimeSec: t.listening.checkTimeSec, parts };
      notes.push(...parts.map((p: any) => `Listening P${p.order}: VOA Learning English "${p.source.title}" ${p.source.url} (public domain; ${p.source.credit})`));
      licences.push('Public domain (Listening audio/transcripts)');
      publishers.push('VOA Learning English');
    }

    if (t.writing) {
      const { chart, source: chartSource, ...task1Rest } = t.writing.task1;
      sections.writing = { durationSec: t.writing.durationSec, tasks: [{ ...task1Rest, ...chartToImage(chart), source: chartSource }, t.writing.task2] };
      notes.push(`Writing T1 data: ${chartSource.url} (CC BY 4.0)`);
      licences.push('CC BY 4.0 (Writing Task 1 data)');
      publishers.push('Our World in Data');
    }
    if (t.series === 'open' && SPEAKING[t.n]) sections.speaking = SPEAKING[t.n];

    const doc: any = {
      slug: t.slug, title: t.title, module: 'academic', difficulty: t.difficulty, sections, bandTable: null,
      isPublished: !draft,
      rights: {
        sourceType: 'licensed',
        publisher: publishers.join('; '),
        licence: licences.join('; '),
        licenceNote: `Questions and answer keys written for Vocably.${t.reading ? ' Reading texts adapted from Wikipedia and shared under CC BY-SA 4.0.' : ''}\n${notes.join('\n')}`,
        rightsVerifiedBy: adminId, rightsVerifiedAt: new Date(), publishScope: 'public',
      },
    };
    const issues = validateTest(doc).filter((i: any) => i.severity === 'error');
    if (issues.length) throw new Error(`validateTest: ${issues.map((i: any) => `${i.path} ${i.message}`).join('; ')}`);
    doc.isMockEligible = computeMockEligible(sections);
    const summary = [
      sections.reading ? `reading ${Math.round(sections.reading.durationSec / 60)} daq` : '',
      sections.listening ? `listening ${Math.round(sections.listening.durationSec / 60)} daq` : '',
      `mock=${doc.isMockEligible}`,
    ].filter(Boolean).join(', ');
    if (dry) { console.log(`✓ ${t.slug} (dry) — ${summary}`); continue; }

    const prev = await db.collection('examtests').findOne({ slug: t.slug }, { projection: { _id: 1, createdAt: 1, createdBy: 1 } });
    await db.collection('examtests').replaceOne(
      { slug: t.slug },
      { ...doc, createdBy: prev?.createdBy || adminId, createdAt: prev?.createdAt || new Date(), updatedAt: new Date() },
      { upsert: true },
    );
    // Yozilganini qayta o'qib audio havolalari haqiqiy faylga olib borishini tekshirish.
    const saved = await db.collection('examtests').findOne({ slug: t.slug });
    for (const p of saved.sections.listening?.parts || []) {
      if (p.audioUrl.startsWith('/audio/exam/open/')) {
        const f = path.join(STATIC_DIR, path.basename(p.audioUrl));
        if (!fs.existsSync(f) || fs.statSync(f).size < 100_000) throw new Error(`part ${p.order}: statik audio fayl ${f} topilmadi`);
      } else {
        const fid = new mongoose.Types.ObjectId(p.audioUrl.split('/').pop());
        const f = await db.collection('examAudio.files').findOne({ _id: fid });
        if (!f || f.length < 100_000) throw new Error(`part ${p.order}: audio fayl bazada topilmadi`);
      }
    }
    console.log(`✓ ${t.slug} — ${prev ? 'yangilandi' : 'yaratildi'}, ${summary}, published=${doc.isPublished}`);
  } catch (e: any) {
    failed++;
    console.log(`✗ ${t.slug}: ${e.message}`);
  }
}

if (mongoose) await mongoose.disconnect();
console.log(failed ? `\n${failed} ta test xato bilan o'tkazib yuborildi.` : `\nBarcha ${tests.length} ta test muvaffaqiyatli.`);
process.exit(failed ? 1 : 0);
