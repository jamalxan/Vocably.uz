'use client';
import { useRef } from 'react';
import ReadingCard from './skills/ReadingCard';
import ListeningCard from './skills/ListeningCard';
import SpeakingCard from './skills/SpeakingCard';
import WritingCard from './skills/WritingCard';
import useRevealOnScroll from './useRevealOnScroll';

// Brief §12 — four skills, each a real product-UI fragment with depth and
// hover interaction rather than a generic icon+text card grid.
export default function SkillsSection() {
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(gridRef, { y: 36, stagger: 0.1, start: 'top 80%' });

  return (
    <section className="relative px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center mb-14" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">4 skills</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">
          Bitta platforma, to'rtta ko'nikma
        </h2>
      </div>

      <div ref={gridRef} className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5 sm:gap-6">
        <ReadingCard />
        <ListeningCard />
        <SpeakingCard />
        <WritingCard />
      </div>
    </section>
  );
}
