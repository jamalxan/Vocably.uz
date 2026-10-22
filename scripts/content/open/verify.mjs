// Open Test kontentini YUKLASHDAN OLDIN qat'iy tekshiradi — javob kalitlaridagi
// xatolar (manbada yo'q javob, so'z limitidan oshgan javob, variantlarda yo'q
// harf, noto'g'ri raqamlash) foydalanuvchiga "to'g'ri javobim xato deb
// hisoblandi" bo'lib chiqmasligi uchun. Har bir izohdagi qo'shtirnoqli dalil
// manba matnida (locatorParagraph bo'lsa — aynan o'sha paragrafda) so'zma-so'z
// borligi ham tekshiriladi, ya'ni izoh to'qib chiqarilmagan.
//
// Uch xil kontent fayli bor (hammasi bir xil tekshiruvdan o'tadi):
//   open-test-N.mjs           — to'liq test: Reading 3 passage + Listening 4 part + Writing
//   reading/reading-N.mjs     — faqat Reading: 1 passage, 13-14 savol (20 daqiqa)
//   listening/listening-N.mjs — faqat Listening: 1 part (VOA hikoyasi), 10 savol
//   node scripts/content/open/verify.mjs [--series=open|reading|listening|reading-full|listening-full]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderChartSvg } from '../../../src/lib/chartSvg.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const GAP_TYPES = new Set(['sentence_completion', 'short_answer', 'note_completion', 'table_completion', 'flowchart_completion', 'summary_completion', 'form_completion']);
const STEM_TYPES = new Set(['note_completion', 'table_completion', 'flowchart_completion', 'summary_completion', 'form_completion', 'summary_completion_bank']);
const KNOWN_TYPES = new Set([...GAP_TYPES, 'summary_completion_bank', 'multiple_choice_single', 'multiple_choice_multi', 'matching_features', 'matching_sentence_endings', 'true_false_notgiven', 'yes_no_notgiven', 'matching_headings', 'matching_information']);
const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];
const YNNG = ['YES', 'NO', 'NOT GIVEN'];

// Solishtirish uchun: kichik harf, tirnoq/tire turlarini bir xillashtirish, tinish belgilarini olib tashlash.
export function norm(s) {
  return ` ${String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—-]/g, ' ')
    .replace(/%/g, ' percent ')
    .replace(/[^a-z0-9à-ÿøæœß'%°\-\s]/g, ' ')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()} `;
}
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const expand = (s) => {
  const m = s.match(/\(([^)]+)\)/);
  if (!m) return [s];
  return [s.replace(/\s*\([^)]+\)\s*/, ' ').trim(), s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim()];
};
// Izohdagi "..." ichidagi iqtiboslar; ichidagi " ... " tashlab ketilgan joy bo'laklarga ajratadi.
function quotes(html) {
  const out = [];
  for (const m of String(html || '').matchAll(/"([^"]{4,})"/g)) {
    for (const frag of m[1].split(/\s*\.\.\.\s*|…/)) if (words(frag) >= 2) out.push(frag);
  }
  return out;
}

