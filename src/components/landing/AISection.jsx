'use client';
import { useRef } from 'react';
import { Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import useRevealOnScroll from './useRevealOnScroll';

// Brief §17 — "shaxsiy AI o'qituvchi". A panel close to the real product UI
// (conversation + inline correction + recommendation), not a generic
// marketing illustration of a robot.
export default function AISection() {
  const headingRef = useRef(null);
  const panelRef = useRef(null);

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(panelRef, { y: 32, delay: 0.1 });

  return (
    <section className="relative px-4 sm:px-6 py-20 sm:py-28 bg-surface border-y border-border overflow-hidden">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-accent) / .18), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-lg mx-auto text-center mb-12" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">AI yordamchi</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">
          Shaxsiy AI o'qituvchingiz
        </h2>
      </div>

      <div ref={panelRef} className="relative max-w-lg mx-auto">
        <div className="bg-bg/80 backdrop-blur-md border border-border rounded-2xl p-5 shadow-premium">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-accent text-on-accent flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span className="text-sm font-landing-body font-semibold text-ink">Vocably AI</span>
          </div>

          <div className="flex justify-end mb-3">
            <div className="max-w-[80%] bg-primary-soft text-ink rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px] font-landing-body">
              "I have went to the exam" — bu to'g'rimi?
            </div>
          </div>

          <div className="flex justify-start mb-3">
            <div className="max-w-[85%] bg-surface border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <p className="text-[13px] font-landing-body text-ink leading-relaxed mb-1.5">
                Deyarli to'g'ri — <strong className="font-medium">"have went"</strong> o'rniga{' '}
                <strong className="font-medium text-accent">"have gone"</strong> ishlatiladi (Present Perfect + III forma).
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-landing-mono text-accent">
                <CheckCircle2 size={12} /> Grammar tuzatildi
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-4 bg-accent-soft/50 border border-accent/15 rounded-xl p-3">
            <Lightbulb size={14} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs font-landing-body text-ink leading-relaxed">
              Tavsiya: "irregular verbs" ro'yxatingizda <strong className="font-medium">go → gone</strong> so'zini
              takrorlang — bugungi SRS navbatida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
