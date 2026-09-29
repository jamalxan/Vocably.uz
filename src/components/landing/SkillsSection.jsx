'use client';
import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ReadingCard from './skills/ReadingCard';
import ListeningCard from './skills/ListeningCard';
import SpeakingCard from './skills/SpeakingCard';
import WritingCard from './skills/WritingCard';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';

// Four color-blocked panels, each a different combination of the existing
// palette (surface/accent, merlot/accent-soft, merlot+accent glow,
// primary-soft/merlot). Text colors are picked per theme so contrast holds in
// both light and dark site themes.
const THEMES = {
  light: {
    panel: 'bg-surface border border-border text-ink',
    muted: 'text-ink/70',
    numeral: 'landing-stroke-text',
    glow: null,
  },
  merlot: {
    panel: 'bg-primary text-on-primary',
    muted: 'text-on-primary/75',
    numeral: 'landing-stroke-light',
    glow: 'radial-gradient(circle at 85% 15%, rgb(var(--color-accent) / .5), transparent 55%)',
  },
  ember: {
    panel: 'bg-primary text-on-primary',
    muted: 'text-on-primary/75',
    numeral: 'landing-stroke-light',
    glow:
      'radial-gradient(circle at 15% 85%, rgb(var(--color-accent) / .75), transparent 55%), radial-gradient(circle at 90% 10%, rgb(var(--color-warning) / .25), transparent 40%)',
  },
  blush: {
    panel: 'bg-primary-soft text-ink',
    muted: 'text-ink/70',
    numeral: 'landing-stroke-text',
    glow: 'radial-gradient(circle at 80% 80%, rgb(var(--color-accent) / .18), transparent 55%)',
  },
};

const PANELS = [
  {
    n: '01',
    title: 'Reading',
    tagline: "Kontekstdagi so'z",
    body: "CEFR darajangizga mos matnlar — o'rgangan so'zlaringiz ichida belgilangan, har savolga izoh bilan.",
    points: ['Highlight + izoh', 'Tushunish savollari', 'IELTS formatidagi passage'],
    theme: 'light',
    Card: ReadingCard,
  },
  {
    n: '02',
    title: 'Listening',
    tagline: 'Tabiiy nutq',
    body: "Dialog va monologlar, tezlikni sozlash va transkript bilan tahlil — so'z quloqqa o'rnashadi.",
    points: ['Audio waveform', 'Tezlikni sozlash', 'Progress kuzatuvi'],
    theme: 'merlot',
    Card: ListeningCard,
  },
  {
    n: '03',
    title: 'Speaking',
    tagline: 'AI baholash',
    body: "Ovozli javob bering — AI talaffuz, ravonlik, grammatika va lug'at bo'yicha IELTS mezonida baholaydi.",
    points: ['Pronunciation', 'Fluency', 'Grammar · Vocabulary'],
    theme: 'ember',
    Card: SpeakingCard,
  },
  {
    n: '04',
    title: 'Writing',
    tagline: 'Band + tahlil',
    body: 'Task 1 va Task 2: band baho, mezonlar bo‘yicha tahlil va aniq, tushunarli tuzatishlar.',
    points: ['Band score', 'Weakness tahlili', 'Aniq tavsiyalar'],
    theme: 'blush',
    Card: WritingCard,
  },
];

export default function SkillsSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  useChapter(sectionRef, 'skills');

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // Desktop: vertical scroll drives a pinned horizontal track.
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = trackRef.current;
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      track.querySelectorAll('[data-numeral]').forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('[data-panel]'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          },
        );
      });
      track.querySelectorAll('[data-panel-card]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 70, rotate: 4 },
          {
            y: -30,
            rotate: -2,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('[data-panel]'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          },
        );
      });
    });

    // Mobile/tablet (and reduced motion): stacked panels that rise in.
    mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
      trackRef.current.querySelectorAll('[data-panel]').forEach((el) => {
        gsap.from(el, {
          y: 70,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-20 lg:py-0 lg:h-[100svh] lg:overflow-hidden lg:flex lg:items-center">
      <div ref={trackRef} className="flex flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:w-max lg:gap-8 lg:px-[6vw] lg:items-stretch">
        <div className="lg:w-[34vw] lg:shrink-0 flex flex-col justify-center pb-6 lg:pb-0 lg:pr-6">
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-5">4 skills</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.04em] leading-[0.98] text-[40px] sm:text-[56px] lg:text-[72px] text-ink mb-6">
            Bitta platforma, to'rtta ko'nikma
          </h2>
          <p className="font-landing-body text-base lg:text-lg text-ink/75 max-w-sm leading-relaxed">
            Har bir ko'nikma — alohida mahsulot interfeysi, lekin hammasi bitta SRS tizimiga ulangan.
          </p>
          <p className="hidden lg:flex items-center gap-3 mt-10 font-landing-mono text-xs uppercase tracking-[0.3em] text-ink/60">
            Scroll <ArrowRight size={14} className="landing-nudge-x" />
          </p>
        </div>

        {PANELS.map((p) => {
          const t = THEMES[p.theme];
          return (
            <article
              key={p.n}
              data-panel
              className={`relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 lg:w-[min(84vw,1180px)] lg:h-[78svh] lg:shrink-0 shadow-premium ${t.panel}`}
            >
              {t.glow && <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: t.glow }} />}
              <div className="relative h-full grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
                <div className="flex h-full flex-col justify-between gap-8">
                  <span
                    data-numeral
                    aria-hidden="true"
                    className={`block font-landing-display font-bold leading-[0.8] tracking-[-0.06em] text-[96px] sm:text-[140px] lg:text-[200px] ${t.numeral}`}
                  >
                    {p.n}
                  </span>
                  <div>
                    <p className={`font-landing-mono text-[11px] uppercase tracking-[0.3em] mb-3 ${t.muted}`}>{p.tagline}</p>
                    <h3 className="font-landing-display font-semibold tracking-[-0.04em] leading-none text-[44px] sm:text-[60px] lg:text-[80px] mb-5">
                      {p.title}
                    </h3>
                    <p className={`font-landing-body text-base lg:text-lg leading-relaxed max-w-md mb-6 ${t.muted}`}>{p.body}</p>
                    <ul className="flex flex-wrap gap-2">
                      {p.points.map((pt) => (
                        <li
                          key={pt}
                          className="rounded-full border px-3 py-1 text-xs font-landing-mono"
                          style={{ borderColor: 'color-mix(in srgb, currentColor 28%, transparent)' }}
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div data-panel-card className="w-full max-w-[460px] justify-self-center lg:justify-self-end">
                  <p.Card />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