export function verifyOpenTest(t) {
  const errors = [];
  const err = (where, msg) => errors.push(`${t.slug} ${where}: ${msg}`);
  const groupIds = new Set();

  if (!/^[a-z0-9-]+$/.test(t.slug || '')) err('slug', "slug faqat kichik lotin harf/raqam/'-'");
  if (!t.title?.trim()) err('title', "sarlavha bo'sh");
  if (!t.reading && !t.listening && !t.writing) err('sections', "kamida bitta bo'lim (reading/listening/writing) kerak");

  const checkGroups = (sectionLabel, groups, sourceAll, paraMap, labels) => {
    for (const g of groups) {
      const where = `${sectionLabel} ${g.id}`;
      if (groupIds.has(g.id)) err(where, 'group id takrorlangan');
      groupIds.add(g.id);
      if (!KNOWN_TYPES.has(g.type)) err(where, `noma'lum tur ${g.type}`);
      if (!g.instructionHtml) err(where, "instructionHtml bo'sh");
      if (GAP_TYPES.has(g.type) && !g.wordLimit) err(where, "gap-tur, lekin wordLimit yo'q");
      if (STEM_TYPES.has(g.type)) {
        if (!g.stemHtml) err(where, "stemHtml yo'q");
        for (const qq of g.questions) if (!g.stemHtml?.includes(`{{q${qq.number}}}`)) err(where, `stemHtml'da {{q${qq.number}}} yo'q`);
        const extra = [...(g.stemHtml || '').matchAll(/\{\{q(\d+)\}\}/g)].map((m) => Number(m[1])).filter((n) => !g.questions.some((qq) => qq.number === n));
        if (extra.length) err(where, `stemHtml'da ortiqcha joylar: ${extra}`);
      }
      for (const qq of g.questions) {
        const qw = `${where} Q${qq.number}`;
        const acc = qq.answer?.accepted || [];
        if (!acc.length) { err(qw, "accepted bo'sh"); continue; }
        if (!qq.explanationHtml) err(qw, "explanationHtml bo'sh");
        if (g.type === 'sentence_completion' && !/_{3,}/.test(qq.promptHtml || '')) err(qw, "gapda ______ joyi yo'q");
        if (!STEM_TYPES.has(g.type) && !qq.promptHtml) err(qw, "promptHtml bo'sh");
        if (qq.locatorParagraph && paraMap && !paraMap[qq.locatorParagraph]) err(qw, `locatorParagraph ${qq.locatorParagraph} mavjud emas`);

        if (g.type === 'true_false_notgiven' && !(acc.length === 1 && TFNG.includes(acc[0]))) err(qw, `TFNG javobi noto'g'ri: ${acc}`);
        if (g.type === 'yes_no_notgiven' && !(acc.length === 1 && YNNG.includes(acc[0]))) err(qw, `YNNG javobi noto'g'ri: ${acc}`);
        if (g.type === 'multiple_choice_single') {
          const keys = (qq.options || []).map((o) => o.key);
          if (keys.length < 3) err(qw, 'kamida 3 ta variant kerak');
          if (new Set(keys).size !== keys.length) err(qw, 'variant kalitlari takrorlangan');
          if (new Set((qq.options || []).map((o) => norm(o.text))).size !== keys.length) err(qw, 'variant matnlari takrorlangan');
          if (!(acc.length === 1 && keys.includes(acc[0]))) err(qw, `javob ${acc} variantlarda yo'q`);
        }
        if (g.type === 'multiple_choice_multi') {
          const keys = (qq.options || []).map((o) => o.key);
          if (acc.length !== qq.selectCount || !acc.every((a) => keys.includes(a))) err(qw, `multi javob/selectCount mos emas`);
        }
        if (['matching_features', 'matching_sentence_endings', 'matching_headings', 'summary_completion_bank'].includes(g.type)) {
          const keys = (g.bank || []).map((b) => b.key);
          if (!(acc.length === 1 && keys.includes(acc[0]))) err(qw, `javob ${acc} bankda yo'q`);
        }
        if (g.type === 'matching_information' && !(acc.length === 1 && labels.includes(acc[0]))) err(qw, `javob ${acc} paragraf harflarida yo'q`);

        if (GAP_TYPES.has(g.type)) {
          let found = false;
          for (const a of acc) {
            for (const v of expand(a)) {
              if (g.wordLimit && words(v) > g.wordLimit.maxWords) err(qw, `"${v}" so'z limitidan (${g.wordLimit.maxWords}) oshadi`);
              if (sourceAll.includes(norm(v))) found = true;
            }
          }
          if (!found) err(qw, `hech bir javob varianti (${acc.join(' | ')}) manba matnida topilmadi`);
        }

        // Izohdagi dalil iqtiboslari manbada bormi?
        const scope = qq.locatorParagraph && paraMap?.[qq.locatorParagraph] ? paraMap[qq.locatorParagraph] : sourceAll;
        for (const frag of quotes(qq.explanationHtml)) {
          if (!scope.includes(norm(frag))) err(qw, `izohdagi iqtibos manbada yo'q: "${frag}"`);
        }
      }
    }
  };

  const numbersOf = (containers) => containers.flatMap((c) => c.questionGroups.flatMap((g) => g.questions.map((qq) => qq.number)));
  const expectSeq = (label, nums, total) => {
    const want = Array.from({ length: total }, (_, i) => i + 1);
    if (nums.length !== total || nums.some((n, i) => n !== want[i])) err(label, `savol raqamlari 1-${total} ketma-ket emas: ${nums.join(',')}`);
  };

  // Reading — 3 passage (to'liq test, 40 savol) yoki 1 passage (bo'lim mashqi, 13-14 savol)
  if (t.reading) {
    const passages = t.reading.passages || [];
    const full = passages.length === 3;
    if (passages.length !== 3 && passages.length !== 1) err('reading', `1 yoki 3 ta passage kerak, ${passages.length} bor`);
    if (!(t.reading.durationSec > 0)) err('reading', "durationSec yo'q");
    let rWords = 0;
    for (const p of passages) {
      const paraMap = Object.fromEntries(p.paragraphs.map((x) => [x.label, norm(x.html)]));
      const all = norm(p.paragraphs.map((x) => x.html).join(' '));
      rWords += words(p.paragraphs.map((x) => x.html.replace(/<[^>]+>/g, ' ')).join(' '));
      const nums = numbersOf([p]);
      if (!p.subtitle?.includes(`questions ${nums[0]}-${nums[nums.length - 1]}`)) err(`reading.p${p.order}`, `subtitle raqamlari (${nums[0]}-${nums[nums.length - 1]}) mos emas`);
      if (!full && !(nums.length >= 13 && nums.length <= 14)) err(`reading.p${p.order}`, `13-14 savol kerak, ${nums.length} bor`);
      if (p.paragraphs.length < 5) err(`reading.p${p.order}`, `kamida 5 paragraf kerak, ${p.paragraphs.length} bor`);
      checkGroups(`reading.p${p.order}`, p.questionGroups, all, paraMap, p.paragraphs.map((x) => x.label));
    }
    const nums = numbersOf(passages);
    expectSeq('reading', nums, full ? 40 : nums.length);
    if (full && (rWords < 2150 || rWords > 2750)) err('reading', `jami so'z soni ${rWords} (mock uchun 2150-2750)`);
    if (!full && (rWords < 650 || rWords > 1000)) err('reading', `passage so'z soni ${rWords} (650-1000 kerak)`);
  }

  // Listening — 4 part (to'liq test) yoki 1 part (bo'lim mashqi); har partda 10 savol
  if (t.listening) {
    const parts = t.listening.parts || [];
    if (parts.length !== 4 && parts.length !== 1) err('listening', `1 yoki 4 ta part kerak, ${parts.length} bor`);
    if (!(t.listening.checkTimeSec >= 0)) err('listening', "checkTimeSec yo'q");
    for (const p of parts) {
      if (!p.source?.mp3) err(`listening.part${p.order}`, "mp3 manbasi yo'q");
      if (!p.transcript || words(p.transcript) < 150) err(`listening.part${p.order}`, 'transkript juda qisqa');
      const n = numbersOf([p]);
      if (n.length !== 10) err(`listening.part${p.order}`, `10 ta savol kerak, ${n.length} bor`);
      checkGroups(`listening.part${p.order}`, p.questionGroups, norm(p.transcript), null, []);
    }
    expectSeq('listening', numbersOf(parts), parts.length * 10);
  }

  // Writing — to'liq testda majburiy, bo'lim mashqida yo'q
  const isFull = t.reading?.passages?.length === 3 && t.listening?.parts?.length === 4;
  if (isFull && !t.writing) err('writing', "to'liq testda Writing bo'limi kerak");
  if (t.writing) {
    const w = t.writing;
    if (!w?.task1?.promptHtml || !w?.task2?.promptHtml) err('writing', "task1/task2 promptHtml bo'sh");
    try {
      const svg = renderChartSvg(w.task1.chart);
      if (!svg.trim().startsWith('<svg')) err('writing.task1', 'grafik SVG bo\'lib chizilmadi');
      for (const s of w.task1.chart.series) if (s.data.length !== w.task1.chart.categories.length) err('writing.task1', `${s.name}: data uzunligi categories bilan mos emas`);
    } catch (e) {
      err('writing.task1', `grafik xatosi: ${e.message}`);
    }
  }
  return errors;
}

