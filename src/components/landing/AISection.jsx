'use client';
import { useLayoutEffect, useRef } from 'react';
import { Sparkles, Lightbulb, CheckCircle2, MessagesSquare, ScanSearch, Target, Wand2 } from 'lucide-react';
import { gsap } from './gsapConfig';
import useChapter from './experience/useChapter';
import useRevealOnScroll from './useRevealOnScroll';
import DarkVeil from './DarkVeil';

const FEATURES = [
  { icon: MessagesSquare, label: 'Suhbat', body: "Istalgan savolni o'zbekcha bering" },
  { icon: ScanSearch, label: 'Xatoni topish', body: 'Grammatika va kollokatsiya xatolari' },
  { icon: Wand2, label: 'Feedback', body: 'Nima uchun xato — tushuntirish bilan' },
  { icon: Target, label: 'Tavsiyalar', body: 'Zaif joylaringizga mos mashqlar' },
  { icon: Lightbulb, label: "O'rganish yo'li", body: "SRS navbatingizga so'z qo'shadi" },
];

// Dark chapter. The chat panel is frosted glass sitting right on top of the
// Learning Core (the "ai" preset parks the orb behind it), and the
// conversation plays out message by message as it scrolls through.
export default function AISection() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const panelRef = useRef(null);
  useChapter(sectionRef, 'ai', { dark: true });
  useRevealOnScroll(headRef, { y: 40, stagger: 0.08 });

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: panelRef.current, start: 'top 80%', end: 'center 40%', scrub: 0.8 },
      });
      tl.from('[data-chat="panel"]', { y: 80, rotateX: 18, opacity: 0, duration: 1, transformPerspective: 1200 })
        .from('[data-chat="user"]', { y: 24, opacity: 0, duration: 0.6 })
        .fromTo('[data-chat="typing"]', { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .to('[data-chat="typing"]', { opacity: 0, height: 0, marginBottom: 0, duration: 0.3 })
        .from('[data-chat="ai"]', { y: 24, opacity: 0, duration: 0.6 })
        .from('[data-chat="fix"]', { scale: 0.8, opacity: 0, duration: 0.4 })
        .from('[data-chat="tip"]', { y: 24, opacity: 0, duration: 0.6 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 py-28 lg:py-40 text-on-primary">
      <DarkVeil />
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div ref={headRef}>
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.35em] landing-dark-accent mb-5">AI yordamchi</p>
          <h2 className="font-landing-display font-semibold tracking-[-0.04em] leading-[0.98] text-[40px] sm:text-[56px] lg:text-[72px] mb-6">
            Shaxsiy AI o'qituvchingiz
          </h2>
          <p className="font-landing-body text-base lg:text-lg text-on-primary/75 max-w-md leading-relaxed mb-10">
            Xatoni ko'radi, sababini tushuntiradi va o'sha so'zni sizning takrorlash navbatingizga qo'yadi.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3 rounded-2xl border border-on-primary/10 bg-on-primary/[0.06] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-on-accent">
                  <f.icon size={16} />
                </span>
                <span>
                  <span className="block text-sm font-landing-body font-semibold">{f.label}</span>
                  <span className="block text-xs font-landing-body text-on-primary/65 mt-0.5">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={panelRef} className="relative [perspective:1200px]">
          <div
            data-chat="panel"
            className="landing-glow-border relative rounded-[2rem] border border-on-primary/10 p-5 sm:p-6 backdrop-blur-xl"
            style={{ background: 'rgb(var(--color-primary) / .45)' }}
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-on-primary/10">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-on-accent shadow-glow">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-landing-body font-semibold leading-tight">Vocably AI</p>
                  <p className="text-[11px] font-landing-mono text-on-primary/60">onlayn · IELTS tutor</p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-accent landing-pulse" aria-hidden="true" />
            </div>

            <div className="flex justify-end mb-3" data-chat="user">
              <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-on-primary/15 px-4 py-3 text-sm font-landing-body">
                "I have went to the exam" — bu to'g'rimi?
              </div>
            </div>

            <div className="flex mb-3 overflow-hidden motion-reduce:hidden" data-chat="typing" aria-hidden="true">
              <div className="flex gap-1 rounded-2xl rounded-tl-md bg-surface px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="landing-typing-dot h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: `${d * 150}ms` }} />
                ))}
              </div>
            </div>

            <div className="flex mb-3" data-chat="ai">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface px-4 py-3 text-ink">
                <p className="text-sm font-landing-body leading-relaxed mb-2">
                  Deyarli to'g'ri — <strong className="font-semibold">"have went"</strong> o'rniga{' '}
                  <strong className="font-semibold text-accent">"have gone"</strong>. Present Perfect'da fe'lning III
                  shakli ishlatiladi.
                </p>
                <span
                  data-chat="fix"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-landing-mono text-accent"
                >
                  <CheckCircle2 size={12} /> Grammar tuzatildi
                </span>
              </div>
            </div>

            <div data-chat="tip" className="flex items-start gap-3 rounded-2xl border border-on-primary/15 bg-on-primary/[0.08] p-4">
              <Lightbulb size={16} className="mt-0.5 shrink-0 landing-dark-accent" />
              <p className="text-sm font-landing-body text-on-primary/85 leading-relaxed">
                <strong className="font-semibold text-on-primary">go → gone</strong> bugungi SRS navbatingizga qo'shildi.
                Ertaga Reading matnida uchratasiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
