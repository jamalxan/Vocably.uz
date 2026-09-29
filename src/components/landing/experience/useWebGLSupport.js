'use client';
import { useEffect, useState } from 'react';

let cached = null;

export function detectWebGL() {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
}

// null until mounted (SSR has no answer), then true/false.
export default function useWebGLSupport() {
  const [supported, setSupported] = useState(null);
  useEffect(() => setSupported(detectWebGL()), []);
  return supported;
}
