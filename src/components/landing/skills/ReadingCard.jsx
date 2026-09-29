import { BookOpenText } from 'lucide-react';
import Tilt3DCard from '../Tilt3DCard';

// Brief §13 — a UI fragment (not a stock illustration): a passage with a
// highlighted vocabulary word and its comprehension explanation.
export default function ReadingCard() {
  return (
    <Tilt3DCard className="h-full">
      <div className="h-full bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <BookOpenText size={17} />
          </div>
          <h3 className="font-landing-display text-lg font-semibold text-ink">Reading</h3>
        </div>

        <div className="bg-bg border border-border rounded-xl p-4 mb-3">
          <p className="text-[13px] font-landing-body text-muted leading-relaxed">
            Modern economies depend on a{' '}
            <mark className="bg-accent-soft text-accent font-medium rounded px-1 not-italic">resilient</mark> workforce
            capable of adapting to rapid technological change.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-accent-soft/60 border border-accent/15 p-3">
          <span className="font-landing-mono text-[10px] uppercase tracking-wider text-accent mt-0.5">Izoh</span>
          <p className="text-xs font-landing-body text-ink leading-relaxed">
            <strong className="font-medium">resilient</strong> — qiyinchiliklarga chidamli, tez tiklanuvchan.
          </p>
        </div>
      </div>
    </Tilt3DCard>
  );
}
