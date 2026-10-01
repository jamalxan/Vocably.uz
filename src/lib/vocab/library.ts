// Global lug'at kutubxonasi (TZ §4, §29–§32): yozuv validatsiyasi, kontent holat mashinasi, CSV import/export,
// foydalanuvchi so'ziga aylantirish. Sof mantiq (I/O yo'q) — Mongo qatlami `server/libraryService.js` da.

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const POS_VALUES = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'phrasal_verb'] as const;
export const REGISTERS = ['formal', 'neutral', 'informal', 'academic'] as const;

/** TZ §29 — kontent holatlari. */
export const CONTENT_STATUSES = ['DRAFT', 'AI_GENERATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

const TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'APPROVED', 'ARCHIVED'],
  AI_GENERATED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'UNDER_REVIEW', 'ARCHIVED'],
  REJECTED: ['DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'UNDER_REVIEW'],
  ARCHIVED: ['DRAFT'],
};

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return (TRANSITIONS[from] || []).includes(to);
}

export interface LibraryExample {
  en: string;
  uz?: string;
}

export interface LibraryEntryInput {
  word: string;
  lemma?: string;
  pos?: string;
  cefr?: string;
  ieltsRelevance?: number; // 0..3
  translationUz?: string;
  translationRu?: string;
  shortDefinition?: string;
  detailedDefinition?: string;
  ipaUk?: string;
  ipaUs?: string;
  audioUk?: string;
  audioUs?: string;
  imageUrl?: string;
  examples?: LibraryExample[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  commonMistakes?: string[];
  usageNotes?: string;
  register?: string;
  topicTags?: string[];
  source?: string;
}

export interface NormalizedEntry extends Required<Omit<LibraryEntryInput, 'examples'>> {
  normalizedWord: string;
  examples: LibraryExample[];
}

const MAX_LIST = 20;

export function normalizeWordKey(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function strList(v: unknown, maxItem = 80): string[] {
  const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[;|]/) : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of arr) {
    const s = str(x, maxItem);
    const k = s.toLowerCase();
    if (s && !seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
    if (out.length >= MAX_LIST) break;
  }
  return out;
}

function exampleList(v: unknown): LibraryExample[] {
  const arr = Array.isArray(v) ? v : [];
  const out: LibraryExample[] = [];
  for (const x of arr) {
    const en = typeof x === 'string' ? str(x, 300) : str((x as any)?.en, 300);
    if (!en) continue;
    out.push({ en, uz: typeof x === 'string' ? '' : str((x as any)?.uz, 300) });
    if (out.length >= 10) break;
  }
  return out;
}

const safeUrl = (v: unknown): string => {
  const s = str(v, 500);
  return /^(https?:\/\/|\/)/i.test(s) ? s : '';
};

/**
 * Kiruvchi ma'lumotni tozalaydi va tekshiradi. Xatolar ro'yxati bo'sh bo'lsa yozuv yaroqli.
 * Nashr qilish uchun qo'shimcha talablar `publishProblems` da.
 */
export function normalizeEntry(input: LibraryEntryInput): { entry: NormalizedEntry; errors: string[] } {
  const errors: string[] = [];
  const word = str(input?.word, 80);
  if (!word) errors.push("So'z (word) majburiy");
  const pos = str(input?.pos, 20).toLowerCase().replace(/\s+/g, '_');
  if (pos && !(POS_VALUES as readonly string[]).includes(pos)) errors.push(`Noto'g'ri turkum: ${pos}`);
  const cefr = str(input?.cefr, 3).toUpperCase();
  if (cefr && !(CEFR_LEVELS as readonly string[]).includes(cefr)) errors.push(`Noto'g'ri CEFR: ${cefr}`);
  const register = str(input?.register, 20).toLowerCase();
  if (register && !(REGISTERS as readonly string[]).includes(register)) errors.push(`Noto'g'ri register: ${register}`);
  const rel = Number(input?.ieltsRelevance ?? 0);
  if (!Number.isFinite(rel) || rel < 0 || rel > 3) errors.push('ieltsRelevance 0–3 oralig‘ida bo‘lishi kerak');

  const entry: NormalizedEntry = {
    word,
    normalizedWord: normalizeWordKey(word),
    lemma: str(input?.lemma, 80) || word,
    pos,
    cefr,
    ieltsRelevance: Number.isFinite(rel) ? Math.max(0, Math.min(3, Math.round(rel))) : 0,
    translationUz: str(input?.translationUz, 200),
    translationRu: str(input?.translationRu, 200),
    shortDefinition: str(input?.shortDefinition, 300),
    detailedDefinition: str(input?.detailedDefinition, 1000),
    ipaUk: str(input?.ipaUk, 80),
    ipaUs: str(input?.ipaUs, 80),
    audioUk: safeUrl(input?.audioUk),
    audioUs: safeUrl(input?.audioUs),
    imageUrl: safeUrl(input?.imageUrl),
    examples: exampleList(input?.examples),
    synonyms: strList(input?.synonyms),
    antonyms: strList(input?.antonyms),
    collocations: strList(input?.collocations, 120),
    commonMistakes: strList(input?.commonMistakes, 200),
    usageNotes: str(input?.usageNotes, 500),
    register,
    topicTags: strList(input?.topicTags, 40).map((t) => t.toLowerCase()),
    source: str(input?.source, 120),
  };
  return { entry, errors };
}

/** Nashr (PUBLISHED) uchun minimal sifat talablari (TZ §4.3: AI kontent tasdiqlanmaguncha pool'ga tushmaydi). */
export function publishProblems(
  e: Pick<NormalizedEntry, 'word' | 'translationUz' | 'shortDefinition' | 'examples' | 'cefr'>,
  meta: { aiGenerated?: boolean; verifiedByAdmin?: boolean } = {}
): string[] {
  const p: string[] = [];
  if (!e.word) p.push("So'z yo'q");
  if (!e.translationUz) p.push("O'zbekcha tarjima yo'q");
  if (!e.shortDefinition) p.push("Qisqa ta'rif yo'q");
  if (e.examples.length < 1) p.push('Kamida 1 ta misol kerak');
  if (!e.cefr) p.push('CEFR darajasi belgilanmagan');
  if (meta.aiGenerated && !meta.verifiedByAdmin) p.push('AI yaratgan kontent admin tomonidan tasdiqlanmagan');
  return p;
}

// ---------------------------------------------------------------- CSV

/** RFC4180-ga yaqin parser: qo'shtirnoq, ichki vergul/yangi qator, "" escape, BOM, CRLF. */
export function parseCsv(text: string): string[][] {
  const src = String(text || '').replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQ = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

export const CSV_COLUMNS = [
  'word',
  'lemma',
  'pos',
  'cefr',
  'ieltsRelevance',
  'translationUz',
  'translationRu',
  'shortDefinition',
  'detailedDefinition',
  'ipaUk',
  'ipaUs',
  'examples',
  'synonyms',
  'antonyms',
  'collocations',
  'commonMistakes',
  'usageNotes',
  'register',
  'topicTags',
  'source',
] as const;

const LIST_COLS = new Set(['synonyms', 'antonyms', 'collocations', 'commonMistakes', 'topicTags']);

/** CSV -> yozuvlar. Sarlavha qatori majburiy; noma'lum ustunlar e'tiborsiz. `examples` ustuni: "en|uz;en2|uz2". */
export function csvToInputs(text: string, maxRows = 2000): { rows: { line: number; input: LibraryEntryInput }[]; errors: string[] } {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length < 2) return { rows: [], errors: ["CSV bo'sh yoki faqat sarlavha"] };
  const header = table[0].map((h) => h.trim());
  if (!header.includes('word')) return { rows: [], errors: ["'word' ustuni topilmadi"] };
  if (table.length - 1 > maxRows) errors.push(`Qatorlar ko'p (maks ${maxRows}); birinchi ${maxRows} tasi o'qildi`);
  const rows: { line: number; input: LibraryEntryInput }[] = [];
  for (let r = 1; r < Math.min(table.length, maxRows + 1); r++) {
    const obj: Record<string, any> = {};
    header.forEach((h, i) => {
      if (!(CSV_COLUMNS as readonly string[]).includes(h)) return;
      const v = (table[r][i] ?? '').trim();
      if (h === 'examples') {
        obj.examples = v
          .split(';')
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => {
            const [en, uz] = p.split('|');
            return { en: (en || '').trim(), uz: (uz || '').trim() };
          });
      } else if (LIST_COLS.has(h)) obj[h] = v ? v.split(/[;|]/).map((x) => x.trim()) : [];
      else if (h === 'ieltsRelevance') obj[h] = v === '' ? 0 : Number(v);
      else obj[h] = v;
    });
    rows.push({ line: r + 1, input: obj as LibraryEntryInput });
  }
  return { rows, errors };
}

