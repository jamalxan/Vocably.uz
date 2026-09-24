// Admin AI chat — tahlil qilingan bo'lak(lar)dan `ExamTest.sections`
// hujjatini yasaydigan SOF qatlam (DB/AI/tarmoq yo'q, shuning uchun birlik
// testlari bor: `buildTest.test.ts`).
//
// Nega alohida modul: chat oqimida bir xil "yig'ish" mantig'i ikki joyda
// kerak — (1) hujjat tahlilidan yangi test qoralamasi yaratishda,
// (2) keyinroq yuborilgan audio/rasmni MAVJUD testga biriktirishda. Ikkalasi
// ham `src/lib/exam/types.ts` shakliga qat'iy rioya qilishi shart, chunki
// `contentValidator.ts` va imtihon dvigateli aynan shu shaklni kutadi.
import type { ListeningSection, Passage, ReadingSection, SpeakingSection, WritingSection } from '@/lib/exam/types';
import type { ListeningPartOutput, SpeakingSectionOutput, WritingTaskOutput } from '@/lib/contentAgent/parsers/sectionParsers';

// Haqiqiy IELTS vaqtlari (TZ §3.2-3.4) — bu yerda bitta joyda, chunki AI
// hech qachon vaqtni "taxmin qilmasligi" kerak: bular standart.
export const SECTION_DURATIONS = {
  reading: 3600,
  listening: 1800,
  listeningCheckTime: 120,
  writing: 3600,
  speaking: 840, // 11-14 daqiqa — o'rtacha 14 daq byudjet
};

export interface ParsedSections {
  reading?: Passage[];
  listening?: ListeningPartOutput[];
  writing?: WritingTaskOutput[];
  speaking?: SpeakingSectionOutput | null;
  /** part order -> audioscript matni (kitobning "Audioscripts" bo'limidan). */
  transcripts?: Record<number, string>;
}

/** "Cambridge IELTS 19 — Test 2" -> "cambridge-ielts-19-test-2". */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'test';
}

/** Band mavjud slug'lar ro'yxatiga qarab birinchi bo'sh variantni topadi
 * ("...-2", "...-3"). Chaqiruvchi DB'dan mavjud slug'larni beradi — shu
 * tufayli funksiyaning o'zi sof qoladi. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const takenSet = new Set(taken);
  if (!takenSet.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!takenSet.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function buildReading(passages: Passage[]): ReadingSection {
  return { durationSec: SECTION_DURATIONS.reading, passages };
}

/** Listening part'lari hujjatdan kelganda AUDIO HALI YO'Q — `audioUrl` ataylab
 * bo'sh qoladi. Bu `validateTest`da BLOKLOVCHI xato (publish qilib
 * bo'lmaydi), lekin qoralama sifatida to'g'ri holat: admin keyin audioni
 * chatga tashlaydi, agent uni shu part'ga biriktiradi
 * (`attachAudioToPart`). Yolg'on "to'liq" test yaratishdan ko'ra, aniq
 * "audio kutilmoqda" holati afzal. */
function buildListening(parts: ListeningPartOutput[], transcripts?: Record<number, string>): ListeningSection {
  return {
    durationSec: SECTION_DURATIONS.listening,
    checkTimeSec: SECTION_DURATIONS.listeningCheckTime,
    parts: parts.map((p) => ({
      order: p.order as 1 | 2 | 3 | 4,
      audioUrl: '',
      durationSec: 0,
      contextText: p.contextText || undefined,
      transcript: transcripts?.[p.order] || undefined,
      questionGroups: p.questionGroups,
    })),
  };
}

function buildWriting(tasks: WritingTaskOutput[]): WritingSection {
  const ordered = [...tasks].sort((a, b) => a.order - b.order).map((t) => ({
    order: t.order,
    minWords: t.minWords,
    recommendedMin: t.recommendedMin,
    promptHtml: t.promptHtml,
  }));
  return { durationSec: SECTION_DURATIONS.writing, tasks: ordered as WritingSection['tasks'] };
}

