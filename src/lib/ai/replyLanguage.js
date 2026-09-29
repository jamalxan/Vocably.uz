// Student AI chat reply language (product rule, 2026-09-29):
//   - English by default — the platform teaches English, answers are practice.
//   - If the user writes in Uzbek, or explicitly asks for Uzbek ("o'zbekcha
//     gapir"), answer in Uzbek. An explicit request sticks for the rest of the
//     conversation until the user asks for English again.
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

/** 'uz' | 'en' | null (no clear signal, e.g. a single English word to translate). */
export function detectMessageLanguage(text) {
  if (!text || !text.trim()) return null;
  if (/[ўқғҳЎҚҒҲ]/.test(text)) return 'uz'; // Uzbek Cyrillic
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

/** Explicit "answer in X" request in this message, or null. English wins a tie. */
export function explicitLanguageRequest(text) {
  if (!text) return null;
  const en = ASK_EN.test(text);
  const uz = ASK_UZ.test(text);
  if (en && !uz) return 'en';
  if (uz && !en) return 'uz';
  return null;
}

/**
 * @param {string} message current user message
 * @param {string[]} previousUserMessages oldest -> newest, excluding `message`
 * @returns {'en' | 'uz'}
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
      return detectedNow && detectedNow !== req && detectedNow === 'uz' ? 'uz' : req;
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

export function replyLanguageInstruction(lang) {
  if (lang === 'uz') {
    return (
      '[REPLY LANGUAGE — MANDATORY] Answer this message in Uzbek (Latin script). ' +
      'Keep English example sentences and the English words being taught in English, but all explanations in Uzbek.'
    );
  }
  return (
    '[REPLY LANGUAGE — MANDATORY] Answer this message in English, even though these instructions are written in Uzbek. ' +
    'Use clear, learner-friendly English (about B1-B2). You may add a short Uzbek translation for a vocabulary item, but explanations stay in English. ' +
    'If the user asks you to speak Uzbek ("o\'zbekcha gapir") or writes in Uzbek, switch to Uzbek.'
  );
}
