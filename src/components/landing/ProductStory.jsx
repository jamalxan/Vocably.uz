'use client';
import { useRef } from 'react';
import { BookOpenText, Ear, Mic, PenLine, Brain } from 'lucide-react';
import useRevealOnScroll from './useRevealOnScroll';
import useScrollScrub from './useScrollScrub';

// Brief §10: the vocabulary token that just formed in the orb travels
// through the four skills into long-term memory. The moving accent dot on
// the vertical line is the "camera follows the token" beat — implemented as
// a scroll-scrubbed line-fill rather than a pinned 3D camera move, which
// keeps it cheap and robust while still reading as one continuous journey.
const STEPS = [
  { label: 'Reading', icon: BookOpenText },
  { label: 'Listening', icon: Ear },
  { label: 'Speaking', icon: Mic },
  { label: 'Writing', icon: PenLine },
  { label: 'Long-term memory', icon: Brain },
];

export default function ProductStory() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const tokenRef = useRef(null);
  const lineFillRef = useRef(null);
  const stepsRef = useRef(null);

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(stepsRef, { y: 28, stagger: 0.12, start: 'top 78%' });

  useScrollScrub(
    lineFillRef,
    { scaleY: 1 },
    { triggerRef: sectionRef, start: 'top 60%', end: 'bottom 70%', scrub: 0.5 },
  );
  useScrollScrub(
    tokenRef,
    { top: '96%' },
    { triggerRef: sectionRef, start: 'top 60%', end: 'bottom 70%', scrub: 0.5 },
  );

  return (
    <section id="qanday-ishlaydi" ref={sectionRef} className="relative px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">So'z → Ko'nikma</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-ink leading-tight">
          Bitta so'z — beshta ko'nikmada tirik qoladi
        </h2>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* vocabulary token that "enters" the chain */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm font-landing-mono text-accent shadow-glow">
            resilient
          </span>
        </div>

        <div className="relative pl-12">
          {/* static track */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
          {/* scrubbed fill representing the token's progress */}
          <div
            ref={lineFillRef}
            className="absolute left-4 top-0 w-px bg-accent origin-top"
            style={{ height: '100%', transform: 'scaleY(0)' }}
            aria-hidden="true"
          />
          {/* traveling dot */}
          <div
            ref={tokenRef}
            className="absolute -left-[3px] w-[9px] h-[9px] rounded-full bg-accent shadow-glow"
            style={{ top: '0%' }}
            aria-hidden="true"
          />

          <div ref={stepsRef} className="flex flex-col gap-7">
            {STEPS.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className="w-9 h-9 -ml-[2px] rounded-xl bg-surface border border-border flex items-center justify-center text-accent flex-shrink-0">
                  <s.icon size={17} />
                </div>
                <span className="font-landing-body font-medium text-ink">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
