// Lug'at qidiruvi (TZ §53): so'z, tarjima, ta'rif, sinonim, kolokatsiya va misol bo'yicha; CEFR/turkum/holat filtrlari.
// Aniq moslik > prefiks > ichida > ta'rif/misol; apostrof va registr farqi e'tiborga olinmaydi.
import type { SelectableWord } from './selection';
import { statusForScore } from './mastery';

export interface SearchFilters {
  cefr?: string;
  pos?: string;
  status?: string;
  weakOnly?: boolean;
  categoryId?: string;
}

export interface SearchHit {
  word: SelectableWord;
  score: number;
  matchedIn: 'word' | 'translation' | 'synonym' | 'definition' | 'collocation' | 'example';
}

export function normalizeQuery(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function rank(hay: string, q: string): number {
  if (!hay) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.split(/[\s,;/-]+/).some((t) => t === q)) return 70;
  if (hay.includes(q)) return 50;
  return 0;
}

export function searchWords(words: SelectableWord[], rawQuery: string, filters: SearchFilters = {}, limit = 50): SearchHit[] {
  const q = normalizeQuery(rawQuery || '');
  const hits: SearchHit[] = [];
  for (const w of words) {
    if (filters.categoryId && w.categoryId !== filters.categoryId) continue;
    if (filters.cefr && (w.cefr || '').toUpperCase() !== filters.cefr.toUpperCase()) continue;
    if (filters.pos && (w.pos || '').toLowerCase() !== filters.pos.toLowerCase()) continue;
    if (filters.status && statusForScore(w.mastery ?? 0) !== filters.status) continue;
    if (filters.weakOnly && !((w.weakness || 0) >= 40 || w.isLeech)) continue;

    if (!q) {
      hits.push({ word: w, score: 0, matchedIn: 'word' });
      continue;
    }
    const candidates: Array<[SearchHit['matchedIn'], number]> = [
      ['word', rank(normalizeQuery(w.word), q)],
      ['translation', Math.max(0, ...(w.translations || []).map((t) => rank(normalizeQuery(t), q))) * 0.9],
      ['synonym', Math.max(0, ...(w.synonymsEn || []).map((t) => rank(normalizeQuery(t), q))) * 0.6],
      ['collocation', Math.max(0, ...(w.collocations || []).map((t) => rank(normalizeQuery(t), q))) * 0.5],
      ['definition', rank(normalizeQuery(w.definitionEn || ''), q) > 0 ? 25 : 0],
      ['example', (w.examples || []).some((e) => normalizeQuery(e.en || '').includes(q)) ? 15 : 0],
    ];
    let best: [SearchHit['matchedIn'], number] = ['word', 0];
    for (const c of candidates) if (c[1] > best[1]) best = c;
    if (best[1] > 0) hits.push({ word: w, score: best[1], matchedIn: best[0] });
  }
  hits.sort((a, b) => b.score - a.score || a.word.word.localeCompare(b.word.word));
  return hits.slice(0, limit);
}
