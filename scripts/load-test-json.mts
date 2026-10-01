// tests/*.json (subagent chiqargan) + audio xaritasi -> private ExamTest qoralamasi.
//   node --env-file=.env --import tsx scripts/load-test-json.mts <test.json> --pdf=<pdf> [--audio=<audio-map.json>] [--dry]
// audio-map.json: { "<testKey>": { "1": "D:/.../part1.mp3", "2": ..., "3": ..., "4": ... } }, testKey = json fayl nomi (cam1-t1)
// HAR DOIM: isPublished:false, rights.publishScope:'private'. Mavjud slug bo'lsa — o'tkazib yuboradi (idempotent).
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'))!;
const flag = (n: string) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=');
const dry = args.includes('--dry');
const pdfPath = flag('pdf');
const audioMapPath = flag('audio');
const key = path.basename(file, '.json');

const t = JSON.parse(fs.readFileSync(file, 'utf8'));
const { validateTest, isMockEligible } = await import('@/lib/exam/contentValidator');
const { uploadAudioBuffer } = await import('@/lib/exam/audioStorage');
const { uploadImageBuffer, buildImageUrl } = await import('@/lib/exam/imageStorage');
const { connectToDatabase } = await import('@/lib/db');
const { ExamTest, User } = await import('@/lib/models');

function durationSec(f: string): number {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
  return Math.round(Number(out) || 0);
}

// --- rasm sahifalari (_needsImagePage) ---
const imagePages = new Set<number>();
const walk = (o: any) => { if (o && typeof o === 'object') { if (o._needsImagePage) imagePages.add(o._needsImagePage); Object.values(o).forEach(walk); } };
walk(t.sections);
const imageUrls = new Map<number, string>();
if (imagePages.size && !dry) {
  if (!pdfPath) throw new Error('--pdf kerak (_needsImagePage bor)');
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(pdfPath)) });
  const shots = await parser.getScreenshot({ partial: [...imagePages], scale: 1.6, imageBuffer: true, imageDataUrl: false } as any);
  for (const p of shots.pages) imageUrls.set(p.pageNumber, buildImageUrl(await uploadImageBuffer(Buffer.from(p.data), `${key}-p${p.pageNumber}.png`, 'image/png')));
  await parser.destroy();
}
const applyImages = (o: any) => {
  if (o && typeof o === 'object') {
    if (o._needsImagePage) { const url = imageUrls.get(o._needsImagePage); if (url) o.imageUrl = url; delete o._needsImagePage; }
    Object.values(o).forEach(applyImages);
  }
};
applyImages(t.sections);

// --- audio ---
let audioAttached = 0;
if (audioMapPath && t.sections.listening) {
  const map = JSON.parse(fs.readFileSync(audioMapPath, 'utf8'))[key] || {};
  for (const part of t.sections.listening.parts) {
    const f = map[String(part.order)];
    if (!f) continue;
    part.durationSec = durationSec(f);
    if (!dry) part.audioUrl = `/api/exam/audio/${await uploadAudioBuffer(fs.readFileSync(f), path.basename(f), 'audio/mpeg')}`;
    else part.audioUrl = `DRY:${path.basename(f)}`;
    audioAttached++;
  }
}

const draft = {
  slug: t.slug, title: t.title, module: t.module || 'academic', difficulty: t.difficulty || 'medium', sections: t.sections,
  rights: { sourceType: 'third_party_copyright', publisher: 'Cambridge University Press', licence: '', licenceNote: 'Admin skript orqali yuklandi (private)', publishScope: 'private' },
};
const issues = validateTest(draft as any);
const errors = issues.filter((i: any) => i.severity === 'error');
console.log(`${key}: audio ${audioAttached}/${t.sections.listening?.parts?.length || 0}, images ${imagePages.size}, errors ${errors.length}, warnings ${issues.length - errors.length}`);
errors.slice(0, 10).forEach((e: any) => console.log('  ✗', e.path, e.message));
if (dry) process.exit(0);

await connectToDatabase();
const exists = await (ExamTest as any).findOne({ slug: draft.slug }).select('_id').lean();
if (exists) { console.log('  skip: slug mavjud', draft.slug); process.exit(0); }
const admin = await (User as any).findOne({ role: 'admin' }).select('_id').lean();
await (ExamTest as any).create({
  ...draft, isPublished: false, isMockEligible: isMockEligible(draft as any), createdBy: admin?._id,
  source: { bookTitle: t.title.replace(/ — Test \d+$/, ''), testIndex: Number((t.title.match(/Test (\d+)$/) || [])[1]) || undefined },
});
console.log('  created (private, unpublished):', draft.slug);
process.exit(0);
