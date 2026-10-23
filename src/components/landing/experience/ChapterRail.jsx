'use client';
import { useEffect, useRef, useState } from 'react';
import { CHAPTER_NAV, experience, getChapterElement } from './store';
import useCopy from '../useCopy';

const COPY = {
  uz: { nav: 'Sahifa boblari', labels: { manifesto: 'Nega Vocably', story: "So'z → ko'nikma", srs: 'SRS', skills: "4 ko'nikma", ai: 'AI tutor', progress: 'Progress', mock: 'Mock', faq: 'FAQ' } },
  en: { nav: 'Page chapters', labels: { manifesto: 'Why Vocably', story: 'Word → skill', srs: 'SRS', skills: '4 skills', ai: 'AI tutor', progress: 'Progress', mock: 'Mock', faq: 'FAQ' } },
};

// Fixed chapter rail (desktop, pointer devices): one tick per chapter of the
// scroll story, the active one stretched and labelled. Reads the same
// chapter registry the 3D core uses, so it can never drift from the page.
// Hidden over the hero and the finale (nothing to navigate yet / anymore),
// so the first viewport stays clean. Clicks go through Lenis when it's
// running so the jump eases like every other scroll on the page.
export default function ChapterRail() {
  const tx = useCopy(COPY);
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const coarse = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1023px)');
    if (coarse.matches) return undefined;
    let last = null;
    const loop = () => {
      const p = experience.preset;
      if (p !== last) {
        last = p;
        setActive(p);
        // skills: gorizontal panellar ekranning o'ng chetigacha boradi — rel ularning ustiga tushmasin.
        setVisible(p !== 'hero' && p !== 'final' && p !== 'skills');
      }
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const jump = (name) => {
    const el = getChapterElement(name);
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (experience.lenis) experience.lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <nav
      aria-label={tx.nav}
      className={`fixed right-5 top-1/2 z-20 hidden lg:flex -translate-y-1/2 flex-col items-end gap-2.5 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {CHAPTER_NAV.map((c, i) => {
        const on = c.name === active;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => jump(c.name)}
            aria-current={on ? 'true' : undefined}
            aria-label={`${String(i + 1).padStart(2, '0')} — ${tx.labels[c.name] || c.label}`}
            className="group flex items-center gap-3 py-0.5 focus-visible:outline-none"
          >
            {/* Rel och va to'q boblar ustidan o'tadi — yorliq o'z sirtli pili bilan, shunda kontrast fonga bog'liq emas. */}
            <span
              className={`rounded-full border border-border bg-surface/85 px-2 py-0.5 font-landing-mono text-[10px] uppercase tracking-[0.2em] text-ink backdrop-blur-md shadow-card transition-all duration-300 ${
                on ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
              }`}
            >
              {tx.labels[c.name] || c.label}
            </span>
            <span
              aria-hidden="true"
              className={`block h-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                on ? 'w-9 bg-accent shadow-glow' : 'w-4 bg-accent/35 group-hover:w-6 group-hover:bg-accent/70 group-focus-visible:w-6'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
