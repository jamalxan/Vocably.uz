// /api/words/translations uchun sof yordamchilar (test qilinadi): AI prompt va javobni tozalash.
export const LANG_NAME = { ru: 'Russian', uz: 'Uzbek (Latin script)' };

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, translations: { type: 'array', items: { type: 'string' }, maxItems: 4 } },
        required: ['id', 'translations'],
      },
    },
  },
  required: ['results'],
};

export function buildPrompt(items, lang) {
  const lines = items.map((it) => `${it.id} | ${it.word}${it.hint.length ? ` | (${it.hintLang}: ${it.hint.join(', ')})` : ''}`);
  return `Translate each English vocabulary item into ${LANG_NAME[lang]}.
Each line is "id | English word" optionally followed by the learner's existing translation in another language — use it only to pick the intended meaning.
For every item give 1-4 short, natural ${LANG_NAME[lang]} translations as a dictionary would (no explanations, no transliteration of the English word).

${lines.join('\n')}

Return JSON strictly matching the schema: results[] with the same id and translations[].`;
}

/** Faqat so'ralgan id'lar, toza va takrorsiz tarjimalar. */
export function cleanResults(items, results) {
  const ids = new Set(items.map((i) => i.id));
  const out = new Map();
  for (const r of Array.isArray(results) ? results : []) {
    const id = String(r?.id || '');
    if (!ids.has(id) || out.has(id)) continue;
    const tr = [...new Set((Array.isArray(r.translations) ? r.translations : []).map((s) => String(s).trim()).filter((s) => s && s.length <= 80))].slice(0, 4);
    if (tr.length) out.set(id, tr);
  }
  return out;
}

