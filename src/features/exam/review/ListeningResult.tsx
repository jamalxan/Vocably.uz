'use client';
import type { AttemptResult } from '@/lib/exam/types';
import SectionResult from './SectionResult';

export interface ListeningResultProps {
  attemptId: string;
  result: AttemptResult | null;
}

export default function ListeningResult({ attemptId, result }: ListeningResultProps) {
  return <SectionResult attemptId={attemptId} result={result} sectionKey="listening" label="Listening" />;
}
