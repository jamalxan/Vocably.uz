'use client';
import { Check } from 'lucide-react';

// TZ-vocably-v2.md §8.3 — "So'zlar: 187". `< minWords` bo'lsa muted +
// "(kamida N)"; `>= minWords` bo'lsa aksent rangda ✓ bilan.
export interface WordCounterProps {
  wordCount: number;
  minWords: number;
}

export default function WordCounter({ wordCount, minWords }: WordCounterProps) {
  const met = wordCount >= minWords;

  return (
    <span
      className="inline-flex items-center gap-1 text-sm tabular-nums"
      style={{ color: met ? 'var(--exam-accent)' : 'var(--exam-muted)' }}
    >
      {met && <Check size={13} />}
      Words: {wordCount}
      {!met && <span className="text-xs">(at least {minWords})</span>}
    </span>
  );
}
