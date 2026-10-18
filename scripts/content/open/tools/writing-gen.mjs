// Writing seriyasi generatori: Our World in Data (CC BY 4.0) CSV'laridan haqiqiy qiymatlarni
// olib scripts/content/open/writing/writing-N.mjs fayllarini yozadi (raqamlar qo'lda yozilmaydi).
//   node scripts/content/open/tools/writing-gen.mjs        (CSV kesh: .local-scratch/owid/<slug>.csv)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'writing');
export const CACHE = path.join(process.cwd(), '.local-scratch', 'owid');
const NOTE = 'Source: Our World in Data (ourworldindata.org), CC BY 4.0.';

function parseCsv(text) {
  const out = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); out.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); out.push(row); }
  return out;
}

// entity -> (year -> value); to'rtinchi ustun = asosiy ko'rsatkich
export async function owidTable(slug) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, `${slug}.csv`);
  if (!fs.existsSync(f)) {
    const r = await fetch(`https://ourworldindata.org/grapher/${slug}.csv?v=1&csvType=full&useColumnShortNames=false`);
    if (!r.ok) throw new Error(`${slug}: HTTP ${r.status}`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  const rows = parseCsv(fs.readFileSync(f, 'utf8'));
  rows.shift();
  const map = new Map();
  for (const r of rows) {
    const v = parseFloat(r[3]);
    if (!Number.isFinite(v)) continue;
    if (!map.has(r[0])) map.set(r[0], new Map());
    map.get(r[0]).set(Number(r[2]), v);
  }
  return { map };
}

const POOLS = [
  ['United Kingdom', 'China', 'Uzbekistan', 'India', 'Nigeria', 'Brazil', 'Japan', 'Germany'],
  ['United States', 'Kazakhstan', 'France', 'Egypt', 'Indonesia', 'Australia', 'Turkey', 'Mexico'],
];
const L = (a, b, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);

// d: dataset · m: sarlavha · u: birlik · p: promptdagi ibora · dp: kasr xonalari
export const DS = [
  { d: 'life-expectancy', m: 'Life expectancy at birth (years)', u: 'years', p: 'average life expectancy at birth', dp: 1 },
  { d: 'co-emissions-per-capita', m: 'CO₂ emissions per person (tonnes)', u: 'tonnes', p: 'carbon dioxide emissions per person, in tonnes', dp: 1 },
  { d: 'share-electricity-renewables', m: 'Share of electricity from renewables (%)', u: '%', p: 'the percentage of electricity generated from renewable sources', dp: 1 },
  { d: 'share-of-population-urban', m: 'Share of the population living in urban areas (%)', u: '%', p: 'the percentage of the population living in urban areas', dp: 1 },
  { d: 'share-of-individuals-using-the-internet', m: 'Share of the population using the Internet (%)', u: '%', p: 'the percentage of the population using the Internet', dp: 1 },
  { d: 'mobile-cellular-subscriptions-per-100-people', m: 'Mobile phone subscriptions per 100 people', u: 'per 100 people', p: 'the number of mobile phone subscriptions per 100 people', dp: 1 },
  { d: 'children-per-woman-un', m: 'Children per woman (fertility rate)', u: 'children per woman', p: 'the average number of children born per woman', dp: 2 },
  { d: 'child-mortality', m: 'Child deaths before age five (% of children born)', u: '%', p: 'the percentage of children who die before their fifth birthday', dp: 1 },
  { d: 'gdp-per-capita-worldbank', m: 'GDP per person (international dollars)', u: 'international $', p: 'gross domestic product (GDP) per person, in international dollars adjusted for inflation and price differences', dp: 0 },
  { d: 'meat-supply-per-person', m: 'Meat supply per person (kg per year)', u: 'kg per year', p: 'the amount of meat available per person, in kilograms per year', dp: 1 },
  { d: 'share-of-the-population-with-access-to-electricity', m: 'Share of the population with access to electricity (%)', u: '%', p: 'the percentage of the population with access to electricity', dp: 1 },
  { d: 'forest-area-as-share-of-land-area', m: 'Share of land covered by forest (%)', u: '%', p: 'the percentage of the land area covered by forest', dp: 1 },
  { d: 'per-capita-energy-use', m: 'Energy use per person (kWh)', u: 'kWh', p: 'primary energy use per person, in kilowatt-hours', dp: 0 },
  { d: 'literacy-rate-adults', m: 'Adult literacy rate (%)', u: '%', p: 'the adult literacy rate', dp: 1 },
  { d: 'daily-per-capita-caloric-supply', m: 'Daily calorie supply per person (kcal)', u: 'kcal', p: 'the daily food supply per person, in kilocalories', dp: 0 },
  { d: 'fish-and-seafood-consumption-per-capita', m: 'Fish and seafood supply per person (kg per year)', u: 'kg per year', p: 'the amount of fish and seafood available per person, in kilograms per year', dp: 1 },
  { d: 'per-capita-electricity-generation', m: 'Electricity generated per person (kWh)', u: 'kWh', p: 'electricity generated per person, in kilowatt-hours', dp: 0 },
  { d: 'share-of-women-in-parliament', m: 'Women in the national parliament (% of seats)', u: '%', p: 'the percentage of parliamentary seats held by women', dp: 1 },
  { d: 'mean-years-of-schooling', m: 'Average years of schooling', u: 'years', p: 'the average number of years of schooling received by adults', dp: 1 },
  { d: 'per-capita-co2-transport', m: 'Transport CO₂ emissions per person (tonnes)', u: 'tonnes', p: 'carbon dioxide emissions from transport per person, in tonnes', dp: 2 },
  { d: 'vegetable-consumption-per-capita', m: 'Vegetable supply per person (kg per year)', u: 'kg per year', p: 'the amount of vegetables available per person, in kilograms per year', dp: 1 },
];

// Har dataset uchun 2 variant
const VARIANTS = [
  { chart: 'line', years: L(2000, 2020, 4), pool: 0 },
  { chart: 'bar', years: [1990, 2000, 2010, 2020], pool: 1 },
];

export const TASK2 = [
  ['opinion', 'Some people think that children should start learning a foreign language at primary school, while others believe it is better to wait until secondary school.<br>Discuss both views and give your own opinion.'],
  ['opinion', 'Many people believe that governments should spend more money on public transport than on building new roads.<br>To what extent do you agree or disagree?'],
  ['advdis', 'More and more people are choosing to work from home instead of going to an office.<br>Do the advantages of this trend outweigh the disadvantages?'],
  ['problem', 'In many cities, traffic congestion is getting worse every year.<br>What are the causes of this problem, and what measures could be taken to solve it?'],
  ['two', 'Nowadays many young people spend a lot of their free time on social media.<br>Why is this the case? Is it a positive or negative development?'],
  ['opinion', 'Some people say that university education should be free for everyone, whereas others believe students should pay for it.<br>Discuss both views and give your own opinion.'],
  ['opinion', 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better alternatives.<br>Discuss both views and give your own opinion.'],
  ['problem', 'Many people today do not take enough physical exercise, and rates of obesity are rising.<br>What are the reasons for this, and what can be done to improve the situation?'],
  ['advdis', 'An increasing number of people travel abroad on holiday every year.<br>Do the benefits of international tourism outweigh the drawbacks for local communities?'],
  ['opinion', 'Some people think that online learning is as effective as studying in a classroom. Others disagree.<br>To what extent do you agree or disagree?'],
  ['opinion', 'Some people believe that it is the responsibility of the government to protect the environment, while others think individuals should take action.<br>Discuss both views and give your own opinion.'],
  ['two', 'In some countries, a growing number of people are choosing to live alone.<br>What are the reasons for this trend, and is it a positive or negative development?'],
  ['opinion', 'It is often said that children spend too much time using screens such as phones, tablets and computers.<br>To what extent do you agree or disagree that parents should strictly limit screen time?'],
  ['problem', 'Many young people find it difficult to find a job after finishing their studies.<br>What are the causes of youth unemployment, and what can be done about it?'],
  ['opinion', 'Some people think that museums and art galleries should be free to enter. Others believe visitors should pay.<br>Discuss both views and give your own opinion.'],
  ['advdis', 'Many companies now use artificial intelligence to carry out tasks that were once done by people.<br>Do the advantages of this development outweigh the disadvantages?'],
  ['opinion', 'Some people say that cities should have more green spaces such as parks, even if this means fewer buildings.<br>To what extent do you agree or disagree?'],
  ['two', 'Fast food is becoming more popular around the world, and traditional home cooking is declining.<br>Why is this happening? What effects will it have on people and society?'],
  ['opinion', 'Some people believe that students should learn practical skills such as cooking and managing money at school, rather than only academic subjects.<br>Discuss both views and give your own opinion.'],
  ['problem', 'The world’s population is growing quickly, and many cities are becoming overcrowded.<br>What problems does this cause, and what solutions can you suggest?'],
  ['opinion', 'Some people think that reading books for pleasure is a waste of time in the digital age.<br>To what extent do you agree or disagree?'],
  ['advdis', 'In many countries, people are now living longer than in the past.<br>Do the advantages of an ageing population outweigh the disadvantages?'],
  ['opinion', 'Some parents believe that competitive sports are good for children, while others think they put too much pressure on them.<br>Discuss both views and give your own opinion.'],
  ['two', 'Many people now buy their goods online rather than in local shops.<br>What are the reasons for this, and what effect might it have on town centres?'],
  ['opinion', 'Some people believe that advertising has a negative effect on society, especially on young people.<br>To what extent do you agree or disagree?'],
  ['problem', 'Plastic waste is damaging the oceans and wildlife all over the world.<br>What are the main causes of this problem, and what can governments and individuals do to reduce it?'],
  ['opinion', 'Some people think that employees should be paid according to the results they achieve, rather than the hours they work.<br>Do you agree or disagree?'],
  ['advdis', 'More students are choosing to study abroad rather than at universities in their own country.<br>Do the advantages of studying abroad outweigh the disadvantages?'],
  ['opinion', 'Some people say that the traditional culture of a country is being lost because of globalisation.<br>Discuss both views and give your own opinion on whether this is a problem.'],
  ['two', 'In many countries, fewer young people are interested in learning traditional crafts and skills.<br>Why do you think this is happening, and is it a problem?'],
  ['opinion', 'Some people believe that doctors should spend more time on preventing illness than on treating it.<br>To what extent do you agree or disagree?'],
  ['problem', 'Noise pollution is a serious problem in many large cities.<br>What are the main causes, and what measures could be taken to reduce it?'],
  ['opinion', 'Some people think that team sports teach children more valuable life skills than individual sports.<br>Do you agree or disagree?'],
  ['advdis', 'Many people now prefer to pay by card or phone instead of using cash.<br>Do the advantages of a cashless society outweigh the disadvantages?'],
  ['opinion', 'Some people believe that students learn better when they are taught in small classes, while others feel that class size makes little difference.<br>Discuss both views and give your own opinion.'],
  ['two', 'Some people choose to spend their whole career with one company, while others change jobs frequently.<br>What are the advantages of each approach? Which do you prefer?'],
  ['opinion', 'Some people argue that international sporting events such as the Olympic Games bring great benefits to the host country. Others say they are too expensive.<br>Discuss both views and give your own opinion.'],
  ['problem', 'In many countries, a large amount of food is wasted every day by shops, restaurants and households.<br>Why does this happen, and what can be done to reduce food waste?'],
  ['opinion', 'Some people believe that everyone should learn how to use computers and programming from a young age.<br>To what extent do you agree or disagree?'],
  ['advdis', 'Many cities are encouraging people to use bicycles instead of cars.<br>Do the advantages of this policy outweigh the disadvantages?'],
];

const have = (table, years, c) => table.map.has(c) && years.every((y) => table.map.get(c).has(y));

export async function build() {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  const report = [];
  for (const ds of DS) {
    const table = await owidTable(ds.d);
    const worldYears = [...(table.map.get('World')?.keys() || [])];
    const lastYear = worldYears.length ? Math.max(...worldYears) : 2020;
    for (const v of VARIANTS) {
      if (n >= TASK2.length) break;
      const all = [...new Set([...POOLS[v.pool], ...POOLS[1 - v.pool]])];
      // yillar: avval standart, bo'lmasa oxirgi mavjud yilga siljitilgan
      const shifts = [0, ...(lastYear < 2020 ? [lastYear - 2020] : []), -3, -6];
      let years = null, countries = [];
      for (const s of shifts) {
        const ys = v.years.map((y) => y + s);
        const cs = all.filter((c) => have(table, ys, c)).slice(0, 4);
        if (cs.length >= 3) { years = ys; countries = cs; break; }
      }
      if (!years) { report.push(`SKIP ${ds.d} ${v.chart}`); continue; }
      n += 1;
      const chart = {
        chartType: v.chart, title: ds.m, unit: ds.u, categories: years.map(String), xAxisLabel: 'Year', yAxisLabel: ds.u,
        series: countries.map((c) => ({ name: c, data: years.map((y) => Number(table.map.get(c).get(y).toFixed(ds.dp))) })),
      };
      const the = (c) => (c === 'United Kingdom' || c === 'United States' ? `the ${c}` : c);
      const cn = countries.map(the);
      const names = `${cn.slice(0, -1).join(', ')} and ${cn[cn.length - 1]}`;
      const kind = v.chart === 'line' ? 'graph' : 'bar chart';
      const [type, t2] = TASK2[n - 1];
      const test = {
        slug: `vocably-writing-${n}`,
        title: `Writing ${n}: ${ds.m.replace(/ \(.*\)$/, '')}`,
        difficulty: n % 3 === 0 ? 'hard' : 'medium',
        dataset: ds.d,
        task2Type: type,
        writing: {
          durationSec: 3600,
          task1: {
            order: 1, minWords: 150, recommendedMin: 20,
            promptHtml: `<p>The ${kind} below shows ${ds.p} in ${names} between ${years[0]} and ${years[years.length - 1]}.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>${NOTE}</em></p>`,
            chart,
            source: { kind: 'owid', dataset: ds.d, url: `https://ourworldindata.org/grapher/${ds.d}`, licence: 'CC BY 4.0' },
          },
          task2: { order: 2, minWords: 250, recommendedMin: 40, promptHtml: `<p>${t2.replace('<br>', '</p><p>')}</p>` },
        },
      };
      const file = `// Vocably Writing ${n} — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.\n` +
        `// Task 2 mavzusi (${type}) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs\n` +
        `export default ${JSON.stringify(test, null, 2)};\n`;
      fs.writeFileSync(path.join(OUT, `writing-${n}.mjs`), file);
      report.push(`writing-${n}: ${ds.d} ${v.chart} ${years[0]}–${years[years.length - 1]} ${countries.join('/')}`);
    }
  }
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log((await build()).join('\n'));
}
