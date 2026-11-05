// Writing "so'z yaxshilashlari" (TZ 2.0 §6.6.1): "a lot of → a considerable number of".
// The AI grader returns them; the user adds them to SRS with one tap. Pure — tested in
// vocabUpgrades.test.ts. Everything that reaches the DB (AI output AND the client's add
// request) goes through these guards: short, plain-English phrases only.

export interface VocabUpgrade {
  original: string;
  better: string;
  noteUz?: string;
}

export const MAX_UPGRADES = 5;
export const MAX_PHRASE_LEN = 60;
export const UPGRADES_DECK_NAME = "Writing: kuchliroq so'zlar";

/** Letters, spaces and light punctuation only — no markup, no sentences. */
const PHRASE_RE = /^[A-Za-z][A-Za-z '’\-/,.()]*$/;

export function cleanPhrase(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').trim().replace(/^["“']+|["”']+$/g, '').trim();
  if (!s || s.length > MAX_PHRASE_LEN || !PHRASE_RE.test(s)) return null;
  return s;
}

/** Normalizes AI output. `better` may come as a string or (old endpoint shape) an array. */
export function normalizeUpgrades(raw: unknown): VocabUpgrade[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabUpgrade[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const original = cleanPhrase(r.original);
    const better = cleanPhrase(Array.isArray(r.better) ? r.better[0] : r.better);
    if (!original || !better || original.toLowerCase() === better.toLowerCase()) continue;
    const key = better.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const note = typeof r.noteUz === 'string' ? r.noteUz.trim().slice(0, 200) : '';
    out.push({ original, better, ...(note ? { noteUz: note } : {}) });
    if (out.length >= MAX_UPGRADES) break;
  }
  return out;
}
