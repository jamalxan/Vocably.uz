'use client';
import { useLayoutEffect, useRef } from 'react';
import { Globe, RotateCw, Palette } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';

const TEXT =
  "Ko'p ilovalar so'z yodlashni o'yinga aylantiradi. Biz uni tizimga aylantirdik — har bir so'z unutish arafasida qaytadi, to'rt ko'nikmada ishlatiladi va imtihon kunigacha xotirangizda qoladi.";
const HIGHLIGHT = new Set(['tizimga', 'unutish', 'arafasida', "to'rt", "ko'nikmada", 'imtihon', 'kunigacha']);

const DIFFERENTIATORS = [
  {
    icon: Globe,
    title: "O'zbek tili birinchi",
    body: "Tarjima, izoh, AI yordamchi, butun interfeys — hammasi o'zbekcha. Boshqa tilni bilish shart emas.",
  },
  {
    icon: RotateCw,
    title: "So'z → ko'nikma zanjiri",
    body: "Bugun o'rgangan so'zingiz 24 soat ichida Reading matnida, Listening dialogida va Speaking savolida qaytadan uchraydi.",
  },
  {
    icon: Palette,
    title: 'Boshqacha dizayn',
    body: "Deep Merlot — issiq, premium palitra. Ko'k-yashil shablonlardan charchagan bo'lsangiz, bu sizga yoqadi.",
  },
];

// Scroll-read manifesto: every word starts faint and "lights up" in reading
// order as the paragraph scrolls through the viewport.
export default function Manifesto() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const cardsRef = useRef(null);
  useChapter(sectionRef, 'manifesto');
  useRevealOnScroll(cardsRef, { y: 50, stagger: 0.12, start: 'top 85%', duration: 1 });

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current.querySelectorAll('[data-mword]'),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: { trigger: textRef.current, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const words = TEXT.split(' ');

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-36">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-8 flex items-center gap-3">
          <span className="h-px w-10 bg-accent" /> Nega Vocably boshqacha
        </h2>
        <p
          ref={textRef}
          className="font-landing-display font-semibold tracking-[-0.03em] leading-[1.12] text-[30px] sm:text-[44px] lg:text-[60px] text-ink"
        >
          {words.map((w, i) => (
            <span key={i}>
              <span data-mword className={HIGHLIGHT.has(w.replace(/[.,—]/g, '')) ? 'text-accent' : undefined}>
                {w}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>

        <div ref={cardsRef} className="mt-16 lg:mt-24 grid md:grid-cols-3 gap-5">
          {DIFFERENTIATORS.map((d, i) => (
            <div
              key={d.title}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/85 p-7 lg:p-8 shadow-card transition-transform duration-500 hover:-translate-y-1.5"
            >
              <span className="absolute right-6 top-4 font-landing-display text-[72px] font-bold leading-none landing-stroke-text transition-transform duration-500 group-hover:scale-110">
                0{i + 1}
              </span>
              <div className="relative w-12 h-12 rounded-2xl bg-accent text-on-accent flex items-center justify-center mb-10 shadow-glow">
                <d.icon size={21} />
              </div>
              <h3 className="relative font-landing-display text-xl font-semibold text-ink mb-2">{d.title}</h3>
              <p className="relative text-sm font-landing-body text-ink/70 leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
