// AI Content Factory (TZ §29): hujjat matni -> bo'laklar -> nomzod so'zlar -> AI boyitish -> tekshiruv.
// Sof mantiq (I/O yo'q). Asosiy xavfsizlik g'oyasi: AI faqat BIZ bergan nomzodlar ichidan tanlaydi va
// qaytargan har bir so'z haqiqatan bo'lakda uchrashi tekshiriladi (gallyutsinatsiyaga qarshi). Natija
// hech qachon to'g'ridan-to'g'ri nashr qilinmaydi — AI_GENERATED holatida inson ko'rib chiqishiga tushadi.
import { findWordInSentence } from './games';
import { lemmaCandidates, normalizeToken, tokenize } from './wordForms';
import { CEFR_LEVELS, normalizeEntry, type LibraryEntryInput } from './library';

export const FACTORY_PROMPT_VERSION = 'vocab_factory_v1';

export const FACTORY_LIMITS = {
  /** Bitta job uchun maksimal matn (belgi) — katta kitoblar bo'limlarga bo'lib yuklanadi. */
  maxChars: 400_000,
  maxChunks: 120,
  chunkChars: 3500,
  /** Bitta bo'lakdan olinadigan maksimal so'z. */
  maxWordsPerChunk: 8,
  maxCandidatesPerChunk: 30,
};

// ---------------------------------------------------------------- bo'laklash

/** Matnni abzatslar chegarasi bo'yicha ~maxChars uzunlikdagi bo'laklarga ajratadi (gap o'rtasida kesmaydi). */
export function chunkText(raw: string, maxChars = FACTORY_LIMITS.chunkChars, minChars = 300): string[] {
  const text = String(raw || '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (!text) return [];
  const paragraphs = text.split(/\n{2,}|\n(?=\s*[A-Z0-9•\-–])/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  // Juda uzun abzatsni gaplar bo'yicha bo'lamiz.
  const pieces: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= maxChars) {
      pieces.push(p);
      continue;
    }
    let cur = '';
    for (const s of p.split(/(?<=[.!?])\s+/)) {
      if (s.length > maxChars) {
        if (cur) pieces.push(cur);
        cur = '';
        for (let i = 0; i < s.length; i += maxChars) pieces.push(s.slice(i, i + maxChars));
        continue;
      }
      if ((cur + ' ' + s).trim().length > maxChars) {
        pieces.push(cur);
        cur = s;
      } else cur = (cur + ' ' + s).trim();
    }
    if (cur) pieces.push(cur);
  }
  const chunks: string[] = [];
  let cur = '';
  for (const piece of pieces) {
    if (cur && (cur + '\n\n' + piece).length > maxChars) {
      chunks.push(cur);
      cur = piece;
    } else cur = cur ? `${cur}\n\n${piece}` : piece;
  }
  if (cur) chunks.push(cur);
  // Juda qisqa oxirgi bo'lakni oldingisiga qo'shamiz.
  if (chunks.length > 1 && chunks[chunks.length - 1].length < minChars) {
    const last = chunks.pop() as string;
    chunks[chunks.length - 1] += `\n\n${last}`;
  }
  return chunks;
}

// ---------------------------------------------------------------- nomzodlar

const STOPWORDS = new Set(
  (
    'the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been being has had did does done said made went came took saw may might must shall should very much many such more less each every both few own same too still while where why here again once during before above below between under until against through off down up again further then there'
  ).split(/\s+/)
);

/**
 * Bo'lakdagi o'rganishga arziydigan nomzod so'zlar: stop-so'z emas, kamida 5 harf, kichik harfda ham uchragan
 * (maxsus nomlar chiqarib tashlanadi), allaqachon ma'lum bo'lmagan. Chastota va uzunlik bo'yicha tartiblanadi.
 */
