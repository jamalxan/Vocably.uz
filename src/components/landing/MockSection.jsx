'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Clock, Flag, ShieldCheck, Save, Award, Layers } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';

const TABS = ['Listening', 'Reading', 'Writing', 'Speaking'];
const OPTIONS = ['A  Tarixiy kontekst', "B  Iqtisodiy ta'sir", 'C  Texnologik yechim'];

const CHIPS = [
  { icon: ShieldCheck, text: 'Server taymeri', pos: 'left-[-6%] top-[14%]', speed: -60 },
  { icon: Save, text: 'Avtosaqlash', pos: 'right-[-5%] top-[30%]', speed: -120 },
  { icon: Layers, text: "4 bo'lim", pos: 'left-[-3%] bottom-[18%]', speed: -150 },
];

function useCountdown(ref, start) {
  const [left, setLeft] = useState(start);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let timer = null;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) timer = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : start)), 1000);
      if (!entry.isIntersecting && timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [ref, start]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function MockSection() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Reading');
  const [picked, setPicked] = useState(1);
  const time = useCountdown(stageRef, 58 * 60 + 32);
  useChapter(sectionRef, 'mock');
  useRevealOnScroll(headRef, { y: 40, stagger: 0.08 });

  // The exam UI lies tilted back in space and swings flat as it arrives;
  // the feature chips drift at different depths around it.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { rotateX: 32, scale: 0.84, y: 90, transformPerspective: 1400, transformOrigin: 'center top' },
        {
          rotateX: 0,
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: stageRef.current, start: 'top 95%', end: 'center 55%', scrub: 0.8 },
        },
      );
      stageRef.current.querySelectorAll('[data-float]').forEach((el) => {
        gsap.to(el, {
          y: Number(el.dataset.float),
          ease: 'none',
          scrollTrigger: { trigger: stageRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-24 lg:py-36">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] text-accent mb-5">IELTS Mock</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.04em] leading-[0.98] text-[40px] sm:text-[56px] lg:text-[72px] text-ink mb-5">
            Haqiqiy imtihon atmosferasi
          </h2>
          <p className="font-landing-body text-base lg:text-lg text-ink/75 max-w-xl mx-auto">
            To'rt bo'limli to'liq sinov: server taymeri, avtosaqlash va haqiqiy IELTS interfeysi — imtihon kuni hech narsa
            yangi bo'lmaydi.
          </p>
        </div>

        <div ref={stageRef} className="relative max-w-3xl mx-auto [perspective:1400px]">
          {CHIPS.map((c) => (
            <div
              key={c.text}
              data-float={c.speed}
              aria-hidden="true"
              className={`hidden lg:flex absolute z-20 ${c.pos} items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-premium`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent-soft text-accent">
                <c.icon size={15} />
              </span>
              <span className="text-sm font-landing-body font-semibold text-ink">{c.text}</span>
            </div>
          ))}
          <div
            data-float="-90"
            aria-hidden="true"
            className="hidden sm:block absolute z-20 -right-[3%] -bottom-[10%] rounded-3xl bg-primary px-6 py-5 text-on-primary shadow-premium"
          >
            <p className="flex items-center gap-2 font-landing-mono text-[11px] uppercase tracking-[0.25em] text-on-primary/70">
              <Award size={13} /> Natija
            </p>
            <p className="font-landing-display text-4xl font-semibold tracking-tight mt-1">Band 7.0</p>
          </div>

          <div ref={cardRef} className="relative overflow-hidden rounded-[1.75rem] border border-border bg-bg shadow-premium">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 sm:px-6 py-3.5">
              <div className="flex items-center gap-2 font-landing-mono text-sm font-semibold text-ink tabular-nums">
                <Clock size={15} className="text-accent" /> {time}
              </div>
              <span className="font-landing-mono text-xs text-ink/60">12 / 40</span>
              <span className="flex items-center gap-1.5 text-xs font-landing-body text-ink/60">
                <Flag size={13} /> Belgilash
              </span>
            </div>

            <div className="flex overflow-x-auto no-scrollbar border-b border-border" role="tablist" aria-label="Mock bo'limlari">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-5 py-3 text-[13px] font-landing-body font-medium transition-colors ${
                    activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-ink/60 hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full w-[30%] rounded-full bg-accent" />
              </div>
              <p className="mb-5 text-sm font-landing-body leading-relaxed text-ink">
                Read the passage and choose the correct heading for paragraph 3. Consider the main idea rather than
                individual details.
              </p>
              <div className="space-y-2.5">
                {OPTIONS.map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPicked(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-landing-body transition-colors ${
                      picked === i ? 'border-accent bg-accent-soft text-ink' : 'border-border text-ink/70 hover:border-accent/40'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 ${picked === i ? 'border-accent bg-accent' : 'border-border-strong'}`}
                    />
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
