'use client';
import type { AttemptResult } from '@/lib/exam/types';
import SectionResult from './SectionResult';

export interface ReadingResultProps {
  attemptId: string;
  result: AttemptResult | null;
}

export default function ReadingResult({ attemptId, result }: ReadingResultProps) {
  return <SectionResult attemptId={attemptId} result={result} sectionKey="reading" label="Reading" />;
}
