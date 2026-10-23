'use client';
import { useLayoutEffect, useRef } from 'react';
import { Globe, RotateCw, Palette } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';
import useCopy from './useCopy';

// Highlighted words are marked with *asterisks* in the copy — each locale picks its own.
const COPY = {
  uz: {
    eyebrow: 'Nega Vocably boshqacha',
    text: "Ko'p ilovalar so'z yodlashni o'yinga aylantiradi. Biz uni *tizimga* aylantirdik — har bir so'z *unutish* *arafasida* qaytadi, *to'rt* *ko'nikmada* ishlatiladi va *imtihon* *kunigacha* xotirangizda qoladi.",
    cards: [
      { title: "O'zbek tili birinchi", body: "Tarjima, izoh, AI yordamchi, butun interfeys — hammasi o'zbekcha. Boshqa tilni bilish shart emas." },
      { title: "So'z → ko'nikma zanjiri", body: "Bugun o'rgangan so'zingiz 24 soat ichida Reading matnida, Listening dialogida va Speaking savolida qaytadan uchraydi." },
      { title: 'Boshqacha dizayn', body: "Deep Merlot — issiq, premium palitra. Ko'k-yashil shablonlardan charchagan bo'lsangiz, bu sizga yoqadi." },
    ],
  },
  en: {
    eyebrow: 'Why Vocably is different',
    text: 'Most apps turn memorising words into a game. We turned it into a *system* — every word comes back just *before* you *forget* it, gets used in all *four* *skills* and stays with you until *exam* *day*.',
    cards: [
      { title: 'Built for Uzbek speakers', body: 'Translations, explanations, the AI helper and the whole interface work in Uzbek — and in English whenever you switch.' },
      { title: 'Word → skill chain', body: 'A word you learn today comes back within 24 hours in a Reading passage, a Listening dialogue and a Speaking question.' },
      { title: 'A different look', body: 'Deep Merlot — a warm, premium palette. If you are tired of blue-and-green templates, you will like this one.' },
    ],
  },
};
const ICONS = [Globe, RotateCw, Palette];

// Scroll-read manifesto: every word starts faint and "lights up" in reading
// order as the paragraph scrolls through the viewport.
export default function Manifesto() {
  const tx = useCopy(COPY);
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
    // Re-run when the language changes: the word spans are new elements.
  }, [tx]);

  const words = tx.text.split(' ').map((w) => ({ w: w.replace(/\*/g, ''), hl: w.includes('*') }));

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-36">
      <div className="max-w-6xl mx-auto">
        {/* Semantika: bo'limning asl bayonoti h2 (avval kichik yorliq h2, bayonot esa <p> edi —
            qidiruv tizimlari uchun bo'lim sarlavhasi "Nega Vocably boshqacha" degan yorliq bo'lib qolardi). */}
        <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-8 flex items-center gap-3">
          <span className="h-px w-10 bg-accent" aria-hidden="true" /> {tx.eyebrow}
        </p>
        <h2
          ref={textRef}
          className="font-landing-display font-semibold tracking-[-0.03em] leading-[1.12] text-[30px] sm:text-[44px] lg:text-[60px] text-ink"
        >
          {words.map(({ w, hl }, i) => (
            <span key={`${tx.eyebrow}-${i}`}>
              <span data-mword className={hl ? 'text-accent' : undefined}>
                {w}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>

        <div ref={cardsRef} className="mt-16 lg:mt-24 grid md:grid-cols-3 gap-5">
          {tx.cards.map((d, i) => {
            const Icon = ICONS[i];
            return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/85 p-7 lg:p-8 shadow-card transition-transform duration-500 hover:-translate-y-1.5"
            >
              <span className="absolute right-6 top-4 font-landing-display text-[72px] font-bold leading-none landing-stroke-text transition-transform duration-500 group-hover:scale-110">
                0{i + 1}
              </span>
              <div className="relative w-12 h-12 rounded-2xl bg-accent text-on-accent flex items-center justify-center mb-10 shadow-glow">
                <Icon size={21} />
              </div>
              <h3 className="relative font-landing-display text-xl font-semibold text-ink mb-2">{d.title}</h3>
              <p className="relative text-sm font-landing-body text-ink/70 leading-relaxed">{d.body}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
