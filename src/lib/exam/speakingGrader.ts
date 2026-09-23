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
import { generateJson, generateJsonWithAudio } from '@/lib/aiJson';
import { getAudioFileMeta, downloadAudioBuffer } from './audioStorage';
import type { SpeakingRecording, SpeakingScore, SpeakingSection } from './types';

// EX-02 (Sprint 2, VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — Gemini's practical
// inline-data ceiling for a single request; above this we skip audio-based
// pronunciation assessment entirely rather than risk an oversized-payload error.
const MAX_PRONUNCIATION_AUDIO_BYTES = 20 * 1024 * 1024;

const PRONUNCIATION_SCHEMA = {
  type: 'object',
  properties: {
    pronunciationBand: { type: 'number' },
    pronunciationNoteUz: { type: 'string' },
  },
  required: ['pronunciationBand', 'pronunciationNoteUz'],
};

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

/** EX-02 — qaysi yozuv talaffuz baholash uchun eng mos: Part 2 cue-card javobi
 * mavjud bo'lsa har doim u (real IELTS'da eng uzun, tabiiy, uzluksiz nutq
 * namunasi — stress/intonatsiya/tezlik baholash uchun eng yaxshisi), aks holda
 * eng uzun Part 3 javobi (Part 1'ning qisqa javoblaridan ko'ra tabiiyroq),
 * aks holda eng uzun Part 1 javobi. Tarmoq/DB'ga tegmaydigan sof funksiya —
 * shuning uchun bevosita unit-testlanadi (speakingGrader.test.ts). */
export function selectPronunciationSample(recordings: SpeakingRecording[]): SpeakingRecording | null {
  if (!recordings.length) return null;

  const part2 = recordings.find((r) => r.part === 2);
  if (part2) return part2;

  const longestOf = (part: 1 | 3): SpeakingRecording | null =>
    recordings.filter((r) => r.part === part).sort((a, b) => b.durationSec - a.durationSec)[0] || null;

  return longestOf(3) || longestOf(1) || null;
}

function buildPronunciationPrompt(): string {
  return `Siz IELTS Speaking examiner'siz. Ilova qilingan audio yozuvni faqat TALAFFUZ (pronunciation) mezoni bo'yicha baholang: stress (urg'u), intonatsiya, ritm, alohida tovushlarning aniqligi, umumiy tushunarlilik (intelligibility).
0-9 IELTS band shkalasida (0.5 qadamda) baho bering (pronunciationBand) va qisqa o'zbekcha izoh yozing (pronunciationNoteUz) — nimalar yaxshi, nimani yaxshilash kerak.
JAVOBNI FAQAT JSON qaytar (sxemaga qat'iy mos), boshqa hech narsa yozmang.`;
}

/** EX-02 asosiy AI chaqiruvi — MUVAFFAQIYATSIZLIK bu funksiyadan HECH QACHON
 * throw qilib chiqmaydi (GEMINI_API_KEY yo'qligidan tortib tarmoq xatosigacha,
 * noto'g'ri formatdagi javobgacha) — `null` qaytaradi, chunki EX-02 QO'SHIMCHA
 * imkoniyat, mavjud (va ishlaydigan) transkript-asosidagi yaxlit baholashni
 * hech qachon buzmasligi kerak. */
async function assessPronunciation(recording: SpeakingRecording): Promise<{ band: number; note: string } | null> {
  try {
    const meta = await getAudioFileMeta(recording.audioFileId);
    if (!meta) return null;
    if (meta.length > MAX_PRONUNCIATION_AUDIO_BYTES) return null;

    const buffer = await downloadAudioBuffer(recording.audioFileId);
    const base64 = buffer.toString('base64');

    const data = await generateJsonWithAudio(buildPronunciationPrompt(), PRONUNCIATION_SCHEMA, [
      { mimeType: meta.contentType, data: base64 },
    ]);

    return { band: clampToHalfBand(data.pronunciationBand), note: String(data.pronunciationNoteUz || '') };
  } catch {
    return null;
  }
}

export async function gradeSpeaking(section: SpeakingSection, recordings: SpeakingRecording[]): Promise<SpeakingScore> {
  const transcriptBlock = buildTranscriptBlock(section, recordings);
  const data = await generateJson(buildPrompt(transcriptBlock), RESPONSE_SCHEMA);

  const fluencyCoherence = { band: clampToHalfBand(data.fluencyCoherence), note: String(data.fluencyCoherenceNote || '') };
  const lexicalResource = { band: clampToHalfBand(data.lexicalResource), note: String(data.lexicalResourceNote || '') };
  const grammaticalRange = { band: clampToHalfBand(data.grammaticalRange), note: String(data.grammaticalRangeNote || '') };

  // EX-02 — qo'shimcha, ixtiyoriy audio-asosidagi talaffuz bahosi. Muvaffaqiyatsiz
  // bo'lsa (yozuv yo'q yoki AI chaqiruvi ishlamadi) `pronunciation` maydoni
  // umuman qo'shilmaydi va `band` eski 3-mezonli formula bo'yicha hisoblanadi —
  // to'liq orqaga moslik.
  const sample = selectPronunciationSample(recordings);
  const pronunciation = sample ? await assessPronunciation(sample) : null;

  const band = pronunciation
    ? clampToHalfBand((fluencyCoherence.band + lexicalResource.band + grammaticalRange.band + pronunciation.band) / 4)
    : clampToHalfBand(data.band);

  return {
    band,
    fluencyCoherence,
    lexicalResource,
    grammaticalRange,
    pronunciationNote: String(data.pronunciationNote || ''),
    ...(pronunciation ? { pronunciation } : {}),
    strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
    corrections: Array.isArray(data.corrections)
      ? data.corrections.slice(0, 6).map((c: any) => ({ original: String(c?.original || ''), suggestion: String(c?.suggestion || '') }))
      : [],
    nextStepsUz: Array.isArray(data.nextStepsUz) ? data.nextStepsUz.map(String) : [],
  };
}
