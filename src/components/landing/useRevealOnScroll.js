'use client';
import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';
import useMotionPreferences from './useMotionPreferences';

// One-shot "enters, settles" reveal — the workhorse of the scroll story
// (brief §9/§10/§23): calm 600-1000ms power3/expo eases, never a pinned
// scrub, so it stays cheap and predictable across every section.
// `stagger` animates all direct children of the ref together with a delay
// offset instead of the element itself.
export default function useRevealOnScroll(
  ref,
  { y = 32, delay = 0, duration = 0.8, ease = 'power3.out', start = 'top 82%', stagger = 0 } = {},
) {
  const { reducedMotion } = useMotionPreferences();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (reducedMotion) {
      gsap.set(stagger ? el.children : el, { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stagger ? el.children : el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease,
          stagger: stagger || 0,
          scrollTrigger: { trigger: el, start, toggleActions: 'play none none reverse' },
        },
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
