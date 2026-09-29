import { PenLine, AlertCircle } from 'lucide-react';
import Tilt3DCard from '../Tilt3DCard';

// Brief §16 — writing editor, AI feedback, band score, weakness + suggestion.
export default function WritingCard() {
  return (
    <Tilt3DCard className="h-full">
      <div className="h-full bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <PenLine size={17} />
            </div>
            <h3 className="font-landing-display text-lg font-semibold text-ink">Writing</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-primary-soft rounded-lg px-2.5 py-1">
            <span className="font-landing-mono text-[10px] uppercase tracking-wider text-ink-muted">Band</span>
            <span className="font-landing-mono text-sm font-semibold text-brand-text">6.5</span>
          </div>
        </div>

        <div className="bg-bg border border-border rounded-xl p-4 mb-3">
          <p className="text-[13px] font-landing-body text-ink leading-relaxed">
            In modern world, technology have change the way{' '}
            <span className="underline decoration-accent decoration-2 underline-offset-2">people communicate</span>{' '}
            with each other rapidly.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-accent-soft/60 border border-accent/15 p-3">
          <AlertCircle size={14} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs font-landing-body text-ink leading-relaxed">
            Your writing can be clearer here — <em className="not-italic text-muted">"technology have"</em> should agree
            in number: <strong className="font-medium">"technology has"</strong>.
          </p>
        </div>
      </div>
    </Tilt3DCard>
  );
}
