'use client';
import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useWebGLSupport from './experience/useWebGLSupport';
import LearningCoreFallback from './LearningCoreFallback';
import Magnetic from './Magnetic';

const CHIPS = ["4 ko'nikma", 'SRS', 'AI feedback', 'Mock test'];

// Each word sits in an overflow-hidden mask and rises into place. The
// entrance is pure CSS (.landing-hero-word, globals.css) so it starts on
// first paint of the server HTML — no flash of static text waiting for JS.
function Word({ children, i, className = '' }) {
  return (
    <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
      <span className={`landing-hero-word inline-block ${className}`} style={{ '--i': i }}>
        {children}
      </span>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const copyRef = useRef(null);
  const bigRef = useRef(null);
  const webgl = useWebGLSupport();
  useChapter(sectionRef, 'hero');

  // Scroll-out: the copy drifts up and dims while the giant outline word
  // slides sideways — the Learning Core meanwhile flies to its next preset.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.to(copyRef.current, {
        yPercent: -12,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.fromTo(
        bigRef.current,
        { xPercent: 0 },
        {
          xPercent: -28,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-10 min-h-[calc(100svh-72px)] overflow-hidden flex items-center px-4 sm:px-6 pb-24"
    >
      <div
        ref={bigRef}
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-[3vw] left-[2vw] whitespace-nowrap font-landing-display font-bold leading-none tracking-[-0.06em] text-[30vw] lg:text-[22vw] landing-stroke-text"
      >
        IELTS · SRS · AI
      </div>

      <div className="relative w-full max-w-7xl mx-auto grid lg:grid-cols-[1.3fr_1fr] items-center gap-4 lg:gap-8">
        <div className="order-first lg:order-last h-[34svh] lg:h-[70svh] flex items-center justify-center">
          {webgl === false && <LearningCoreFallback size={420} />}
        </div>

        <div ref={copyRef} className="min-w-0 text-center lg:text-left">
          <div
            className="landing-hero-fade inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent/20 bg-surface/70 px-3.5 py-1.5 mb-6 lg:mb-7 text-[10px] sm:text-[11px] font-landing-mono font-medium uppercase tracking-[0.06em] sm:tracking-[0.2em] text-accent"
            style={{ '--i': 0 }}
          >
            <Sparkles size={13} /> IELTS uchun zamonaviy o'quv platformasi
          </div>

          <h1 className="font-landing-display font-semibold text-ink tracking-[-0.045em] leading-[0.95] text-[40px] sm:text-[58px] lg:text-[60px] xl:text-[76px] 2xl:text-[84px] mb-7">
            <Word i={0}>Ingliz</Word> <Word i={1}>tilini</Word>{' '}
            <Word i={2} className="landing-shimmer-text">
              unutmaydigan
            </Word>{' '}
            <Word i={3}>usulda</Word> <Word i={4}>o'rganing</Word>
          </h1>

          <p
            className="landing-hero-fade text-base sm:text-lg font-landing-body text-ink/75 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            style={{ '--i': 1 }}
          >
            Vocably IELTS imtihoniga tayyorgarlik uchun Reading, Listening, Writing, Speaking, Vocabulary, AI va Mock
            testlarni bitta tizimga birlashtiradi.
          </p>

          <div
            className="landing-hero-fade flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
            style={{ '--i': 2 }}
          >
            <Magnetic className="w-full sm:w-auto">
              <Link
                href="/royxat"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-accent pl-7 pr-2 py-2 text-sm font-landing-body font-semibold text-on-accent shadow-glow transition-colors duration-300 hover:bg-accent-hover"
              >
                Bepul boshlash
                <span className="grid h-10 w-10 place-items-center rounded-full bg-on-accent/15 transition-transform duration-500 group-hover:rotate-[-45deg]">
                  <ArrowRight size={17} />
                </span>
              </Link>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <a
                href="#qanday-ishlaydi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface/60 px-7 py-4 text-sm font-landing-body font-semibold text-ink backdrop-blur-md transition-colors duration-300 hover:border-accent/50"
              >
                Qanday ishlaydi?
              </a>
            </Magnetic>
          </div>

          <ul
            className="landing-hero-fade mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-2"
            style={{ '--i': 3 }}
          >
            {CHIPS.map((c) => (
              <li
                key={c}
                className="rounded-full border border-border bg-surface/70 px-3 py-1 text-[11px] font-landing-mono text-ink/80"
              >
                {c}
              </li>
            ))}
            <li className="px-1 text-[11px] font-landing-mono text-ink/60">· kredit karta shart emas</li>
          </ul>
        </div>
      </div>

      <div
        className="landing-hero-fade absolute bottom-7 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-[10px] font-landing-mono uppercase tracking-[0.3em] text-ink/60"
        style={{ '--i': 4 }}
        aria-hidden="true"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-ink/15">
          <span className="landing-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
        </span>
        <ArrowDown size={12} />
      </div>
    </section>
  );
}
