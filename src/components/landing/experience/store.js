// Shared, mutable, non-React state for the scroll-driven 3D experience.
// Written by DOM-side code (scroll, pointer, chapter detection) and read
// every frame inside the R3F scene — deliberately not React state, so a
// scroll event never triggers a React re-render.
export const experience = {
  scroll: 0,
  velocity: 0,
  dark: 0,
  darkTarget: 0,
  pointer: { x: 0, y: 0 },
  preset: 'hero',
  activeEl: null,
  story: { progress: 0 },
  isMobile: false,
  reducedMotion: false,
};

// Where the Learning Core sits for each chapter of the page. vx/vy are in
// [-1, 1] of the visible half-width/half-height at the core's depth, s is the
// orb radius as a fraction of the smaller half-extent — converted to world
// units every frame, so a preset lands in the same visual spot on any aspect
// ratio. d = desktop/tablet, m = phone.
export const PRESETS = {
  hero: { d: { vx: 0.42, vy: 0.0, s: 0.44 }, m: { vx: 0, vy: 0.56, s: 0.4 }, rings: 1, labels: 1, tokens: 1, spin: 1 },
  manifesto: { d: { vx: 0.8, vy: 0.55, s: 0.2 }, m: { vx: 0.72, vy: 0.8, s: 0.2 }, rings: 1.25, labels: 0, tokens: 0, spin: 1.4 },
  story: { d: { vx: 0, vy: 0, s: 0.33 }, m: { vx: 0, vy: 0.14, s: 0.42 }, rings: 1.12, labels: 1, tokens: 0, spin: 0.35 },
  srs: { d: { vx: -0.8, vy: 0.64, s: 0.22 }, m: { vx: 0.72, vy: 0.82, s: 0.18 }, rings: 2.1, labels: 0, tokens: 0, spin: 1.8 },
  skills: { d: { vx: 0.88, vy: 0.8, s: 0.12 }, m: { vx: 0.78, vy: 0.84, s: 0.14 }, rings: 1, labels: 0, tokens: 0, spin: 1 },
  ai: { d: { vx: 0.5, vy: 0.02, s: 0.5 }, m: { vx: 0.72, vy: 0.8, s: 0.2 }, rings: 1.35, labels: 0, tokens: 0, spin: 0.8 },
  progress: { d: { vx: 0.82, vy: 0.58, s: 0.2 }, m: { vx: 0.72, vy: 0.82, s: 0.16 }, rings: 1.2, labels: 0, tokens: 0, spin: 1.2 },
  mock: { d: { vx: -0.84, vy: 0.64, s: 0.2 }, m: { vx: -0.74, vy: 0.84, s: 0.16 }, rings: 1, labels: 0, tokens: 0, spin: 1 },
  faq: { d: { vx: -0.8, vy: -0.58, s: 0.22 }, m: { vx: 0.74, vy: 0.84, s: 0.16 }, rings: 1.4, labels: 0, tokens: 0, spin: 1 },
  // anchorY: position is tied to the chapter element itself (fraction of its
  // height from the top) instead of the viewport, so the core stays above
  // the headline even when the footer pushes the section upward.
  final: { d: { vx: 0, vy: 0, s: 0.32 }, m: { vx: 0, vy: 0, s: 0.42 }, anchorY: 0.3, rings: 2.3, labels: 0, tokens: 0, spin: 2 },
};

// Chapter registry: each section registers its element + preset. The active
// chapter is whichever element currently spans the vertical center of the
// viewport — measured with getBoundingClientRect, which stays correct for
// GSAP-pinned sections too (a pinned element covers the viewport while
// pinned), unlike trigger start/end math on pinned elements.
const chapters = new Set();

export function registerChapter(el, name, dark) {
  const entry = { el, name, dark };
  chapters.add(entry);
  return () => chapters.delete(entry);
}

export function updateActiveChapter() {
  if (typeof window === 'undefined') return;
  const mid = window.innerHeight * 0.5;
  for (const c of chapters) {
    const r = c.el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) {
      experience.preset = c.name;
      experience.activeEl = c.el;
      experience.darkTarget = c.dark ? 1 : 0;
      return;
    }
  }
}

// Screen-space vertical extents of the dark chapters, as canvas uv.y ranges
// (0 = bottom). The backdrop shader darkens exactly those bands, so the
// light/dark boundary moves pixel-for-pixel with the section edge instead
// of the whole background switching at once. Returns how much of the
// viewport is dark (0..1) for effects that want a single intensity.
export function collectDarkRanges(out, canvasHeight) {
  let n = 0;
  let coverage = 0;
  for (const c of chapters) {
    if (!c.dark) continue;
    const r = c.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > canvasHeight) continue;
    if (n < out.length) {
      out[n].set(1 - r.bottom / canvasHeight, 1 - r.top / canvasHeight);
      n++;
    }
    coverage += (Math.min(r.bottom, canvasHeight) - Math.max(r.top, 0)) / canvasHeight;
  }
  return { n, coverage: Math.min(coverage, 1) };
}
