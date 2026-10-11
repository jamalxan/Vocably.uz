// "Vocably Open Test" kontenti uchun umumiy yordamchilar. Bu testlarning MATNI va
// AUDIOSI ochiq litsenziyali internet manbalaridan olingan (savollar, javob
// kalitlari va Writing topshiriqlari esa Vocably uchun yozilgan):
//   - Reading  — Wikipedia maqolalaridan parchalar (CC BY-SA 4.0), sources/wiki/*.json
//   - Listening — VOA Learning English audio + transkript (AQSh hukumati asari,
//                 public domain), sources/voa/*.json; faqat VOA xodimlari yozgan
//                 hikoyalar olingan (AP/Reuters/AFP materiallari ATAYLAB chiqarilgan)
//   - Writing Task 1 — Our World in Data grafik ma'lumotlari (CC BY 4.0)
// Manba fayllarini qayta yaratish/yangilash: scripts/content/open/README.md.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export { q, table, TFNG_INSTRUCTION, YNNG_INSTRUCTION } from '../_html.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function wikiSource(slug) {
  return JSON.parse(readFileSync(path.join(DIR, 'sources', 'wiki', `${slug}.json`), 'utf8'));
}

export function voaSource(key) {
  return JSON.parse(readFileSync(path.join(DIR, 'sources', 'voa', `${key}.json`), 'utf8'));
}

/** Wikipedia parchasidan Reading passage: paragraflar A, B, C... yorlig'i bilan,
 * subtitle'da CC BY-SA talab qiladigan atributsiya (muallif = Wikipedia
 * hissachilari, manba revision havolasi, litsenziya, "adapted" belgisi). */
export function wikiPassage({ order, slug, title, from, to, questionGroups }) {
  const src = wikiSource(slug);
  return {
    order,
    title,
    subtitle: `Read the text and answer questions ${from}-${to}. Adapted from the Wikipedia article "${src.article}" (${src.url}) by Wikipedia contributors, licensed under CC BY-SA 4.0.`,
    paragraphs: src.paragraphs.map((p) => ({ label: p.label, html: `<p>${esc(p.text)}</p>` })),
    questionGroups,
    source: { kind: 'wikipedia', slug, article: src.article, url: src.url, revid: src.revid, licence: src.licence },
  };
}

/** VOA hikoyasidan Listening part. `transcript` — audio matni (natija ekranida
 * ko'rsatiladi), `source.mp3` — yuklovchi skript shu fayldan siqilgan nusxa
 * yasab GridFS'ga joylaydi. */
export function voaPart({ order, key, contextText, questionGroups }) {
  const src = voaSource(key);
  return {
    order,
    contextText: `${contextText} (Audio: VOA Learning English, "${src.title}", public domain.)`,
    gapAfterSec: 30,
    transcript: src.paragraphs.join('\n\n'),
    questionGroups,
    source: { kind: 'voa', key, title: src.title, url: src.url, mp3: src.mp3, licence: src.licence, credit: src.credit },
  };
}

export const OWID_NOTE = 'Source: Our World in Data (ourworldindata.org), CC BY 4.0.';