function csvCell(v: string): string {
  // CSV-injection'dan himoya: formula belgilari bilan boshlansa apostrof qo'shamiz.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function entriesToCsv(entries: Partial<NormalizedEntry>[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const e of entries) {
    const cells = CSV_COLUMNS.map((c) => {
      const v: any = (e as any)[c];
      if (c === 'examples') return csvCell((v || []).map((x: LibraryExample) => (x.uz ? `${x.en}|${x.uz}` : x.en)).join(';'));
      if (Array.isArray(v)) return csvCell(v.join(';'));
      return csvCell(v == null ? '' : String(v));
    });
    lines.push(cells.join(','));
  }
  return lines.join('\r\n');
}

// ---------------------------------------------------------------- foydalanuvchi so'ziga aylantirish

/**
 * Kutubxona yozuvi -> `User.categories[].words[]` elementi (WordSchema shakli).
 * `syns` — o'zbekcha tarjima(lar) (mavjud konventsiya), `synonymsEn` — inglizcha sinonimlar.
 */
export function toUserWord(e: NormalizedEntry | (Partial<NormalizedEntry> & { word: string })) {
  const syns = String(e.translationUz || '')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pos = (POS_VALUES as readonly string[]).includes(e.pos || '') ? e.pos : '';
  return {
    word: e.word,
    syns,
    pronunciation: e.ipaUk || e.ipaUs || '',
    enrichment: {
      pos,
      definitionEn: e.shortDefinition || '',
      definitionUz: '',
      examples: (e.examples || []).map((x) => ({ en: x.en, uz: x.uz || '' })),
      collocations: e.collocations || [],
      synonymsEn: e.synonyms || [],
      antonyms: e.antonyms || [],
      cefr: e.cefr || '',
      register: e.register || '',
      topics: e.topicTags || [],
      commonMistakes: e.commonMistakes || [],
      audioUrl: { uk: e.audioUk || '', us: e.audioUs || '' },
      imageUrl: e.imageUrl || '',
    },
  };
}
