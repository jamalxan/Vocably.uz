// VOA manbalari (sources/voa/*.json) uchun audioni OLDINDAN tayyorlaydi: yuklab
// oladi, siqadi, dekodlaydi, Whisper (Groq) bilan to'liq transkripsiya qiladi va
// veb-sahifadagi transkript bilan so'z qamrovini o'lchaydi. Natija keshi (.asr.json)
// keyin load-open-tests.mts tomonidan qayta ishlatiladi — savol yozishdan OLDIN
// qaysi hikoyalar audio jihatdan ishonchli ekanini bilib olamiz.
//   node --env-file=.env --import tsx scripts/content/open/tools/voa-prepare.mts [--only=key1,key2] [--skip-asr]
// Hisobot: .local-scratch/voa-prepare-report.json — {key, durationSec, coverage, status}
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { prepareAudio, fullAsr, transcriptCoverage, CACHE } = await import('./audio.mts');
const { norm } = await import('../verify.mjs');

const args = process.argv.slice(2);
const only = ((args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const skipAsr = args.includes('--skip-asr');
const SRC = path.join(process.cwd(), 'scripts', 'content', 'open', 'sources', 'voa');
const REPORT = path.join(process.cwd(), '.local-scratch', 'voa-prepare-report.json');

const report: Record<string, any> = fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, 'utf8')) : {};
const keys = fs.readdirSync(SRC).map((f) => f.replace(/\.json$/, '')).filter((k) => !only.length || only.includes(k)).sort();
let n = 0;
for (const key of keys) {
  n++;
  const src = JSON.parse(fs.readFileSync(path.join(SRC, `${key}.json`), 'utf8'));
  const prev = report[key];
  if (prev?.status === 'ok' && fs.existsSync(path.join(CACHE, `${key}.mp3`)) && (skipAsr || fs.existsSync(path.join(CACHE, `${key}.asr.json`)))) continue;
  try {
    const a = await prepareAudio(key, src.mp3);
    let coverage: number | null = null;
    if (!skipAsr) {
      const asr = await fullAsr(key, a.file);
      coverage = transcriptCoverage(src.paragraphs.join('\n'), asr.text, norm);
    }
    const words = src.paragraphs.join(' ').split(/\s+/).length;
    const status = coverage !== null && coverage < 0.85 ? 'low-coverage' : 'ok';
    report[key] = { durationSec: a.durationSec, words, coverage: coverage === null ? null : Number(coverage.toFixed(3)), status };
    console.log(`${status === 'ok' ? '✓' : '△'} [${n}/${keys.length}] ${key} — ${a.durationSec}s, ${words} so'z${coverage !== null ? `, qamrov ${(coverage * 100).toFixed(0)}%` : ''}`);
  } catch (e: any) {
    report[key] = { status: 'error', error: e.message };
    console.log(`✗ [${n}/${keys.length}] ${key}: ${e.message}`);
  }
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 1));
}
const ok = Object.values(report).filter((r: any) => r.status === 'ok').length;
console.log(`\nTayyor: ${ok} ok / ${Object.keys(report).length} jami`);
