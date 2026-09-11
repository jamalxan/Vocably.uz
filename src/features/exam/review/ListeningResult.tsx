'use client';
import type { AttemptResult } from '@/lib/exam/types';
import SectionResult from './SectionResult';

export interface ListeningResultProps {
  result: AttemptResult | null;
}

export default function ListeningResult({ result }: ListeningResultProps) {
  return <SectionResult result={result} sectionKey="listening" label="Listening" />;
}
