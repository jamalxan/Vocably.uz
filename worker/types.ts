// AI-01 worker — barcha bosqich fayllari baham ko'radigan tur e'lonlari.
export type IngestStage =
  | 'extract'
  | 'segment'
  | 'split_sections'
  | 'parse_reading'
  | 'parse_listening'
  | 'parse_writing'
  | 'parse_speaking'
  | 'parse_answerkey'
  | 'extract_images'
  | 'process_audio'
  | 'assemble'
  | 'validate'
  | 'qa';

/** Har bosqich funksiyasiga (`stages/*.ts`) beriladigan kontekst — Mongo
 * `IngestJob` hujjatining o'zi EMAS (bosqich funksiyalari hujjatni to'g'ridan-
 * to'g'ri yangilamaydi, faqat `output`ni QAYTARADI — `jobRunner.ts` uni
 * saqlaydi, status o'tishlarini boshqaradi). */
export interface StageContext {
  job: {
    _id: string;
    bookId: string;
    stage: IngestStage;
    attempt: number;
  };
}

export type StageHandler = (ctx: StageContext) => Promise<unknown>;
