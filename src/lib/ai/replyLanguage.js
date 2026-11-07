// Student AI chat reply language (product rule, 2026-09-29):
//   - English by default — the platform teaches English, answers are practice.
//   - If the user writes in Uzbek or Russian, or explicitly asks for one ("o'zbekcha
//     gapir", "по-русски"), answer in it. An explicit request sticks for the rest of the
//     conversation until the user asks for another language.
//   - Word translations (and add_words "syns") use the learner's translation language:
//     Russian when the UI is Russian, otherwise Uzbek (2026-11-07).
// Decided here in code (not left to the model): the base system prompt is
// written in Uzbek, which on its own pulled replies into Uzbek.

const APOS = "['‘’`ʻʼ]?";

const ASK_UZ = new RegExp(
  [
    `o${APOS}zbek(?:cha| tilida| tilda)`,
    `ozbek(?:cha| tilida)`,
    `uzbek(?:cha| tilida)`,
    `\\b(?:in|speak|answer in|reply in|write in) uzbek\\b`,
    `\\buzbek please\\b`,
    'ўзбекча',
  ].join('|'),
  'i'
);

const ASK_RU = new RegExp(
  [
    'по-русски',
    'на русском',
    'русский язык',
    `\\b(?:in|speak|answer in|reply in|write in) russian\\b`,
    `\\brussian please\\b`,
    `ruscha|rus tilida|rus tilda`,
  ].join('|'),
  'i'
);

const ASK_EN = new RegExp(
  [`ingliz(?:cha| tilida| tilda)`, `\\b(?:in|speak|answer in|reply in|write in) english\\b`, `\\benglish please\\b`, 'инглизча'].join('|'),
  'i'
);

// Common Uzbek (Latin) function words and roots — deliberately words that
// don't occur in English text.
const UZ_WORDS = new Set(
  (
    'men sen siz biz ular u bu shu nima nega qanday qanaqa qachon qayerda qaysi kim necha iltimos rahmat salom assalomu alaykum ' +
    'uchun bilan kerak emas ham yoq yo\'q bor mumkin edi ekan bo\'ladi bo\'lsa qil qiling qilib ayt ayting tushuntir tushuntiring ' +
    'tarjima so\'z soz ma\'no mano ma\'nosi manosi misol qoida gap gapir yoz yozing o\'qi o\'qing ber bering va lekin ammo agar ' +
    'yana endi hozir bugun ertaga kecha juda yaxshi yomon katta kichik xato to\'g\'ri togri noto\'g\'ri qanday'
  ).split(' ')
);
const UZ_SUFFIX = /\b\p{L}+(?:ning|dagi|lari|larni|ingiz|imiz|yapti|yapman|moqda|sizmi|mikan|lik|chi)\b/giu;
const EN_WORDS = new Set(
  'the is are was were what how why when where which who you your can could would should does do did please mean means meaning word sentence explain example grammar difference between and of to in for with this that it i'.split(
    ' '
  )
);

function tokens(text) {
  return (text.toLowerCase().match(/[\p{L}'‘’ʻʼ]+/gu) || []).map((t) => t.replace(/[‘’ʻʼ]/g, "'"));
}

/** 'uz' | 'ru' | 'en' | null (no clear signal, e.g. a single English word to translate). */
export function detectMessageLanguage(text) {
  if (!text || !text.trim()) return null;
  if (/[ўқғҳЎҚҒҲ]/.test(text)) return 'uz'; // Uzbek Cyrillic
  // Boshqa kirill matni — ruscha (kamida bitta kirill so'z, lotin so'zlardan ko'p yoki teng).
  const cyr = (text.match(/[Ѐ-ӿ]+/g) || []).length;
  const lat = (text.match(/[A-Za-z]+/g) || []).length;
  if (cyr > 0 && cyr >= lat) return 'ru';
  const toks = tokens(text);
  let uz = 0;
  let en = 0;
  for (const t of toks) {
    if (UZ_WORDS.has(t)) uz++;
    if (EN_WORDS.has(t)) en++;
    if (/[a-z](?:o'|g')/.test(t) || /^(?:o'|g')/.test(t)) uz++; // o'/g' digraphs
  }
  uz += (text.match(UZ_SUFFIX) || []).length;
  if (uz === 0 && en === 0) return null;
  if (uz > en) return 'uz';
  if (en > uz) return 'en';
  return null;
}

/** Explicit "answer in X" request in this message, or null (none, or more than one). */
export function explicitLanguageRequest(text) {
  if (!text) return null;
  const hits = [['en', ASK_EN], ['uz', ASK_UZ], ['ru', ASK_RU]].filter(([, re]) => re.test(text)).map(([l]) => l);
  return hits.length === 1 ? hits[0] : null;
}

/**
 * @param {string} message current user message
 * @param {string[]} previousUserMessages oldest -> newest, excluding `message`
 * @returns {'en' | 'uz' | 'ru'}
 */
export function chooseReplyLanguage(message, previousUserMessages = []) {
  const explicitNow = explicitLanguageRequest(message);
  if (explicitNow) return explicitNow;

  // A standing explicit preference from earlier in the conversation.
  for (let i = previousUserMessages.length - 1; i >= 0; i--) {
    const req = explicitLanguageRequest(previousUserMessages[i]);
    if (req) {
      // ...unless the user has since switched to writing in the other language.
      const detectedNow = detectMessageLanguage(message);
      // (English text alone doesn't cancel a request for Uzbek/Russian — learners practise in English.)
      return detectedNow && detectedNow !== req && detectedNow !== 'en' ? detectedNow : req;
    }
  }

  const detected = detectMessageLanguage(message);
  if (detected) return detected;
  // Ambiguous (e.g. "resilient"): stay in the language of the last clear message.
  for (let i = previousUserMessages.length - 1; i >= 0; i--) {
    const prev = detectMessageLanguage(previousUserMessages[i]);
    if (prev) return prev;
  }
  return 'en';
}

const NATIVE_NAME = { uz: 'Uzbek', ru: 'Russian' };

/**
 * @param {'en'|'uz'|'ru'} lang reply language
 * @param {'uz'|'ru'} translationLang the learner's translation language (UI ru -> ru, otherwise uz)
 */
export function replyLanguageInstruction(lang, translationLang = 'uz') {
  const native = NATIVE_NAME[translationLang] || NATIVE_NAME.uz;
  const words =
    `\n[TRANSLATION LANGUAGE — MANDATORY] This learner's translation language is ${native}. ` +
    `Translate English words into ${native}, and every "syns" item you send to add_words must be in ${native}` +
    (translationLang === 'ru' ? ' (not Uzbek).' : '.');
  if (lang === 'ru') {
    return (
      '[REPLY LANGUAGE — MANDATORY] Answer this message in Russian. ' +
      'Keep English example sentences and the English words being taught in English, but all explanations in Russian.' +
      words
    );
  }
  if (lang === 'uz') {
    return (
      '[REPLY LANGUAGE — MANDATORY] Answer this message in Uzbek (Latin script). ' +
      'Keep English example sentences and the English words being taught in English, but all explanations in Uzbek.' +
      words
    );
  }
  return (
    '[REPLY LANGUAGE — MANDATORY] Answer this message in English, even though these instructions are written in Uzbek. ' +
    `Use clear, learner-friendly English (about B1-B2). You may add a short ${native} translation for a vocabulary item, but explanations stay in English. ` +
    'If the user asks you to speak Uzbek or Russian, or writes in one of them, switch to that language.' +
    words
  );
}
