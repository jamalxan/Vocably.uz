// Kitob PDF'ini admin AI-chat pipeline'i bilan (analyzeDocument -> parseTestSections
// -> buildSections -> validateTest) ichkaridan, admin paneldan tashqari yuklaydi.
// Testlar HAR DOIM private + isPublished:false.
//
//   node --env-file=.env --import tsx scripts/ingest-book.mts <pdf> "<Book title>" [--dry] [--only=1,2]
import dns from 'node:dns';
import fs from 'node:fs';
dns.setServers(['8.8.8.8', '1.1.1.1']); // Windows'da SRV so'rovi ECONNREFUSED bermasligi uchun

const [, , pdfPath, bookTitle, ...flags] = process.argv;
const dry = flags.includes('--dry');
const only = (flags.find((f) => f.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean).map(Number);
if (!pdfPath || !bookTitle) throw new Error('Usage: ingest-book.mts <pdf> "<title>" [--dry] [--only=1,2]');

const { extractDocumentText } = await import('@/lib/contentAgent/documentText');
const { analyzeDocument, parseTestSections, answerKeyTextFrom, audioscriptTextFrom } = await import('@/lib/contentAgent/agent/analyze.js');
const { buildSections, summarizeSections, slugify, uniqueSlug } = await import('@/lib/contentAgent/agent/buildTest');
const { validateTest, isMockEligible } = await import('@/lib/exam/contentValidator');
const { connectToDatabase } = await import('@/lib/db');
const { ExamTest, User } = await import('@/lib/models');

const deadline = () => Date.now() + 280_000;
const doc = await extractDocumentText(fs.readFileSync(pdfPath), 'pdf');
console.log(`pages=${doc.pageCount} textLayer=${doc.hasTextLayer}`);

// --map=file.json: [{index, sections:{listening:{pageFrom,pageTo},...}, audioscript:{pageFrom,pageTo}, answerKey:{pageFrom,pageTo}}]
// AI xaritasi faqat kitobning dastlabki ~50 sahifasini ko'radi, shuning uchun to'liq kitoblarda aniq xarita beriladi.
const mapFile = (flags.find((f) => f.startsWith('--map=')) || '').replace('--map=', '');
const analysis: any = mapFile
  ? { tests: JSON.parse(fs.readFileSync(mapFile, 'utf8')), answerKeyPages: [], audioscriptPages: [], headingSplit: null }
  : await analyzeDocument({ pages: doc.pages, deadlineAt: deadline() });
console.log('map:', analysis.tests.map((t: any) => `T${t.index}[${t.pageFrom}-${t.pageTo}]`).join(' '));
if (analysis.crossCheckWarnings?.length) console.log('warn:', analysis.crossCheckWarnings.join(' | '));

const rangeText = (r?: { pageFrom: number; pageTo: number }) =>
  r ? doc.pages.filter((p: any) => p.n >= r.pageFrom && p.n <= r.pageTo).map((p: any) => p.text).join('\n\n') : '';
const globalKey = answerKeyTextFrom(doc.pages, analysis.answerKeyPages);
const globalScript = audioscriptTextFrom(doc.pages, analysis.audioscriptPages);

await connectToDatabase();
const admin = await (User as any).findOne({ role: 'admin' }).select('_id').lean();
const results: any[] = [];

for (const entry of analysis.tests) {
  if (only.length && !only.includes(entry.index)) continue;
  const title = `${bookTitle} — Test ${entry.index}`;
  const exists = await (ExamTest as any).findOne({ 'source.bookTitle': bookTitle, 'source.testIndex': entry.index }).select('slug').lean();
  if (exists) { console.log(`skip ${title} (exists: ${exists.slug})`); continue; }

  const { parsed, warnings, needsReview } = await parseTestSections({
    pages: doc.pages, test: entry, answerKeyText: rangeText(entry.answerKey) || globalKey, audioscriptText: rangeText(entry.audioscript) || globalScript, fallbackTexts: analysis.headingSplit || null, deadlineAt: deadline(),
  });
  const sections = buildSections(parsed);
  if (!Object.keys(sections).length) { console.log(`FAIL ${title}: empty`, warnings); continue; }

  const base = slugify(title);
  const taken = (await (ExamTest as any).find({ slug: new RegExp(`^${base}(-\\d+)?$`) }).select('slug').lean()).map((t: any) => t.slug);
  const draft = {
    slug: uniqueSlug(base, taken), title, module: 'academic', difficulty: 'medium', sections,
    rights: { sourceType: 'third_party_copyright', publisher: 'Cambridge University Press', licence: '', licenceNote: `Admin skript: ${pdfPath.split(/[\\/]/).pop()}`, publishScope: 'private' },
  };
  const issues = validateTest(draft as any);
  const summary = summarizeSections(sections).map((s: any) => `${s.label}: ${s.detail}`).join('; ');
  console.log(`${dry ? 'DRY ' : ''}${title} -> ${summary} | issues=${issues.length} (errors=${issues.filter((i: any) => i.severity === 'error').length}) review=${needsReview.length}`);
  results.push({ title, slug: draft.slug, summary, issues, warnings });
  if (dry) { fs.writeFileSync(`D:/vocably-books/dry-${draft.slug}.json`, JSON.stringify({ draft, issues, warnings, needsReview }, null, 1)); continue; }

  await (ExamTest as any).create({
    ...draft, isPublished: false, isMockEligible: isMockEligible(draft as any), createdBy: admin?._id,
    source: { bookTitle, testIndex: entry.index },
  });
}
fs.writeFileSync(`D:/vocably-books/ingest-${slugify(bookTitle)}${dry ? '-dry' : ''}.json`, JSON.stringify(results, null, 1));
process.exit(0);