/** Barcha kontent fayllari: open-test-N.mjs (series 'open'), reading/reading-N.mjs
 * ('reading'), listening/listening-N.mjs ('listening'). Har bir testga `series` va `n`
 * qo'shiladi. `series` berilsa faqat o'sha seriya yuklanadi. */
export const SERIES_NAMES = ['open', 'reading', 'listening', 'reading-full', 'listening-full'];

export async function loadOpenTests(series) {
  const SERIES = [
    { name: 'open', dir: DIR, re: /^open-test-(\d+)\.mjs$/ },
    { name: 'reading', dir: path.join(DIR, 'reading'), re: /^reading-(\d+)\.mjs$/ },
    { name: 'listening', dir: path.join(DIR, 'listening'), re: /^listening-(\d+)\.mjs$/ },
  ];
  // To'liq (40 savol) testlar bo'lim fayllaridan yig'iladi (full/compose.mjs + full/sets.json),
  // shuning uchun ular so'ralganda manba bo'limlar ham yuklanadi.
  const wantFull = !series || series.endsWith('-full');
  const sectionSeries = series?.endsWith('-full') ? series.replace(/-full$/, '') : series;
  const out = [];
  const sections = [];
  for (const s of SERIES) {
    const wanted = !series || s.name === series;
    if (!wanted && s.name !== sectionSeries) continue;
    if (!existsSync(s.dir)) continue;
    const files = readdirSync(s.dir).map((f) => s.re.exec(f)).filter(Boolean).sort((a, b) => Number(a[1]) - Number(b[1]));
    for (const m of files) {
      const t = (await import(pathToFileURL(path.join(s.dir, m[0])).href)).default;
      const entry = { ...t, series: s.name, n: Number(m[1]) };
      if (wanted) out.push(entry);
      if (s.name !== 'open') sections.push(entry);
    }
  }
  if (wantFull) {
    const setsFile = path.join(DIR, 'full', 'sets.json');
    if (existsSync(setsFile)) {
      const { composeAll } = await import('./full/compose.mjs');
      const sets = JSON.parse(readFileSync(setsFile, 'utf8'));
      for (const t of composeAll(sets, sections, series)) out.push(t);
    }
  }
  return out;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const series = (process.argv.find((a) => a.startsWith('--series=')) || '').split('=')[1] || undefined;
  const tests = await loadOpenTests(series);
  let total = 0;
  const slugs = new Set();
  for (const t of tests) {
    const e = verifyOpenTest(t);
    if (slugs.has(t.slug)) e.push(`${t.slug}: slug takrorlangan`);
    slugs.add(t.slug);
    const expected = t.series === 'open' ? `vocably-open-test-${t.n}` : `vocably-${t.series}-${t.n}`;
    if (t.slug !== expected) e.push(`${t.slug}: slug fayl nomiga mos emas (${expected} kutilgan)`);
    total += e.length;
    console.log(`${e.length ? '✗' : '✓'} ${t.slug}${e.length ? ` — ${e.length} xato` : ''}`);
    e.forEach((x) => console.log('   ', x));
  }
  console.log(`\n${tests.length} ta test, ${total} ta xato`);
  if (total) process.exit(1);
}
