'use client';
import { useRef } from 'react';
import useMotionPreferences from './useMotionPreferences';

// Lightweight CSS-only "3D depth" for the skill cards (brief §12: "oddiy
// card grid emas... 3D depth; hover interaction; subtle parallax"). A full
// WebGL card per skill would be four more Canvases running simultaneously —
// wasteful for what is fundamentally a UI screenshot with a tilt. Disabled
// on touch devices (no hover) and reduced-motion.
export default function Tilt3DCard({ children, className = '', max = 6 }) {
  const ref = useRef(null);
  const { reducedMotion, isCoarsePointer } = useMotionPreferences();
  const disabled = reducedMotion || isCoarsePointer;

  const handleMove = (e) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateZ(0)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}
