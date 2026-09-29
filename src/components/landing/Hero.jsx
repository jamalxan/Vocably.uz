'use client';
import { useRef } from 'react';
import HeroCopy from './HeroCopy';
import LearningCore3DLoader from './LearningCore3DLoader';
import useScrollScrub from './useScrollScrub';

// Composition per brief §29: Hero -> HeroCopy + LearningCore3D, side by
// side on desktop, stacked (core below copy, smaller) on mobile (§26).
// §10: as the user starts scrolling past the hero, the Learning Core
// gently scales down and fades — the opening beat of the scroll story.
export default function Hero() {
  const sectionRef = useRef(null);
  const coreRef = useRef(null);

  useScrollScrub(
    coreRef,
    { scale: 0.72, opacity: 0.45, y: -24 },
    { triggerRef: sectionRef, start: 'top top', end: 'bottom top', scrub: 0.6 },
  );

  return (
    <section ref={sectionRef} id="hero" className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-6">
        <HeroCopy />
        <div ref={coreRef} className="min-w-0 flex justify-center lg:justify-end order-first lg:order-last">
          <LearningCore3DLoader size={440} />
        </div>
      </div>
    </section>
  );
}
