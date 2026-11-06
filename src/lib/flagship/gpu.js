// Render tier for the 3D flagship games. Most Vocably users are on inexpensive Android phones, so the
// games start in the cheapest mode that looks good and drop to the 2D renderer when the device
// cannot keep up. No benchmark download (detect-gpu fetches one from a CDN, which the CSP blocks).
//
//   'none' → 2D renderer from the start: no WebGL2 (three r180 needs it), a software rasteriser,
//            reduced motion, or this device already fell back to 2D before (remembered)
//   'low'  → 3D at DPR 1 with fewer objects: budget phones (entry-level GPU or ≤ 4 GB RAM)
//   'high' → 3D at DPR ≤ 1.5
//
// createFpsWatchdog() is fed from the game controller's own requestAnimationFrame loop (never from
// an R3F frame callback), so switching renderers can never unmount the Canvas from inside a frame.

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
// Entry-level mobile GPUs common on budget Android phones in Uzbekistan.
const WEAK_GPU = /mali-(?:4\d\d|t[678]\d\d|g31|g51|g52|g57)|powervr|adreno \(tm\) [345]\d\d|adreno \(tm\) 6[01]\d/i;
const PREF_KEY = 'vocably.flagship.render.v1';

let probeCache = null;

/** WebGL2 probe: { ok, renderer }. Cached per page; never throws. */
export function probeWebgl(doc = typeof document !== 'undefined' ? document : null, { cache = true } = {}) {
  if (cache && probeCache) return probeCache;
  let result = { ok: false, renderer: '' };
  if (doc) {
    try {
      const canvas = doc.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (gl) {
        let renderer = '';
        try {
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
        } catch {
          renderer = '';
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        result = { ok: true, renderer };
      }
    } catch {
      result = { ok: false, renderer: '' };
    }
  }
  if (cache && doc) probeCache = result;
  return result;
}

/** `?render=2d|low|high` forces a tier (QA, screenshots, E2E); anything else is ignored. */
export function tierOverride(search = '') {
  const m = /[?&]render=(2d|none|low|high)\b/i.exec(search || '');
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v === '2d' ? 'none' : v;
}

/**
 * Picks the tier once per page. All inputs are injectable for tests:
 * { webgl: {ok, renderer}, reducedMotion, cores, memoryGb, mobile, remembered2d, search }.
 */
export function renderTier({ webgl, reducedMotion = false, cores, memoryGb, mobile = false, remembered2d = false, search = '' } = {}) {
  const forced = tierOverride(search);
  if (forced) return forced === 'none' || webgl?.ok ? forced : 'none';
  if (!webgl?.ok || reducedMotion || remembered2d) return 'none';
  const renderer = webgl.renderer || '';
  if (SOFTWARE.test(renderer)) return 'none';
  if (WEAK_GPU.test(renderer)) return 'low';
  if (typeof cores === 'number' && cores > 0 && cores <= 2) return 'low';
  if (typeof memoryGb === 'number' && memoryGb > 0 && memoryGb <= 2) return 'low';
  // Android phones with ≤ 4 GB (or unknown) RAM: DPR 1, fewer objects — like the landing canvas.
  if (mobile && !/apple/i.test(renderer) && !(typeof memoryGb === 'number' && memoryGb > 4)) return 'low';
  return 'high';
}

function isMobile() {
  const uad = navigator.userAgentData;
  if (uad && typeof uad.mobile === 'boolean') return uad.mobile;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

/** "This device fell back to 2D" — remembered so later rounds do not replay janky 3D. */
export function readRenderPref() {
  try {
    return localStorage.getItem(PREF_KEY) === '2d' ? '2d' : 'auto';
  } catch {
    return 'auto';
  }
}
export function writeRenderPref(pref) {
  try {
    if (pref === '2d') localStorage.setItem(PREF_KEY, '2d');
    else localStorage.removeItem(PREF_KEY);
  } catch {
    /* storage blocked */
  }
}

/** Browser wrapper around renderTier(). */
export function detectRenderTier({ ignorePref = false } = {}) {
  if (typeof window === 'undefined') return 'none';
  return renderTier({
    webgl: probeWebgl(document),
    reducedMotion: !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    cores: navigator.hardwareConcurrency,
    memoryGb: navigator.deviceMemory,
    mobile: isMobile(),
    remembered2d: !ignorePref && readRenderPref() === '2d',
    search: window.location.search,
  });
}

/** Canvas DPR range for a tier. */
export function dprFor(tier, deviceDpr = 1) {
  const d = Math.max(1, Number(deviceDpr) || 1);
  return tier === 'high' ? [1, Math.min(1.5, d)] : [1, 1];
}

/** One step down: high → low → none. */
export function stepDown(tier) {
  return tier === 'high' ? 'low' : 'none';
}

/**
 * Frame-rate watchdog. Call sample(now) once per controller frame while the round is playing and
 * the tab is visible. It ignores `warmupMs` after creation and after every reset() (start, resume,
 * resize, renderer change), restarts its window on any gap longer than `stallMs` (GC, tab switch,
 * keyboard animation), and fires onLow(fps) after `strikes` slow windows in a row. After firing it
 * re-arms on reset(), so the controller can step high → low → 2D.
 */
export function createFpsWatchdog({ onLow, windowMs = 3000, minFps = 24, strikes = 2, warmupMs = 2000, stallMs = 250, maxStalls = 8 } = {}) {
  let armedAt = 0;
  let windowStart = 0;
  let frames = 0;
  let last = 0;
  let slow = 0;
  let stalls = 0;
  let fired = false;
  const fire = (fps) => {
    fired = true;
    onLow?.(fps);
    return true;
  };
  const restart = (now) => {
    windowStart = now;
    frames = 0;
  };
  return {
    get fired() {
      return fired;
    },
    /** Restart measuring with a fresh warm-up (after pause/resume, resize or a tier change). */
    reset(now) {
      armedAt = now;
      last = now;
      slow = 0;
      stalls = 0;
      fired = false;
      restart(now);
    },
    sample(now) {
      if (fired) return false;
      if (!armedAt) {
        armedAt = now;
        last = now;
        restart(now);
        return false;
      }
      const gap = now - last;
      last = now;
      if (now - armedAt < warmupMs) {
        restart(now);
        return false;
      }
      if (gap > stallMs) {
        // One long gap is a hiccup; many in a row while playing means the device renders at < 4 fps.
        stalls += 1;
        restart(now);
        return stalls >= maxStalls ? fire(1000 / gap) : false;
      }
      stalls = 0;
      frames += 1;
      const span = now - windowStart;
      if (span < windowMs) return false;
      const fps = (frames * 1000) / span;
      restart(now);
      slow = fps < minFps ? slow + 1 : 0;
      return slow >= strikes ? fire(fps) : false;
    },
  };
}
