'use client';
import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';
import useMotionPreferences from './useMotionPreferences';

// Continuous scroll-linked tween (not a one-shot reveal) — used for the
// hero orb shrink and the SRS/ProductStory progress lines (brief §10/§11:
// "scroll boshlanganda orb sekin scale down qiladi", "camera vocabulary
// token'ni kuzatadi"). `triggerRef` defaults to the animated element itself.
export default function useScrollScrub(targetRef, toVars, { triggerRef, start = 'top top', end = 'bottom top', scrub = 0.6 } = {}) {
  const { reducedMotion } = useMotionPreferences();

  useLayoutEffect(() => {
    const target = targetRef.current;
    const trigger = triggerRef?.current || target;
    if (!target || !trigger || reducedMotion) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(target, {
        ...toVars,
        ease: 'none',
        scrollTrigger: { trigger, start, end, scrub },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}
