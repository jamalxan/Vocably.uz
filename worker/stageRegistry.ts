// AI-01 worker — `IngestJob.stage` qiymatini haqiqiy bosqich funksiyasiga
// bog'laydi. `models.js`dagi `IngestJobSchema.stage` enum bilan BIR XIL 13
// ta qiymat — biri qo'shilsa/o'zgarsa ikkalasi ham yangilanishi kerak
// (TypeScript `Record<IngestStage, ...>` buni compile-time'da kafolatlaydi:
// biror qiymat tushib qolsa turdagi xato chiqadi).
import type { IngestStage, StageHandler } from './types';
import { runExtract } from './stages/extract';
import { runSegment } from './stages/segment';
import { runSplitSections } from './stages/splitSections';
import { runParseReading } from './stages/parseReading';
import { runParseListening } from './stages/parseListening';
import { runParseWriting } from './stages/parseWriting';
import { runParseSpeaking } from './stages/parseSpeaking';
import { runParseAnswerkey } from './stages/parseAnswerkey';
import { runExtractImages } from './stages/extractImages';
import { runProcessAudio } from './stages/processAudio';
import { runAssemble } from './stages/assemble';
import { runValidate } from './stages/validate';
import { runQa } from './stages/qa';

export const STAGE_REGISTRY: Record<IngestStage, StageHandler> = {
  extract: runExtract,
  segment: runSegment,
  split_sections: runSplitSections,
  parse_reading: runParseReading,
  parse_listening: runParseListening,
  parse_writing: runParseWriting,
  parse_speaking: runParseSpeaking,
  parse_answerkey: runParseAnswerkey,
  extract_images: runExtractImages,
  process_audio: runProcessAudio,
  assemble: runAssemble,
  validate: runValidate,
  qa: runQa,
};
