// TZ-vocably-v2.md §19 Faza 4 item 23 — AI Speaking grader. Reuses the exact
// same Whisper-transcription + Groq/OpenRouter/Gemini JSON-grading pipeline
// as the old (pre-exam-engine) /api/speaking/submit (src/lib/transcribe.js +
// src/lib/aiJson.js) — same "bepul tarif" limitation documented there: no
// Azure Speech Pronunciation Assessment, so `pronunciationNote` is a
// text-only observation, never a scored criterion.
//
// Unlike the old route (which graded ONE response at a time, no persisted
// "Speaking test"), this grades the WHOLE Speaking section (Part 1+2+3)
// HOLISTICALLY in a single AI call once all recordings are in — that's how
// real IELTS Speaking works (one interview, one band, not three averaged
// scores). Transcription itself already happened per-recording at upload
// time (speaking-recording route.js) — this function only combines the
// already-transcribed text, it never touches audio.
import { generateJson } from '@/lib/aiJson';
import type { SpeakingRecording, SpeakingScore, SpeakingSection } from './types';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    band: { type: 'number' },
    fluencyCoherence: { type: 'number' },
    fluencyCoherenceNote: { type: 'string' },
    lexicalResource: { type: 'number' },
    lexicalResourceNote: { type: 'string' },
    grammaticalRange: { type: 'number' },
    grammaticalRangeNote: { type: 'string' },
    pronunciationNote: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { original: { type: 'string' }, suggestion: { type: 'string' } },
        required: ['original', 'suggestion'],
      },
    },
    nextStepsUz: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'band', 'fluencyCoherence', 'fluencyCoherenceNote', 'lexicalResource', 'lexicalResourceNote',
    'grammaticalRange', 'grammaticalRangeNote', 'pronunciationNote', 'strengths', 'corrections', 'nextStepsUz',
  ],
};

function clampToHalfBand(n: unknown): number {
  const num = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.min(9, Math.max(0, Math.round(num * 2) / 2));
}

/** Har bir yozuvni savol matni bilan birga, Part tartibida, o'qish uchun
 * qulay transkript blokiga yig'adi — AI'ga "kim nima so'radi, foydalanuvchi
 * nima javob berdi" kontekstini beradi (faqat xom matnlar ketma-ketligi
 * emas). Javob yo'q savol (foydalanuvchi o'sha savolni tashlab ketgan)
 * "(javob berilmagan)" deb belgilanadi — AI buni jarima sifatida hisobga
 * olishi kerak, sukut bo'yicha e'tiborsiz qoldirmasligi uchun aniq aytiladi. */
function buildTranscriptBlock(section: SpeakingSection, recordings: SpeakingRecording[]): string {
  const byKey = new Map(recordings.map((r) => [`${r.part}:${r.questionIndex}`, r]));
  const lines: string[] = [];

  lines.push('=== PART 1 ===');
  section.part1Questions.forEach((q, i) => {
    const r = byKey.get(`1:${i}`);
    lines.push(`S: ${q}\nJ: ${r?.transcript?.trim() || '(javob berilmagan)'}`);
  });

  lines.push('\n=== PART 2 (cue card) ===');
  lines.push(`Mavzu: ${section.part2CueCard.topic}`);
  if (section.part2CueCard.bulletPoints?.length) {
    lines.push(section.part2CueCard.bulletPoints.map((b) => `- ${b}`).join('\n'));
  }
  lines.push(`J: ${byKey.get('2:0')?.transcript?.trim() || '(javob berilmagan)'}`);

  lines.push('\n=== PART 3 ===');
  section.part3Questions.forEach((q, i) => {
    const r = byKey.get(`3:${i}`);
    lines.push(`S: ${q}\nJ: ${r?.transcript?.trim() || '(javob berilmagan)'}`);
  });

  return lines.join('\n\n');
}

function buildPrompt(transcriptBlock: string): string {
  return `Siz IELTS Speaking examiner'siz. Quyida bitta nomzodning to'liq Speaking suhbati (3 qism, Whisper orqali yozma matnga o'girilgan — tinish belgilari/pauza/ohang ma'lumoti yo'qolgan bo'lishi mumkin):

${transcriptBlock}

Butun suhbatni (3 qismni birgalikda, haqiqiy IELTS'dagidek YAXLIT) IELTS mezonlari bo'yicha taxminiy baholang (0-9, 0.5 qadamda): Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy — har biriga o'zbekcha qisqa izoh (butun suhbat bo'yicha umumlashtirilgan, alohida part-part emas).
pronunciationNote — FAQAT matn asosida (talaffuzni EMAS, so'z tanlovi/ravonlikni aks ettiruvchi belgilar asosida) umumiy kuzatuv; "aniq fonema tahlili yo'q" degan izohni yozmang, shunchaki matndan ko'ringan narsalarni yozing.
"(javob berilmagan)" savollarni PASTROQ baholashga sabab sifatida hisobga oling (ayniqsa Fluency & Coherence'ga).
Umumiy band (3 mezon o'rtachasi, 0.5ga yaxlitlangan — pronunciation hisobga kiritilmaydi, chunki aniq o'lchanmagan).
strengths — 2-3 ta kuchli tomon.
corrections — 3-6 ta grammatik/leksik tuzatish (original parcha -> tuzatilgan), butun suhbatdan.
nextStepsUz — 2-3 ta aniq maslahat, o'zbek tilida.
JAVOBNI FAQAT JSON qaytar (sxemaga qat'iy mos).`;
}

export async function gradeSpeaking(section: SpeakingSection, recordings: SpeakingRecording[]): Promise<SpeakingScore> {
  const transcriptBlock = buildTranscriptBlock(section, recordings);
  const data = await generateJson(buildPrompt(transcriptBlock), RESPONSE_SCHEMA);

  return {
    band: clampToHalfBand(data.band),
    fluencyCoherence: { band: clampToHalfBand(data.fluencyCoherence), note: String(data.fluencyCoherenceNote || '') },
    lexicalResource: { band: clampToHalfBand(data.lexicalResource), note: String(data.lexicalResourceNote || '') },
    grammaticalRange: { band: clampToHalfBand(data.grammaticalRange), note: String(data.grammaticalRangeNote || '') },
    pronunciationNote: String(data.pronunciationNote || ''),
    strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
    corrections: Array.isArray(data.corrections)
      ? data.corrections.slice(0, 6).map((c: any) => ({ original: String(c?.original || ''), suggestion: String(c?.suggestion || '') }))
      : [],
    nextStepsUz: Array.isArray(data.nextStepsUz) ? data.nextStepsUz.map(String) : [],
  };
}
