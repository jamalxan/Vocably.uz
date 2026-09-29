'use client';
import { useEffect, useState } from 'react';

// Shared across every landing 3D/scroll component so "calm, intentional"
// motion (brief §7, §27) and mobile perf simplification (§26) are decided
// once, consistently, instead of every section re-implementing its own
// matchMedia checks.
export default function useMotionPreferences() {
  const [state, setState] = useState({ reducedMotion: false, isMobile: false, isCoarsePointer: false });

  useEffect(() => {
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const coarseQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const update = () =>
      setState({
        reducedMotion: reducedQuery.matches,
        isMobile: mobileQuery.matches,
        isCoarsePointer: coarseQuery.matches,
      });

    update();
    reducedQuery.addEventListener('change', update);
    mobileQuery.addEventListener('change', update);
    coarseQuery.addEventListener('change', update);
    return () => {
      reducedQuery.removeEventListener('change', update);
      mobileQuery.removeEventListener('change', update);
      coarseQuery.removeEventListener('change', update);
    };
  }, []);

  return state;
}
