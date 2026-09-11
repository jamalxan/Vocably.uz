'use client';
import type { SpeakingSection } from '@/lib/exam/types';

// TZ-vocably-v2.md §C0 — Part 2 "cue card": mavzu + qo'llab-quvvatlovchi
// nuqtalar, haqiqiy IELTS'dagi qog'oz kartochkaning ekran versiyasi.
export default function CueCard({ cueCard }: { cueCard: SpeakingSection['part2CueCard'] }) {
  return (
    <div
      className="rounded-xl p-5 text-left"
      style={{ background: 'var(--exam-instruction)', border: '1px solid var(--exam-chrome-border)' }}
    >
      <p className="text-base font-semibold mb-3" style={{ color: 'var(--exam-text)' }}>
        {cueCard.topic}
      </p>
      {cueCard.bulletPoints?.length > 0 && (
        <ul className="text-sm space-y-1.5 list-disc list-inside" style={{ color: 'var(--exam-text)' }}>
          {cueCard.bulletPoints.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
