'use client';
import type { AttemptResult } from '@/lib/exam/types';
import SectionResult from './SectionResult';

export interface ReadingResultProps {
  result: AttemptResult | null;
}

export default function ReadingResult({ result }: ReadingResultProps) {
  return <SectionResult result={result} sectionKey="reading" label="Reading" />;
}
