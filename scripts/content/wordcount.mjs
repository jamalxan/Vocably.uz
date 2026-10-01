// Yordamchi: `node scripts/content/wordcount.mjs 42` — passage va transcript so'z sonlari.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
for (const n of process.argv.slice(2)) {
  const c = (await import(pathToFileURL(path.resolve(`scripts/content/practice-test-${n}.mjs`)).href)).default;
  const count = (t) => t.trim().split(/\s+/).filter(Boolean).length;
  const r = c.reading.passages.map((p) => count(p.paragraphs.map((x) => x.html.replace(/<[^>]+>/g, ' ')).join(' ')));
  const l = c.listening.parts.map((p) => count(p.transcriptLines.map((x) => x.text).join(' ')));
  console.log(`test ${n}: reading ${r.join('/')} = ${r.reduce((a, b) => a + b)} (need 2150-2750); listening ${l.join('/')}`);
}