function buildSpeaking(speaking: SpeakingSectionOutput): SpeakingSection {
  return {
    durationSec: SECTION_DURATIONS.speaking,
    part1Questions: speaking.part1Questions,
    part2CueCard: speaking.part2CueCard,
    part3Questions: speaking.part3Questions,
  };
}

/** Faqat HAQIQATDA topilgan bo'limlar qo'shiladi — bo'sh bo'lim (masalan
 * kitobda Speaking yo'q) hech qachon "bo'sh qobiq" sifatida yozilmaydi,
 * aks holda `/app/gapirish` ro'yxatida mazmunsiz test paydo bo'lardi. */
export function buildSections(parsed: ParsedSections) {
  const sections: {
    reading?: ReadingSection;
    listening?: ListeningSection;
    writing?: WritingSection;
    speaking?: SpeakingSection;
  } = {};

  if (parsed.reading?.length) sections.reading = buildReading(parsed.reading);
  if (parsed.listening?.length) sections.listening = buildListening(parsed.listening, parsed.transcripts);
  if (parsed.writing?.length) sections.writing = buildWriting(parsed.writing);
  if (parsed.speaking && (parsed.speaking.part1Questions.length || parsed.speaking.part3Questions.length)) {
    sections.speaking = buildSpeaking(parsed.speaking);
  }

  return sections;
}

export const SECTION_LABEL: Record<string, string> = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
};

/** Chatda ko'rsatiladigan qisqa hisobot: "Reading — 3 passage, 40 savol". */
export function summarizeSections(sections: ReturnType<typeof buildSections>): { key: string; label: string; detail: string }[] {
  const out: { key: string; label: string; detail: string }[] = [];

  if (sections.reading) {
    const questions = sections.reading.passages.reduce(
      (sum, p) => sum + (p.questionGroups || []).reduce((s, g) => s + (g.questions?.length || 0), 0),
      0
    );
    out.push({ key: 'reading', label: SECTION_LABEL.reading, detail: `${sections.reading.passages.length} passage · ${questions} savol` });
  }
  if (sections.listening) {
    const questions = sections.listening.parts.reduce(
      (sum, p) => sum + (p.questionGroups || []).reduce((s, g) => s + (g.questions?.length || 0), 0),
      0
    );
    const missingAudio = sections.listening.parts.filter((p) => !p.audioUrl).length;
    out.push({
      key: 'listening',
      label: SECTION_LABEL.listening,
      detail: `${sections.listening.parts.length} part · ${questions} savol${missingAudio ? ` · ${missingAudio} part audiosiz` : ''}`,
    });
  }
  if (sections.writing) {
    out.push({ key: 'writing', label: SECTION_LABEL.writing, detail: `${sections.writing.tasks.length} task` });
  }
  if (sections.speaking) {
    out.push({
      key: 'speaking',
      label: SECTION_LABEL.speaking,
      detail: `Part 1: ${sections.speaking.part1Questions.length} · Part 3: ${sections.speaking.part3Questions.length} savol`,
    });
  }

  return out;
}

/** Audio faylni mavjud testning bitta Listening part'iga biriktiradi.
 * Hujjatni MUTATSIYA QILMAYDI — yangi `sections` obyektini qaytaradi
 * (chaqiruvchi uni `ExamTest.sections`ga yozadi), shunda funksiya sof
 * bo'lib qoladi va test qilinadi. */
export function attachAudioToPart(
  sections: any,
  partOrder: number,
  { audioUrl, durationSec, transcript }: { audioUrl: string; durationSec?: number; transcript?: string }
): { sections: any; attached: boolean } {
  const listening = sections?.listening;
  if (!listening?.parts?.length) return { sections, attached: false };

  let attached = false;
  const parts = listening.parts.map((p: any) => {
    if (p.order !== partOrder) return p;
    attached = true;
    return {
      ...p,
      audioUrl,
      durationSec: durationSec ?? p.durationSec ?? 0,
      transcript: transcript?.trim() ? transcript : p.transcript,
    };
  });

  return { sections: { ...sections, listening: { ...listening, parts } }, attached };
}
