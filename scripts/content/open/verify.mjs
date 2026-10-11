// Open Test kontentini YUKLASHDAN OLDIN qat'iy tekshiradi — javob kalitlaridagi
// xatolar (manbada yo'q javob, so'z limitidan oshgan javob, variantlarda yo'q
// harf, noto'g'ri raqamlash) foydalanuvchiga "to'g'ri javobim xato deb
// hisoblandi" bo'lib chiqmasligi uchun. Har bir izohdagi qo'shtirnoqli dalil
// manba matnida (locatorParagraph bo'lsa — aynan o'sha paragrafda) so'zma-so'z
// borligi ham tekshiriladi, ya'ni izoh to'qib chiqarilmagan.
//   node scripts/content/open/verify.mjs            # barcha open-test-N.mjs
import { readdirSync } from 'node:fs';
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
  const expectSeq = (label, nums) => {
    const want = Array.from({ length: 40 }, (_, i) => i + 1);
    if (nums.length !== 40 || nums.some((n, i) => n !== want[i])) err(label, `savol raqamlari 1-40 ketma-ket emas: ${nums.join(',')}`);
  };

  // Reading
  const passages = t.reading?.passages || [];
  if (passages.length !== 3) err('reading', `3 ta passage kerak, ${passages.length} bor`);
  let rWords = 0;
  for (const p of passages) {
    const paraMap = Object.fromEntries(p.paragraphs.map((x) => [x.label, norm(x.html)]));
    const all = norm(p.paragraphs.map((x) => x.html).join(' '));
    rWords += words(p.paragraphs.map((x) => x.html.replace(/<[^>]+>/g, ' ')).join(' '));
    const nums = numbersOf([p]);
    if (!p.subtitle?.includes(`questions ${nums[0]}-${nums[nums.length - 1]}`)) err(`reading.p${p.order}`, `subtitle raqamlari (${nums[0]}-${nums[nums.length - 1]}) mos emas`);
    checkGroups(`reading.p${p.order}`, p.questionGroups, all, paraMap, p.paragraphs.map((x) => x.label));
  }
  expectSeq('reading', numbersOf(passages));
  if (rWords < 2150 || rWords > 2750) err('reading', `jami so'z soni ${rWords} (mock uchun 2150-2750)`);

  // Listening
  const parts = t.listening?.parts || [];
  if (parts.length !== 4) err('listening', `4 ta part kerak, ${parts.length} bor`);
  for (const p of parts) {
    if (!p.source?.mp3) err(`listening.part${p.order}`, "mp3 manbasi yo'q");
    if (!p.transcript || words(p.transcript) < 150) err(`listening.part${p.order}`, 'transkript juda qisqa');
    const n = numbersOf([p]);
    if (n.length !== 10) err(`listening.part${p.order}`, `10 ta savol kerak, ${n.length} bor`);
    checkGroups(`listening.part${p.order}`, p.questionGroups, norm(p.transcript), null, []);
  }
  expectSeq('listening', numbersOf(parts));

  // Writing
  const w = t.writing;
  if (!w?.task1?.promptHtml || !w?.task2?.promptHtml) err('writing', "task1/task2 promptHtml bo'sh");
  try {
    const svg = renderChartSvg(w.task1.chart);
    if (!svg.trim().startsWith('<svg')) err('writing.task1', 'grafik SVG bo\'lib chizilmadi');
    for (const s of w.task1.chart.series) if (s.data.length !== w.task1.chart.categories.length) err('writing.task1', `${s.name}: data uzunligi categories bilan mos emas`);
  } catch (e) {
    err('writing.task1', `grafik xatosi: ${e.message}`);
  }
  return errors;
}

export async function loadOpenTests() {
  const files = readdirSync(DIR)
    .map((f) => /^open-test-(\d+)\.mjs$/.exec(f))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  const out = [];
  for (const m of files) out.push((await import(pathToFileURL(path.join(DIR, m[0])).href)).default);
  return out;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const tests = await loadOpenTests();
  let total = 0;
  for (const t of tests) {
    const e = verifyOpenTest(t);
    total += e.length;
    console.log(`${e.length ? '✗' : '✓'} ${t.slug}${e.length ? ` — ${e.length} xato` : ''}`);
    e.forEach((x) => console.log('   ', x));
  }
  if (total) process.exit(1);
}