export function selectCandidates(chunk: string, known: Set<string>, limit = FACTORY_LIMITS.maxCandidatesPerChunk): string[] {
  const freq = new Map<string, number>();
  const lowerSeen = new Set<string>();
  const tokens = tokenize(chunk);
  for (const t of tokens) if (t.token === t.token.toLowerCase()) lowerSeen.add(normalizeToken(t.token));
  for (const t of tokens) {
    const k = normalizeToken(t.token);
    if (k.length < 5 || STOPWORDS.has(k) || /['’-]/.test(k) || !lowerSeen.has(k)) continue;
    // Allaqachon ma'lum bo'lsa (asos shakli ham) — o'tkazib yuboramiz.
    if (lemmaCandidates(k).some((l) => known.has(l))) continue;
    freq.set(k, (freq.get(k) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

// ---------------------------------------------------------------- AI so'rovi

export const FACTORY_SCHEMA = {
  type: 'object',
  properties: {
    words: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pos: { type: 'string' },
          cefr: { type: 'string' },
          ieltsRelevance: { type: 'integer' },
          translationUz: { type: 'string' },
          shortDefinition: { type: 'string' },
          ipaUk: { type: 'string' },
          example: { type: 'string' },
          synonyms: { type: 'array', items: { type: 'string' } },
          antonyms: { type: 'array', items: { type: 'string' } },
          collocations: { type: 'array', items: { type: 'string' } },
          topicTags: { type: 'array', items: { type: 'string' } },
        },
        required: ['word', 'pos', 'cefr', 'translationUz', 'shortDefinition', 'example'],
      },
    },
  },
  required: ['words'],
};

export function buildFactoryPrompt(chunk: string, candidates: string[], maxWords = FACTORY_LIMITS.maxWordsPerChunk): string {
  return `Siz IELTS tayyorgarligi uchun lug'at tuzuvchi lingvistsiz. Quyida ingliz tilidagi matn bo'lagi va undan olingan NOMZOD so'zlar ro'yxati berilgan.

VAZIFA: nomzodlar ichidan o'zbek tilida o'rganuvchi uchun (B1–C1) eng foydali, akademik/umumiy ahamiyatli ${maxWords} tagacha so'zni tanlang.
Faqat nomzodlar ro'yxatidan tanlang; so'zni matndagi ma'nosida (kontekstda) izohlang. Maxsus ismlar, juda oddiy yoki juda noyob so'zlarni TANLAMANG.

Har bir so'z uchun:
- word: ro'yxatdagi shaklda (kichik harf)
- pos: noun | verb | adjective | adverb | phrase | idiom | phrasal_verb
- cefr: A1..C2
- ieltsRelevance: 0..3 (IELTS Academic uchun ahamiyati)
- translationUz: 1–3 ta tabiiy o'zbekcha tarjima, ";" bilan ajrating
- shortDefinition: oddiy inglizcha qisqa ta'rif (1 gap)
- ipaUk: IPA transkripsiya (bilmasangiz bo'sh qoldiring)
- example: so'z ishtirok etgan tabiiy misol gap (matndan olingan yoki original; so'zning o'zi gapda bo'lsin)
- synonyms, antonyms, collocations: 0–4 tadan, bilmasangiz bo'sh
- topicTags: 1–3 ta mavzu (kichik harf, inglizcha)

NOMZODLAR: ${candidates.join(', ')}

MATN:
"""
${chunk}
"""

JAVOBNI FAQAT JSON sxemaga qat'iy mos qaytaring. Ishonchingiz komil bo'lmagan ma'lumotni to'qimang — bo'sh qoldiring.`;
}

// ---------------------------------------------------------------- AI chiqishini tekshirish

export interface FactoryValidation {
  entries: LibraryEntryInput[];
  rejected: Array<{ word: string; reason: string }>;
}

/**
 * AI chiqishini qat'iy tekshiradi: so'z nomzodlar ichida va bo'lakda bor, tarjima/ta'rif/misol bor, misolda so'zning
 * o'zi bor, CEFR to'g'ri, takror emas. Yaroqsizlar `rejected` ga sabab bilan tushadi.
 */
export function validateFactoryOutput(
  raw: unknown,
  chunk: string,
  candidates: string[],
  opts: { sourceName?: string; maxWords?: number } = {}
): FactoryValidation {
  const out: FactoryValidation = { entries: [], rejected: [] };
  const list = Array.isArray((raw as any)?.words) ? ((raw as any).words as any[]) : [];
  const allowed = new Set(candidates.map(normalizeToken));
  const seen = new Set<string>();
  const max = opts.maxWords ?? FACTORY_LIMITS.maxWordsPerChunk;
  for (const item of list) {
    const word = typeof item?.word === 'string' ? item.word.trim().toLowerCase() : '';
    const reject = (reason: string) => out.rejected.push({ word: word || '?', reason });
    if (!word) {
      reject("so'z yo'q");
      continue;
    }
    if (out.entries.length >= max) {
      reject("limitdan ortiq");
      continue;
    }
    if (seen.has(word)) {
      reject('takror');
      continue;
    }
    if (!allowed.has(word)) {
      reject("nomzodlar ro'yxatida yo'q");
      continue;
    }
    if (!findWordInSentence(chunk, word)) {
      reject("matnda uchramaydi");
      continue;
    }
    const example = typeof item?.example === 'string' ? item.example.trim() : '';
    if (!example || !findWordInSentence(example, word)) {
      reject("misolda so'zning o'zi yo'q");
      continue;
    }
    const cefr = String(item?.cefr || '').toUpperCase();
    if (!(CEFR_LEVELS as readonly string[]).includes(cefr)) {
      reject("CEFR noto'g'ri");
      continue;
    }
    const input: LibraryEntryInput = {
      word,
      pos: item.pos,
      cefr,
      ieltsRelevance: Number.isFinite(Number(item.ieltsRelevance)) ? Number(item.ieltsRelevance) : 0,
      translationUz: item.translationUz,
      shortDefinition: item.shortDefinition,
      ipaUk: item.ipaUk,
      examples: [{ en: example }],
      synonyms: item.synonyms,
      antonyms: item.antonyms,
      collocations: item.collocations,
      topicTags: item.topicTags,
      source: opts.sourceName ? `factory: ${opts.sourceName}`.slice(0, 120) : 'factory',
    };
    const { entry, errors } = normalizeEntry(input);
    if (errors.length) {
      reject(errors[0]);
      continue;
    }
    if (!entry.translationUz || !entry.shortDefinition) {
      reject("tarjima yoki ta'rif yo'q");
      continue;
    }
    seen.add(word); // faqat qabul qilinganda — yaroqsiz nusxa keyingi yaroqli nusxani to'sib qo'ymasin
    out.entries.push(input);
  }
  return out;
}
