// VOA Learning English hikoyalarini (faqat VOA xodimlari yozgan — AP/Reuters/AFP
// moslashtirmalari CHIQARILADI) sources/voa/<key>.json ko'rinishida yig'adi.
//   node scripts/content/open/tools/voa-fetch.mjs --cats=987,4456 --pages=1-10 [--limit=N]
//   node scripts/content/open/tools/voa-fetch.mjs --url=https://learningenglish.voanews.com/a/...html
// Natija: har bir qabul qilingan hikoya uchun JSON (title,url,mp3,published,licence,
// credit,paragraphs) + .local-scratch/voa-fetch-report.json (rad etilganlar sababi bilan).
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'sources', 'voa');
const UA = 'Mozilla/5.0 (compatible; VocablyContentBot/1.0; +https://www.vocably.uz)';
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = /^--([^=]+)=?(.*)$/.exec(a); return [m[1], m[2] || true]; }));
const cats = String(args.cats || '987,4456,7468,1579,3521,955,986').split(',').filter(Boolean);
const [pFrom, pTo] = String(args.pages || '1-5').split('-').map(Number);
const limit = Number(args.limit || 1e9);
const minWords = Number(args.minWords || 350), maxWords = Number(args.maxWords || 1300);

const AGENCY = /(Associated Press|\bAP\b|Reuters|\bAFP\b|Agence[- ]France[- ]Presse|Bloomberg|New York Times|Washington Post|\bCNN\b|\bBBC\b)/i;
const STAFF = /(wrote|reported|produced) this (story|report|article|lesson|program)( for (VOA|Voice of America|Learning English|VOA Learning English|VOA Special English))?|wrote this for (VOA )?Learning English|wrote this (story|lesson)\./i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch {}
    await sleep(1500 * (i + 1));
  }
  return null;
}

const clean = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const words = (s) => s.split(/\s+/).filter(Boolean).length;

export function parseArticle(html, url) {
  const dom = new JSDOM(html);
  const d = dom.window.document;
  const title = clean(d.querySelector('h1.title, h1')?.textContent || '');
  const audio = d.querySelector('div.wsw audio, audio');
  let mp3 = null;
  if (audio) {
    const src = (audio.getAttribute('data-sources') || '').replace(/&quot;/g, '"');
    const m = /"Src":"([^"]+_hq\.mp3)"/.exec(src);
    mp3 = m ? m[1] : audio.getAttribute('src');
  }
  if (!mp3) {
    const m = /https:\/\/voa-audio[^"'\s]+?(?:_hq)?\.mp3/.exec(html);
    mp3 = m ? m[0] : null;
  }
  const body = d.querySelector('div.wsw');
  const published = d.querySelector('time[datetime]')?.getAttribute('datetime')?.slice(0, 10) || null;
  const paragraphs = [];
  let credit = '';
  if (body) {
    // Ba'zi sahifalarda (Everyday Grammar) har <p> alohida <div> ichida — shuning
    // uchun to'g'ridan-to'g'ri p/h2 elementlar hujjat tartibida olinadi.
    for (const el of body.querySelectorAll('p, h2, h3')) {
      if (el.closest('.wsw__embed')) continue; // media embed'lar
      const tag = el.tagName;
      const text = clean(el.textContent || '');
      if (!text) continue;
      if (/^_{5,}$/.test(text) || /^words in this story/i.test(text) || /^(related stories|more stories)/i.test(text)) break;
      if (/^(quiz|start the quiz|take the quiz)\W*$/i.test(text)) continue; // darsdagi mini-quiz sarlavhasi
      if (tag !== 'P') continue; // h2/ul/jadval — transkript emas
      const isCredit = /\b(wrote|reported|adapted|edited) (this|it)\b|was the editor|additional reporting/i.test(text);
      if (isCredit) { credit = credit ? `${credit} ${text}` : text; continue; }
      if (/^(we want to hear from you|write to us|what do you think|start the quiz)/i.test(text)) continue;
      paragraphs.push(text);
    }
  }
  return { title, url, mp3, published, credit, paragraphs };
}

export function judge(a) {
  if (!a.mp3) return "mp3 yo'q";
  if (!a.credit) return 'muallif satri topilmadi';
  if (AGENCY.test(a.credit)) return `agentlik materiali: ${a.credit}`;
  if (!STAFF.test(a.credit)) return `noaniq muallif: ${a.credit}`;
  const w = a.paragraphs.reduce((s, p) => s + words(p), 0);
  if (w < minWords) return `juda qisqa (${w} so'z)`;
  if (w > maxWords) return `juda uzun (${w} so'z)`;
  if (/^(ask a teacher|english in a minute|news words)/i.test(a.title)) return 'format mos emas';
  return null;
}

const keyOf = (url) => /\/a\/([^/]+)\/\d+\.html/.exec(url)?.[1]?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  mkdirSync(DIR, { recursive: true });
  const existing = new Set(readdirSync(DIR).map((f) => f.replace(/\.json$/, '')));
  const urls = [];
  if (args.url) urls.push(String(args.url));
  else if (args.urls) urls.push(...readFileSync(String(args.urls), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  else {
    for (const c of cats) for (let p = pFrom; p <= pTo; p++) {
      const html = await get(`https://learningenglish.voanews.com/z/${c}?p=${p}`);
      if (!html) continue;
      for (const m of html.matchAll(/href="(\/a\/[^"]+\/\d+\.html)"/g)) urls.push(`https://learningenglish.voanews.com${m[1]}`);
      await sleep(300);
    }
  }
  const uniq = [...new Set(urls)].filter((u) => keyOf(u) && !existing.has(keyOf(u)));
  console.log(`${uniq.length} ta yangi URL (${urls.length} topildi, ${existing.size} mavjud)`);
  const report = { accepted: [], rejected: [] };
  let accepted = 0;
  const queue = [...uniq];
  async function worker() {
    while (queue.length && accepted < limit) {
      const url = queue.shift();
      const html = await get(url);
      if (!html) { report.rejected.push({ url, why: "yuklab bo'lmadi" }); continue; }
      const a = parseArticle(html, url);
      const why = judge(a);
      if (why) { report.rejected.push({ url, why }); continue; }
      const key = keyOf(url);
      const doc = { key, title: a.title, url, mp3: a.mp3, published: a.published, licence: 'Public domain (VOA Learning English, U.S. Government work)', credit: a.credit, paragraphs: a.paragraphs };
      writeFileSync(path.join(DIR, `${key}.json`), JSON.stringify(doc, null, 1) + '\n');
      accepted++;
      const w = a.paragraphs.reduce((s, p) => s + words(p), 0);
      report.accepted.push({ key, words: w, credit: a.credit });
      console.log(`✓ ${key} (${w} so'z)`);
      await sleep(400);
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  mkdirSync('.local-scratch', { recursive: true });
  writeFileSync('.local-scratch/voa-fetch-report.json', JSON.stringify(report, null, 1));
  const why = {};
  for (const r of report.rejected) { const k = r.why.split(':')[0]; why[k] = (why[k] || 0) + 1; }
  console.log(`\nQabul: ${accepted}, rad: ${report.rejected.length}`, why);
}
main();
