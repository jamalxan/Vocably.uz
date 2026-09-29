'use client';
import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import DarkVeil from './DarkVeil';
import Magnetic from './Magnetic';

const HEADLINE = [
  { w: 'Bugundan' },
  { w: 'boshlang.' },
  { w: 'Natijangizni', accent: true },
  { w: "o'zgartiring." },
];

// Finale: dark chapter, the Learning Core returns above the headline with
// its orbits blown wide (the "final" preset) — every element of the story
// converging in one frame.
export default function FinalCTA() {
  const sectionRef = useRef(null);
  const loopRef = useRef(null);
  useChapter(sectionRef, 'final', { dark: true });

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('[data-fword]', {
        yPercent: 120,
        rotate: 6,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 55%', toggleActions: 'play none none reverse' },
      });
      gsap.from('[data-ffade]', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.4,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 55%', toggleActions: 'play none none reverse' },
      });
      gsap.to(loopRef.current, { xPercent: -50, repeat: -1, duration: 30, ease: 'none' });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 min-h-[100svh] overflow-hidden flex items-end px-4 sm:px-6 pb-20 lg:pb-28 text-on-primary"
    >
      <DarkVeil edge={14} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[12%] select-none overflow-hidden w-full"
      >
        <div
          ref={loopRef}
          className="flex w-max whitespace-nowrap font-landing-display font-bold leading-none tracking-[-0.05em] text-[18vw] landing-stroke-light"
        >
          <span className="pr-[6vw]">Bugundan boshlang ✦</span>
          <span className="pr-[6vw]">Bugundan boshlang ✦</span>
        </div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto text-center pt-[48svh] lg:pt-[42svh]">
        <h2 className="font-landing-display font-semibold tracking-[-0.045em] leading-[0.98] text-[42px] sm:text-[64px] lg:text-[88px] mb-7">
          {HEADLINE.map(({ w, accent }, i) => (
            <span key={w}>
              <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
                <span data-fword className={`inline-block ${accent ? 'landing-dark-accent' : ''}`}>
                  {w}
                </span>
              </span>
              {i < HEADLINE.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>
        <p data-ffade className="font-landing-body text-base lg:text-lg text-on-primary/75 mb-10">
          Ro'yxatdan o'tish 1 daqiqa, kredit karta shart emas.
        </p>
        <div data-ffade className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Magnetic className="w-full sm:w-auto">
            <Link
              href="/royxat"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-on-primary pl-8 pr-2 py-2 text-base font-landing-body font-semibold text-primary shadow-premium transition-transform duration-300 hover:scale-[1.03]"
            >
              Ro'yxatdan o'tish
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:rotate-[-45deg]">
                <ArrowRight size={18} />
              </span>
            </Link>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-on-primary/30 px-8 py-[1.15rem] text-base font-landing-body font-semibold text-on-primary transition-colors duration-300 hover:bg-on-primary/10"
            >
              Batafsil ma'lumot
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
