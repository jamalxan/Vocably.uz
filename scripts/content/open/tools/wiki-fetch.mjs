// Wikipedia maqolasidan Reading passage manbasi (CC BY-SA 4.0) yasaydi:
// sources/wiki/<slug>.json — {article,url(oldid),revid,licence,paragraphs[{label,text}]}.
//   node scripts/content/open/tools/wiki-fetch.mjs "Rosetta Stone" "Stonehenge" ...
//   node scripts/content/open/tools/wiki-fetch.mjs --list=scripts/content/open/tools/wiki-topics.txt
// Paragraflar: bosh qism + dastlabki bo'limlar, 35 so'zdan qisqa satrlar (rasm izohi,
// ro'yxat) tashlanadi, "See also/References/..." bo'limida to'xtaydi; umumiy hajm
// ~750-950 so'z (IELTS passage). Qisqa chiqsa fayl yozilmaydi (hisobotda ko'rsatiladi).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'sources', 'wiki');
const UA = 'VocablyContentBot/1.0 (https://www.vocably.uz; content@vocably.uz)';
const argv = process.argv.slice(2);
const listArg = argv.find((a) => a.startsWith('--list='));
const force = argv.includes('--force');
const titles = listArg
  ? readFileSync(listArg.slice(7), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : argv.filter((a) => !a.startsWith('--'));

const STOP = /^(see also|references|external links|notes|further reading|bibliography|gallery|sources|citations|footnotes|explanatory notes)$/i;
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const slugOf = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function cleanParagraph(t) {
  return t
    .replace(/\s*\([^()]*[ˈˌəɪʊːɛɔæʃʒθðŋɡ][^()]*\)/g, '') // IPA talaffuz qavslari
    .replace(/\s*\((?:listen|pronounced)[^()]*\)/gi, '')
    .replace(/\s*\(\s*[,;:\s]*\)/g, '') // bo'sh qolgan qavslar "( , )"
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPassage(extract, { min = 700, target = 820, max = 980, maxParas = 11 } = {}) {
  const lines = extract.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const paras = [];
  let section = '';
  for (const l of lines) {
    const h = /^(=+)\s*(.+?)\s*=+$/.exec(l);
    if (h) { section = h[2]; if (STOP.test(section)) break; continue; }
    const t = cleanParagraph(l);
    if (words(t) < 35) continue; // rasm izohi / ro'yxat / jadval qoldig'i
    if (/^[\-•*]/.test(t)) continue;
    if (paras.some((p) => p.slice(0, 80) === t.slice(0, 80))) continue; // takror paragraf (masalan Desertification)
    if ((t.match(/ – /g) || []).length >= 3) continue; // "Ta'rif – ..." ro'yxat qoldig'i
    paras.push(t);
  }
  const out = [];
  let total = 0;
  for (const p of paras) {
    const w = words(p);
    if (out.length >= maxParas) break;
    if (total >= target) break;
    if (total + w > max && total >= min) break;
    if (w > 220) continue; // juda uzun paragraf — o'qish og'ir, tashlab ketamiz
    out.push(p);
    total += w;
  }
  return { paragraphs: out.map((text, i) => ({ label: 'ABCDEFGHIJKLMNOP'[i], text })), words: total };
}

async function fetchArticle(title) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  Object.entries({ action: 'query', prop: 'extracts|revisions', explaintext: 1, exsectionformat: 'wiki', rvprop: 'ids', redirects: 1, titles: title, format: 'json', formatversion: 2 })
    .forEach(([k, v]) => u.searchParams.set(k, String(v)));
  const res = await fetch(u, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const page = (await res.json()).query.pages[0];
  if (page.missing) throw new Error('maqola topilmadi');
  return page;
}

async function main() {
  mkdirSync(DIR, { recursive: true });
  const report = [];
  for (const title of titles) {
    try {
      const page = await fetchArticle(title);
      const slug = slugOf(page.title);
      const file = path.join(DIR, `${slug}.json`);
      if (existsSync(file) && !force) { report.push({ title, slug, status: 'mavjud' }); continue; }
      const { paragraphs, words: w } = buildPassage(page.extract);
      if (w < 650 || paragraphs.length < 5) { report.push({ title, slug, status: `qisqa (${w} so'z, ${paragraphs.length} paragraf)` }); continue; }
      const revid = page.revisions[0].revid;
      const doc = {
        article: page.title,
        url: `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(page.title.replace(/ /g, '_'))}&oldid=${revid}`,
        revid,
        licence: 'CC BY-SA 4.0',
        paragraphs,
      };
      writeFileSync(file, JSON.stringify(doc, null, 1) + '\n');
      report.push({ title, slug, status: `ok ${w} so'z, ${paragraphs.length} paragraf` });
      console.log(`✓ ${slug}: ${w} so'z, ${paragraphs.length} paragraf`);
    } catch (e) {
      report.push({ title, status: `xato: ${e.message}` });
      console.log(`✗ ${title}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  mkdirSync('.local-scratch', { recursive: true });
  writeFileSync('.local-scratch/wiki-fetch-report.json', JSON.stringify(report, null, 1));
  const bad = report.filter((r) => !r.status.startsWith('ok') && r.status !== 'mavjud');
  console.log(`\n${report.length} ta: ok ${report.filter((r) => r.status.startsWith('ok')).length}, mavjud ${report.filter((r) => r.status === 'mavjud').length}, muammo ${bad.length}`);
  bad.forEach((b) => console.log('  ', b.title, '—', b.status));
}
main();
