'use client';
import { useEffect, useState } from 'react';

// The whole point of the 3D redesign brief: no new palette. Every glow,
// glass tint, reflection and highlight in the 3D scene must be *derived*
// from the exact same CSS custom properties the rest of Vocably already
// uses (src/app/globals.css, "Deep Merlot" tokens) — including its
// light/dark inversion. This hook reads them at runtime (so it stays correct
// if ThemeContext flips data-theme) instead of hardcoding hex values here.

const TOKENS = [
  'color-bg',
  'color-surface',
  'color-surface-2',
  'color-primary',
  'color-primary-hover',
  'color-accent',
  'color-accent-hover',
  'color-accent-soft',
  'color-ink',
  'color-border',
];

// "R G B" (space-separated, 0-255) -> "#rrggbb", the format three.js's
// THREE.Color accepts directly.
function rgbTripletToHex(triplet) {
  const parts = triplet.trim().split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return `#${parts.map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')).join('')}`;
}

function readBrandColors() {
  if (typeof window === 'undefined') return null;
  const style = getComputedStyle(document.documentElement);
  const out = {};
  for (const token of TOKENS) {
    const key = token.replace(/^color-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = rgbTripletToHex(style.getPropertyValue(`--${token}`)) || '#4A1226';
  }
  return out;
}

// Re-reads on theme change (ThemeContext toggles the `data-theme` attribute
// on <html>) so 3D materials stay in sync with light/dark mode.
export default function useBrandColors() {
  const [colors, setColors] = useState(readBrandColors);

  useEffect(() => {
    const update = () => setColors(readBrandColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', update);
    return () => {
      observer.disconnect();
      media.removeEventListener?.('change', update);
    };
  }, []);

  return colors;
}
