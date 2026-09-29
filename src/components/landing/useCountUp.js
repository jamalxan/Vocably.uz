'use client';
import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';
import useMotionPreferences from './useMotionPreferences';

// Statistics count-up (brief §24). Plays once when the number scrolls into
// view. `format` lets callers add a "%"/"x" suffix etc.
export default function useCountUp(ref, { end, duration = 1.2, format = (n) => `${n}` } = {}) {
  const { reducedMotion } = useMotionPreferences();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (reducedMotion) {
      el.textContent = format(end);
      return undefined;
    }

    const state = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: end,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(Math.round(state.value));
        },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, end]);
}
