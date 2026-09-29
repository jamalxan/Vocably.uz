'use client';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../gsapConfig';
import { experience, updateActiveChapter } from './store';

// Page-level scroll plumbing for the landing experience:
//  - Lenis inertial smooth scroll (desktop pointer only, never with
//    prefers-reduced-motion), driven from GSAP's ticker so ScrollTrigger
//    scrubs/pins stay frame-locked to it
//  - global scroll progress + velocity -> experience store (3D scene reads it)
//  - active chapter detection on every scroll/resize
//  - in-page anchor links routed through Lenis
//  - top progress bar and a soft accent cursor glow
export default function SmoothScroll() {
  const barRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    experience.reducedMotion = reduced;
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis = null;
    let tick = null;
    if (!reduced && !coarse) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      // Update after the pins, so element rects are final when we read them.
      refreshPriority: -1,
      onUpdate: (self) => {
        experience.scroll = self.progress;
        experience.velocity = self.getVelocity();
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
        updateActiveChapter();
      },
    });

    const onAnchor = (e) => {
      const link = e.target.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.6 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', onAnchor);

    let glowX = null;
    let glowY = null;
    const onPointer = (e) => {
      if (!glowX) return;
      glowX(e.clientX);
      glowY(e.clientY);
    };
    if (!coarse && !reduced && glowRef.current) {
      glowX = gsap.quickTo(glowRef.current, 'x', { duration: 0.7, ease: 'power3.out' });
      glowY = gsap.quickTo(glowRef.current, 'y', { duration: 0.7, ease: 'power3.out' });
      window.addEventListener('pointermove', onPointer, { passive: true });
    }

    const onResize = () => updateActiveChapter();
    window.addEventListener('resize', onResize);

    // Pins and scrubbed ranges depend on final text metrics — recompute once
    // the self-hosted fonts are in.
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      updateActiveChapter();
    };
    document.fonts?.ready.then(refresh);
    updateActiveChapter();

    return () => {
      progress.kill();
      document.removeEventListener('click', onAnchor);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left"
        style={{
          transform: 'scaleX(0)',
          background:
            'linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-accent)), rgb(var(--color-warning)))',
        }}
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[5] hidden lg:block h-[520px] w-[520px] -ml-[260px] -mt-[260px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-accent) / .13), transparent 62%)' }}
      />
    </>
  );
}
