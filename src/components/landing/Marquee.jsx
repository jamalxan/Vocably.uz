'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';

const WORDS = [
  'resilient',
  'articulate',
  'meticulous',
  'eloquent',
  'sustainable',
  'insightful',
  'pragmatic',
  'coherent',
  'nuanced',
  'ubiquitous',
];

function Row({ rowRef, variant }) {
  return (
    <div ref={rowRef} className="flex w-max will-change-transform">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center gap-6 lg:gap-10 pr-6 lg:pr-10">
          {WORDS.map((w) => (
            <span key={w} className="flex items-center gap-6 lg:gap-10">
              <span className={variant === 'fill' ? 'text-on-primary' : 'landing-stroke-strong'}>{w}</span>
              <span className="inline-block h-2.5 w-2.5 lg:h-4 lg:w-4 rotate-45 bg-accent" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// Two oversized, counter-rotating vocabulary bands. They loop on their own
// and surge with scroll velocity (and reverse with scroll direction).
export default function Marquee() {
  const sectionRef = useRef(null);
  const row1 = useRef(null);
  const row2 = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const t1 = gsap.to(row1.current, { xPercent: -50, repeat: -1, duration: 40, ease: 'none' });
      const t2 = gsap.fromTo(row2.current, { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 46, ease: 'none' });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
          const dir = self.direction;
          gsap.to([t1, t2], {
            timeScale: dir * boost,
            duration: 0.15,
            overwrite: true,
            onComplete: () => gsap.to([t1, t2], { timeScale: dir, duration: 1.4, ease: 'power2.out', overwrite: true }),
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className="relative z-10 overflow-hidden py-16 lg:py-24 font-landing-display font-semibold tracking-[-0.03em] leading-none select-none"
    >
      <div className="-rotate-2 w-[120%] -ml-[10%] bg-primary py-5 lg:py-7 text-[40px] lg:text-[84px] shadow-premium">
        <Row rowRef={row1} variant="fill" />
      </div>
      <div className="rotate-1 w-[120%] -ml-[10%] mt-3 py-4 lg:py-5 text-[40px] lg:text-[84px]">
        <Row rowRef={row2} variant="outline" />
      </div>
    </section>
  );
}
