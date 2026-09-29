'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { BookOpenText, Ear, Mic, PenLine, Brain } from 'lucide-react';
import { ScrollTrigger } from './gsapConfig';
import useChapter from './experience/useChapter';
import { experience } from './experience/store';
import DarkVeil from './DarkVeil';

const STEPS = [
  {
    label: 'Reading',
    icon: BookOpenText,
    title: 'Matnda uchratasiz',
    body: "Ertasi kuni “resilient” sizning darajangizdagi Reading matnida qaytadi — endi kontekst ichida.",
  },
  {
    label: 'Listening',
    icon: Ear,
    title: 'Dialogda eshitasiz',
    body: "So'z tabiiy nutqda — talaffuzi va urg'usi bilan quloqqa tanish bo'ladi.",
  },
  {
    label: 'Speaking',
    icon: Mic,
    title: "O'zingiz gapirasiz",
    body: "Speaking savoliga javobda ishlatasiz — AI talaffuz va ravonlikni baholaydi.",
  },
  {
    label: 'Writing',
    icon: PenLine,
    title: "Yozuvda qo'llaysiz",
    body: "Task 2 inshoda to'g'ri kollokatsiya bilan yozasiz — AI tekshiradi va tuzatadi.",
  },
  {
    label: 'Long-term memory',
    icon: Brain,
    title: 'Xotirada qoladi',
    body: "To'rt ko'nikmadan o'tgan so'z endi passiv emas — imtihon kuni o'zi esga tushadi.",
  },
];

// Pinned for ~3 screens of scroll. Progress drives both the DOM step panels
// and (via the experience store) the 3D token hopping between skill nodes
// around the Learning Core, which sits in the middle column.
export default function ProductStory() {
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(true);
  // Unpinned (reduced motion) the steps are a plain centered list, so the
  // core parks in a corner instead of sitting behind the text.
  useChapter(sectionRef, pinned ? 'story' : 'manifesto', { dark: true });

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPinned(false);
      return undefined;
    }
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3.2}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        experience.story.progress = self.progress;
        if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`;
        const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
        if (idx !== activeRef.current) {
          activeRef.current = idx;
          setActive(idx);
        }
      },
    });
    return () => st.kill();
  }, []);

  if (!pinned) {
    return (
      <section ref={sectionRef} id="qanday-ishlaydi" className="relative z-10 px-4 sm:px-6 py-24 text-on-primary">
        <DarkVeil />
        <div className="relative max-w-3xl mx-auto" key="static">
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] landing-dark-accent mb-4">
            So'z → Ko'nikma
          </p>
          <h2 className="font-landing-display text-4xl font-semibold tracking-tight mb-10">
            Bitta so'z — beshta ko'nikmada tirik qoladi
          </h2>
          <ol className="space-y-6">
            {STEPS.map((s) => (
              <li key={s.label}>
                <p className="font-landing-display text-2xl font-semibold">{s.title}</p>
                <p className="text-on-primary/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  const Icon = STEPS[active].icon;

  return (
    <section ref={sectionRef} id="qanday-ishlaydi" className="relative z-10 h-[100svh] overflow-hidden text-on-primary">
      <DarkVeil edge={6} />

      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col lg:grid lg:grid-cols-[1fr_1.05fr_1fr] lg:items-center pt-24 pb-8 lg:py-0">
        <div className="lg:pr-6">
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] landing-dark-accent mb-4">
            So'z → Ko'nikma
          </p>
          <h2 className="font-landing-display font-semibold tracking-[-0.035em] leading-[1.02] text-[30px] sm:text-[40px] lg:text-[52px]">
            Bitta so'z — beshta ko'nikmada tirik qoladi
          </h2>
          <div className="hidden lg:flex items-end gap-5 mt-12">
            <span className="font-landing-display font-bold leading-none text-[120px] tabular-nums landing-stroke-light">
              0{active + 1}
            </span>
            <span className="mb-4 font-landing-mono text-sm text-on-primary/60">/ 0{STEPS.length}</span>
            <span className="relative mb-4 ml-2 h-24 w-[2px] overflow-hidden rounded-full bg-on-primary/15">
              <span ref={barRef} className="absolute inset-0 origin-top bg-accent" style={{ transform: 'scaleY(0)' }} />
            </span>
          </div>
        </div>

        <div className="flex-1 lg:h-full" aria-hidden="true" />

        <div className="relative min-h-[210px] lg:min-h-[260px] lg:pl-6">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              aria-hidden={i !== active}
              className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                opacity: i === active ? 1 : 0,
                transform: `translateY(${i === active ? 0 : i < active ? -28 : 28}px)`,
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-on-primary/15 bg-on-primary/10 px-3 py-1 mb-5 font-landing-mono text-[11px] uppercase tracking-[0.2em]">
                {i === active && <Icon size={13} />}
                {s.label}
              </div>
              <h3 className="font-landing-display font-semibold tracking-tight text-[30px] lg:text-[44px] leading-[1.05] mb-4">
                {s.title}
              </h3>
              <p className="font-landing-body text-base lg:text-lg text-on-primary/75 leading-relaxed max-w-sm">{s.body}</p>
            </div>
          ))}
          <div className="lg:hidden absolute -bottom-2 left-0 right-0 flex gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.label}
                className="h-1 flex-1 rounded-full transition-colors duration-500"
                style={{ background: i <= active ? 'rgb(var(--color-accent))' : 'rgb(var(--color-on-primary) / .15)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
