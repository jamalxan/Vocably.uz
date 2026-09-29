'use client';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import ExperienceScene from './ExperienceScene';
import useBrandColors from '../useBrandColors';
import { experience } from './store';

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

// One fixed, full-viewport WebGL canvas behind the whole landing page: the
// "video" backdrop + the travelling Learning Core + depth particles. Client
// only (loaded through ExperienceLoader with ssr:false).
export default function ExperienceCanvas() {
  const colors = useBrandColors();
  const isMobile = useMedia('(max-width: 767px)');
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const [dpr, setDpr] = useState(1.5);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    experience.isMobile = isMobile;
    experience.reducedMotion = reducedMotion;
  }, [isMobile, reducedMotion]);

  // The shader now darkens the dark chapters itself — lighten their CSS veil.
  useEffect(() => {
    if (!ready) return undefined;
    const root = document.documentElement;
    root.style.setProperty('--landing-veil', '0.18');
    return () => root.style.removeProperty('--landing-veil');
  }, [ready]);

  useEffect(() => {
    const onPointer = (e) => {
      experience.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      experience.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => setHidden(document.hidden);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!colors) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        flat
        dpr={isMobile ? Math.min(dpr, 1) : dpr}
        gl={{ antialias: !isMobile, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 40 }}
        frameloop={hidden ? 'never' : 'always'}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor(colors.bg);
          requestAnimationFrame(() => setReady(true));
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <ExperienceScene colors={colors} lite={isMobile} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
