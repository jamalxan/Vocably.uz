'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import LearningCoreScene from './three/LearningCoreScene';
import LearningCoreFallback from './LearningCoreFallback';
import useBrandColors from './useBrandColors';
import useMotionPreferences from './useMotionPreferences';

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Public entrypoint for the hero's signature 3D object (brief §6). Handles
// everything that isn't "what the scene looks like":
//  - WebGL capability check -> CSS fallback (§21/§25)
//  - IntersectionObserver -> pauses rendering entirely when scrolled out of
//    view, so it never burns GPU/battery for a scene nobody sees (§25)
//  - prefers-reduced-motion / mobile -> lighter geometry + no parallax (§26/§27)
//  - DPR cap so retina displays don't 3x the fragment cost for no visible gain
export default function LearningCore3D({ size = 480 }) {
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [canRenderWebGL, setCanRenderWebGL] = useState(null);
  const colors = useBrandColors();
  const { reducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    setCanRenderWebGL(supportsWebGL());
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || isMobile) return undefined;
    const el = containerRef.current;
    if (!el) return undefined;
    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [reducedMotion, isMobile]);

  const showFallback = canRenderWebGL === false || !colors;

  return (
    <div ref={containerRef} className="min-w-0" style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}>
      {showFallback ? (
        <LearningCoreFallback size={size} />
      ) : canRenderWebGL === null ? null : (
        <Canvas
          dpr={isMobile ? 1 : [1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          frameloop={isVisible ? 'always' : 'never'}
          style={{ width: '100%', height: '100%' }}
        >
          <LearningCoreScene
            colors={colors}
            reducedMotion={reducedMotion}
            quality={isMobile ? 'lite' : 'full'}
            pointerRef={pointerRef}
          />
        </Canvas>
      )}
    </div>
  );
}
